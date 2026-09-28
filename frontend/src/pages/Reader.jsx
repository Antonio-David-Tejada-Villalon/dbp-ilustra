import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, img } from "../api";
import { useAuth } from "../auth";
import { Button, ChapterNav, ProtectedImage, ReaderBar } from "../ds/ilustra";
import { useApi, useTitle } from "../hooks";
import { useToast } from "../toast";
import Comments from "../components/Comments";
import HelpTip from "../components/HelpTip";
import { ErrorState, Loading } from "../components/States";
import { hasTTS, pickVoice, speakOnce } from "../voice";

const VOICES = [["", "Automática"], ["grave", "Grave"], ["aguda", "Aguda"], ["neutra", "Neutra"]];
let uid = 0;
const newOverlayId = () => `n${Date.now()}${uid++}`;

function playSfx(url) {
  if (!url) return;
  try { new Audio(url).play().catch(() => {}); } catch { /* dispositivo sin audio */ }
}

function OverlayBubble({ id, o, active, onTap }) {
  return (
    <div id={id} className={"app-overlay-bubble" + (active ? " is-active" : "")}
      style={{ left: o.x + "%", top: o.y + "%", width: o.w + "%" }}
      onClick={(e) => { e.stopPropagation(); onTap && onTap(); }}>
      {o.text}
    </div>
  );
}

