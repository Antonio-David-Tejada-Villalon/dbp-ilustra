import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "./api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = cargando
  const [config, setConfig] = useState({ googleClientId: "", assistant: false, categories: [] });
  const [loginOpen, setLoginOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const d = await api.get("/me");
      setUser(d.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    api.get("/config").then(setConfig).catch(() => {});
    refresh();
  }, [refresh]);

  const logout = async () => {
    await api.post("/auth/logout");
    try { window.google?.accounts?.id?.disableAutoSelect(); } catch { /* sin GIS */ }
    setUser(null);
  };

  /** Ejecuta fn si hay sesión; si no, abre el diálogo de ingreso. */
  const requireLogin = (fn) => (...args) => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    return fn(...args);
  };

  return (
    <AuthCtx.Provider value={{ user, setUser, config, refresh, logout, requireLogin, loginOpen, setLoginOpen }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
