import { useState } from "react";
import { api } from "../api";
import { Button, ProtectedImage } from "../ds/ilustra";

/** Campo para pegar el enlace directo de una imagen pública, con validación en el servidor y vista previa. */
export default function ImageUrlField({ id, label, value, onChange, onValid, hint }) {
  const [state, setState] = useState({ status: "idle", msg: "", ratio: null });
  const check = async () => {
    if (!value.trim()) return;
    setState({ status: "checking", msg: "Verificando la imagen…", ratio: null });
    try {
      const r = await api.post("/images/check", { url: value.trim() });
      setState({ status: "ok", msg: `Imagen válida · ${r.width} × ${r.height} px`, ratio: r.ratio });
      onValid && onValid(r);
    } catch (e) {
      setState({ status: "error", msg: e.message, ratio: null });
      onValid && onValid(null);
    }
  };
  return (
    <div className="d-grid gap-2">
      <label className="form-label body-strong m-0" htmlFor={id}>{label}</label>
      <div className="d-flex gap-2">
        <input id={id} type="url" inputMode="url" className="form-control" placeholder="https://…/mi-obra.jpg" value={value}
          onChange={(e) => { onChange(e.target.value); setState({ status: "idle", msg: "", ratio: null }); onValid && onValid(null); }}
          onBlur={check} aria-describedby={id + "-help"} />
        <Button variant="secondary" onClick={check} disabled={state.status === "checking"}>Verificar</Button>
      </div>
      <small id={id + "-help"} className={state.status === "error" ? "app-error" : "text-muted-ink"} role={state.status === "error" ? "alert" : undefined}>
        {state.msg || hint || "Subí tu imagen a un servicio público y pegá el enlace directo a la imagen (JPG, PNG, WEBP o GIF)."}
      </small>
      {state.status === "ok" && (
        <div className="app-preview"><ProtectedImage src={value.trim()} ratio={state.ratio} alt="Vista previa" /></div>
      )}
    </div>
  );
}
