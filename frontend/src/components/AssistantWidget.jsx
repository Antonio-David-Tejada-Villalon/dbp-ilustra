import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { AssistantPanel, Icon } from "../ds/ilustra";

const START = ["¿Cómo publico mi obra?", "Artistas nuevos", "Proyectos DBP"];

export default function AssistantWidget() {
  const { config } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [links, setLinks] = useState([]);
  const [messages, setMessages] = useState([
    { from: "bot", text: "¡Hola! Soy el Asistente Ilustra. Preguntame cómo usar el sitio o qué obras, series y artistas buscás." },
  ]);
  if (!config.assistant) return null;

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
    } catch (e) {
      setMessages((m) => [...m.slice(0, -1), { from: "bot", text: e.message }]);
    } finally {
      setBusy(false);
    }
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
          onSend={() => send()} suggestions={suggestions} onSuggestion={onSuggestion} onClose={() => setOpen(false)} />
      )}
      {!open && (
        <button type="button" className="app-assistant-launch" onClick={() => setOpen(true)} aria-label="Abrir Asistente Ilustra">
          <Icon name="message-square-text" size={22} />
        </button>
      )}
    </div>
  );
}
