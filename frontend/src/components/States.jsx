import { Button } from "../ds/ilustra";

export function Loading({ label = "Cargando…" }) {
  return <div className="app-state" role="status"><span className="app-spinner" aria-hidden="true" />{label}</div>;
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="app-state">
      <p className="m-0">{error?.status === 404 ? "No encontramos lo que buscabas." : error?.message || "Algo salió mal."}</p>
      {onRetry && error?.status !== 404 && <Button variant="secondary" size="sm" onClick={onRetry}>Reintentar</Button>}
    </div>
  );
}

export function Empty({ title, text, action }) {
  return (
    <div className="app-empty">
      <div className="title-md">{title}</div>
      {text && <p className="m-0 text-muted-ink">{text}</p>}
      {action}
    </div>
  );
}
