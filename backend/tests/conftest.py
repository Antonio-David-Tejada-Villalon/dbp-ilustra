import os

os.environ.setdefault("DATABASE_URL", "sqlite:///test.sqlite3")
os.environ.setdefault("GOOGLE_CLIENT_ID", "test-client-id")

import pytest
from fastapi.testclient import TestClient

from api.services import ratelimit


@pytest.fixture(autouse=True)
def _reset_limits(tmp_path, settings):
    ratelimit.reset()
    settings.IMAGE_CACHE_DIR = tmp_path / "cache"
    yield


@pytest.fixture
def client():
    from api.main import app
    return TestClient(app)


H = {"x-requested-with": "ilustra"}


@pytest.fixture
def login(client, monkeypatch, settings):
    """Devuelve una función que loguea un usuario simulando Google."""
    settings.GOOGLE_CLIENT_ID = "test-client-id"
    from api.routers import auth

    def _login(sub="1", name="Ana Paz", email="ana@example.com"):
        monkeypatch.setattr(auth.id_token, "verify_oauth2_token",
                            lambda cred, req, aud: {"sub": sub, "email": email, "name": name, "email_verified": True, "picture": ""})
        r = client.post("/api/auth/google", json={"credential": "x"})
        assert r.status_code == 200, r.text
        return client
    return _login


@pytest.fixture
def fake_fetch(monkeypatch):
    from api.services.safefetch import FetchedImage
    from api.routers import artworks, auth, series

    def _fake(url, max_bytes=None):
        return FetchedImage(data=b"", width=900, height=1200, format="PNG")
    for mod in (artworks, auth, series):
        monkeypatch.setattr(mod, "fetch_image", _fake)
    return _fake
