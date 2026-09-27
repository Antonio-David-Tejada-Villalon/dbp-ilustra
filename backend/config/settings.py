"""Configuración de Django para DBP Ilustra.

Django es dueño de los modelos, las migraciones y el panel de administración.
La API pública la sirve FastAPI (ver api/main.py) usando este mismo ORM.
"""
import os
from pathlib import Path

import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent


def _load_dotenv(path):
    """Carga variables de un archivo .env simple (KEY=valor) sin pisar las ya definidas."""
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


if "pytest" not in __import__("sys").modules:
    _load_dotenv(BASE_DIR.parent / ".env")


def env(name, default=None):
    return os.environ.get(name, default)


def env_bool(name, default=False):
    return str(env(name, str(default))).lower() in ("1", "true", "yes", "on")


def env_list(name, default=""):
    return [x.strip() for x in env(name, default).split(",") if x.strip()]


DEBUG = env_bool("DEBUG", False)
_DEV_KEY = "solo-desarrollo-no-usar-en-produccion-0123456789abcdef"
SECRET_KEY = env("SECRET_KEY", _DEV_KEY)
if SECRET_KEY == _DEV_KEY and not DEBUG and "pytest" not in __import__("sys").modules:
    from django.core.exceptions import ImproperlyConfigured
    raise ImproperlyConfigured("Definí SECRET_KEY (mínimo 50 caracteres aleatorios) para producción.")
ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", "localhost,127.0.0.1")
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS", "http://localhost:8000,http://localhost:5173")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "ilustra",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    # Permite entrar al panel con la misma sesión de Google del sitio (solo usuarios staff).
    "ilustra.middleware.IlustraSessionMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

ASGI_APPLICATION = "config.asgi.application"

DATABASES = {
    "default": dj_database_url.parse(
        env("DATABASE_URL", f"sqlite:///{BASE_DIR / 'db.sqlite3'}"),
        conn_max_age=int(env("DB_CONN_MAX_AGE", "60")),
        conn_health_checks=True,
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
]

LANGUAGE_CODE = "es-ar"
TIME_ZONE = "America/Argentina/San_Juan"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

SESSION_COOKIE_SECURE = env_bool("COOKIE_SECURE", False)
CSRF_COOKIE_SECURE = env_bool("COOKIE_SECURE", False)

# ---- DBP Ilustra ----
GOOGLE_CLIENT_ID = env("GOOGLE_CLIENT_ID", "")
GEMINI_API_KEY = env("GEMINI_API_KEY", "")
GEMINI_MODEL = env("GEMINI_MODEL", "gemini-3.1-flash-lite")
SESSION_COOKIE_NAME_ILUSTRA = "ilustra_session"
SESSION_DAYS = int(env("SESSION_DAYS", "14"))
COOKIE_SECURE = env_bool("COOKIE_SECURE", False)
IMAGE_CACHE_DIR = Path(env("IMAGE_CACHE_DIR", str(BASE_DIR / "image_cache")))
MAX_IMAGE_BYTES = int(env("MAX_IMAGE_BYTES", str(15 * 1024 * 1024)))
# Hosts de imágenes permitidos (vacío = cualquier host público).
IMAGE_ALLOWED_HOSTS = env_list("IMAGE_ALLOWED_HOSTS", "")
FRONTEND_DIST = Path(env("FRONTEND_DIST", str(BASE_DIR.parent / "frontend" / "dist")))
SITE_URL = env("SITE_URL", "http://localhost:5173")
