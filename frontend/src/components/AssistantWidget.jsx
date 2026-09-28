import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { AssistantPanel, Icon } from "../ds/ilustra";

const START = ["¿Cómo publico mi obra?", "Artistas nuevos", "Proyectos DBP"];
const SpeechRecognitionApi = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
const hasTTS = typeof window !== "undefined" && "speechSynthesis" in window;

/** Elige una voz en español, prefiriendo una de Google si el dispositivo la tiene instalada. */
function pickVoice() {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => /^es/i.test(v.lang) && /google/i.test(v.name))
    || voices.find((v) => /^es/i.test(v.lang))
    || null;
}

export default function AssistantWidget() {
  const { config } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [links, setLinks] = useState([]);
  const [voiceOn, setVoiceOn] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);
  const [messages, setMessages] = useState([
    { from: "bot", text: "¡Hola! Soy el Asistente Ilustra. Preguntame cómo usar el sitio o qué obras, series y artistas buscás." },
  ]);

  useEffect(() => {
    if (!hasTTS) return;
    window.speechSynthesis.getVoices();
    const onVoices = () => {};
    window.speechSynthesis.addEventListener("voiceschanged", onVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", onVoices);
  }, []);

  useEffect(() => () => { recognitionRef.current && recognitionRef.current.abort(); hasTTS && window.speechSynthesis.cancel(); }, []);

  if (!config.assistant) return null;

  const speak = (text) => {
    if (!hasTTS || !voiceOn || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/\/(obra|serie|artista)\/[A-Za-z0-9._-]+/g, ""));
    const voice = pickVoice();
    if (voice) u.voice = voice;
    u.lang = (voice && voice.lang) || "es-AR";
    window.speechSynthesis.speak(u);
  };

  const send = async (text) => {
    const msg = (text ?? value).trim();
    if (!msg || busy) return;
    const history = messages.slice(1).slice(-8).map((m) => ({ role: m.from === "user" ? "user" : "bot", text: m.text }));
    setMessages((m) => [...m, { from: "user", text: msg }, { from: "bot", text: "Pensando…" }]);
    setValue("");
    setBusy(true);
    try {
      const r = await api.post("/assistant", { message: msg, history });
      setMessages((m) => [...m.slice(0, -1), { from: "bot", text: r.reply }]);
      setLinks(r.links || []);
      speak(r.reply);
    } catch (e) {
      setMessages((m) => [...m.slice(0, -1), { from: "bot", text: e.message }]);
    } finally {
      setBusy(false);
    }
  };

  const toggleMic = () => {
    if (listening) {
      recognitionRef.current && recognitionRef.current.stop();
      return;
    }
    if (!SpeechRecognitionApi) return;
    const rec = new SpeechRecognitionApi();
    rec.lang = "es-AR";
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      setValue(text);
      if (e.results[e.results.length - 1].isFinal) send(text);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  const toggleVoice = () => {
    if (voiceOn && hasTTS) window.speechSynthesis.cancel();
    setVoiceOn((v) => !v);
  };

  const label = (l) => (l.startsWith("/obra/") ? "Ver obra " : l.startsWith("/serie/") ? "Ver serie " : "Ver artista ") + l.split("/").pop();
  const suggestions = links.length ? links.map(label) : messages.length < 3 ? START : [];
  const onSuggestion = (s) => {
    const i = links.map(label).indexOf(s);
    if (i >= 0) { nav(links[i]); setOpen(false); } else send(s);
  };

  return (
    <div className="app-assistant">
      {open && (
        <AssistantPanel messages={messages} value={value} onChange={(e) => setValue(e.target.value.slice(0, 800))}
          onSend={() => send()} suggestions={suggestions} onSuggestion={onSuggestion} onClose={() => setOpen(false)}
          showMic={!!SpeechRecognitionApi} micOn={listening} onMic={toggleMic}
          showVoiceToggle={hasTTS} voiceOn={voiceOn} onToggleVoice={toggleVoice} />
      )}
      {!open && (
        <button type="button" className="app-assistant-launch" onClick={() => setOpen(true)} aria-label="Abrir Asistente Ilustra">
          <Icon name="message-square-text" size={22} />
        </button>
      )}
    </div>
  );
}
