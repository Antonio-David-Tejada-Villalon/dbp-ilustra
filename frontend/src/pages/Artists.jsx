import { useSearchParams } from "react-router-dom";
import { Button, CategoryTag, Tabs } from "../ds/ilustra";
import { usePaged, useTitle } from "../hooks";
import { ArtistTile, useFollow } from "../components/Artists";
import { Empty, Loading } from "../components/States";

const DISC = ["", "ilustracion", "comic", "manga", "historieta", "boceto"];

export default function Artists() {
  useTitle("Artistas");
  const [sp, setSp] = useSearchParams();
  const sort = sp.get("sort") || "popular";
  const d = sp.get("d") || "";
  const paged = usePaged(`/artists?sort=${sort}${d ? "&discipline=" + d : ""}`);
  const follow = useFollow(paged.setItems);
  const set = (k, v) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n); };
  return (
    <div className="app-wrap">
      <header className="app-page-head">
        <div className="il-overline">Comunidad</div>
        <h1 className="display-lg m-0">Artistas</h1>
      </header>
      <div className="d-flex flex-wrap justify-content-between gap-3 align-items-center">
        <Tabs items={[{ id: "popular", label: "Más seguidos" }, { id: "new", label: "Nuevos" }]} active={sort} onChange={(v) => set("sort", v)} />
        <div className="d-flex flex-wrap gap-2">
          {DISC.map((c) => (
            <button key={c || "all"} type="button" className={"app-chip-btn" + (d === c ? " is-on" : "")} aria-pressed={d === c} onClick={() => set("d", c)}>
              {c ? <CategoryTag category={c} /> : <span className="il-tag il-tag-boceto">Todas</span>}
            </button>
          ))}
        </div>
      </div>
      {paged.loading && !paged.items.length ? <Loading /> : paged.items.length === 0 ? <Empty title="No hay artistas para este filtro" /> : (
        <div className="app-artist-grid">{paged.items.map((a) => <ArtistTile key={a.id} a={a} onFollow={follow} />)}</div>
      )}
      {paged.hasMore && <div className="d-flex justify-content-center"><Button variant="secondary" onClick={paged.more}>Ver más</Button></div>}
    </div>
  );
}
