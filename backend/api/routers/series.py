from concurrent.futures import ThreadPoolExecutor

from django.db import IntegrityError, transaction
from django.db.models import F, Max, Q
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from ilustra.models import SERIES_CATEGORY_CHOICES, Chapter, ChapterPage, Follow, Like, Series

from .. import serialize
from ..deps import artist, current_user, writer
from ..services import ratelimit
from ..services.notify import notify, notify_followers
from ..services.safefetch import ImageURLError, fetch_image

router = APIRouter(tags=["series"])
SCATS = {k for k, _ in SERIES_CATEGORY_CHOICES}
MAX_PAGES = 80


def visible_series(user=None):
    q = Q(status="published", author__profile__suspended=False)
    if user is not None:
        q |= Q(author=user)
    return Series.objects.filter(q).select_related("author__profile")


@router.get("/series")
def list_series(category: str | None = None, author: str | None = None, page: int = Query(1, ge=1, le=500),
                limit: int = Query(24, ge=1, le=60), user=Depends(current_user)):
    qs = visible_series(user).filter(chapters__isnull=False).distinct()
    if category:
        qs = qs.filter(category=category)
    if author:
        qs = visible_series(user).filter(author__profile__handle=author.lstrip("@"))
    items = list(qs.order_by("-updated")[(page - 1) * limit: page * limit + 1])
    return {"items": [serialize.series(s) for s in items[:limit]], "next": page + 1 if len(items) > limit else None}


@router.get("/series/{series_id}")
def get_series(series_id: int, user=Depends(current_user)):
    s = visible_series(user).filter(pk=series_id).first()
    if not s:
        raise HTTPException(404, "No encontramos esa serie.")
    chapters = s.chapters.all() if (user and user.pk == s.author_id) else s.chapters.filter(status="published")
    d = serialize.series(s, chapters)
    d["own"] = bool(user and user.pk == s.author_id)
    d["following"] = bool(user and Follow.objects.filter(follower=user, following=s.author).exists())
    return d


