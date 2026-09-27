import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, img } from "../api";
import { useAuth } from "../auth";
import { Button, ProfileHeader, SectionHeader, ScrollRow } from "../ds/ilustra";
import { useApi, usePaged, useTitle } from "../hooks";
import { useToast } from "../toast";
import { PagedGrid, SeriesCard } from "../components/Feed";
import Dialog from "../components/Dialog";
import ReportDialog from "../components/ReportDialog";
import { ErrorState, Loading } from "../components/States";

const TABS = [["port", "Portfolio", null], ["ilustracion", "Ilustraciones", "ilustracion"], ["comic", "Cómics", "comic"],
  ["manga", "Manga", "manga"], ["historieta", "Historieta", "historieta"], ["boceto", "Bocetos", "boceto"]];

export default function Profile() {
  const { handle } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { requireLogin } = useAuth();
  const [tab, setTab] = useState("port");
  const [report, setReport] = useState(null);
  const [contact, setContact] = useState(false);
  const { data: p, error, loading, setData } = useApi(`/users/${handle}`);
  const cat = TABS.find((t) => t[0] === tab)?.[2];
  const works = usePaged(p ? `/artworks?author=${p.slug}${cat ? "&category=" + cat : ""}` : null);
  const series = useApi(p ? `/series?author=${p.slug}` : null);
  useTitle(p?.name);
  if (loading) return <Loading />;
  if (error) return <div className="app-wrap"><ErrorState error={error} /></div>;

  const follow = requireLogin(async () => {
    try {
      const r = await api.post(`/users/${p.slug}/follow`);
      setData((d) => ({ ...d, following: r.following, stats: { ...d.stats, followers: r.followers } }));
    } catch (e) { toast(e.message, "error"); }
  });
  const shownSeries = (series.data?.items || []).filter((s) => !cat || s.category === cat);
  const tabs = TABS.map(([id, label, c]) => ({ id, label, count: c ? p.counts[c] || 0 : p.stats.works }));

  return (
    <div className="app-wrap">
      <ProfileHeader name={p.name} handle={p.handle} avatar={img(p.avatar, 400)} cover={p.cover ? img(p.cover, 1600) : undefined}
        bio={p.bio} location={p.location} disciplines={p.disciplines} accent={p.accent} stats={p.stats}
        following={p.following} onFollow={p.own ? () => nav("/ajustes") : follow}
        onContact={p.own ? () => nav("/ajustes") : () => setContact(true)}
        tabs={tabs} activeTab={tab} onTab={setTab} />
      {p.own && (
        <div className="d-flex flex-wrap gap-2">
          <Button icon="plus" onClick={() => nav("/publicar")}>Publicar</Button>
          <Button variant="secondary" icon="settings" onClick={() => nav("/ajustes")}>Editar estilo del muro</Button>
        </div>
      )}
      {!p.isArtist && !p.own && <p className="text-muted-ink">Este perfil todavía no publica obras.</p>}
      {shownSeries.length > 0 && (
        <section><SectionHeader title="Series" /><ScrollRow itemWidth={220}>{shownSeries.map((s) => <SeriesCard key={s.id} s={s} />)}</ScrollRow></section>
      )}
      <PagedGrid paged={works} emptyTitle={p.own ? "Todavía no publicaste en esta sección" : "Sin obras en esta sección"}
        emptyText={p.own ? "Tocá Publicar y pegá el enlace de tu imagen." : undefined} />
      <ReportDialog target={report} onClose={() => setReport(null)} />
      <Dialog open={contact} onClose={() => setContact(false)} title={`Contactar a ${p.name}`}>
        {p.contact ? <p className="m-0">Datos que {p.name} compartió: <strong className="app-break">{p.contact}</strong></p>
          : <p className="m-0 text-muted-ink">Este artista todavía no cargó datos de contacto. Podés dejarle un comentario en sus obras.</p>}
      </Dialog>
      {!p.own && <div className="text-end"><button className="il-linkbtn" onClick={requireLogin(() => setReport({ type: "user", id: p.id }))}>Reportar perfil</button></div>}
      <div className="visually-hidden"><Link to="/artistas">Artistas</Link></div>
    </div>
  );
}
