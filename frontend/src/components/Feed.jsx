import { useNavigate } from "react-router-dom";
import { api, img } from "../api";
import { useAuth } from "../auth";
import { ArtworkCard, Button, MasonryGrid } from "../ds/ilustra";
import { useToast } from "../toast";
import { Empty, ErrorState, Loading } from "./States";

/** Acciones de me gusta / guardar sobre una lista de obras (actualización optimista). */
export function useArtworkActions(setItems) {
  const { requireLogin } = useAuth();
  const toast = useToast();
  const patch = (id, fn) => setItems((list) => list.map((a) => (a.id === id ? { ...a, ...fn(a) } : a)));
  const like = requireLogin(async (a) => {
    patch(a.id, (x) => ({ liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) }));
    try {
      const r = await api.post(`/artworks/${a.id}/like`);
      patch(a.id, () => ({ liked: r.liked, likes: r.likes }));
    } catch (e) {
      patch(a.id, () => ({ liked: a.liked, likes: a.likes }));
      toast(e.message, "error");
    }
  });
  const save = requireLogin(async (a) => {
    patch(a.id, (x) => ({ saved: !x.saved }));
    try {
      const r = await api.post(`/artworks/${a.id}/save`);
      patch(a.id, () => ({ saved: r.saved }));
      toast(r.saved ? "Guardada en tu colección." : "Quitada de guardados.", "ok");
    } catch (e) {
      patch(a.id, () => ({ saved: a.saved }));
      toast(e.message, "error");
    }
  });
  return { like, save };
}

export function ArtworkGrid({ items, setItems, columns, emptyTitle = "Todavía no hay obras", emptyText }) {
  const nav = useNavigate();
  const { like, save } = useArtworkActions(setItems);
  if (!items.length) return <Empty title={emptyTitle} text={emptyText} />;
  return (
    <MasonryGrid columns={columns}>
      {items.map((a) => (
        <ArtworkCard key={a.id} image={img(a.image, 400)} ratio={a.ratio} title={a.title} artist={{ ...a.artist, avatar: img(a.artist.avatar, 400) }}
          category={a.category} likes={a.likes} comments={a.comments} liked={a.liked} saved={a.saved}
          onOpen={() => nav(`/obra/${a.id}`)} onArtist={() => a.artist.slug && nav(`/artista/${a.artist.slug}`)}
          onLike={() => like(a)} onSave={() => save(a)} />
      ))}
    </MasonryGrid>
  );
}

/** Grilla paginada completa (usa usePaged). */
export function PagedGrid({ paged, ...rest }) {
  if (paged.error && !paged.items.length) return <ErrorState error={paged.error} />;
  if (paged.loading && !paged.items.length) return <Loading />;
  return (
    <>
      <ArtworkGrid items={paged.items} setItems={paged.setItems} {...rest} />
      {paged.hasMore && (
        <div className="d-flex justify-content-center mt-4">
          <Button variant="secondary" onClick={paged.more} disabled={paged.loading}>{paged.loading ? "Cargando…" : "Ver más"}</Button>
        </div>
      )}
    </>
  );
}

/** Tarjeta de serie reutilizando ArtworkCard (portada + título + categoría). */
export function SeriesCard({ s }) {
  const nav = useNavigate();
  return (
    <ArtworkCard className="app-series" image={img(s.cover, 400)} ratio={s.ratio} title={s.title} artist={{ ...s.artist, avatar: img(s.artist.avatar, 400) }}
      category={s.category} onOpen={() => nav(`/serie/${s.id}`)} onArtist={() => s.artist.slug && nav(`/artista/${s.artist.slug}`)} />
  );
}
