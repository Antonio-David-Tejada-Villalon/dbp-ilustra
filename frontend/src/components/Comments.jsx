import { useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth";
import { CommentComposer, CommentItem } from "../ds/ilustra";
import { useApi } from "../hooks";
import { useToast } from "../toast";
import GoogleButton from "./GoogleButton";

/** Comentarios de una obra o capítulo: lista, respuesta, me gusta y alta. */
export default function Comments({ artwork, chapter, onCount }) {
  const q = artwork ? `artwork=${artwork}` : `chapter=${chapter}`;
  const { data, setData } = useApi(`/comments?${q}`);
  const { user, requireLogin } = useAuth();
  const toast = useToast();
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      const c = await api.post("/comments", { artwork, chapter, text, parent: replyTo?.id });
      setData((d) => {
        const items = d ? [...d.items] : [];
        if (replyTo) {
          const root = items.find((x) => x.id === (replyTo.parent || replyTo.id));
          if (root) root.replies = [...root.replies, c];
        } else items.unshift(c);
        return { items, total: (d?.total || 0) + 1 };
      });
      setText("");
      setReplyTo(null);
      onCount && onCount(1);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const like = requireLogin(async (c) => {
    try {
      const r = await api.post(`/comments/${c.id}/like`);
      const upd = (x) => (x.id === c.id ? { ...x, liked: r.liked, likes: r.likes } : { ...x, replies: x.replies.map(upd) });
      setData((d) => ({ ...d, items: d.items.map(upd) }));
    } catch (e) {
      toast(e.message, "error");
    }
  });

  const render = (c, nested) => (
    <CommentItem key={c.id} nested={nested} author={c.author} time={c.time} text={c.text} likes={c.likes} liked={c.liked}
      isArtist={c.isArtist} onLike={() => like(c)} onReply={requireLogin(() => { setReplyTo(c); setText(`@${(c.author.handle || "").replace("@", "")} `); })}>
      {!nested && c.replies.length ? c.replies.map((r) => render(r, true)) : null}
    </CommentItem>
  );

  return (
    <div className="d-grid gap-2">
      <h2 className="title-md m-0">Comentarios {data ? `(${data.total})` : ""}</h2>
      {user ? (
        <>
          {replyTo && (
            <div className="app-replying">Respondiendo a {replyTo.author.name} · <button className="il-linkbtn" onClick={() => { setReplyTo(null); setText(""); }}>cancelar</button></div>
          )}
          <CommentComposer user={user} value={text} onChange={(e) => setText(e.target.value.slice(0, 1000))} onSubmit={submit} />
        </>
      ) : (
        <CommentComposer signIn={<GoogleButton size="medium" />} />
      )}
      {data?.items.map((c) => render(c, false))}
    </div>
  );
}
