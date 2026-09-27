from django.db import IntegrityError, transaction
from django.db.models import Count, F, Q
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from ilustra.models import (CATEGORY_CHOICES, Artwork, Chapter, Comment, CommentLike, Follow, Notification, Profile, Report,
                            Series)

from .. import serialize
from ..deps import current_user, require_user, writer
from ..services import ratelimit
from ..services.notify import notify

router = APIRouter(tags=["comunidad"])


# ---------- perfiles ----------
def _profile(handle):
    p = Profile.objects.select_related("user").filter(handle=handle.lstrip("@").lower(), suspended=False, user__is_active=True).first()
    if not p:
        raise HTTPException(404, "No encontramos a ese artista.")
    return p


def _stats(user_id):
    return {"works": Artwork.objects.filter(author_id=user_id, status="published").count()
            + Series.objects.filter(author_id=user_id, status="published").count(),
            "followers": Follow.objects.filter(following_id=user_id).count(),
            "following": Follow.objects.filter(follower_id=user_id).count()}


@router.get("/users/{handle}")
def get_user(handle: str, user=Depends(current_user)):
    p = _profile(handle)
    counts = dict(Artwork.objects.filter(author_id=p.user_id, status="published").values_list("category").annotate(n=Count("id")))
    for cat, n in Series.objects.filter(author_id=p.user_id, status="published").values_list("category").annotate(n=Count("id")):
        counts[cat] = counts.get(cat, 0) + n
    data = serialize.profile_full(p, _stats(p.user_id),
                                  following=bool(user and Follow.objects.filter(follower=user, following_id=p.user_id).exists()),
                                  own=bool(user and user.pk == p.user_id))
    data["counts"] = counts
    return data


@router.get("/artists")
def list_artists(discipline: str | None = None, sort: str = "popular", q: str | None = None,
                 page: int = Query(1, ge=1, le=200), limit: int = Query(24, ge=1, le=60), user=Depends(current_user)):
    qs = Profile.objects.filter(is_artist=True, suspended=False, user__is_active=True).select_related("user")
    if discipline:
        qs = qs.filter(disciplines__icontains=discipline)
    if q:
        qs = qs.filter(Q(display_name__icontains=q[:60]) | Q(handle__icontains=q[:60].lower()))
    qs = qs.order_by("-created") if sort == "new" else qs.annotate(f=Count("user__followers_set")).order_by("-f", "-created")
    items = list(qs[(page - 1) * limit: page * limit + 1])
    return {"items": artist_cards(items[:limit], user), "next": page + 1 if len(items) > limit else None}


def artist_cards(profiles, user):
    following = set()
    if user is not None:
        following = set(Follow.objects.filter(follower=user, following_id__in=[p.user_id for p in profiles]).values_list("following_id", flat=True))
    out = []
    for p in profiles:
        works = list(Artwork.objects.filter(author_id=p.user_id, status="published").order_by("-like_count", "-created").values_list("id", flat=True)[:3])
        out.append({**serialize.person(p.user), "disciplines": p.disciplines, "accent": p.accent,
                    "works": [f"/api/img/a/{i}?w=400" for i in works], "following": p.user_id in following,
                    "own": bool(user and user.pk == p.user_id)})
    return out


@router.post("/users/{handle}/follow")
def follow(handle: str, user=Depends(writer)):
    ratelimit.check("follow", f"u{user.pk}", 60, 60)
    p = _profile(handle)
    if p.user_id == user.pk:
        raise HTTPException(422, "No podés seguirte a vos mismo.")
    deleted, _ = Follow.objects.filter(follower=user, following_id=p.user_id).delete()
    if not deleted:
        try:
            Follow.objects.create(follower=user, following_id=p.user_id)
        except IntegrityError:
            pass
        notify(p.user_id, user.pk, "follow", "empezó a seguirte")
    return {"following": not deleted, "followers": Follow.objects.filter(following_id=p.user_id).count()}


# ---------- comentarios ----------
def _target(artwork: int | None, chapter: int | None):
    if bool(artwork) == bool(chapter):
        raise HTTPException(422, "Indicá una obra o un capítulo.")
    if artwork:
        obj = Artwork.objects.filter(pk=artwork, status="published").select_related("author").first()
        if not obj:
            raise HTTPException(404, "No encontramos esa obra.")
        return obj, obj.author_id, Q(artwork=obj)
    obj = Chapter.objects.filter(pk=chapter, status="published", series__status="published").select_related("series").first()
    if not obj:
        raise HTTPException(404, "No encontramos ese capítulo.")
    return obj, obj.series.author_id, Q(chapter=obj)


@router.get("/comments")
def list_comments(artwork: int | None = None, chapter: int | None = None, user=Depends(current_user)):
    obj, owner_id, q = _target(artwork, chapter)
    rows = list(Comment.objects.filter(q, status="visible").select_related("author__profile").order_by("created")[:500])
    liked = set()
    if user is not None:
        liked = set(CommentLike.objects.filter(user=user, comment__in=rows).values_list("comment_id", flat=True))
    by_id, roots = {}, []
    for c in rows:
        d = serialize.comment(c, liked, owner_id)
        by_id[c.pk] = d
        if c.parent_id and c.parent_id in by_id:
            by_id[c.parent_id]["replies"].append(d)
        elif not c.parent_id:
            roots.append(d)
    roots.reverse()  # los más nuevos arriba; las respuestas en orden
    return {"items": roots, "total": len(rows)}


