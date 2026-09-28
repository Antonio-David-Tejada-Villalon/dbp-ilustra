import { useEffect, useRef, useState } from "react";

/** Botón «?» que muestra una ayuda contextual con ejemplo, al lado de un campo o título. */
export default function HelpTip({ title, children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <span className="help-tip" ref={ref}>
      <button type="button" className="help-tip-btn" aria-label={`Ayuda: ${title}`} aria-expanded={open}
        onClick={() => setOpen((v) => !v)}>?</button>
      {open && (
        <div className="help-tip-panel" role="dialog" aria-label={title}>
          <p className="body-strong m-0">{title}</p>
          <div className="help-tip-body">{children}</div>
        </div>
      )}
    </span>
  );
}
