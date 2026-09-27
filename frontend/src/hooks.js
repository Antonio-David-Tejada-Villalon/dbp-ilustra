import { useCallback, useEffect, useState } from "react";
import { api } from "./api";

/** Carga un endpoint GET y expone {data, error, loading, reload, setData}. */
export function useApi(path) {
  const [state, setState] = useState({ data: null, error: null, loading: !!path });
  const load = useCallback(() => {
    if (!path) return;
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    api.get(path).then(
      (data) => alive && setState({ data, error: null, loading: false }),
      (error) => alive && setState({ data: null, error, loading: false })
    );
    return () => { alive = false; };
  }, [path]);
  useEffect(() => load(), [load]);
  const setData = (fn) => setState((s) => ({ ...s, data: typeof fn === "function" ? fn(s.data) : fn }));
  return { ...state, reload: load, setData };
}

/** Lista paginada con "cargar más". */
export function usePaged(path) {
  const [items, setItems] = useState([]);
  const [next, setNext] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadPage = useCallback(async (page, reset) => {
    if (!path || page == null) return;
    setLoading(true);
    try {
      const sep = path.includes("?") ? "&" : "?";
      const d = await api.get(`${path}${sep}page=${page}`);
      setItems((prev) => (reset ? d.items : [...prev, ...d.items]));
      setNext(d.next);
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [path]);
  useEffect(() => { setItems([]); setNext(1); loadPage(1, true); }, [loadPage]);
  return { items, setItems, loading, error, hasMore: next != null, more: () => loadPage(next, false) };
}

export function useTitle(title) {
  useEffect(() => { document.title = title ? `${title} · DBP Ilustra` : "DBP Ilustra"; }, [title]);
}
