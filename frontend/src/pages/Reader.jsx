import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, img } from "../api";
import { useAuth } from "../auth";
import { Button, ChapterNav, ProtectedImage, ReaderBar } from "../ds/ilustra";
import { useApi, useTitle } from "../hooks";
import { useToast } from "../toast";
import Comments from "../components/Comments";
import { ErrorState, Loading } from "../components/States";

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

  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} />;
  const go = (num) => nav(`/leer/${id}/${num}`);
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
      {c.own && <div className="app-wrap d-flex gap-2 py-2"><Button size="sm" variant="secondary" onClick={() => setEditing(true)}>Editar capítulo</Button></div>}
      <div className="app-strip">
        {c.pages.map((p, i) => (
          <ProtectedImage key={p.id} src={img(p.image, 1200)} ratio={p.ratio} rounded={false} alt={`Página ${i + 1}`} watermark={i === 0 ? mark : undefined} />
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
