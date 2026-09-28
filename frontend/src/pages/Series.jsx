import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, img } from "../api";
import { useAuth } from "../auth";
import { Avatar, Button, CategoryTag, ProtectedImage } from "../ds/ilustra";
import { useApi, useTitle } from "../hooks";
import { useToast } from "../toast";
import HelpTip from "../components/HelpTip";
import ImageUrlField from "../components/ImageUrlField";
import { Empty, ErrorState, Loading } from "../components/States";

const SCATS = [["comic", "Cómic"], ["manga", "Manga"], ["historieta", "Historieta"]];
const VOICES = [["", "Automática"], ["grave", "Grave"], ["aguda", "Aguda"], ["neutra", "Neutra"]];

function EditForm({ s, onSaved, onCancel }) {
  const toast = useToast();
  const [f, setF] = useState({ title: s.title, description: s.description, category: s.category, cover_url: s.coverUrl });
  const [valid, setValid] = useState(true);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e && e.target ? e.target.value : e });
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...f };
      if (body.cover_url === s.coverUrl) delete body.cover_url;
      const updated = await api.patch(`/series/${s.id}`, body);
      toast("Cambios guardados.", "ok");
      onSaved(updated);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="app-form" onSubmit={submit}>
      <div><label className="form-label body-strong" htmlFor="es-t">Título de la serie</label>
        <input id="es-t" className="form-control" required maxLength={120} value={f.title} onChange={set("title")} /></div>
      <div><label className="form-label body-strong" htmlFor="es-c">Tipo</label>
        <select id="es-c" className="form-select" value={f.category} onChange={set("category")}>{SCATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
      <ImageUrlField id="es-cover" label="Portada" value={f.cover_url} onChange={set("cover_url")} onValid={(v) => setValid(!!v)}
        hint="Dejala igual si no querés cambiar la portada." />
      <div><label className="form-label body-strong" htmlFor="es-d">Sinopsis</label>
        <textarea id="es-d" className="form-control" rows={4} maxLength={2000} value={f.description} onChange={set("description")} /></div>
      <div className="d-flex gap-2 justify-content-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>Cancelar</Button>
        <Button type="submit" disabled={busy || !valid || !f.title.trim()}>{busy ? "Guardando…" : "Guardar cambios"}</Button>
      </div>
    </form>
  );
}

function CharacterForm({ seriesId, character, onSaved, onCancel }) {
  const toast = useToast();
  const [f, setF] = useState({ name: character?.name || "", description: character?.description || "", image_url: character?.image || "", voice: character?.voice || "" });
  const [valid, setValid] = useState(!!character);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e && e.target ? e.target.value : e });
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...f };
      if (character && body.image_url === character.image) delete body.image_url;
      const saved = character
        ? await api.patch(`/series/${seriesId}/characters/${character.id}`, body)
        : await api.post(`/series/${seriesId}/characters`, body);
      toast(character ? "Personaje actualizado." : "Personaje agregado.", "ok");
      onSaved(saved);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="app-form app-character-form" onSubmit={submit}>
      <div><label className="form-label body-strong" htmlFor="ch-n">Nombre</label>
        <input id="ch-n" className="form-control" required maxLength={80} value={f.name} onChange={set("name")} /></div>
      <ImageUrlField id="ch-img" label="Imagen (podés usar un GIF animado)" value={f.image_url} onChange={set("image_url")} onValid={(v) => setValid(!!v)}
        hint={character ? "Dejala igual si no querés cambiar la imagen." : undefined} />
      <div><label className="form-label body-strong" htmlFor="ch-d">Descripción</label>
        <input id="ch-d" className="form-control" maxLength={300} value={f.description} onChange={set("description")} placeholder="Quién es, cómo habla…" /></div>
      <div><label className="form-label body-strong" htmlFor="ch-v">Voz para narrar sus diálogos
          <HelpTip title="¿Qué hace la voz del personaje?">
            <p>Es una pista de estilo, no una voz exacta: cuando alguien narra un capítulo y una viñeta
            tiene este personaje asignado, el sitio busca entre las voces en español instaladas en el
            dispositivo de esa persona una que combine con «Grave» o «Aguda». «Neutra» o «Automática»
            usan la primera voz en español disponible.</p>
            <p className="m-0">Las voces disponibles varían según el celular o la computadora de quien
            lee — no todos van a escuchar exactamente la misma voz, pero sí el mismo estilo aproximado.</p>
          </HelpTip>
        </label>
        <select id="ch-v" className="form-select" value={f.voice} onChange={set("voice")}>{VOICES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
      <div className="d-flex gap-2 justify-content-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>Cancelar</Button>
        <Button type="submit" disabled={busy || !valid || !f.name.trim()}>{busy ? "Guardando…" : "Guardar"}</Button>
      </div>
    </form>
  );
}

