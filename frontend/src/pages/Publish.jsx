import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { Button, Tabs } from "../ds/ilustra";
import { useApi, useTitle } from "../hooks";
import { useToast } from "../toast";
import HelpTip from "../components/HelpTip";
import ImageUrlField from "../components/ImageUrlField";
import { Empty, Loading } from "../components/States";

const CATS = [["ilustracion", "Ilustración"], ["comic", "Cómic"], ["manga", "Manga"], ["historieta", "Historieta"], ["boceto", "Boceto"]];
const SCATS = CATS.filter(([c]) => ["comic", "manga", "historieta"].includes(c));

function ArtworkForm() {
  const nav = useNavigate();
  const toast = useToast();
  const [f, setF] = useState({ title: "", description: "", category: "ilustracion", image_url: "", tags: "" });
  const [valid, setValid] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target ? e.target.value : e });
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const a = await api.post("/artworks", { ...f, tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean) });
      toast("¡Obra publicada!", "ok");
      nav(`/obra/${a.id}`);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="app-form" onSubmit={submit}>
      <ImageUrlField id="img" label="Enlace de la imagen" value={f.image_url} onChange={set("image_url")} onValid={setValid} />
      <div><label className="form-label body-strong" htmlFor="t">Título</label>
        <input id="t" className="form-control" required maxLength={120} value={f.title} onChange={set("title")} /></div>
      <div><label className="form-label body-strong" htmlFor="c">Categoría</label>
        <select id="c" className="form-select" value={f.category} onChange={set("category")}>{CATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
      <div><label className="form-label body-strong" htmlFor="d">Descripción</label>
        <textarea id="d" className="form-control" rows={4} maxLength={2000} value={f.description} onChange={set("description")} placeholder="Técnica, contexto, lo que quieras contar." /></div>
      <div><label className="form-label body-strong" htmlFor="g">Etiquetas</label>
        <input id="g" className="form-control" value={f.tags} onChange={set("tags")} placeholder="acuarela, paisaje, cordillera" />
        <small className="text-muted-ink">Hasta 10, separadas por coma.</small></div>
      <div className="d-flex gap-2 justify-content-end"><Button type="submit" size="lg" disabled={busy || !valid || !f.title.trim()}>{busy ? "Publicando…" : "Publicar obra"}</Button></div>
    </form>
  );
}

function SeriesForm({ onCreated }) {
  const toast = useToast();
  const [f, setF] = useState({ title: "", description: "", category: "historieta", cover_url: "" });
  const [valid, setValid] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target ? e.target.value : e });
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const s = await api.post("/series", f);
      toast("Serie creada. Ahora agregá el primer capítulo.", "ok");
      onCreated(s.id);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="app-form" onSubmit={submit}>
      <div><label className="form-label body-strong" htmlFor="st">Título de la serie</label>
        <input id="st" className="form-control" required maxLength={120} value={f.title} onChange={set("title")} /></div>
      <div><label className="form-label body-strong" htmlFor="sc">Tipo</label>
        <select id="sc" className="form-select" value={f.category} onChange={set("category")}>{SCATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
      <ImageUrlField id="cover" label="Portada" value={f.cover_url} onChange={set("cover_url")} onValid={setValid} />
      <div><label className="form-label body-strong" htmlFor="sd">Sinopsis</label>
        <textarea id="sd" className="form-control" rows={4} maxLength={2000} value={f.description} onChange={set("description")} /></div>
      <div className="d-flex justify-content-end"><Button type="submit" size="lg" disabled={busy || !valid || !f.title.trim()}>Crear serie</Button></div>
    </form>
  );
}

