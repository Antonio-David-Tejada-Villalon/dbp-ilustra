"""Metadatos Open Graph / Twitter Card dinámicos para obras, series y perfiles.

Los rastreadores de redes sociales (Facebook, Twitter/X, WhatsApp, Discord, etc.) no ejecutan
JavaScript: solo leen las etiquetas <meta> del HTML que reciben. Como el sitio es una SPA de React,
esto arma esas etiquetas del lado del servidor antes de entregar la página, para obra/serie/perfil.
El resto de las rutas conserva los metadatos genéricos ya presentes en frontend/index.html.
"""
import re

from asgiref.sync import sync_to_async
from django.conf import settings

_OBRA_RE = re.compile(r"^/obra/(\d+)/?$")
_SERIE_RE = re.compile(r"^/serie/(\d+)/?$")
_ARTISTA_RE = re.compile(r"^/artista/([A-Za-z0-9._-]+)/?$")
_LEER_RE = re.compile(r"^/leer/(\d+)/(\d+)/?$")


def _escape(value: str) -> str:
    return (value or "").replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;").replace(">", "&gt;")


def _snippet(text, fallback, limit=180):
    text = " ".join((text or "").split())
    if not text:
        text = fallback
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "…"


def _replace_meta(html: str, tag_id: str, value: str) -> str:
    def repl(m):
        return re.sub(r'content="[^"]*"', f'content="{_escape(value)}"', m.group(0), count=1)
    return re.sub(rf'<meta\b[^>]*\bid="{tag_id}"[^>]*/?>', repl, html, count=1)


def inject(html: str, *, title=None, description=None, image=None, url=None) -> str:
    if title:
        html = _replace_meta(html, "og-title", title)
        html = _replace_meta(html, "twitter-title", title)
        html = re.sub(r"<title>.*?</title>", f"<title>{_escape(title)}</title>", html, count=1, flags=re.S)
    if description:
        html = _replace_meta(html, "og-description", description)
        html = _replace_meta(html, "twitter-description", description)
    if image:
        html = _replace_meta(html, "og-image", image)
        html = _replace_meta(html, "twitter-image", image)
    if url:
        html = _replace_meta(html, "og-url", url)
    return html


def _match(path: str):
    m = _OBRA_RE.match(path)
    if m:
        return "obra", m.group(1)
    m = _SERIE_RE.match(path)
    if m:
        return "serie", m.group(1)
    m = _ARTISTA_RE.match(path)
    if m:
        return "artista", m.group(1)
    m = _LEER_RE.match(path)
    if m:
        return "leer", (m.group(1), m.group(2))
    return None


def _lookup_sync(kind, ident, path):
    from ilustra.models import Artwork, Chapter, Profile, Series

    base = settings.SITE_URL.rstrip("/")
    if kind == "obra":
        a = Artwork.objects.filter(pk=int(ident), status="published").select_related("author__profile").first()
        if not a:
            return None
        return {
            "title": f"{a.title} · DBP Ilustra",
            "description": _snippet(a.description, f"Obra de {a.author.profile.display_name} en DBP Ilustra."),
            "image": f"{base}/api/img/a/{a.pk}?w=1200",
            "url": f"{base}{path}",
        }
    if kind == "serie":
        s = Series.objects.filter(pk=int(ident), status="published").select_related("author__profile").first()
        if not s:
            return None
        return {
            "title": f"{s.title} · DBP Ilustra",
            "description": _snippet(s.description, f"Serie de {s.author.profile.display_name} en DBP Ilustra."),
            "image": f"{base}/api/img/s/{s.pk}?w=1200",
            "url": f"{base}{path}",
        }
    if kind == "artista":
        p = Profile.objects.filter(handle=ident, suspended=False).first()
        if not p:
            return None
        image = f"{base}/api/img/u/{p.handle}/avatar" if p.avatar_url else f"{base}/icon-512.png"
        return {
            "title": f"{p.display_name} (@{p.handle}) · DBP Ilustra",
            "description": _snippet(p.bio, f"Perfil de @{p.handle} en DBP Ilustra."),
            "image": image,
            "url": f"{base}{path}",
        }
    if kind == "leer":
        series_id, number = ident
        c = (Chapter.objects.filter(series_id=int(series_id), number=int(number), status="published",
                                    series__status="published")
             .select_related("series__author__profile").prefetch_related("pages").first())
        if not c:
            return None
        page = c.pages.order_by("order").first()
        image = f"{base}/api/img/p/{page.pk}" if page else f"{base}/api/img/s/{c.series_id}?w=1200"
        title = f"{c.series.title} · Cap. {c.number}" + (f": {c.title}" if c.title else "")
        return {
            "title": f"{title} · DBP Ilustra",
            "description": _snippet(None, f"Leé el capítulo {c.number} de «{c.series.title}» en DBP Ilustra."),
            "image": image,
            "url": f"{base}{path}",
        }
    return None


_lookup_async = sync_to_async(_lookup_sync, thread_sensitive=False)


async def meta_for_path(path: str):
    matched = _match(path)
    if not matched:
        return None
    try:
        return await _lookup_async(*matched, path)
    except Exception:
        return None
