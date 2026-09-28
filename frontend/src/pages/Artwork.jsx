import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, img } from "../api";
import { useAuth } from "../auth";
import { ArtworkViewer, Button, CATEGORIES, SectionHeader } from "../ds/ilustra";
import { useApi, usePaged, useTitle } from "../hooks";
import { useToast } from "../toast";
import Comments from "../components/Comments";
import { ArtworkGrid } from "../components/Feed";
import ImageUrlField from "../components/ImageUrlField";
import ReportDialog from "../components/ReportDialog";
import { ErrorState, Loading } from "../components/States";

const CATS = Object.entries(CATEGORIES).filter(([c]) => c !== "dbp");

function EditForm({ a, onSaved, onCancel }) {
  const toast = useToast();
  const [f, setF] = useState({ title: a.title, description: a.description, category: a.category, tags: (a.tags || []).join(", "), image_url: a.imageUrl });
  const [valid, setValid] = useState(true);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...f, tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean) };
      if (body.image_url === a.imageUrl) delete body.image_url;
      const updated = await api.patch(`/artworks/${a.id}`, body);
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
      <ImageUrlField id="e-img" label="Enlace de la imagen" value={f.image_url} onChange={set("image_url")} onValid={(v) => setValid(!!v)}
        hint="Dejalo igual si no querés cambiar la imagen." />
      <div><label className="form-label body-strong" htmlFor="e-t">Título</label>
        <input id="e-t" className="form-control" required maxLength={120} value={f.title} onChange={set("title")} /></div>
      <div><label className="form-label body-strong" htmlFor="e-c">Categoría</label>
        <select id="e-c" className="form-select" value={f.category} onChange={set("category")}>{CATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
      <div><label className="form-label body-strong" htmlFor="e-d">Descripción</label>
        <textarea id="e-d" className="form-control" rows={4} maxLength={2000} value={f.description} onChange={set("description")} /></div>
      <div><label className="form-label body-strong" htmlFor="e-g">Etiquetas</label>
        <input id="e-g" className="form-control" value={f.tags} onChange={set("tags")} placeholder="acuarela, paisaje, cordillera" />
        <small className="text-muted-ink">Hasta 10, separadas por coma.</small></div>
      <div className="d-flex gap-2 justify-content-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>Cancelar</Button>
        <Button type="submit" disabled={busy || !valid || !f.title.trim()}>{busy ? "Guardando…" : "Guardar cambios"}</Button>
      </div>
    </form>
  );
}

export default function Artwork() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { requireLogin } = useAuth();
  const { data: a, error, loading, setData } = useApi(`/artworks/${id}`);
  const more = usePaged(a ? `/artworks?author=${a.artist.slug}&limit=10` : null);
  const [report, setReport] = useState(null);
  const [editing, setEditing] = useState(false);
  useTitle(a?.title);
  if (loading) return <Loading />;
  if (error) return <div className="app-wrap"><ErrorState error={error} /></div>;

  const like = requireLogin(async () => {
    const r = await api.post(`/artworks/${a.id}/like`).catch((e) => toast(e.message, "error"));
    r && setData((d) => ({ ...d, ...r }));
  });
  const save = requireLogin(async () => {
    const r = await api.post(`/artworks/${a.id}/save`).catch((e) => toast(e.message, "error"));
    r && (setData((d) => ({ ...d, saved: r.saved })), toast(r.saved ? "Guardada en tu colección." : "Quitada de guardados.", "ok"));
  });
  const follow = requireLogin(async () => {
    const r = await api.post(`/users/${a.artist.slug}/follow`).catch((e) => toast(e.message, "error"));
    r && setData((d) => ({ ...d, following: r.following }));
  });
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: a.title, url });
      else { await navigator.clipboard.writeText(url); toast("Enlace copiado.", "ok"); }
    } catch { /* cancelado */ }
  };
  const remove = async () => {
    if (!window.confirm("¿Eliminar esta obra? No se puede deshacer.")) return;
    try { await api.del(`/artworks/${a.id}`); toast("Obra eliminada.", "ok"); nav(`/artista/${a.artist.slug}`); } catch (e) { toast(e.message, "error"); }
  };
  const others = more.items.filter((x) => x.id !== a.id).slice(0, 8);

  if (editing) {
    return (
      <div className="app-wrap app-narrow">
        <header className="app-page-head"><h1 className="display-lg m-0">Editar obra</h1></header>
        <EditForm a={a} onCancel={() => setEditing(false)}
          onSaved={(updated) => { setData((d) => ({ ...d, ...updated, imageUrl: updated.imageUrl ?? d.imageUrl })); setEditing(false); }} />
      </div>
    );
  }

  return (
    <div className="app-wrap">
      {a.status === "hidden" && <div className="app-alert">Esta obra está oculta por moderación y solo la ves vos.</div>}
      <ArtworkViewer image={img(a.image, 1600)} ratio={a.ratio} title={a.title} description={a.description} category={a.category}
        date={a.date} tags={a.tags} artist={{ ...a.artist, avatar: img(a.artist.avatar, 400) }} own={a.own}
        likes={a.likes} comments={a.comments} liked={a.liked} saved={a.saved} following={a.following}
        onLike={like} onSave={save} onFollow={follow} onShare={share} onArtist={() => nav(`/artista/${a.artist.slug}`)}
        onReport={a.own ? undefined : requireLogin(() => setReport({ type: "artwork", id: a.id }))}>
        {a.own && (
          <div className="d-flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>Editar obra</Button>
            <Button size="sm" variant="secondary" onClick={remove}>Eliminar obra</Button>
          </div>
        )}
        <Comments artwork={a.id} onCount={(n) => setData((d) => ({ ...d, comments: d.comments + n }))} />
      </ArtworkViewer>
      {others.length > 0 && (
        <section>
          <SectionHeader title={`Más de ${a.artist.name}`} action="Ver muro" href={`/artista/${a.artist.slug}`} linkAs={Link} />
          <ArtworkGrid items={others} setItems={more.setItems} />
        </section>
      )}
      <ReportDialog target={report} onClose={() => setReport(null)} />
    </div>
  );
}
