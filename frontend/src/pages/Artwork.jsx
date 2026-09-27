import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, img } from "../api";
import { useAuth } from "../auth";
import { ArtworkViewer, Button, SectionHeader } from "../ds/ilustra";
import { useApi, usePaged, useTitle } from "../hooks";
import { useToast } from "../toast";
import Comments from "../components/Comments";
import { ArtworkGrid } from "../components/Feed";
import ReportDialog from "../components/ReportDialog";
import { ErrorState, Loading } from "../components/States";

export default function Artwork() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { requireLogin } = useAuth();
  const { data: a, error, loading, setData } = useApi(`/artworks/${id}`);
  const more = usePaged(a ? `/artworks?author=${a.artist.slug}&limit=10` : null);
  const [report, setReport] = useState(null);
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

  return (
    <div className="app-wrap">
      {a.status === "hidden" && <div className="app-alert">Esta obra está oculta por moderación y solo la ves vos.</div>}
      <ArtworkViewer image={img(a.image, 1600)} ratio={a.ratio} title={a.title} description={a.description} category={a.category}
        date={a.date} tags={a.tags} artist={{ ...a.artist, avatar: img(a.artist.avatar, 400) }} own={a.own}
        likes={a.likes} comments={a.comments} liked={a.liked} saved={a.saved} following={a.following}
        onLike={like} onSave={save} onFollow={follow} onShare={share} onArtist={() => nav(`/artista/${a.artist.slug}`)}
        onReport={a.own ? undefined : requireLogin(() => setReport({ type: "artwork", id: a.id }))}>
        {a.own && <div className="d-flex gap-2"><Button size="sm" variant="secondary" onClick={remove}>Eliminar obra</Button></div>}
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
