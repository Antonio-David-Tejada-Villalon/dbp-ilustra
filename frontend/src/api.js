/** Cliente de la API. Usa la cookie de sesión (httpOnly) y el encabezado anti-CSRF en escrituras. */
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request(method, path, body) {
  const opts = { method, credentials: "same-origin", headers: {} };
  if (method !== "GET") opts.headers["X-Requested-With"] = "ilustra";
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch("/api" + path, opts);
  } catch {
    throw new ApiError("No hay conexión con el servidor.", 0);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const d = data && data.detail;
    const msg = typeof d === "string" ? d : (d && d.message) || "Ocurrió un error. Probá de nuevo.";
    throw new ApiError(msg, res.status, d);
  }
  return data;
}

export const api = {
  get: (p) => request("GET", p),
  post: (p, b) => request("POST", p, b ?? {}),
  patch: (p, b) => request("PATCH", p, b),
  del: (p) => request("DELETE", p),
};

/** Agrega el ancho pedido a una URL de imagen del proxy. */
export function img(src, w = 800) {
  if (!src) return src;
  if (!src.startsWith("/api/img/") || src.includes("w=")) return src;
  return src + (src.includes("?") ? "&" : "?") + "w=" + w;
}
