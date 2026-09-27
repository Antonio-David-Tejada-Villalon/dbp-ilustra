import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, img } from "../api";
import { useAuth } from "../auth";
import { Button, NotificationItem } from "../ds/ilustra";
import { usePaged, useTitle } from "../hooks";
import { Empty, Loading } from "../components/States";

export default function Notifications() {
  useTitle("Notificaciones");
  const { user, setUser, setLoginOpen } = useAuth();
  const nav = useNavigate();
  const paged = usePaged(user ? "/notifications" : null);
  useEffect(() => {
    if (user?.unread) api.post("/notifications/read-all").then(() => setUser((u) => ({ ...u, unread: 0 }))).catch(() => {});
  }, [user?.unread, setUser]);
  if (user === undefined) return <Loading />;
  if (!user) return <div className="app-wrap"><Empty title="Ingresá para ver tus notificaciones" action={<Button onClick={() => setLoginOpen(true)}>Ingresar</Button>} /></div>;
  const open = (n) => {
    if (n.artwork) nav(`/obra/${n.artwork}`);
    else if (n.series) nav(`/leer/${n.series}/${n.chapter}`);
    else if (n.actor?.slug) nav(`/artista/${n.actor.slug}`);
  };
  return (
    <div className="app-wrap app-narrow">
      <header className="app-page-head"><h1 className="display-lg m-0">Notificaciones</h1></header>
      {paged.loading && !paged.items.length ? <Loading /> : paged.items.length === 0 ? <Empty title="Todo tranquilo por acá" text="Cuando alguien comente, te siga o le guste tu obra, lo vas a ver acá." /> : (
        <div className="app-list">
          {paged.items.map((n) => (
            <button key={n.id} type="button" className="app-list-btn" onClick={() => open(n)}>
              <NotificationItem type={n.type === "reply" ? "comment" : n.type} actor={{ ...n.actor, avatar: img(n.actor.avatar, 400) }}
                text={n.text} time={n.time} unread={n.unread} thumb={n.thumb} />
            </button>
          ))}
        </div>
      )}
      {paged.hasMore && <div className="d-flex justify-content-center"><Button variant="secondary" onClick={paged.more}>Ver más</Button></div>}
    </div>
  );
}
