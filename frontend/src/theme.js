const KEY = "ilustra-theme";
export const THEMES = [
  { id: "auto", label: "Automático" },
  { id: "papel", label: "Papel" },
  { id: "galeria", label: "Galería" },
  { id: "nocturno", label: "Nocturno" },
];

export function getTheme() {
  try {
    return localStorage.getItem(KEY) || "auto";
  } catch {
    return "auto";
  }
}

export function applyTheme(t) {
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* navegación privada: se aplica igual en esta sesión */
  }
  const resolved = t === "auto" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "nocturno" : "papel") : t;
  document.documentElement.setAttribute("data-theme", resolved);
}
