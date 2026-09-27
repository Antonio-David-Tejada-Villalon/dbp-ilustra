import { useNavigate } from "react-router-dom";
import { api, img } from "../api";
import { useAuth } from "../auth";
import { ArtistCard } from "../ds/ilustra";
import { useToast } from "../toast";

export function useFollow(setList) {
  const { requireLogin } = useAuth();
  const toast = useToast();
  return requireLogin(async (a) => {
    try {
      const r = await api.post(`/users/${a.slug}/follow`);
      setList((l) => l.map((x) => (x.slug === a.slug ? { ...x, following: r.following } : x)));
    } catch (e) {
      toast(e.message, "error");
    }
  });
}

export function ArtistTile({ a, onFollow }) {
  const nav = useNavigate();
  return (
    <div className="app-artist" onClick={(e) => { if (!e.target.closest("button")) nav(`/artista/${a.slug}`); }}>
      <ArtistCard name={a.name} handle={a.handle} avatar={img(a.avatar, 400)} disciplines={a.disciplines} works={a.works}
        following={a.following} onFollow={a.own ? undefined : () => onFollow(a)} />
    </div>
  );
}