function OverlayEditor({ page, characters, onSave, onClose }) {
  const [list, setList] = useState(page.overlays.map((o) => ({ ...o })));
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const add = () => setList((l) => [...l, { id: newOverlayId(), x: 30, y: 30, w: 40, text: "", character: null, voice: "", sfx: "" }]);
  const upd = (i, k, v) => setList((l) => l.map((o, j) => (j === i ? { ...o, [k]: v } : o)));
  const del = (i) => setList((l) => l.filter((_, j) => j !== i));
  const save = async () => {
    const clean = list.filter((o) => o.text.trim()).map((o) => ({
      ...o, text: o.text.trim(), x: Number(o.x) || 0, y: Number(o.y) || 0, w: Number(o.w) || 30,
      character: o.character ? Number(o.character) : null, sfx: o.sfx ? o.sfx.trim() : null,
    }));
    setBusy(true);
    try {
      await api.patch(`/series/${page.seriesId}/chapters/${page.chapterNumber}/pages/${page.id}`, { overlays: clean });
      toast("Viñetas guardadas.", "ok");
      onSave(clean);
    } catch (e) { toast(e.message, "error"); }
    finally { setBusy(false); }
  };
  return (
    <div className="app-overlay-editor">
      <div className="d-flex align-items-center gap-2">
        <span className="body-strong">Viñetas de esta página</span>
        <HelpTip title="¿Cómo cargo una viñeta?">
          <p><strong>Texto:</strong> lo que dice el personaje o el cartel de la escena.</p>
          <p><strong>X / Y:</strong> dónde arranca el globo, en % de la imagen (0 = borde izquierdo/superior,
          100 = borde derecho/inferior). <strong>Ancho %:</strong> qué tan ancho se ve el globo.</p>
          <p className="m-0">Movés los números y el globo se reacomoda solo en la imagen de arriba — no
          hace falta arrastrar nada, con probar un par de valores lo ubicás.</p>
          <p><strong>Personaje:</strong> opcional. Si elegís uno, se usa SU voz al narrar; si dejás «Sin
          personaje», se usa el selector de Voz de al lado.</p>
          <p><strong>Enlace de sonido:</strong> opcional, un enlace directo a un audio (por ejemplo un grito
          o un efecto) que se reproduce junto con esa viñeta al narrar o al tocarla.</p>
          <p className="m-0"><em>Ejemplo:</em> texto «¡Cuidado!», X 10, Y 70, Ancho 35, personaje «Lara» →
          aparece un globo abajo a la izquierda de la página, y al narrar se lee con la voz de Lara.</p>
        </HelpTip>
      </div>
      {list.length === 0 && <p className="caption text-muted-ink">Todavía no hay viñetas en esta página.</p>}
      {list.map((o, i) => (
        <div key={o.id} className="app-overlay-row">
          <textarea className="form-control" rows={2} placeholder="Texto del diálogo" value={o.text} onChange={(e) => upd(i, "text", e.target.value)} />
          <div className="d-flex gap-2 flex-wrap">
            <label className="caption">X <input type="number" min={0} max={100} className="form-control" style={{ width: 64 }} value={o.x} onChange={(e) => upd(i, "x", e.target.value)} /></label>
            <label className="caption">Y <input type="number" min={0} max={100} className="form-control" style={{ width: 64 }} value={o.y} onChange={(e) => upd(i, "y", e.target.value)} /></label>
            <label className="caption">Ancho % <input type="number" min={8} max={90} className="form-control" style={{ width: 64 }} value={o.w} onChange={(e) => upd(i, "w", e.target.value)} /></label>
            <select className="form-select" style={{ width: 140 }} value={o.character || ""} onChange={(e) => upd(i, "character", e.target.value || null)}>
              <option value="">Sin personaje</option>
              {characters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="form-select" style={{ width: 120 }} value={o.voice || ""} onChange={(e) => upd(i, "voice", e.target.value)}>
              {VOICES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <input className="form-control" style={{ width: 180 }} placeholder="Enlace de sonido (opcional)" value={o.sfx || ""} onChange={(e) => upd(i, "sfx", e.target.value)} />
            <Button size="sm" variant="secondary" onClick={() => del(i)}>Quitar</Button>
          </div>
        </div>
      ))}
      <div className="d-flex gap-2 justify-content-between">
        <Button size="sm" variant="secondary" icon="plus" onClick={add}>Agregar viñeta</Button>
        <div className="d-flex gap-2">
          <Button size="sm" variant="secondary" onClick={onClose} disabled={busy}>Cerrar</Button>
          <Button size="sm" onClick={save} disabled={busy}>{busy ? "Guardando…" : "Guardar viñetas"}</Button>
        </div>
      </div>
    </div>
  );
}

function EditForm({ c, seriesId, onSaved, onCancel, onDelete }) {
  const toast = useToast();
  const [title, setTitle] = useState(c.title || "");
  const [pages, setPages] = useState(c.pages.map((p) => p.url || "").join("\n"));
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);
  const urls = pages.split("\n").map((l) => l.trim()).filter(Boolean);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors([]);
    try {
      await api.patch(`/series/${seriesId}/chapters/${c.number}`, { title, pages: urls });
      toast("Capítulo actualizado.", "ok");
      onSaved();
    } catch (err) {
      if (err.data?.pages) setErrors(err.data.pages);
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="app-form" onSubmit={submit}>
      <div><label className="form-label body-strong" htmlFor="ec-t">Título del capítulo (opcional)</label>
        <input id="ec-t" className="form-control" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
      <div><label className="form-label body-strong" htmlFor="ec-p">Páginas en orden</label>
        <textarea id="ec-p" className="form-control font-monospace" rows={10} value={pages} onChange={(e) => setPages(e.target.value)} />
        <small className="text-muted-ink">Un enlace por línea, en orden de lectura. {urls.length} página(s). Máximo 80.</small></div>
      {errors.length > 0 && <div className="app-alert" role="alert">{errors.map((e) => <div key={e.page}>Página {e.page}: {e.error}</div>)}</div>}
      <div className="d-flex gap-2 justify-content-between">
        <Button type="button" variant="secondary" onClick={onDelete} disabled={busy}>Eliminar capítulo</Button>
        <div className="d-flex gap-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>Cancelar</Button>
          <Button type="submit" disabled={busy || !urls.length}>{busy ? "Guardando…" : "Guardar cambios"}</Button>
        </div>
      </div>
    </form>
  );
}

export default function Reader() {
  const { id, n } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { requireLogin } = useAuth();
  const { data: c, error, loading, setData, reload } = useApi(`/series/${id}/chapters/${n}`);
  const [progress, setProgress] = useState(0);
  const [editing, setEditing] = useState(false);
  const [overlayEdit, setOverlayEdit] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [narrating, setNarrating] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState(null);
  const narrateRef = useRef(false);
  useTitle(c ? `${c.series.title} · cap. ${c.number}` : "Lector");

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.round((window.scrollY / max) * 100) : 100);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [c]);
  useEffect(() => { window.scrollTo(0, 0); }, [n]);
  useEffect(() => () => { narrateRef.current = false; hasTTS && window.speechSynthesis.cancel(); }, [n]);

  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} />;
  const go = (num) => nav(`/leer/${id}/${num}`);

  const stopNarration = () => {
    narrateRef.current = false;
    hasTTS && window.speechSynthesis.cancel();
    setNarrating(false);
    setActiveOverlay(null);
  };
  const speakItem = (queue, i) => {
    if (!narrateRef.current || i >= queue.length) { stopNarration(); return; }
    const o = queue[i];
    setActiveOverlay({ pageId: o.pageId, id: o.id });
    document.getElementById(`ov-${o.pageId}-${o.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    playSfx(o.sfx);
    const character = (c.characters || []).find((ch) => ch.id === o.character);
    const style = (character && character.voice) || o.voice || "";
    const u = new SpeechSynthesisUtterance(o.text);
    const voice = pickVoice(style);
    if (voice) u.voice = voice;
    u.lang = (voice && voice.lang) || "es-AR";
    u.onend = () => speakItem(queue, i + 1);
    u.onerror = () => speakItem(queue, i + 1);
    window.speechSynthesis.speak(u);
  };
  const startNarration = () => {
    const queue = c.pages.flatMap((p) => (p.overlays || []).slice().sort((a, b) => a.y - b.y).map((o) => ({ ...o, pageId: p.id })));
    if (!queue.length) return;
    narrateRef.current = true;
    setNarrating(true);
    speakItem(queue, 0);
  };
  const tapOverlay = (o) => {
    if (overlayEdit || narrating) return;
    playSfx(o.sfx);
    const character = (c.characters || []).find((ch) => ch.id === o.character);
    speakOnce(o.text, (character && character.voice) || o.voice || "");
  };
  const hasOverlays = c.pages.some((p) => p.overlays && p.overlays.length);
  const like = requireLogin(async () => {
    try { const r = await api.post(`/series/${id}/chapters/${c.number}/like`); setData((d) => ({ ...d, ...r })); }
    catch (e) { toast(e.message, "error"); }
  });
  const follow = requireLogin(async () => {
    try { const r = await api.post(`/users/${c.series.artist.slug}/follow`); setData((d) => ({ ...d, following: r.following })); }
    catch (e) { toast(e.message, "error"); }
  });
  const share = async () => {
    try { if (navigator.share) await navigator.share({ title: c.series.title, url: location.href }); else { await navigator.clipboard.writeText(location.href); toast("Enlace copiado.", "ok"); } } catch { /* cancelado */ }
  };
  const remove = async () => {
    if (!window.confirm("¿Eliminar este capítulo? No se puede deshacer.")) return;
    try { await api.del(`/series/${id}/chapters/${c.number}`); toast("Capítulo eliminado.", "ok"); nav(`/serie/${id}`); } catch (e) { toast(e.message, "error"); }
  };
  const mark = `${c.series.artist.handle} · DBP Ilustra`;

  if (editing) {
    return (
      <div className="app-wrap app-narrow">
        <header className="app-page-head"><h1 className="display-lg m-0">Editar capítulo {c.number}</h1></header>
        <EditForm c={c} seriesId={id} onCancel={() => setEditing(false)} onDelete={remove}
          onSaved={() => { setEditing(false); reload(); }} />
      </div>
    );
  }

  return (
    <div className="app-reader">
      <div className="app-reader-bar">
        <ReaderBar series={c.series.title} category={c.series.category} chapter={c.number} title={c.title} author={c.series.artist.name}
          progress={progress} following={c.following} onFollow={c.own ? undefined : follow} onBack={() => nav(`/serie/${id}`)} />
      </div>
      <div className="app-wrap d-flex align-items-center gap-2 py-2 flex-wrap">
        {c.own && <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>Editar capítulo</Button>}
        {c.own && <Button size="sm" variant="secondary" active={overlayEdit} onClick={() => { setOverlayEdit((v) => !v); setEditingPage(null); }}>
          {overlayEdit ? "Listo con las viñetas" : "Editar viñetas"}
        </Button>}
        {c.own && (
          <HelpTip title="Viñetas de texto y narración">
            <p>«Editar viñetas» te deja agregar globos de diálogo sobre las páginas de este capítulo,
            con texto, posición, un personaje opcional y un sonido opcional.</p>
            <p className="m-0">En cuanto haya al menos una viñeta guardada, aparece acá el botón «Narrar
            capítulo»: lee todas en voz alta, en orden, con la voz de cada personaje. Cualquier lector
            también puede tocar un globo suelto para escuchar solo esa línea.</p>
          </HelpTip>
        )}
        {hasTTS && hasOverlays && (
          <Button size="sm" variant="secondary" icon={narrating ? "volume-x" : "volume-2"} onClick={narrating ? stopNarration : startNarration}>
            {narrating ? "Detener narración" : "Narrar capítulo"}
          </Button>
        )}
      </div>
      <div className="app-strip">
        {c.pages.map((p, i) => (
          <div key={p.id} className="app-page-block">
            <ProtectedImage src={img(p.image, 1200)} ratio={p.ratio} rounded={false} alt={`Página ${i + 1}`} watermark={i === 0 ? mark : undefined}>
              {(p.overlays || []).map((o) => (
                <OverlayBubble key={o.id} id={`ov-${p.id}-${o.id}`} o={o}
                  active={!!activeOverlay && activeOverlay.pageId === p.id && activeOverlay.id === o.id}
                  onTap={() => tapOverlay(o)} />
              ))}
            </ProtectedImage>
            {c.own && overlayEdit && (
              editingPage === p.id ? (
                <OverlayEditor page={{ ...p, seriesId: id, chapterNumber: c.number }} characters={c.characters || []}
                  onClose={() => setEditingPage(null)}
                  onSave={(overlays) => { setData((d) => ({ ...d, pages: d.pages.map((x) => (x.id === p.id ? { ...x, overlays } : x)) })); setEditingPage(null); }} />
              ) : (
                <div className="app-wrap py-2"><Button size="sm" variant="secondary" onClick={() => setEditingPage(p.id)}>
                  Editar viñetas de la página {i + 1} ({(p.overlays || []).length})
                </Button></div>
              )
            )}
          </div>
        ))}
      </div>
      <div className="app-reader-nav">
        <ChapterNav prev={c.prev} next={c.next} likes={c.likes} comments={c.comments} liked={c.liked}
          onPrev={() => c.prev && go(c.prev)} onNext={() => c.next && go(c.next)} onLike={like} onShare={share} />
      </div>
      <div className="app-strip-comments">
        <Comments chapter={c.id} onCount={(k) => setData((d) => ({ ...d, comments: d.comments + k }))} />
      </div>
    </div>
  );
}
