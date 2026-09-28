import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, img } from "../api";
import { useAuth } from "../auth";
import { Button, CategoryTag, ProfileHeader } from "../ds/ilustra";
import { useTitle } from "../hooks";
import { THEMES, applyTheme, getTheme } from "../theme";
import { useToast } from "../toast";
import HelpTip from "../components/HelpTip";
import ImageUrlField from "../components/ImageUrlField";
import { Empty, Loading } from "../components/States";

const ACCENTS = [["violet", "Violeta"], ["yellow", "Amarillo"], ["sky", "Celeste"], ["coral", "Coral"]];
const DISC = ["ilustracion", "comic", "manga", "historieta", "boceto"];

export default function Settings() {
  useTitle("Ajustes");
  const { user, setUser, setLoginOpen } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [f, setF] = useState(null);
  const [theme, setTheme] = useState(getTheme());
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (user) setF({ display_name: user.name, handle: user.slug, bio: user.bio, location: user.location, contact: user.contact || "",
      disciplines: user.disciplines, accent: user.accent, cover_url: user.coverUrl, is_artist: user.isArtist,
      watermark_enabled: user.watermarkEnabled });
  }, [user]);
  if (user === undefined) return <Loading />;
  if (!user) return <div className="app-wrap"><Empty title="Ingresá para editar tu perfil" action={<Button onClick={() => setLoginOpen(true)}>Ingresar</Button>} /></div>;
  if (!f) return <Loading />;
  const set = (k) => (e) => setF({ ...f, [k]: e && e.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e });
  const toggleDisc = (d) => setF({ ...f, disciplines: f.disciplines.includes(d) ? f.disciplines.filter((x) => x !== d) : [...f.disciplines, d] });
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = { ...f };
      if (body.cover_url === user.coverUrl) delete body.cover_url;
      const r = await api.patch("/me/profile", body);
      setUser(r.user);
      toast("Cambios guardados.", "ok");
      nav(`/artista/${r.user.slug}`);
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="app-wrap">
      <header className="app-page-head"><div className="il-overline">Ajustes</div><h1 className="display-lg m-0">Tu perfil y tu muro</h1></header>
      <div className="app-settings">
        <form className="app-form" onSubmit={save}>
          <div className="form-check form-switch app-switch">
            <input className="form-check-input" type="checkbox" role="switch" id="art" checked={f.is_artist} onChange={set("is_artist")} />
            <label className="form-check-label body-strong" htmlFor="art">Soy artista: quiero publicar obras y series
              <HelpTip title="¿Qué cambia si activo esto?">
                <p>Sin esto activado podés mirar, leer, comentar, dar me gusta y seguir artistas, pero no vas a ver la opción Publicar.</p>
                <p className="m-0">Al activarlo aparece «Publicar» en el menú, y podés cargar obras sueltas o series (cómic/manga/historieta) con capítulos. No hace falta ser artista profesional, solo tener algo para compartir.</p>
              </HelpTip>
            </label>
          </div>
          {f.is_artist && (
            <div className="form-check form-switch app-switch">
              <input className="form-check-input" type="checkbox" role="switch" id="wm" checked={f.watermark_enabled} onChange={set("watermark_enabled")} />
              <label className="form-check-label body-strong" htmlFor="wm">Marca de agua en mis obras
                <HelpTip title="¿Qué protege esto?">
                  <p>Tus obras <strong>siempre</strong> están protegidas, tengas esto activado o no: nunca se muestra
                  el enlace original, y el sitio bloquea el clic derecho, arrastrar y seleccionar la imagen.</p>
                  <p className="m-0">Esto solo agrega, de forma sutil sobre la imagen, tu usuario y «DBP Ilustra» como
                  firma extra. Si preferís que tu obra se vea limpia, dejalo desactivado.</p>
                </HelpTip>
              </label>
            </div>
          )}
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label body-strong" htmlFor="n">Nombre visible</label>
              <input id="n" className="form-control" required minLength={2} maxLength={80} value={f.display_name} onChange={set("display_name")} /></div>
            <div className="col-md-6"><label className="form-label body-strong" htmlFor="h">Usuario</label>
              <div className="input-group"><span className="input-group-text">@</span>
                <input id="h" className="form-control" required pattern="[a-z0-9._]{3,30}" maxLength={30} value={f.handle} onChange={(e) => setF({ ...f, handle: e.target.value.toLowerCase() })} /></div></div>
          </div>
          <div><label className="form-label body-strong" htmlFor="b">Biografía</label>
            <textarea id="b" className="form-control" rows={3} maxLength={500} value={f.bio} onChange={set("bio")} /></div>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label body-strong" htmlFor="l">Ubicación</label>
              <input id="l" className="form-control" maxLength={100} value={f.location} onChange={set("location")} placeholder="Rawson, San Juan" /></div>
            <div className="col-md-6"><label className="form-label body-strong" htmlFor="ct">Contacto público</label>
              <input id="ct" className="form-control" maxLength={200} value={f.contact} onChange={set("contact")} placeholder="Correo, web o red social" /></div>
          </div>
          <fieldset><legend className="form-label body-strong">Disciplinas</legend>
            <div className="d-flex flex-wrap gap-2">{DISC.map((d) => (
              <button key={d} type="button" className={"app-chip-btn" + (f.disciplines.includes(d) ? " is-on" : "")} aria-pressed={f.disciplines.includes(d)} onClick={() => toggleDisc(d)}>
                <CategoryTag category={d} /></button>))}</div></fieldset>
          <fieldset><legend className="form-label body-strong">Color de acento del muro</legend>
            <div className="d-flex flex-wrap gap-3">{ACCENTS.map(([id, label]) => (
              <label key={id} className={"app-swatch" + (f.accent === id ? " is-on" : "")}>
                <input type="radio" name="accent" value={id} checked={f.accent === id} onChange={set("accent")} className="visually-hidden" />
                <span className={"app-swatch-dot app-swatch-" + id} aria-hidden="true" />{label}</label>))}</div></fieldset>
          <ImageUrlField id="cov" label="Portada del muro (opcional)" value={f.cover_url} onChange={set("cover_url")} hint="Imagen horizontal, idealmente 1600 × 400 px o más." />
          <fieldset><legend className="form-label body-strong">Estilo del sitio (solo en este dispositivo)</legend>
            <div className="d-flex flex-wrap gap-2">{THEMES.map((t) => (
              <Button key={t.id} size="sm" variant={theme === t.id ? "primary" : "secondary"} onClick={() => { setTheme(t.id); applyTheme(t.id); }}>{t.label}</Button>))}</div></fieldset>
          <div className="d-flex justify-content-end gap-2"><Button type="submit" size="lg" disabled={busy}>{busy ? "Guardando…" : "Guardar cambios"}</Button></div>
        </form>
        <aside className="app-settings-preview" aria-label="Vista previa del muro">
          <div className="il-overline mb-2">Vista previa</div>
          <ProfileHeader name={f.display_name} handle={"@" + f.handle} avatar={img(user.avatar, 400)} bio={f.bio} location={f.location}
            disciplines={f.disciplines} accent={f.accent} cover={f.cover_url && f.cover_url === user.coverUrl ? img(user.cover, 1200) : undefined}
            stats={{ works: 0, followers: 0, following: 0 }} following={false} onFollow={() => {}} onContact={() => {}} />
        </aside>
      </div>
    </div>
  );
}
