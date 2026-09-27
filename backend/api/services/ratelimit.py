"""Límite de frecuencia simple en memoria (por proceso).

Suficiente para un solo servidor. Con varios procesos/instancias, mover a Redis.
"""
import threading
import time
from collections import defaultdict, deque

from fastapi import HTTPException

_hits: dict[tuple[str, str], deque] = defaultdict(deque)
_lock = threading.Lock()


def check(bucket: str, key: str, limit: int, window_s: int) -> None:
    now = time.monotonic()
    with _lock:
        q = _hits[(bucket, key)]
        while q and now - q[0] > window_s:
            q.popleft()
        if len(q) >= limit:
            raise HTTPException(429, "Hiciste muchas solicitudes seguidas. Esperá un momento y probá de nuevo.")
        q.append(now)


def reset() -> None:
    with _lock:
        _hits.clear()
