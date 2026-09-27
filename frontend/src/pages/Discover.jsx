import { Link, useNavigate } from "react-router-dom";
import { img } from "../api";
import { ArtworkCard, CategoryTag, SearchField, SectionHeader, ScrollRow } from "../ds/ilustra";
import { useApi, useTitle } from "../hooks";
import { ArtworkGrid, SeriesCard } from "../components/Feed";
import { ArtistTile, useFollow } from "../components/Artists";
import { ErrorState, Loading } from "../components/States";

const BLANK = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

export default function Discover() {
  useTitle("Descubrir");
  const nav = useNavigate();
  const { data, error, loading, reload, setData } = useApi("/discover");
  const followIn = (key) => useFollow((fn) => setData((d) => ({ ...d, [key]: fn(d[key]) })));
  const followTrending = followIn("trendingArtists");
  const followNew = followIn("newArtists");
  const followRec = followIn("recommended");
  const setList = (key) => (fn) => setData((d) => ({ ...d, [key]: fn(d[key]) }));

  return (
    <div className="app-wrap">
      <header className="app-page-head">
        <div className="il-overline">Descubrir</div>
        <h1 className="display-lg m-0">¿Qué querés ver hoy?</h1>
        <form role="search" onSubmit={(e) => { e.preventDefault(); const q = e.target.elements.q.value.trim(); if (q) nav(`/buscar?q=${encodeURIComponent(q)}`); }}>
          <SearchField size="lg" name="q" />
        </form>
        <div className="d-flex flex-wrap gap-2">
          {["ilustracion", "comic", "manga", "historieta", "boceto"].map((c) => <Link key={c} to={`/categoria/${c}`}><CategoryTag category={c} /></Link>)}
        </div>
      </header>
      {loading && <Loading />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data && (
        <>
          {data.trendingArtists.length > 0 && <section><SectionHeader overline="Estas dos semanas" title="Artistas en tendencia" action="Ver todo" href="/artistas" linkAs={Link} />
            <ScrollRow itemWidth={250}>{data.trendingArtists.map((a) => <ArtistTile key={a.id} a={a} onFollow={followTrending} />)}</ScrollRow></section>}
          {data.featured.length > 0 && <section><SectionHeader title="Obras destacadas" /><ArtworkGrid items={data.featured} setItems={setList("featured")} /></section>}
          {data.newIllustrations.length > 0 && <section><SectionHeader title="Nuevas ilustraciones" action="Ver todo" href="/categoria/ilustracion" linkAs={Link} />
            <ArtworkGrid items={data.newIllustrations} setItems={setList("newIllustrations")} /></section>}
          {[["comics", "Cómics", "comic"], ["manga", "Manga", "manga"], ["historietas", "Historietas", "historieta"]].map(([k, t, c]) =>
            data[k].length > 0 && <section key={k}><SectionHeader title={t} action={`Ver ${t.toLowerCase()}`} href={`/categoria/${c}`} linkAs={Link} />
              <ScrollRow itemWidth={220}>{data[k].map((s) => <SeriesCard key={s.id} s={s} />)}</ScrollRow></section>)}
          {data.recommended.length > 0 && <section><SectionHeader overline="Para vos" title="Creadores recomendados" />
            <ScrollRow itemWidth={250}>{data.recommended.map((a) => <ArtistTile key={a.id} a={a} onFollow={followRec} />)}</ScrollRow></section>}
          {data.newArtists.length > 0 && <section><SectionHeader overline="Nuevos en Ilustra" title="Artistas recién llegados" action="Ver todo" href="/artistas?sort=new" linkAs={Link} />
            <ScrollRow itemWidth={250}>{data.newArtists.map((a) => <ArtistTile key={a.id} a={a} onFollow={followNew} />)}</ScrollRow></section>}
          {data.projects.length > 0 && <section><SectionHeader overline="DBP · Actividades literarias" title="Proyectos culturales" />
            <ScrollRow itemWidth={300}>{data.projects.map((p) => (
              <a key={p.id} href={p.link || undefined} target="_blank" rel="noreferrer" className="text-decoration-none">
                <ArtworkCard className="app-series" image={p.image ? img(p.image, 800) : BLANK} ratio={1.5} title={p.title} artist={{ name: p.summary }} category="dbp" />
              </a>))}</ScrollRow></section>}
        </>
      )}
    </div>
  );
}
