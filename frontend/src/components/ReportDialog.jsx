import { useState } from "react";
import { api } from "../api";
import { Button } from "../ds/ilustra";
import { useToast } from "../toast";
import Dialog from "./Dialog";

const REASONS = [
  ["copia", "No es obra del autor / plagio"],
  ["ofensivo", "Contenido ofensivo"],
  ["spam", "Spam"],
  ["sensible", "Contenido sensible sin aviso"],
  ["otro", "Otro"],
];

export default function ReportDialog({ target, onClose }) {
  const [reason, setReason] = useState("copia");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const send = async () => {
    setBusy(true);
    try {
      const r = await api.post("/reports", { target_type: target.type, target_id: target.id, reason, details });
      toast(r.message, "ok");
      onClose();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={!!target} onClose={onClose} title="Reportar contenido">
      <div className="d-grid gap-3">
        <div>
          {REASONS.map(([id, label]) => (
            <div className="form-check" key={id}>
              <input className="form-check-input" type="radio" name="reason" id={"r-" + id} checked={reason === id} onChange={() => setReason(id)} />
              <label className="form-check-label" htmlFor={"r-" + id}>{label}</label>
            </div>
          ))}
        </div>
        <textarea className="form-control" rows={3} maxLength={1000} placeholder="Contanos más (opcional)" value={details} onChange={(e) => setDetails(e.target.value)} />
        <div className="d-flex justify-content-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={send} disabled={busy}>Enviar reporte</Button>
        </div>
      </div>
    </Dialog>
  );
}
