import { useEffect, useState } from "react";
import HelpTip from "./HelpTip";

/** Campo para pegar el enlace directo de una imagen pública.
 * La vista previa la carga el propio navegador (instantánea, sin pasar por nuestro servidor);
 * la validación de seguridad real ocurre en el servidor recién al publicar. */
export default function ImageUrlField({ id, label, value, onChange, onValid, hint }) {
  const [state, setState] = useState({ status: "idle", msg: "" });
  const [previewSrc, setPreviewSrc] = useState("");

  useEffect(() => {
    const url = value.trim();
    if (!url) { setPreviewSrc(""); setState({ status: "idle", msg: "" }); return; }
    setState({ status: "checking", msg: "Cargando vista previa…" });
    const t = setTimeout(() => setPreviewSrc(url), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const onImgLoad = (e) => {
    const { naturalWidth: w, naturalHeight: h } = e.target;
    if (w < 200 || h < 200) {
      setState({ status: "error", msg: "La imagen es muy chica (mínimo 200 × 200 px)." });
      onValid && onValid(null);
      return;
    }
    setState({ status: "ok", msg: `Imagen válida · ${w} × ${h} px` });
    onValid && onValid({ width: w, height: h, ratio: w / h });
  };
  const onImgError = () => {
    setState({ status: "error", msg: "No pudimos cargar esa imagen. Revisá que el enlace sea directo, público y https." });
    onValid && onValid(null);
  };

  return (
    <div className="d-grid gap-2">
      <label className="form-label body-strong m-0" htmlFor={id}>{label}
        <HelpTip title="¿Qué es el enlace directo a una imagen?">
          <p>Es el link que termina directo en el archivo (<code>.jpg</code>, <code>.png</code>, <code>.webp</code> o <code>.gif</code>), no una página que lo muestra.</p>
          <p className="body-strong m-0">Cómo conseguirlo:</p>
          <ol>
            <li>Subí tu imagen a un servicio público (imgur, ibb.co, tu propia web, etc.).</li>
            <li>Abrí la imagen sola, a pantalla completa.</li>
            <li>Clic derecho sobre la imagen → «Copiar dirección de imagen».</li>
            <li>Pegá ese link acá.</li>
          </ol>
          <p className="m-0">Ejemplo válido: <code>https://i.ibb.co/abc123/mi-obra.jpg</code></p>
        </HelpTip>
      </label>
      <input id={id} type="url" inputMode="url" className="form-control" placeholder="https://…/mi-obra.jpg" value={value}
        onChange={(e) => onChange(e.target.value)} aria-describedby={id + "-help"} />
      <small id={id + "-help"} className={state.status === "error" ? "app-error" : "text-muted-ink"} role={state.status === "error" ? "alert" : undefined}>
        {state.msg || hint || "Subí tu imagen a un servicio público y pegá el enlace directo a la imagen (JPG, PNG, WEBP o GIF)."}
      </small>
      {previewSrc && (
        <div className="app-preview">
          <img src={previewSrc} alt="Vista previa" onLoad={onImgLoad} onError={onImgError}
            style={{ maxWidth: "100%", borderRadius: "var(--radius-lg)", display: state.status === "error" ? "none" : "block" }} />
        </div>
      )}
    </div>
  );
}
