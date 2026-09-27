from django.conf import settings
from fastapi import Depends, HTTPException, Request

from ilustra.sessions import user_from_token


def current_user(request: Request):
    """Usuario logueado o None (endpoints públicos)."""
    return user_from_token(request.cookies.get(settings.SESSION_COOKIE_NAME_ILUSTRA))


def require_user(user=Depends(current_user)):
    if user is None:
        raise HTTPException(401, "Iniciá sesión con Google para continuar.")
    return user


def writer(request: Request, user=Depends(require_user)):
    """Para acciones que modifican datos: exige el encabezado anti-CSRF y cuenta no suspendida."""
    if request.headers.get("x-requested-with") != "ilustra":
        raise HTTPException(403, "Solicitud no permitida.")
    profile = getattr(user, "profile", None)
    if profile is not None and profile.suspended:
        raise HTTPException(403, "Tu cuenta está suspendida. Escribí a la DBP si creés que es un error.")
    return user


def artist(user=Depends(writer)):
    if not getattr(user, "profile", None) or not user.profile.is_artist:
        raise HTTPException(403, "Activá tu perfil de artista en Ajustes para publicar.")
    return user


def client_key(request: Request, user=None) -> str:
    if user is not None:
        return f"u{user.pk}"
    fwd = request.headers.get("x-forwarded-for")
    return fwd.split(",")[0].strip() if fwd else (request.client.host if request.client else "anon")
