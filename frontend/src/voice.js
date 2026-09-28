/** Elige una voz de lectura en español instalada en el dispositivo/navegador.
 * "grave"/"aguda" son pistas de estilo que el artista elige por personaje; como la Web Speech API
 * no expone el género de una voz, se usa una lista de nombres típicos de voces en español como heurística. */
export const hasTTS = typeof window !== "undefined" && "speechSynthesis" in window;

const AGUDA = /mujer|female|m[oó]nica|paulina|sabina|elvira|helena|luc[ií]a|camila|esperanza|marisol|conchita|penélope|penelope|soledad|laura|carmen/i;
const GRAVE = /hombre|male|jorge|diego|pablo|carlos|enrique|juan|miguel|alonso|jos[eé]|rodrigo|andr[eé]s/i;

export function pickVoice(style) {
  if (!hasTTS) return null;
  const all = window.speechSynthesis.getVoices().filter((v) => /^es/i.test(v.lang));
  if (!all.length) return null;
  const re = style === "aguda" ? AGUDA : style === "grave" ? GRAVE : null;
  if (re) {
    const hit = all.find((v) => re.test(v.name));
    if (hit) return hit;
  }
  return all.find((v) => /google/i.test(v.name)) || all[0];
}

export function speakOnce(text, style) {
  if (!hasTTS || !text) return;
  const u = new SpeechSynthesisUtterance(text);
  const voice = pickVoice(style);
  if (voice) u.voice = voice;
  u.lang = (voice && voice.lang) || "es-AR";
  window.speechSynthesis.speak(u);
  return u;
}
