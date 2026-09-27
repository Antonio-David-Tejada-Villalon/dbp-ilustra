import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, img } from "../api";
import { useAuth } from "../auth";
import { ChapterNav, ProtectedImage, ReaderBar } from "../ds/ilustra";
import { useApi, useTitle } from "../hooks";
import { useToast } from "../toast";
import Comments from "../components/Comments";
import { ErrorState, Loading } from "../components/States";

export default function Reader() {
  const { id, n } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { requireLogin } = useAuth();
  const { data: c, error, loading, setData } = useApi(`/series/${id}/chapters/${n}`);
  const [progress, setProgress] = useState(0);
  useTitle(c ? `${c.series.title} · cap. ${c.number}` : "Lector");

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.round((window.scrollY / max) * 100) : 100);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [c]);
  useEffect(() => { window.scrollTo(0, 0); }, [n]);

  if (loading) return <Loading />;
  if (error) return <ErrorState error={error} />;
  const go = (num) => nav(`/leer/${id}/${num}`);
  const like = requireLogin(async () => {
    try { const r = await api.post(`/series/${id}/chapters/${c.number}/like`); setData((d) => ({ ...d, ...r })); }
    catch (e) { toast(e.message, "error"); }
  });
  const follow = requireLogin(async () => {
    try { const r = await api.post(`/users/${c.series.artist.slug}/follow`); setData((d) => ({ ...d, following: r.following })); }
    catch (e) { toast(e.message, "error"); }
  });
  const share = async () => {
    try { if (navigator.share) await navigator.share({ title: c.series.title, url: location.href }); else { await navigator.clipboard.writeText(location.href); toast("Enlace copiado.", "ok"); } } catch { /* cancelado */ }
  };
  const mark = `${c.series.artist.handle} · DBP Ilustra`;

  return (
    <div className="app-reader">
      <div className="app-reader-bar">
        <ReaderBar series={c.series.title} category={c.series.category} chapter={c.number} title={c.title} author={c.series.artist.name}
          progress={progress} following={c.following} onFollow={c.own ? undefined : follow} onBack={() => nav(`/serie/${id}`)} />
      </div>
      <div className="app-strip">
        {c.pages.map((p, i) => (
          <ProtectedImage key={p.id} src={img(p.image, 1200)} ratio={p.ratio} rounded={false} alt={`Página ${i + 1}`} watermark={i === 0 ? mark : undefined} />
        ))}
      </div>
      <div className="app-reader-nav">
        <ChapterNav prev={c.prev} next={c.next} likes={c.likes} comments={c.comments} liked={c.liked}
          onPrev={() => c.prev && go(c.prev)} onNext={() => c.next && go(c.next)} onLike={like} onShare={share} />
      </div>
      <div className="app-strip-comments">
        <Comments chapter={c.id} onCount={(k) => setData((d) => ({ ...d, comments: d.comments + k }))} />
      </div>
    </div>
  );
}
