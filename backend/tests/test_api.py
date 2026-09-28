import socket

import pytest
from django.contrib.auth import get_user_model

from api.services import imaging, safefetch
from ilustra.models import Artwork, Comment, ModeratorScope, Notification, Profile

from .conftest import H

pytestmark = pytest.mark.django_db(transaction=True)


# ---------- seguridad de enlaces ----------
@pytest.mark.parametrize("url,msg", [
    ("http://example.com/a.png", "https://"),
    ("https://user:pw@example.com/a.png", "usuario"),
    ("https://example.com:8080/a.png", "puerto"),
])
def test_rechaza_enlaces_invalidos(url, msg):
    with pytest.raises(safefetch.ImageURLError) as e:
        safefetch.validate_url_syntax(url)
    assert msg in str(e.value)


def test_rechaza_ip_privada(monkeypatch):
    monkeypatch.setattr(socket, "getaddrinfo", lambda *a, **k: [(None, None, None, None, ("10.0.0.5", 443))])
    with pytest.raises(safefetch.ImageURLError, match="no pública"):
        safefetch.validate_url_syntax("https://intranet.example/x.png")


def test_hosts_permitidos(monkeypatch, settings):
    settings.IMAGE_ALLOWED_HOSTS = ["i.imgur.com"]
    with pytest.raises(safefetch.ImageURLError, match="no está habilitado"):
        safefetch.validate_url_syntax("https://evil.example/x.png")


# ---------- sesión ----------
def test_login_google_crea_usuario_y_perfil(login):
    c = login(sub="abc", name="María José Díaz")
    me = c.get("/api/me").json()["user"]
    assert me["name"] == "María José Díaz"
    assert me["slug"] == "maria.jose.diaz"
    assert Profile.objects.get(google_sub="abc")


def test_escritura_requiere_encabezado(login, fake_fetch):
    c = login()
    assert c.patch("/api/me/profile", json={"bio": "hola"}).status_code == 403
    assert c.patch("/api/me/profile", json={"bio": "hola"}, headers=H).status_code == 200


# ---------- publicar ----------
def test_publicar_requiere_perfil_de_artista(login, fake_fetch):
    c = login()
    body = {"title": "Obra", "category": "ilustracion", "image_url": "https://example.com/a.png", "tags": ["#Tinta", "tinta"]}
    assert c.post("/api/artworks", json=body, headers=H).status_code == 403
    c.patch("/api/me/profile", json={"is_artist": True}, headers=H)
    r = c.post("/api/artworks", json=body, headers=H)
    assert r.status_code == 201, r.text
    data = r.json()
    assert data["tags"] == ["tinta"] and data["ratio"] == 0.75
    assert "image_url" not in data and data["image"] == f"/api/img/a/{data['id']}?wm=0"


def test_suspendido_no_puede_escribir(login):
    c = login()
    Profile.objects.update(suspended=True)
    assert c.patch("/api/me/profile", json={"bio": "x"}, headers=H).status_code == 403


# ---------- comunidad ----------
def _artwork_for(handle="lara", sub="99"):
    User = get_user_model()
    u = User.objects.create(username=handle)
    Profile.objects.create(user=u, handle=handle + ".art", display_name=handle.title(), is_artist=True, google_sub=sub)
    return Artwork.objects.create(author=u, title="Sierra", category="ilustracion", image_url="demo:1:800x1000", width=800, height=1000)


def test_comentar_notifica_al_artista(login):
    a = _artwork_for()
    c = login()
    r = c.post("/api/comments", json={"artwork": a.pk, "text": "¡Hermosa!"}, headers=H)
    assert r.status_code == 201
    assert Notification.objects.filter(recipient=a.author, type="comment").count() == 1
    a.refresh_from_db()
    assert a.comment_count == 1
    tree = c.get(f"/api/comments?artwork={a.pk}").json()
    assert tree["items"][0]["text"] == "¡Hermosa!"


def test_like_y_follow_toggle(login):
    a = _artwork_for()
    c = login()
    assert c.post(f"/api/artworks/{a.pk}/like", headers=H).json() == {"liked": True, "likes": 1}
    assert c.post(f"/api/artworks/{a.pk}/like", headers=H).json() == {"liked": False, "likes": 0}
    r = c.post("/api/users/lara.art/follow", headers=H).json()
    assert r["following"] is True and r["followers"] == 1
    me = c.get("/api/me").json()["user"]["slug"]
    assert c.post(f"/api/users/{me}/follow", headers=H).status_code == 422


# ---------- moderación ----------
def test_moderador_recibe_permisos_por_alcance():
    User = get_user_model()
    u = User.objects.create(username="mod")
    scope = ModeratorScope.objects.create(user=u, categories=["manga"], can_moderate_comments=True, can_moderate_artworks=False)
    u = User.objects.get(pk=u.pk)
    assert u.is_staff
    assert u.has_perm("ilustra.change_comment")
    assert not u.has_perm("ilustra.change_artwork")
    scope.active = False
    scope.save()
    u = User.objects.get(pk=u.pk)
    assert not u.is_staff and not u.has_perm("ilustra.change_comment")


def test_moderador_ve_solo_sus_categorias(rf):
    from django.contrib.admin.sites import site
    from ilustra.admin import ArtworkAdmin
    User = get_user_model()
    a1 = _artwork_for("lara", "1")
    a2 = Artwork.objects.create(author=a1.author, title="Kaze", category="manga", image_url="demo:2:800x800", width=800, height=800)
    mod = User.objects.create(username="mod")
    ModeratorScope.objects.create(user=mod, categories=["manga"])
    req = rf.get("/admin/")
    req.user = User.objects.get(pk=mod.pk)
    qs = ArtworkAdmin(Artwork, site).get_queryset(req)
    assert list(qs) == [a2]


# ---------- imágenes ----------
def test_proxy_entrega_webp_con_marca(client):
    a = _artwork_for()
    r = client.get(f"/api/img/a/{a.pk}?w=800")
    assert r.status_code == 200 and r.headers["content-type"] == "image/webp"
    assert r.headers["content-disposition"] == "inline"
    assert imaging.pick_width(700) == 800 and imaging.pick_width(5000) == 1600


def test_obra_oculta_no_se_sirve(client):
    a = _artwork_for()
    Artwork.objects.filter(pk=a.pk).update(status="hidden")
    assert client.get(f"/api/img/a/{a.pk}").status_code == 404
    assert client.get(f"/api/artworks/{a.pk}").status_code == 404


# ---------- asistente ----------
def test_asistente_sin_configurar(client, settings):
    settings.GEMINI_API_KEY = ""
    assert client.post("/api/assistant", json={"message": "hola"}).status_code == 503


def test_asistente_usa_contexto(client, settings, monkeypatch):
    from api.routers import assistant
    a = _artwork_for()
    settings.GEMINI_API_KEY = "k"
    seen = {}

    def fake(system, history, message):
        seen["system"] = system
        return f"Mirá «Sierra»: /obra/{a.pk}"
    monkeypatch.setattr(assistant, "call_gemini", fake)
    r = client.post("/api/assistant", json={"message": "busco obras de sierra"}).json()
    assert f"/obra/{a.pk}" in r["links"]
    assert "OBRA «Sierra»" in seen["system"]
