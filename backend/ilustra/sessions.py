"""Sesión propia del sitio: un JWT firmado en una cookie httpOnly.

La usan FastAPI (API) y Django (panel /admin) para reconocer al mismo usuario.
"""
import datetime as dt

import jwt
from django.conf import settings
from django.contrib.auth import get_user_model

ALGO = "HS256"


def issue_token(user_id: int) -> str:
    now = dt.datetime.now(dt.timezone.utc)
    payload = {"sub": str(user_id), "iat": now, "exp": now + dt.timedelta(days=settings.SESSION_DAYS), "iss": "dbp-ilustra"}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGO)


def user_from_token(token: str | None):
    if not token:
        return None
    try:
        data = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGO], issuer="dbp-ilustra")
    except jwt.PyJWTError:
        return None
    User = get_user_model()
    try:
        return User.objects.select_related("profile").get(pk=int(data["sub"]), is_active=True)
    except (User.DoesNotExist, ValueError, KeyError):
        return None
