from datetime import timedelta

from django.db import IntegrityError, transaction
from django.db.models import Count, F, Q
from django.utils import timezone
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel, Field

from ilustra.models import CATEGORY_CHOICES, Artwork, Follow, Like, Save

from .. import serialize
from ..deps import artist, current_user, writer
from ..services import ratelimit
from ..services.notify import notify
from ..services.safefetch import ImageURLError, fetch_image

router = APIRouter(tags=["obras"])
CATS = {k for k, _ in CATEGORY_CHOICES}


def visible(user=None):
    q = Q(status="published", author__profile__suspended=False)
    if user is not None:
        q |= Q(author=user)
    return Artwork.objects.filter(q).select_related("author__profile")


def with_flags(items, user):
    items = list(items)
    if user is None or not items:
        return [serialize.artwork(a) for a in items]
    ids = [a.pk for a in items]
    liked = set(Like.objects.filter(user=user, artwork_id__in=ids).values_list("artwork_id", flat=True))
    saved = set(Save.objects.filter(user=user, artwork_id__in=ids).values_list("artwork_id", flat=True))
    return [serialize.artwork(a, a.pk in liked, a.pk in saved) for a in items]


def trending(qs, days=7):
    since = timezone.now() - timedelta(days=days)
    return qs.annotate(recent=Count("likes", filter=Q(likes__created__gte=since))).order_by("-recent", "-like_count", "-created")


@router.get("/artworks")
def list_artworks(category: str | None = None, sort: str = "recent", author: str | None = None, tag: str | None = None,
                  page: int = Query(1, ge=1, le=500), limit: int = Query(24, ge=1, le=60), user=Depends(current_user)):
    qs = visible(user)
    if category:
        if category not in CATS:
            raise HTTPException(422, "Categoría inválida.")
        qs = qs.filter(category=category)
    if author:
        qs = qs.filter(author__profile__handle=author.lstrip("@"))
        if user is None or user.profile.handle != author.lstrip("@"):
            qs = qs.filter(status="published")
    if tag:
        qs = qs.filter(tags__icontains=tag.lower()[:40])
    if sort == "trending":
        qs = trending(qs)
    elif sort == "following":
        if user is None:
            raise HTTPException(401, "Iniciá sesión para ver a quienes seguís.")
        qs = qs.filter(author__in=Follow.objects.filter(follower=user).values("following"))
    else:
        qs = qs.order_by("-created")
    start = (page - 1) * limit
    items = list(qs[start:start + limit + 1])
    return {"items": with_flags(items[:limit], user), "next": page + 1 if len(items) > limit else None}


@router.get("/artworks/{artwork_id}")
def get_artwork(artwork_id: int, user=Depends(current_user)):
    a = visible(user).filter(pk=artwork_id).first()
    if not a:
        raise HTTPException(404, "No encontramos esa obra.")
    data = with_flags([a], user)[0]
    data["following"] = bool(user and Follow.objects.filter(follower=user, following=a.author).exists())
    data["own"] = bool(user and user.pk == a.author_id)
    if data["own"]:
        data["imageUrl"] = a.image_url  # solo el autor ve su enlace original
    return data


class ImageCheckIn(BaseModel):
    url: str = Field(max_length=1000)


@router.post("/images/check")
def check_image(body: ImageCheckIn, request: Request, user=Depends(writer)):
    ratelimit.check("imgcheck", f"u{user.pk}", 60, 600)
    try:
        img = fetch_image(body.url)
    except ImageURLError as e:
        raise HTTPException(422, str(e))
    return {"ok": True, "width": img.width, "height": img.height, "ratio": round(img.width / img.height, 4)}


