import { useEffect, useRef, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth";
import { Button } from "../ds/ilustra";

/** Botón oficial de Google Identity Services. Sin GOOGLE_CLIENT_ID muestra un ingreso de desarrollo. */
export default function GoogleButton({ size = "large", onDone }) {
  const { config, refresh } = useAuth();
  const ref = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!config.googleClientId) return;
    let tries = 0;
    const timer = setInterval(() => {
      const gid = window.google?.accounts?.id;
      if (!gid || !ref.current) {
        if (++tries > 50) { clearInterval(timer); setError("No se pudo cargar el ingreso con Google."); }
        return;
      }
      clearInterval(timer);
      gid.initialize({
        client_id: config.googleClientId,
        callback: async (resp) => {
          try {
            await api.post("/auth/google", { credential: resp.credential });
            await refresh();
            onDone && onDone();
          } catch (e) {
            setError(e.message);
          }
        },
      });
      gid.renderButton(ref.current, { theme: "outline", size, text: "continue_with", shape: "pill", locale: "es" });
    }, 100);
    return () => clearInterval(timer);
  }, [config.googleClientId, size, refresh, onDone]);

  if (!config.googleClientId) {
    const dev = async () => {
      const handle = window.prompt("Modo desarrollo: usuario existente (ej. ana.paz)");
      if (!handle) return;
      try {
        await api.post("/auth/dev-login", { handle });
        await refresh();
        onDone && onDone();
      } catch (e) {
        setError(e.status === 404 ? "Configurá GOOGLE_CLIENT_ID para ingresar." : e.message);
      }
    };
    return (
      <span className="d-inline-flex flex-column gap-1">
        <Button size="sm" variant="secondary" onClick={dev}>Ingresar</Button>
        {error && <small className="app-error">{error}</small>}
      </span>
    );
  }
  return (
    <span className="d-inline-flex flex-column gap-1">
      <span ref={ref} />
      {error && <small className="app-error">{error}</small>}
    </span>
  );
}
