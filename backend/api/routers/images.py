"""Entrega de imágenes siempre a través del servidor (reducidas, con marca de agua, en caché)."""
from django.db.models import Q
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse

from ilustra.models import Artwork, ChapterPage, Profile, Project, Series

from ..deps import current_user
from ..services.imaging import render
from ..services.safefetch import ImageURLError

router = APIRouter(tags=["imágenes"])
HEADERS = {"Cache-Control": "public, max-age=604800", "Content-Disposition": "inline", "X-Content-Type-Options": "nosniff"}


def _serve(source, w, mark):
    try:
        path = render(source, w, mark)
    except ImageURLError:
        raise HTTPException(502, "La imagen original ya no está disponible.")
    except Exception:
        raise HTTPException(502, "No pudimos procesar la imagen.")
    return FileResponse(path, media_type="image/webp", headers=HEADERS)


def _mark(user):
    p = getattr(user, "profile", None)
    if not p or not p.watermark_enabled:
        return None
    return f"@{p.handle} · DBP Ilustra"


def _pub(user):
    q = Q(status="published")
    return q | Q(author=user) if user is not None else q


@router.get("/img/a/{artwork_id}")
def artwork_image(artwork_id: int, w: int = Query(800, ge=100, le=2000), user=Depends(current_user)):
    a = Artwork.objects.filter(_pub(user), pk=artwork_id).select_related("author__profile").first()
    if not a:
        raise HTTPException(404)
    return _serve(a.image_url, w, _mark(a.author) if w >= 800 else None)


@router.get("/img/p/{page_id}")
def page_image(page_id: int, w: int = Query(1200, ge=100, le=2000), user=Depends(current_user)):
    p = ChapterPage.objects.filter(pk=page_id).select_related("chapter__series__author__profile").first()
    if not p or (p.chapter.status != "published" or p.chapter.series.status != "published") and not (user and user.pk == p.chapter.series.author_id):
        raise HTTPException(404)
    return _serve(p.image_url, w, _mark(p.chapter.series.author))


@router.get("/img/s/{series_id}")
def series_cover(series_id: int, w: int = Query(800, ge=100, le=2000), user=Depends(current_user)):
    s = Series.objects.filter(_pub(user), pk=series_id).select_related("author__profile").first()
    if not s:
        raise HTTPException(404)
    return _serve(s.cover_url, w, _mark(s.author) if w >= 800 else None)


@router.get("/img/u/{handle}/{kind}")
def user_image(handle: str, kind: str, w: int = Query(1200, ge=100, le=2000)):
    p = Profile.objects.filter(handle=handle, suspended=False).first()
    if not p or kind not in ("cover", "avatar"):
        raise HTTPException(404)
    src = p.cover_url if kind == "cover" else p.avatar_url
    if not src:
        raise HTTPException(404)
    return _serve(src, w if kind == "cover" else 400, None)


@router.get("/img/project/{project_id}")
def project_image(project_id: int, w: int = Query(800, ge=100, le=2000)):
    p = Project.objects.filter(pk=project_id, active=True).first()
    if not p or not p.image_url:
        raise HTTPException(404)
    return _serve(p.image_url, w, None)
