import { Link, useNavigate, useParams } from "react-router-dom";
import { api, img } from "../api";
import { useAuth } from "../auth";
import { Avatar, Button, CategoryTag, ProtectedImage } from "../ds/ilustra";
import { useApi, useTitle } from "../hooks";
import { useToast } from "../toast";
import { Empty, ErrorState, Loading } from "../components/States";

export default function Series() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { requireLogin } = useAuth();
  const { data: s, error, loading, setData } = useApi(`/series/${id}`);
  useTitle(s?.title);
  if (loading) return <Loading />;
  if (error) return <div className="app-wrap"><ErrorState error={error} /></div>;
  const follow = requireLogin(async () => {
    try { const r = await api.post(`/users/${s.artist.slug}/follow`); setData((d) => ({ ...d, following: r.following })); }
    catch (e) { toast(e.message, "error"); }
  });
  const first = s.chapters[0];
  return (
    <div className="app-wrap">
      <article className="app-series-head">
        <div className="app-series-cover"><ProtectedImage src={img(s.cover, 800)} ratio={s.ratio} alt={s.title} /></div>
        <div className="d-grid gap-3 align-content-start">
          <div className="d-flex align-items-center gap-2"><CategoryTag category={s.category} /><span className="caption text-muted-ink">{s.chapters.length} capítulos</span></div>
          <h1 className="display-lg m-0">{s.title}</h1>
          <Link to={`/artista/${s.artist.slug}`} className="d-flex align-items-center gap-2 text-decoration-none">
            <Avatar src={img(s.artist.avatar, 400)} name={s.artist.name} size={36} /><span className="body-strong app-ink">{s.artist.name}</span>
          </Link>
          {s.description && <p className="body-lg m-0">{s.description}</p>}
          <div className="d-flex flex-wrap gap-2">
            {first && <Button size="lg" icon="book-open" onClick={() => nav(`/leer/${s.id}/${first.number}`)}>Leer desde el capítulo {first.number}</Button>}
            {s.own ? <Button size="lg" variant="secondary" icon="plus" onClick={() => nav(`/publicar?serie=${s.id}`)}>Agregar capítulo</Button>
              : <Button variant="follow" size="lg" active={s.following} onClick={follow} />}
          </div>
        </div>
      </article>
      <section>
        <h2 className="title-lg">Capítulos</h2>
        {s.chapters.length === 0 ? <Empty title="Todavía no hay capítulos" /> : (
          <ol className="app-chapters">
            {s.chapters.map((c) => (
              <li key={c.number}>
                <Link to={`/leer/${s.id}/${c.number}`}>
                  <span className="app-ch-n">{c.number}</span>
                  <span className="app-ch-t">{c.title || `Capítulo ${c.number}`}</span>
                  <span className="caption text-muted-ink">{c.date} · {c.likes} me gusta · {c.comments} comentarios</span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
