/** Cliente de la API. Usa la cookie de sesión (httpOnly) y el encabezado anti-CSRF en escrituras. */
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

/** Traduce nombres de campo de los modelos de la API a lo que ve el usuario. */
const FIELD_LABELS = {
  title: "Título", description: "Descripción", category: "Categoría", image_url: "Enlace de la imagen",
  cover_url: "Portada", tags: "Etiquetas", url: "Enlace", handle: "Usuario", display_name: "Nombre visible",
  bio: "Biografía", location: "Ubicación", contact: "Contacto", text: "Texto", message: "Mensaje", pages: "Páginas",
};

/** Arma un mensaje legible a partir de un error de validación de FastAPI/Pydantic (lista de {loc, msg}). */
function validationMessage(detail) {
  const first = detail[0];
  if (!first || typeof first !== "object") return null;
  const field = Array.isArray(first.loc) ? first.loc[first.loc.length - 1] : null;
  const label = (field && FIELD_LABELS[field]) || field;
  return label ? `${label}: ${first.msg || "dato inválido"}` : first.msg || null;
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
    const msg = typeof d === "string" ? d
      : Array.isArray(d) ? (validationMessage(d) || "Revisá los datos ingresados.")
      : (d && d.message) || "Ocurrió un error. Probá de nuevo.";
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
