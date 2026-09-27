import { useEffect, useRef } from "react";
import { Icon } from "../ds/ilustra";

export default function Dialog({ open, onClose, title, children, width = 440 }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    ref.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); prev && prev.focus && prev.focus(); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="app-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="app-dialog" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref} style={{ maxWidth: width }}>
        <div className="app-dialog-head">
          <h2 className="title-md m-0">{title}</h2>
          <button type="button" className="il-iconbtn" aria-label="Cerrar" onClick={onClose}><Icon name="x" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
