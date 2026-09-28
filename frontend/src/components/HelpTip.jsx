import { useEffect, useLayoutEffect, useRef, useState } from "react";

/** Botón «?» que muestra una ayuda contextual con ejemplo, al lado de un campo o título. */
export default function HelpTip({ title, children }) {
  const [open, setOpen] = useState(false);
  const [shiftX, setShiftX] = useState(0);
  const ref = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !panelRef.current) { setShiftX(0); return; }
    const margin = 12;
    const rect = panelRef.current.getBoundingClientRect();
    let shift = 0;
    if (rect.right > window.innerWidth - margin) shift = window.innerWidth - margin - rect.right;
    if (rect.left + shift < margin) shift = margin - rect.left;
    setShiftX(shift);
  }, [open]);

  return (
    <span className="help-tip" ref={ref}>
      <button type="button" className="help-tip-btn" aria-label={`Ayuda: ${title}`} aria-expanded={open}
        onClick={() => setOpen((v) => !v)}>?</button>
      {open && (
        <div className="help-tip-panel" ref={panelRef} style={shiftX ? { transform: `translateX(${shiftX}px)` } : undefined}
          role="dialog" aria-label={title}>
          <p className="body-strong m-0">{title}</p>
          <div className="help-tip-body">{children}</div>
        </div>
      )}
    </span>
  );
}