class CommentIn(BaseModel):
    artwork: int | None = None
    chapter: int | None = None
    parent: int | None = None
    text: str = Field(min_length=1, max_length=1000)


def _clean(text: str) -> str:
    return "".join(ch for ch in text if ch == "\n" or ch >= " ").strip()


@router.post("/comments", status_code=201)
def create_comment(body: CommentIn, user=Depends(writer)):
    ratelimit.check("comment", f"u{user.pk}", 10, 60)
    obj, owner_id, q = _target(body.artwork, body.chapter)
    text = _clean(body.text)
    if not text:
        raise HTTPException(422, "El comentario está vacío.")
    parent = None
    if body.parent:
        parent = Comment.objects.filter(q, pk=body.parent, status="visible").first()
        if not parent:
            raise HTTPException(404, "El comentario que querés responder no existe.")
        if parent.parent_id:  # un solo nivel de respuestas
            parent = parent.parent
    with transaction.atomic():
        c = Comment.objects.create(author=user, parent=parent, text=text,
                                   artwork=obj if isinstance(obj, Artwork) else None, chapter=obj if isinstance(obj, Chapter) else None)
        type(obj).objects.filter(pk=obj.pk).update(comment_count=F("comment_count") + 1)
    snippet = text[:80]
    kw = {"artwork": obj} if isinstance(obj, Artwork) else {"chapter": obj}
    notify(owner_id, user.pk, "comment", f"comentó: «{snippet}»", **kw)
    if parent and parent.author_id != owner_id:
        notify(parent.author_id, user.pk, "reply", f"respondió: «{snippet}»", **kw)
    return serialize.comment(c, frozenset(), owner_id)


@router.post("/comments/{comment_id}/like")
def like_comment(comment_id: int, user=Depends(writer)):
    c = Comment.objects.filter(pk=comment_id, status="visible").first()
    if not c:
        raise HTTPException(404, "No encontramos ese comentario.")
    deleted, _ = CommentLike.objects.filter(user=user, comment=c).delete()
    if deleted:
        Comment.objects.filter(pk=c.pk, like_count__gt=0).update(like_count=F("like_count") - 1)
    else:
        CommentLike.objects.get_or_create(user=user, comment=c)
        Comment.objects.filter(pk=c.pk).update(like_count=F("like_count") + 1)
    c.refresh_from_db(fields=["like_count"])
    return {"liked": not deleted, "likes": c.like_count}


@router.delete("/comments/{comment_id}")
def delete_comment(comment_id: int, user=Depends(writer)):
    """El autor del comentario o el autor de la obra pueden quitarlo."""
    c = Comment.objects.select_related("artwork", "chapter__series").filter(pk=comment_id, status="visible").first()
    if not c:
        raise HTTPException(404, "No encontramos ese comentario.")
    owner = c.artwork.author_id if c.artwork_id else c.chapter.series.author_id
    if user.pk not in (c.author_id, owner):
        raise HTTPException(403, "No podés quitar este comentario.")
    c.status = "hidden"
    c.save(update_fields=["status"])
    model = Artwork if c.artwork_id else Chapter
    model.objects.filter(pk=c.artwork_id or c.chapter_id, comment_count__gt=0).update(comment_count=F("comment_count") - 1)
    return {"ok": True}


# ---------- reportes ----------
class ReportIn(BaseModel):
    target_type: str
    target_id: int
    reason: str
    details: str = Field("", max_length=1000)


@router.post("/reports", status_code=201)
def report(body: ReportIn, user=Depends(writer)):
    ratelimit.check("report", f"u{user.pk}", 10, 3600)
    if body.reason not in dict(Report.REASONS):
        raise HTTPException(422, "Motivo inválido.")
    category = ""
    if body.target_type == "artwork":
        a = Artwork.objects.filter(pk=body.target_id).first()
        category = a.category if a else None
    elif body.target_type == "chapter":
        ch = Chapter.objects.filter(pk=body.target_id).select_related("series").first()
        category = ch.series.category if ch else None
    elif body.target_type == "comment":
        c = Comment.objects.filter(pk=body.target_id).first()
        category = (c.category or "") if c else None
    elif body.target_type == "user":
        category = "" if Profile.objects.filter(user_id=body.target_id).exists() else None
    else:
        raise HTTPException(422, "Tipo inválido.")
    if category is None:
        raise HTTPException(404, "No encontramos el contenido reportado.")
    Report.objects.create(reporter=user, target_type=body.target_type, target_id=body.target_id, category=category,
                          reason=body.reason, details=_clean(body.details))
    return {"ok": True, "message": "Gracias. El equipo de moderación lo va a revisar."}


# ---------- notificaciones ----------
@router.get("/notifications")
def notifications(page: int = Query(1, ge=1, le=100), user=Depends(require_user)):
    rows = list(Notification.objects.filter(recipient=user).select_related("actor__profile", "chapter")[(page - 1) * 30: page * 30 + 1])
    return {"items": [serialize.notification(n) for n in rows[:30]], "next": page + 1 if len(rows) > 30 else None}


@router.post("/notifications/read-all")
def read_all(user=Depends(writer)):
    Notification.objects.filter(recipient=user, read=False).update(read=True)
    return {"ok": True}


CATEGORY_LABELS = dict(CATEGORY_CHOICES)