function ChapterForm({ seriesId, mine }) {
  const nav = useNavigate();
  const toast = useToast();
  const [sid, setSid] = useState(seriesId || (mine[0] && String(mine[0].id)) || "");
  const [title, setTitle] = useState("");
  const [pages, setPages] = useState("");
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);
  const urls = pages.split("\n").map((l) => l.trim()).filter(Boolean);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErrors([]);
    try {
      const r = await api.post(`/series/${sid}/chapters`, { title, pages: urls });
      toast(`Capítulo ${r.number} publicado.`, "ok");
      nav(`/leer/${r.series}/${r.number}`);
    } catch (err) {
      if (err.data?.pages) setErrors(err.data.pages);
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };
  if (!mine.length) return <Empty title="Primero creá una serie" text="Los capítulos se agregan dentro de una serie de cómic, manga o historieta." />;
  return (
    <form className="app-form" onSubmit={submit}>
      <div><label className="form-label body-strong" htmlFor="cs">Serie</label>
        <select id="cs" className="form-select" value={sid} onChange={(e) => setSid(e.target.value)}>{mine.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}</select></div>
      <div><label className="form-label body-strong" htmlFor="ct">Título del capítulo (opcional)</label>
        <input id="ct" className="form-control" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
      <div><label className="form-label body-strong" htmlFor="cp">Páginas en orden
          <HelpTip title="¿Cómo cargo las páginas?">
            <p>Un enlace directo a imagen por línea (igual que en Obra), en el orden en que se leen: primero la página 1, después la 2, etc.</p>
            <p className="m-0">Ejemplo:</p>
            <p className="m-0"><code>https://i.ibb.co/.../pagina-01.jpg</code><br /><code>https://i.ibb.co/.../pagina-02.jpg</code></p>
          </HelpTip>
        </label>
        <textarea id="cp" className="form-control font-monospace" rows={8} value={pages} onChange={(e) => setPages(e.target.value)}
          placeholder={"https://…/pagina-01.jpg\nhttps://…/pagina-02.jpg"} />
        <small className="text-muted-ink">Un enlace por línea, en orden de lectura. {urls.length} página(s). Máximo 80.</small></div>
      {errors.length > 0 && <div className="app-alert" role="alert">{errors.map((e) => <div key={e.page}>Página {e.page}: {e.error}</div>)}</div>}
      <div className="d-flex justify-content-end"><Button type="submit" size="lg" disabled={busy || !sid || !urls.length}>{busy ? "Verificando páginas…" : "Publicar capítulo"}</Button></div>
    </form>
  );
}

export default function Publish() {
  useTitle("Publicar");
  const { user, setLoginOpen } = useAuth();
  const [sp] = useSearchParams();
  const [tab, setTab] = useState(sp.get("serie") ? "chapter" : "artwork");
  const [newSeries, setNewSeries] = useState(sp.get("serie") || "");
  const mine = useApi(user ? `/series?author=${user.slug}` : null);
  if (user === undefined) return <Loading />;
  if (!user) return <div className="app-wrap"><Empty title="Ingresá para publicar" action={<Button onClick={() => setLoginOpen(true)}>Ingresar</Button>} /></div>;
  if (!user.isArtist) return (
    <div className="app-wrap"><Empty title="Activá tu perfil de artista" text="Para publicar obras y series, activá «Soy artista» en Ajustes."
      action={<Link to="/ajustes"><Button>Ir a Ajustes</Button></Link>} /></div>
  );
  return (
    <div className="app-wrap app-narrow">
      <header className="app-page-head">
        <div className="il-overline">Publicar</div>
        <h1 className="display-lg m-0">Compartí tu obra</h1>
        <p className="m-0"><Link to="/guia-artistas">¿Primera vez? Mirá la guía para artistas</Link></p>
      </header>
      <Tabs items={[{ id: "artwork", label: "Obra" }, { id: "series", label: "Nueva serie" }, { id: "chapter", label: "Capítulo" }]} active={tab} onChange={setTab} />
      {tab === "artwork" && <ArtworkForm />}
      {tab === "series" && <SeriesForm onCreated={(id) => { setNewSeries(String(id)); mine.reload(); setTab("chapter"); }} />}
      {tab === "chapter" && (mine.loading ? <Loading /> : <ChapterForm key={newSeries} seriesId={newSeries} mine={mine.data?.items || []} />)}
    </div>
  );
}
