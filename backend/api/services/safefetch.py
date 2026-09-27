"""Descarga segura de imágenes desde enlaces públicos que pegan los artistas.

- Solo https, sin credenciales en la URL, puertos 443 (o el estándar).
- Resuelve el DNS y rechaza IPs privadas, locales o reservadas (evita SSRF).
- Sigue hasta 3 redirecciones validando cada salto.
- Corta la descarga al superar MAX_IMAGE_BYTES y verifica que sea una imagen real con Pillow.

Limitación conocida: entre la resolución DNS y la conexión podría cambiar la IP (DNS rebinding).
Para cerrarlo del todo, restringí IMAGE_ALLOWED_HOSTS a los servicios que uses.
"""
import io
import ipaddress
import socket
from dataclasses import dataclass
from urllib.parse import urljoin, urlsplit

import httpx
from django.conf import settings
from PIL import Image, UnidentifiedImageError

Image.MAX_IMAGE_PIXELS = 60_000_000
USER_AGENT = "DBPIlustraBot/1.0 (+verificacion de imagenes)"
ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP", "GIF"}


class ImageURLError(ValueError):
    """Error con mensaje apto para mostrar al usuario."""


@dataclass
class FetchedImage:
    data: bytes
    width: int
    height: int
    format: str


def _check_host(url: str) -> None:
    parts = urlsplit(url)
    if parts.scheme != "https":
        raise ImageURLError("El enlace debe empezar con https://")
    if parts.username or parts.password:
        raise ImageURLError("El enlace no puede incluir usuario o contraseña.")
    host = parts.hostname
    if not host:
        raise ImageURLError("El enlace no es válido.")
    if parts.port not in (None, 443):
        raise ImageURLError("El enlace usa un puerto no permitido.")
    allowed = settings.IMAGE_ALLOWED_HOSTS
    if allowed and not any(host == h or host.endswith("." + h) for h in allowed):
        raise ImageURLError("Ese sitio de imágenes no está habilitado. Consultá la lista de servicios permitidos.")
    try:
        infos = socket.getaddrinfo(host, 443, proto=socket.IPPROTO_TCP)
    except socket.gaierror:
        raise ImageURLError("No se encontró el sitio del enlace.")
    for info in infos:
        ip = ipaddress.ip_address(info[4][0])
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast or ip.is_unspecified:
            raise ImageURLError("El enlace apunta a una dirección no pública.")


def validate_url_syntax(url: str) -> str:
    url = (url or "").strip()
    if len(url) > 1000:
        raise ImageURLError("El enlace es demasiado largo.")
    _check_host(url)
    return url


def fetch_image(url: str, max_bytes: int | None = None) -> FetchedImage:
    max_bytes = max_bytes or settings.MAX_IMAGE_BYTES
    current = validate_url_syntax(url)
    with httpx.Client(timeout=httpx.Timeout(10.0, connect=5.0), follow_redirects=False,
                      headers={"User-Agent": USER_AGENT, "Accept": "image/*"}) as client:
        for _ in range(4):
            with client.stream("GET", current) as resp:
                if resp.status_code in (301, 302, 303, 307, 308):
                    location = resp.headers.get("location")
                    if not location:
                        raise ImageURLError("El enlace redirige a un destino inválido.")
                    current = urljoin(current, location)
                    _check_host(current)
                    continue
                if resp.status_code != 200:
                    raise ImageURLError(f"El sitio respondió con error {resp.status_code}. ¿El enlace es público?")
                ctype = resp.headers.get("content-type", "").split(";")[0].strip().lower()
                if not ctype.startswith("image/"):
                    raise ImageURLError("El enlace no es una imagen directa. Usá el enlace que termina en la imagen (clic derecho → copiar dirección de imagen).")
                declared = resp.headers.get("content-length")
                if declared and declared.isdigit() and int(declared) > max_bytes:
                    raise ImageURLError("La imagen supera el tamaño máximo permitido.")
                buf = io.BytesIO()
                for chunk in resp.iter_bytes():
                    buf.write(chunk)
                    if buf.tell() > max_bytes:
                        raise ImageURLError("La imagen supera el tamaño máximo permitido.")
                data = buf.getvalue()
                break
        else:
            raise ImageURLError("El enlace tiene demasiadas redirecciones.")
    try:
        with Image.open(io.BytesIO(data)) as im:
            im.verify()
        with Image.open(io.BytesIO(data)) as im:
            fmt, (w, h) = im.format, im.size
    except (UnidentifiedImageError, OSError, Image.DecompressionBombError):
        raise ImageURLError("No pudimos leer la imagen. Probá con JPG, PNG, WEBP o GIF.")
    if fmt not in ALLOWED_FORMATS:
        raise ImageURLError("Formato no admitido. Usá JPG, PNG, WEBP o GIF.")
    if w < 200 or h < 200:
        raise ImageURLError("La imagen es muy chica (mínimo 200 × 200 px).")
    return FetchedImage(data=data, width=w, height=h, format=fmt)
