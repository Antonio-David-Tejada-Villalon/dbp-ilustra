import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, img } from "../api";
import { useAuth } from "../auth";
import { Avatar, Button, CategoryTag, ProtectedImage } from "../ds/ilustra";
import { useApi, useTitle } from "../hooks";
import { useToast } from "../toast";
import ImageUrlField from "../components/ImageUrlField";
import { Empty, ErrorState, Loading } from "../components/States";

const SCATS = [["comic", "Cómic"], ["manga", "Manga"], ["historieta", "Historieta"]];

function EditForm({ s, onSaved, onCancel }) {
  const toast = useToast();
  const [f, setF] = useState({ title: s.title, description: s.description, category: s.category, cover_url: s.coverUrl });
  const [valid, setValid] = useState(true);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...f };
      if (body.cover_url === s.coverUrl) delete body.cover_url;
      const updated = await api.patch(`/series/${s.id}`, body);
      toast("Cambios guardados.", "ok");
      onSaved(updated);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="app-form" onSubmit={submit}>
      <div><label className="form-label body-strong" htmlFor="es-t">Título de la serie</label>
        <input id="es-t" className="form-control" required maxLength={120} value={f.title} onChange={set("title")} /></div>
      <div><label className="form-label body-strong" htmlFor="es-c">Tipo</label>
        <select id="es-c" className="form-select" value={f.category} onChange={set("category")}>{SCATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
      <ImageUrlField id="es-cover" label="Portada" value={f.cover_url} onChange={set("cover_url")} onValid={(v) => setValid(!!v)}
        hint="Dejala igual si no querés cambiar la portada." />
      <div><label className="form-label body-strong" htmlFor="es-d">Sinopsis</label>
        <textarea id="es-d" className="form-control" rows={4} maxLength={2000} value={f.description} onChange={set("description")} /></div>
      <div className="d-flex gap-2 justify-content-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>Cancelar</Button>
        <Button type="submit" disabled={busy || !valid || !f.title.trim()}>{busy ? "Guardando…" : "Guardar cambios"}</Button>
      </div>
    </form>
  );
}

export default function Series() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { requireLogin } = useAuth();
  const { data: s, error, loading, setData } = useApi(`/series/${id}`);
  const [editing, setEditing] = useState(false);
  useTitle(s?.title);
  if (loading) return <Loading />;
  if (error) return <div className="app-wrap"><ErrorState error={error} /></div>;
  const follow = requireLogin(async () => {
    try { const r = await api.post(`/users/${s.artist.slug}/follow`); setData((d) => ({ ...d, following: r.following })); }
    catch (e) { toast(e.message, "error"); }
  });
  const remove = async () => {
    if (!window.confirm("¿Eliminar esta serie y todos sus capítulos? No se puede deshacer.")) return;
    try { await api.del(`/series/${s.id}`); toast("Serie eliminada.", "ok"); nav(`/artista/${s.artist.slug}`); } catch (e) { toast(e.message, "error"); }
  };
  const first = s.chapters[0];

  if (editing) {
    return (
      <div className="app-wrap app-narrow">
        <header className="app-page-head"><h1 className="display-lg m-0">Editar serie</h1></header>
        <EditForm s={s} onCancel={() => setEditing(false)}
          onSaved={(updated) => { setData((d) => ({ ...d, ...updated, coverUrl: updated.coverUrl ?? d.coverUrl })); setEditing(false); }} />
      </div>
    );
  }

  return (
    <div className="app-wrap">
      <article className="app-series-head">
        <div className="app-series-cover"><ProtectedImage src={img(s.cover, 800)} ratio={s.ratio} alt={s.title} /></div>
        <div className="d-grid gap-3 align-content-start">
          <div className="d-flex align-items-center gap-2"><CategoryTag category={s.category} /><span className="caption text-muted-ink">{s.chapters.length} capítulos</span></div>
          <h1 className="display-lg m-0">{s.title}</h1>
          <Link to={`/artista/${s.artist.slug}`} className="d-flex align-items-center gap-2 text-decoration-none">
            <Avatar src={img(s.artist.avatar, 400)} name={s.artist.name} size={36} /><span className="body-strong app-ink">{s.artist.name}</span>
          </Link>
          {s.description && <p className="body-lg m-0">{s.description}</p>}
          <div className="d-flex flex-wrap gap-2">
            {first && <Button size="lg" icon="book-open" onClick={() => nav(`/leer/${s.id}/${first.number}`)}>Leer desde el capítulo {first.number}</Button>}
            {s.own ? <Button size="lg" variant="secondary" icon="plus" onClick={() => nav(`/publicar?serie=${s.id}`)}>Agregar capítulo</Button>
              : <Button variant="follow" size="lg" active={s.following} onClick={follow} />}
          </div>
          {s.own && (
            <div className="d-flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>Editar serie</Button>
              <Button size="sm" variant="secondary" onClick={remove}>Eliminar serie</Button>
            </div>
          )}
        </div>
      </article>
      <section>
        <h2 className="title-lg">Capítulos</h2>
        {s.chapters.length === 0 ? <Empty title="Todavía no hay capítulos" /> : (
          <ol className="app-chapters">
            {s.chapters.map((c) => (
              <li key={c.number}>
                <Link to={`/leer/${s.id}/${c.number}`}>
                  <span className="app-ch-n">{c.number}</span>
                  <span className="app-ch-t">{c.title || `Capítulo ${c.number}`}</span>
                  <span className="caption text-muted-ink">{c.date} · {c.likes} me gusta · {c.comments} comentarios</span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
