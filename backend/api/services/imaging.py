"""Proxy de imágenes: descarga la obra, la reduce, le pone marca de agua y la guarda en caché.

El navegador nunca ve el enlace original: recibe un WEBP reducido desde /api/img/...
"""
import hashlib
import io
import math
import random
from pathlib import Path

from django.conf import settings
from PIL import Image, ImageDraw, ImageFont, ImageOps

from .safefetch import fetch_image

WIDTHS = (400, 800, 1200, 1600)
FONT_PATH = Path(__file__).resolve().parent.parent.parent / "assets" / "PlusJakartaSans-700.ttf"
CACHE_VERSION = "v2"
MAX_FRAMES = 50  # tope de cuadros para GIFs/WEBP animados: el servidor tiene CPU muy limitada


def pick_width(requested: int | None) -> int:
    if not requested:
        return 800
    for w in WIDTHS:
        if requested <= w:
            return w
    return WIDTHS[-1]


def _cache_path(key: str) -> Path:
    h = hashlib.sha256(key.encode()).hexdigest()
    return settings.IMAGE_CACHE_DIR / h[:2] / f"{h}.webp"


# --- arte de ejemplo para datos demo (sin red) ---
PALETTES = [
    ("#5b2bd9", "#ffc83d", "#fdf6ea", "#1c1b22"), ("#ff6b5b", "#1c1b22", "#fff2cc", "#6cc4f0"),
    ("#6cc4f0", "#5b2bd9", "#f4f1ff", "#ff6b5b"), ("#1c1b22", "#ffc83d", "#ece6fc", "#ff6b5b"),
    ("#ffc83d", "#5b2bd9", "#1c1b22", "#fdf6ea"), ("#e0f2fb", "#1c1b22", "#ff6b5b", "#5b2bd9"),
]


def demo_art(seed: int, w: int, h: int) -> Image.Image:
    r = random.Random(seed)
    p = PALETTES[seed % len(PALETTES)]
    im = Image.new("RGB", (w, h), p[2])
    d = ImageDraw.Draw(im)
    m = min(w, h)
    cx, cy, rad = w * (0.3 + r.random() * 0.4), h * (0.25 + r.random() * 0.3), m * (0.22 + r.random() * 0.15)
    d.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], fill=p[0])
    x0, y0 = w * r.random() * 0.5, h * (0.55 + r.random() * 0.2)
    d.rounded_rectangle([x0, y0, x0 + w * (0.4 + r.random() * 0.4), y0 + h * 0.5], radius=int(w * 0.04), fill=p[1])
    sx, sy, sr = w * (0.6 + r.random() * 0.3), h * (0.6 + r.random() * 0.2), m * 0.08
    d.ellipse([sx - sr, sy - sr, sx + sr, sy + sr], fill=p[3])
    base = h * (0.35 + r.random() * 0.3)
    pts = [(w * (0.08 + 0.84 * t / 40), base + math.sin(t / 40 * math.pi * 2) * h * 0.06) for t in range(41)]
    d.line(pts, fill=p[3], width=max(3, int(w * 0.018)), joint="curve")
    return im


def _prep_frame(im: Image.Image) -> Image.Image:
    return im.convert("RGBA") if im.mode in ("P", "LA", "RGBA") else im.convert("RGB")


def _load_frames(source: str) -> list[tuple[Image.Image, int]]:
    """Devuelve [(cuadro, duración_ms), …]. Para imágenes fijas, una sola tupla con duración 0."""
    if source.startswith("demo:"):
        _, seed, size = source.split(":")
        w, h = (int(x) for x in size.split("x"))
        return [(demo_art(int(seed), w, h), 0)]
    fetched = fetch_image(source)
    im = Image.open(io.BytesIO(fetched.data))
    n = min(getattr(im, "n_frames", 1), MAX_FRAMES)
    if n <= 1:
        return [(_prep_frame(ImageOps.exif_transpose(im)), 0)]
    frames = []
    for i in range(n):
        im.seek(i)
        frames.append((_prep_frame(im.copy()), im.info.get("duration") or 100))
    return frames


def _watermark(im: Image.Image, text: str, tiled: bool = True) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    size = max(12, int(w * 0.024))
    try:
        font = ImageFont.truetype(str(FONT_PATH), size)
        tile_font = ImageFont.truetype(str(FONT_PATH), max(14, int(w * 0.035)))
    except OSError:
        font = tile_font = ImageFont.load_default()
    # marca tenue repetida en diagonal (se omite en cuadros de animación por costo de CPU)
    if tiled:
        tile = Image.new("RGBA", (w * 2, h * 2), (0, 0, 0, 0))
        td = ImageDraw.Draw(tile)
        step_x, step_y = int(w * 0.55), int(h * 0.22) or 60
        for yy in range(0, h * 2, step_y):
            for xx in range(-(yy // 3) % step_x - step_x, w * 2, step_x):
                td.text((xx, yy), text, font=tile_font, fill=(255, 255, 255, 26))
        tile = tile.rotate(28, resample=Image.BICUBIC)
        left, top = (tile.width - w) // 2, (tile.height - h) // 2
        layer.alpha_composite(tile.crop((left, top, left + w, top + h)))
    # firma nítida abajo a la derecha
    bbox = d.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x, y = w - tw - int(size * 0.9), h - th - int(size * 0.9)
    d.text((x + 1, y + 1), text, font=font, fill=(0, 0, 0, 140))
    d.text((x, y), text, font=font, fill=(255, 255, 255, 225))
    return Image.alpha_composite(im, layer)


def render(source: str, width: int, watermark: str | None) -> Path:
    """Devuelve la ruta del WEBP en caché (lo genera si no existe). Si el origen es un GIF/WEBP
    animado, el resultado también queda animado (hasta MAX_FRAMES cuadros)."""
    width = pick_width(width)
    path = _cache_path(f"{CACHE_VERSION}|{source}|{width}|{watermark or ''}")
    if path.exists():
        return path
    frames = _load_frames(source)
    animated = len(frames) > 1
    out = []
    for im, dur in frames:
        if im.width > width:
            im = im.resize((width, max(1, round(im.height * width / im.width))), Image.LANCZOS)
        if watermark:
            im = _watermark(im, watermark, tiled=not animated)
        out.append((im, dur))
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    if animated:
        first, rest = out[0][0], [f for f, _ in out[1:]]
        durations = [d for _, d in out]
        first.save(tmp, "WEBP", save_all=True, append_images=rest, duration=durations, loop=0, quality=76, method=4)
    else:
        out[0][0].save(tmp, "WEBP", quality=82, method=4)
    tmp.replace(path)
    return path
