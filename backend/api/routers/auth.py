import re
import unicodedata

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from google.auth.transport import requests as grequests
from google.oauth2 import id_token
from pydantic import BaseModel, Field

from ilustra.models import ACCENT_CHOICES, CATEGORY_CHOICES, Notification, Profile
from ilustra.sessions import issue_token

from .. import serialize
from ..deps import client_key, current_user, require_user, writer
from ..services import ratelimit
from ..services.safefetch import ImageURLError, fetch_image

router = APIRouter(tags=["auth"])
User = get_user_model()
HANDLE_RE = re.compile(r"^[a-z0-9._]{3,30}$")


def _slug(name: str) -> str:
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode().lower()
    s = re.sub(r"[^a-z0-9]+", ".", s).strip(".")[:24] or "artista"
    return s if len(s) >= 3 else s + ".art"


def _unique_handle(base: str) -> str:
    handle, i = base, 1
    while Profile.objects.filter(handle=handle).exists():
        i += 1
        handle = f"{base[:26]}{i}"
    return handle


def _set_cookie(response: Response, user) -> None:
    response.set_cookie(settings.SESSION_COOKIE_NAME_ILUSTRA, issue_token(user.pk), max_age=settings.SESSION_DAYS * 86400,
                        httponly=True, secure=settings.COOKIE_SECURE, samesite="lax", path="/")


def login_or_create(sub: str, email: str, name: str, picture: str = ""):
    with transaction.atomic():
        profile = Profile.objects.select_related("user").filter(google_sub=sub).first()
        if profile:
            user = profile.user
            if picture and profile.avatar_url != picture and not profile.avatar_url.startswith("demo:"):
                profile.avatar_url = picture
                profile.save(update_fields=["avatar_url"])
            return user
        user = User.objects.create(username=f"g{sub}"[:150], email=email, first_name=name[:150])
        user.set_unusable_password()
        user.save()
        Profile.objects.create(user=user, google_sub=sub, handle=_unique_handle(_slug(name or email.split("@")[0])),
                               display_name=(name or email.split("@")[0])[:80], avatar_url=picture or "")
        return user


class GoogleIn(BaseModel):
    credential: str = Field(max_length=4096)


@router.post("/auth/google")
def google_login(body: GoogleIn, request: Request, response: Response):
    ratelimit.check("login", client_key(request), 20, 600)
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(503, "Falta configurar GOOGLE_CLIENT_ID en el servidor.")
    try:
        info = id_token.verify_oauth2_token(body.credential, grequests.Request(), settings.GOOGLE_CLIENT_ID)
    except ValueError:
        raise HTTPException(401, "No pudimos validar tu cuenta de Google. Probá de nuevo.")
    if not info.get("email_verified"):
        raise HTTPException(401, "Tu correo de Google no está verificado.")
    user = login_or_create(info["sub"], info.get("email", ""), info.get("name", ""), info.get("picture", ""))
    if not user.is_active:
        raise HTTPException(403, "Cuenta desactivada.")
    _set_cookie(response, user)
    return {"ok": True}


class DevIn(BaseModel):
    handle: str = Field(max_length=30)


@router.post("/auth/dev-login", include_in_schema=False)
def dev_login(body: DevIn, response: Response):
    """Solo desarrollo (DEBUG y DEV_LOGIN=1): entra como un perfil existente sin Google."""
    import os
    if not (settings.DEBUG and os.environ.get("DEV_LOGIN") == "1"):
        raise HTTPException(404)
    p = Profile.objects.select_related("user").filter(handle=body.handle).first()
    if not p:
        raise HTTPException(404, "No existe ese usuario.")
    _set_cookie(response, p.user)
    return {"ok": True}


@router.post("/auth/logout")
def logout(response: Response):
    response.delete_cookie(settings.SESSION_COOKIE_NAME_ILUSTRA, path="/")
    return {"ok": True}


@router.get("/config")
def config():
    return {"googleClientId": settings.GOOGLE_CLIENT_ID, "assistant": bool(settings.GEMINI_API_KEY),
            "categories": [{"id": k, "label": v} for k, v in CATEGORY_CHOICES]}


@router.get("/me")
def me(user=Depends(current_user)):
    if user is None:
        return {"user": None}
    p = user.profile
    return {"user": {
        **serialize.person(user), "email": user.email, "isArtist": p.is_artist, "isStaff": user.is_staff,
        "bio": p.bio, "location": p.location, "contact": p.contact, "disciplines": p.disciplines, "accent": p.accent,
        "coverUrl": p.cover_url, "cover": f"/api/img/u/{p.handle}/cover" if p.cover_url else None, "suspended": p.suspended,
        "unread": Notification.objects.filter(recipient=user, read=False).count(),
    }}


class ProfileIn(BaseModel):
    display_name: str | None = Field(None, min_length=2, max_length=80)
    handle: str | None = Field(None, max_length=30)
    bio: str | None = Field(None, max_length=500)
    location: str | None = Field(None, max_length=100)
    contact: str | None = Field(None, max_length=200)
    disciplines: list[str] | None = None
    accent: str | None = None
    cover_url: str | None = Field(None, max_length=1000)
    is_artist: bool | None = None


@router.patch("/me/profile")
def update_profile(body: ProfileIn, request: Request, user=Depends(writer)):
    ratelimit.check("profile", f"u{user.pk}", 30, 600)
    p = user.profile
    data = body.model_dump(exclude_unset=True)
    if "handle" in data:
        h = (data["handle"] or "").strip().lower().lstrip("@")
        if not HANDLE_RE.match(h):
            raise HTTPException(422, "El usuario debe tener de 3 a 30 caracteres: minúsculas, números, punto o guion bajo.")
        if Profile.objects.filter(handle=h).exclude(pk=p.pk).exists():
            raise HTTPException(409, "Ese nombre de usuario ya está en uso.")
        p.handle = h
    if "disciplines" in data:
        valid = {k for k, _ in CATEGORY_CHOICES}
        p.disciplines = [d for d in dict.fromkeys(data["disciplines"] or []) if d in valid][:5]
    if "accent" in data:
        if data["accent"] not in {k for k, _ in ACCENT_CHOICES}:
            raise HTTPException(422, "Color de acento inválido.")
        p.accent = data["accent"]
    if "cover_url" in data:
        url = (data["cover_url"] or "").strip()
        if url:
            try:
                fetch_image(url)
            except ImageURLError as e:
                raise HTTPException(422, f"Portada: {e}")
        p.cover_url = url
    for field in ("display_name", "bio", "location", "contact", "is_artist"):
        if field in data and data[field] is not None:
            setattr(p, field, data[field].strip() if isinstance(data[field], str) else data[field])
    try:
        p.save()
    except IntegrityError:
        raise HTTPException(409, "Ese nombre de usuario ya está en uso.")
    return me(user)