function Characters({ seriesId, characters, own, onChange }) {
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);
  const remove = async (c) => {
    if (!window.confirm(`¿Eliminar a ${c.name} del casting?`)) return;
    try { await api.del(`/series/${seriesId}/characters/${c.id}`); onChange(characters.filter((x) => x.id !== c.id)); }
    catch (e) { toast(e.message, "error"); }
  };
  if (!own && characters.length === 0) return null;
  return (
    <section>
      <div className="d-flex align-items-center gap-2">
        <h2 className="title-lg m-0">Personajes</h2>
        <HelpTip title="Casting de personajes">
          <p>Presentá a los personajes de tu serie con una imagen (o un GIF animado) y una voz sugerida.</p>
          <p className="m-0">Esa voz se usa cuando alguien toca "Narrar" en el lector y ese personaje tiene una viñeta de diálogo.</p>
        </HelpTip>
      </div>
      {characters.length === 0 ? <Empty title="Todavía no agregaste personajes" /> : (
        <div className="app-characters">
          {characters.map((c) => (
            <article key={c.id} className="app-character-card">
              <ProtectedImage src={img(c.image, 400)} ratio={c.ratio} rounded alt={c.name} />
              <div className="app-character-name">{c.name}</div>
              {c.description && <p className="caption text-muted-ink m-0">{c.description}</p>}
              {own && (
                <div className="d-flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setEditing(c)}>Editar</Button>
                  <Button size="sm" variant="secondary" onClick={() => remove(c)}>Eliminar</Button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      {own && !adding && <Button size="sm" variant="secondary" icon="plus" onClick={() => setAdding(true)}>Agregar personaje</Button>}
      {own && adding && (
        <CharacterForm seriesId={seriesId} onCancel={() => setAdding(false)}
          onSaved={(c) => { onChange([...characters, c]); setAdding(false); }} />
      )}
      {own && editing && (
        <CharacterForm seriesId={seriesId} character={editing} onCancel={() => setEditing(null)}
          onSaved={(c) => { onChange(characters.map((x) => (x.id === c.id ? c : x))); setEditing(null); }} />
      )}
    </section>
  );
}

export default function Series() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { requireLogin } = useAuth();
  const { data: s, error, loading, setData } = useApi(`/series/${id}`);
  const [editing, setEditing] = useState(false);
  useTitle(s?.title);
  if (loading) return <Loading />;
  if (error) return <div className="app-wrap"><ErrorState error={error} /></div>;
  const follow = requireLogin(async () => {
    try { const r = await api.post(`/users/${s.artist.slug}/follow`); setData((d) => ({ ...d, following: r.following })); }
    catch (e) { toast(e.message, "error"); }
  });
  const remove = async () => {
    if (!window.confirm("¿Eliminar esta serie y todos sus capítulos? No se puede deshacer.")) return;
    try { await api.del(`/series/${s.id}`); toast("Serie eliminada.", "ok"); nav(`/artista/${s.artist.slug}`); } catch (e) { toast(e.message, "error"); }
  };
  const first = s.chapters[0];

  if (editing) {
    return (
      <div className="app-wrap app-narrow">
        <header className="app-page-head"><h1 className="display-lg m-0">Editar serie</h1></header>
        <EditForm s={s} onCancel={() => setEditing(false)}
          onSaved={(updated) => { setData((d) => ({ ...d, ...updated, coverUrl: updated.coverUrl ?? d.coverUrl })); setEditing(false); }} />
      </div>
    );
  }

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
          {s.own && (
            <div className="d-flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>Editar serie</Button>
              <Button size="sm" variant="secondary" onClick={remove}>Eliminar serie</Button>
            </div>
          )}
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
      <Characters seriesId={s.id} characters={s.characters || []} own={s.own}
        onChange={(list) => setData((d) => ({ ...d, characters: list }))} />
    </div>
  );
}
