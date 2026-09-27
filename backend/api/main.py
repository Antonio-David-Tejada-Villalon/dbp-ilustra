"""App principal: FastAPI sirve /api, Django sirve /admin y, en producción, se entrega el frontend compilado.

    uvicorn api.main:app --reload     (desde la carpeta backend)
"""
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django  # noqa: E402

django.setup()

from django.conf import settings  # noqa: E402
from django.core.asgi import get_asgi_application  # noqa: E402
from fastapi import APIRouter, FastAPI, Request  # noqa: E402
from fastapi.responses import FileResponse, JSONResponse  # noqa: E402
from fastapi.staticfiles import StaticFiles  # noqa: E402

from .routers import artworks, assistant, auth, discover, images, series, social  # noqa: E402

django_app = get_asgi_application()

app = FastAPI(title="DBP Ilustra API", version="1.0.0", docs_url="/api/docs" if settings.DEBUG else None,
              redoc_url=None, openapi_url="/api/openapi.json" if settings.DEBUG else None)

api = APIRouter(prefix="/api")
for r in (auth, artworks, series, social, discover, images, assistant):
    api.include_router(r.router)


@api.get("/health", include_in_schema=False)
def health():
    return {"ok": True}


app.include_router(api)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    if not request.url.path.startswith("/admin"):
        response.headers.setdefault("X-Frame-Options", "DENY")
    return response


if settings.STATIC_ROOT.exists():
    app.mount("/static", StaticFiles(directory=settings.STATIC_ROOT), name="static")


class Fallback:
    """/admin → Django. Todo lo demás → frontend compilado (SPA) si existe."""

    def __init__(self, dist):
        self.dist = dist

    async def __call__(self, scope, receive, send):
        path = scope.get("path", "")
        if scope["type"] != "http" or path.startswith("/admin"):
            return await django_app(scope, receive, send)
        if path.startswith("/api/"):
            return await JSONResponse({"detail": "No encontrado."}, status_code=404)(scope, receive, send)
        candidate = (self.dist / path.lstrip("/")).resolve()
        if path != "/" and candidate.is_file() and self.dist.resolve() in candidate.parents:
            cache = "public, max-age=31536000, immutable" if path.startswith("/assets/") else "no-cache"
            return await FileResponse(candidate, headers={"Cache-Control": cache})(scope, receive, send)
        index = self.dist / "index.html"
        if index.exists():
            return await FileResponse(index, headers={"Cache-Control": "no-cache"})(scope, receive, send)
        return await JSONResponse({"detail": "Frontend no compilado. En desarrollo usá http://localhost:5173"}, status_code=404)(scope, receive, send)


app.mount("/", Fallback(settings.FRONTEND_DIST))
