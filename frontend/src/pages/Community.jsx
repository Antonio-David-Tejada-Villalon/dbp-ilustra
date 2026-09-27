import { Link } from "react-router-dom";
import { useAuth } from "../auth";
import { Button, SectionHeader, ScrollRow } from "../ds/ilustra";
import { useApi, usePaged, useTitle } from "../hooks";
import { PagedGrid } from "../components/Feed";
import { ArtistTile, useFollow } from "../components/Artists";
import { Empty } from "../components/States";

export default function Community() {
  useTitle("Comunidad");
  const { user, setLoginOpen } = useAuth();
  const disc = useApi("/discover");
  const paged = usePaged(user ? "/artworks?sort=following" : null);
  const follow = useFollow((fn) => disc.setData((d) => ({ ...d, newArtists: fn(d.newArtists) })));
  return (
    <div className="app-wrap">
      <header className="app-page-head">
        <div className="il-overline">Comunidad</div>
        <h1 className="display-lg m-0">Lo nuevo de quienes seguís</h1>
      </header>
      {user ? <PagedGrid paged={paged} emptyTitle="Todavía no seguís a nadie" emptyText="Explorá artistas y seguí a quienes te gusten." /> : (
        <Empty title="Sumate a la comunidad" text="Ingresá con Google para seguir artistas, comentar y guardar obras."
          action={<Button onClick={() => setLoginOpen(true)}>Ingresar</Button>} />
      )}
      {disc.data?.newArtists?.length > 0 && (
        <section><SectionHeader overline="Bienvenida" title="Artistas recién llegados" action="Ver artistas" href="/artistas?sort=new" linkAs={Link} />
          <ScrollRow itemWidth={250}>{disc.data.newArtists.map((a) => <ArtistTile key={a.id} a={a} onFollow={follow} />)}</ScrollRow></section>
      )}
    </div>
  );
}
