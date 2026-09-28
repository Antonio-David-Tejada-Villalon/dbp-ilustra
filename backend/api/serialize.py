"""Convierte modelos a JSON para el frontend. Nunca expone el enlace original de las obras."""
import hashlib
import re

from django.utils import timezone
from django.utils.timesince import timesince


def ago(dt):
    delta = timezone.now() - dt
    if delta.total_seconds() < 60:
        return "recién"
    return "hace " + timesince(dt).split(",")[0]


def avatar(profile):
    if not profile:
        return None
    if profile.avatar_url.startswith("demo:"):
        return f"/api/img/u/{profile.handle}/avatar"
    url = profile.avatar_url
    if not url:
        return None
    if "googleusercontent.com" in url:
        # Google entrega por defecto una foto chica (p. ej. =s96-c); pedimos una más grande
        # para que no se vea borrosa en pantallas de alta densidad (celulares).
        url = re.sub(r"=s\d+-c$", "=s256-c", url) if re.search(r"=s\d+-c$", url) else url + "=s256-c"
    return url


def person(user):
    p = getattr(user, "profile", None)
    if p is None:
        return {"id": user.pk, "name": user.get_full_name() or user.username, "handle": None, "avatar": None}
    return {"id": user.pk, "name": p.display_name, "handle": "@" + p.handle, "slug": p.handle, "avatar": avatar(p)}


def img_version(source, user):
    """Cambia si el artista reemplaza esta imagen (cambia el enlace de origen) o si activa/desactiva
    su marca de agua, para que el navegador no siga mostrando la versión vieja desde su caché."""
    p = getattr(user, "profile", None)
    wm = "1" if p and p.watermark_enabled else "0"
    return hashlib.sha1(f"{source}|{wm}".encode()).hexdigest()[:10]


def artwork(a, liked=False, saved=False):
    return {
        "id": a.pk, "title": a.title, "description": a.description, "category": a.category, "tags": a.tags,
        "image": f"/api/img/a/{a.pk}?v={img_version(a.image_url, a.author)}", "ratio": a.ratio, "artist": person(a.author),
        "likes": a.like_count, "comments": a.comment_count, "liked": liked, "saved": saved,
        "status": a.status, "created": a.created.isoformat(), "date": timezone.localtime(a.created).strftime("%d/%m/%Y"),
    }


def series(s, chapters=None):
    d = {"id": s.pk, "title": s.title, "description": s.description, "category": s.category,
         "cover": f"/api/img/s/{s.pk}?v={img_version(s.cover_url, s.author)}", "ratio": round(s.cover_width / s.cover_height, 4) if s.cover_width and s.cover_height else 0.75,
         "artist": person(s.author), "status": s.status, "updated": s.updated.isoformat()}
    if chapters is not None:
        d["chapters"] = [{"number": c.number, "title": c.title, "likes": c.like_count, "comments": c.comment_count,
                          "date": timezone.localtime(c.created).strftime("%d/%m/%Y")} for c in chapters]
    return d


def character(c, author):
    return {"id": c.pk, "name": c.name, "description": c.description, "voice": c.voice,
            "image": f"/api/img/c/{c.pk}?v={img_version(c.image_url, author)}", "ratio": c.ratio}


def comment(c, liked_ids=frozenset(), content_author_id=None):
    return {"id": c.pk, "author": person(c.author), "text": c.text, "time": ago(c.created), "likes": c.like_count,
            "liked": c.pk in liked_ids, "isArtist": c.author_id == content_author_id, "parent": c.parent_id, "replies": []}


def notification(n):
    return {"id": n.pk, "type": n.type, "actor": person(n.actor) if n.actor_id else {"name": "DBP San Juan", "avatar": None},
            "text": n.text, "time": ago(n.created), "unread": not n.read,
            "artwork": n.artwork_id, "thumb": f"/api/img/a/{n.artwork_id}?w=400" if n.artwork_id else None,
            "series": n.chapter.series_id if n.chapter_id else None, "chapter": n.chapter.number if n.chapter_id else None}


def profile_full(p, stats, following=False, own=False):
    return {
        "id": p.user_id, "name": p.display_name, "handle": "@" + p.handle, "slug": p.handle, "avatar": avatar(p),
        "cover": f"/api/img/u/{p.handle}/cover" if p.cover_url else None, "bio": p.bio, "location": p.location, "contact": p.contact,
        "disciplines": p.disciplines, "isArtist": p.is_artist, "accent": p.accent, "stats": stats,
        "following": following, "own": own,
    }