class ArtworkIn(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    description: str = Field("", max_length=2000)
    category: str
    image_url: str = Field(max_length=1000)
    tags: list[str] = Field(default_factory=list, max_length=10)


def clean_tags(tags):
    out = []
    for t in tags:
        t = t.strip().lstrip("#").lower()[:30]
        if t and t not in out:
            out.append(t)
    return out[:10]


@router.post("/artworks", status_code=201)
def create_artwork(body: ArtworkIn, user=Depends(artist)):
    ratelimit.check("publish", f"u{user.pk}", 30, 3600)
    if body.category not in CATS:
        raise HTTPException(422, "Elegí una categoría válida.")
    try:
        img = fetch_image(body.image_url)
    except ImageURLError as e:
        raise HTTPException(422, str(e))
    a = Artwork.objects.create(author=user, title=body.title.strip(), description=body.description.strip(), category=body.category,
                               image_url=body.image_url.strip(), width=img.width, height=img.height, tags=clean_tags(body.tags))
    return serialize.artwork(a)


class ArtworkPatch(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=120)
    description: str | None = Field(None, max_length=2000)
    category: str | None = None
    tags: list[str] | None = Field(None, max_length=10)


def own_artwork(artwork_id, user):
    a = Artwork.objects.filter(pk=artwork_id, author=user).first()
    if not a:
        raise HTTPException(404, "No encontramos esa obra entre las tuyas.")
    return a


@router.patch("/artworks/{artwork_id}")
def update_artwork(artwork_id: int, body: ArtworkPatch, user=Depends(writer)):
    a = own_artwork(artwork_id, user)
    data = body.model_dump(exclude_unset=True)
    if "category" in data and data["category"] not in CATS:
        raise HTTPException(422, "Categoría inválida.")
    if "tags" in data:
        data["tags"] = clean_tags(data["tags"] or [])
    for k, v in data.items():
        if v is not None:
            setattr(a, k, v.strip() if isinstance(v, str) else v)
    a.save()
    return serialize.artwork(a)


@router.delete("/artworks/{artwork_id}")
def delete_artwork(artwork_id: int, user=Depends(writer)):
    own_artwork(artwork_id, user).delete()
    return {"ok": True}


@router.post("/artworks/{artwork_id}/like")
def like_artwork(artwork_id: int, user=Depends(writer)):
    ratelimit.check("like", f"u{user.pk}", 120, 60)
    a = visible().filter(pk=artwork_id).first()
    if not a:
        raise HTTPException(404, "No encontramos esa obra.")
    with transaction.atomic():
        deleted, _ = Like.objects.filter(user=user, artwork=a).delete()
        if deleted:
            Artwork.objects.filter(pk=a.pk, like_count__gt=0).update(like_count=F("like_count") - 1)
            liked = False
        else:
            try:
                with transaction.atomic():
                    Like.objects.create(user=user, artwork=a)
            except IntegrityError:
                pass
            Artwork.objects.filter(pk=a.pk).update(like_count=F("like_count") + 1)
            liked = True
    if liked:
        notify(a.author_id, user.pk, "like", f"le gustó tu obra «{a.title}»", artwork=a)
    a.refresh_from_db(fields=["like_count"])
    return {"liked": liked, "likes": a.like_count}


@router.post("/artworks/{artwork_id}/save")
def save_artwork(artwork_id: int, user=Depends(writer)):
    a = visible().filter(pk=artwork_id).first()
    if not a:
        raise HTTPException(404, "No encontramos esa obra.")
    deleted, _ = Save.objects.filter(user=user, artwork=a).delete()
    if deleted:
        Artwork.objects.filter(pk=a.pk, save_count__gt=0).update(save_count=F("save_count") - 1)
        return {"saved": False}
    Save.objects.get_or_create(user=user, artwork=a)
    Artwork.objects.filter(pk=a.pk).update(save_count=F("save_count") + 1)
    return {"saved": True}


@router.get("/me/saved")
def saved(page: int = Query(1, ge=1), user=Depends(current_user)):
    if user is None:
        raise HTTPException(401, "Iniciá sesión para ver tus guardados.")
    ids = Save.objects.filter(user=user).order_by("-created").values_list("artwork_id", flat=True)[(page - 1) * 30: page * 30 + 1]
    ids = list(ids)
    items = {a.pk: a for a in visible().filter(pk__in=ids[:30])}
    ordered = [items[i] for i in ids[:30] if i in items]
    return {"items": with_flags(ordered, user), "next": page + 1 if len(ids) > 30 else None}
