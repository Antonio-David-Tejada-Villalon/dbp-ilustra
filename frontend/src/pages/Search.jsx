import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SearchField, SectionHeader, ScrollRow } from "../ds/ilustra";
import { useApi, useTitle } from "../hooks";
import { ArtworkGrid, SeriesCard } from "../components/Feed";
import { ArtistTile, useFollow } from "../components/Artists";
import { Empty, Loading } from "../components/States";

export default function Search() {
  const [sp] = useSearchParams();
  const q = sp.get("q") || "";
  const nav = useNavigate();
  useTitle(q ? `Buscar: ${q}` : "Buscar");
  const { data, loading, setData } = useApi(q.length >= 2 ? `/search?q=${encodeURIComponent(q)}` : null);
  const follow = useFollow((fn) => setData((d) => ({ ...d, artists: fn(d.artists) })));
  const [val, setVal] = useState(q);
  const none = data && !data.artworks.length && !data.series.length && !data.artists.length;
  return (
    <div className="app-wrap">
      <header className="app-page-head">
        <h1 className="display-lg m-0">Buscar</h1>
        <form role="search" onSubmit={(e) => { e.preventDefault(); if (val.trim().length >= 2) nav(`/buscar?q=${encodeURIComponent(val.trim())}`); }}>
          <SearchField size="lg" value={val} onChange={(e) => setVal(e.target.value)} autoFocus />
        </form>
      </header>
      {loading && <Loading />}
      {none && <Empty title={`Sin resultados para «${q}»`} text="Probá con otra palabra, el nombre de un artista o una etiqueta." />}
      {data?.artists.length > 0 && <section><SectionHeader title="Artistas" /><ScrollRow itemWidth={250}>{data.artists.map((a) => <ArtistTile key={a.id} a={a} onFollow={follow} />)}</ScrollRow></section>}
      {data?.series.length > 0 && <section><SectionHeader title="Series" /><ScrollRow itemWidth={220}>{data.series.map((s) => <SeriesCard key={s.id} s={s} />)}</ScrollRow></section>}
      {data?.artworks.length > 0 && <section><SectionHeader title="Obras" /><ArtworkGrid items={data.artworks} setItems={(fn) => setData((d) => ({ ...d, artworks: fn(d.artworks) }))} /></section>}
    </div>
  );
}
