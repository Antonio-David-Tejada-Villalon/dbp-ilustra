import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { img } from "../api";
import { useAuth } from "../auth";
import { CategoryTag, Hero, SectionHeader, ScrollRow, Tabs } from "../ds/ilustra";
import { useApi, usePaged, useTitle } from "../hooks";
import { PagedGrid } from "../components/Feed";
import { ArtistTile, useFollow } from "../components/Artists";
import { Link } from "react-router-dom";

const SORTS = [{ id: "trending", label: "Tendencias" }, { id: "recent", label: "Recientes" }, { id: "following", label: "De quienes sigo" }];
const CATS = ["ilustracion", "comic", "manga", "historieta", "boceto"];

export default function Home() {
  useTitle("");
  const nav = useNavigate();
  const { user, setLoginOpen } = useAuth();
  const [sort, setSort] = useState("trending");
  const [cat, setCat] = useState("");
  const disc = useApi("/discover");
  const paged = usePaged(`/artworks?sort=${sort}${cat ? "&category=" + cat : ""}`);
  const follow = useFollow((fn) => disc.setData((d) => ({ ...d, recommended: fn(d.recommended) })));
  const works = (disc.data?.featured || []).slice(0, 4).map((a) => ({ image: img(a.image, 800), ratio: a.ratio, artist: a.artist.name, title: a.title }));

  return (
    <div className="app-wrap">
      <Hero works={works} secondaryLabel="Leer historietas" onPrimary={() => nav("/artistas")} onSecondary={() => nav("/categoria/historieta")} />
      <section>
        <SectionHeader title="Obras destacadas" action="Descubrir más" href="/descubrir" linkAs={Link} />
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <Tabs items={SORTS} active={sort} onChange={(s) => (s === "following" && !user ? setLoginOpen(true) : setSort(s))} />
          <div className="d-flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
            {CATS.map((c) => (
              <button key={c} type="button" className={"app-chip-btn" + (cat === c ? " is-on" : "")} aria-pressed={cat === c} onClick={() => setCat(cat === c ? "" : c)}>
                <CategoryTag category={c} />
              </button>
            ))}
          </div>
        </div>
        <PagedGrid paged={paged} emptyTitle={sort === "following" ? "Todavía no seguís a nadie" : "Todavía no hay obras"}
          emptyText={sort === "following" ? "Seguí artistas para ver acá sus nuevas obras." : "¡Sé la primera persona en publicar!"} />
      </section>
      {disc.data?.recommended?.length > 0 && (
        <section>
          <SectionHeader title="Artistas para seguir" action="Ver artistas" href="/artistas" linkAs={Link} />
          <ScrollRow itemWidth={250}>{disc.data.recommended.map((a) => <ArtistTile key={a.id} a={a} onFollow={follow} />)}</ScrollRow>
        </section>
      )}
    </div>
  );
}