class SeriesIn(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: str = Field("", max_length=2000)
    category: str
    cover_url: str = Field(max_length=1000)


@router.post("/series", status_code=201)
def create_series(body: SeriesIn, user=Depends(artist)):
    ratelimit.check("publish", f"u{user.pk}", 30, 3600)
    if body.category not in SCATS:
        raise HTTPException(422, "Las series pueden ser Cómic, Manga o Historieta.")
    try:
        img = fetch_image(body.cover_url)
    except ImageURLError as e:
        raise HTTPException(422, f"Portada: {e}")
    s = Series.objects.create(author=user, title=body.title.strip(), description=body.description.strip(), category=body.category,
                              cover_url=body.cover_url.strip(), cover_width=img.width, cover_height=img.height)
    return serialize.series(s, [])


class ChapterIn(BaseModel):
    title: str = Field("", max_length=120)
    number: int | None = Field(None, ge=1, le=10000)
    pages: list[str] = Field(min_length=1, max_length=MAX_PAGES)


def _check_page(url):
    try:
        img = fetch_image(url)
        return url, img.width, img.height, None
    except ImageURLError as e:
        return url, 0, 0, str(e)


@router.post("/series/{series_id}/chapters", status_code=201)
def add_chapter(series_id: int, body: ChapterIn, user=Depends(artist)):
    ratelimit.check("publish", f"u{user.pk}", 30, 3600)
    s = Series.objects.filter(pk=series_id, author=user).first()
    if not s:
        raise HTTPException(404, "No encontramos esa serie entre las tuyas.")
    urls = [u.strip() for u in body.pages if u.strip()]
    if not urls:
        raise HTTPException(422, "Agregá al menos una página.")
    with ThreadPoolExecutor(max_workers=6) as pool:
        results = list(pool.map(_check_page, urls))
    errors = [{"page": i + 1, "error": err} for i, (_, _, _, err) in enumerate(results) if err]
    if errors:
        raise HTTPException(422, {"message": "Algunas páginas no se pudieron validar.", "pages": errors})
    number = body.number or (s.chapters.aggregate(m=Max("number"))["m"] or 0) + 1
    try:
        with transaction.atomic():
            ch = Chapter.objects.create(series=s, number=number, title=body.title.strip())
            ChapterPage.objects.bulk_create([ChapterPage(chapter=ch, order=i, image_url=u, width=w, height=h)
                                             for i, (u, w, h, _) in enumerate(results)])
            s.save(update_fields=["updated"])
    except IntegrityError:
        raise HTTPException(409, f"Ya existe el capítulo {number} en esta serie.")
    notify_followers(user.pk, "chapter", f"publicó el capítulo {number} de «{s.title}»", chapter=ch)
    return {"series": s.pk, "number": ch.number}


def _chapter(series_id, number, user):
    s = visible_series(user).filter(pk=series_id).first()
    if not s:
        raise HTTPException(404, "No encontramos esa serie.")
    qs = s.chapters.all() if (user and user.pk == s.author_id) else s.chapters.filter(status="published")
    ch = qs.filter(number=number).first()
    if not ch:
        raise HTTPException(404, "No encontramos ese capítulo.")
    return s, ch, qs


@router.get("/series/{series_id}/chapters/{number}")
def get_chapter(series_id: int, number: int, user=Depends(current_user)):
    s, ch, qs = _chapter(series_id, number, user)
    prev = qs.filter(number__lt=number).order_by("-number").values_list("number", flat=True).first()
    nxt = qs.filter(number__gt=number).order_by("number").values_list("number", flat=True).first()
    return {
        "series": serialize.series(s), "number": ch.number, "title": ch.title, "id": ch.pk,
        "pages": [{"id": p.pk, "image": f"/api/img/p/{p.pk}", "ratio": p.ratio} for p in ch.pages.all()],
        "prev": prev, "next": nxt, "likes": ch.like_count, "comments": ch.comment_count,
        "liked": bool(user and Like.objects.filter(user=user, chapter=ch).exists()),
        "following": bool(user and Follow.objects.filter(follower=user, following=s.author).exists()),
        "own": bool(user and user.pk == s.author_id),
    }


@router.post("/series/{series_id}/chapters/{number}/like")
def like_chapter(series_id: int, number: int, user=Depends(writer)):
    ratelimit.check("like", f"u{user.pk}", 120, 60)
    s, ch, _ = _chapter(series_id, number, None)
    with transaction.atomic():
        deleted, _ = Like.objects.filter(user=user, chapter=ch).delete()
        if deleted:
            Chapter.objects.filter(pk=ch.pk, like_count__gt=0).update(like_count=F("like_count") - 1)
        else:
            Like.objects.get_or_create(user=user, chapter=ch)
            Chapter.objects.filter(pk=ch.pk).update(like_count=F("like_count") + 1)
    if not deleted:
        notify(s.author_id, user.pk, "like", f"le gustó el capítulo {ch.number} de «{s.title}»", chapter=ch)
    ch.refresh_from_db(fields=["like_count"])
    return {"liked": not deleted, "likes": ch.like_count}


@router.delete("/series/{series_id}/chapters/{number}")
def delete_chapter(series_id: int, number: int, user=Depends(writer)):
    n, _ = Chapter.objects.filter(series_id=series_id, series__author=user, number=number).delete()
    if not n:
        raise HTTPException(404, "No encontramos ese capítulo entre los tuyos.")
    return {"ok": True}


@router.delete("/series/{series_id}")
def delete_series(series_id: int, user=Depends(writer)):
    n, _ = Series.objects.filter(pk=series_id, author=user).delete()
    if not n:
        raise HTTPException(404, "No encontramos esa serie entre las tuyas.")
    return {"ok": True}
