# DBP Ilustra

Plataforma de la Dirección de Bibliotecas Populares y Actividades Literarias de San Juan para que ilustradores, historietistas y creadores de manga publiquen su obra, armen su muro y conversen con el público.

- **Frontend:** React 18 + Vite + Bootstrap 5 + los componentes del Design System *DBP Ilustra* (`frontend/src/ds/`).
- **Backend:** Django 5.2 (modelos, migraciones, panel de administración y moderadores) + FastAPI (API pública) en **un solo proceso**.
- **Base de datos:** PostgreSQL (SQLite opcional para desarrollo rápido).
- **Ingreso:** cuenta de Google (Google Identity Services).
- **Asistente:** Gemini (`gemini-3.1-flash-lite` por defecto, configurable).

## Arquitectura

```
Navegador (React + Bootstrap)
   │  /api/*            → FastAPI  (routers en backend/api/routers)
   │  /admin/*          → Django admin (panel, moderadores)
   │  /api/img/*        → Proxy de imágenes: descarga el enlace del artista, reduce, marca de agua, caché WEBP
   │  resto             → frontend compilado (SPA) en producción
   ▼
uvicorn api.main:app ── Django ORM ── PostgreSQL
                     └─ Gemini API (solo desde el servidor)
```

- Django es dueño de los datos: `backend/ilustra/models.py`, migraciones y `admin.py`.
- FastAPI usa el mismo ORM de Django con endpoints síncronos (corren en el pool de hilos, sin problemas de async).
- Sesión: cookie `ilustra_session` (JWT firmado, httpOnly, SameSite=Lax). Las escrituras exigen el encabezado `X-Requested-With: ilustra` (protección CSRF).
- La misma cookie sirve para entrar al panel `/admin` si el usuario es **staff** (administrador o moderador).

## Funciones incluidas

| Área | Qué hace |
|---|---|
| Cuentas | Ingreso con Google, perfil con usuario, bio, ubicación, disciplinas, contacto público, «Soy artista». |
| Muro | Portada y color de acento (violeta, amarillo, celeste, coral); pestañas por categoría; series. |
| Publicar | Obras por **enlace directo** a una imagen pública; series de cómic/manga/historieta con capítulos (un enlace por página). El servidor valida cada enlace. |
| Descubrir | Tendencias (14 días), destacados, nuevas ilustraciones, cómics, manga, historietas, recomendados, recién llegados, proyectos DBP. |
| Comunidad | Me gusta, comentarios con respuestas, me gusta en comentarios, seguir, guardar, compartir, reportar, notificaciones. |
| Lector | Tira vertical por capítulos, progreso de lectura, navegación entre capítulos, reacciones y comentarios. |
| Protección | Las obras nunca se sirven desde el enlace original: el proxy entrega WEBP reducido con marca de agua (@usuario · DBP Ilustra) y el frontend bloquea clic derecho, arrastre y selección. |
| Panel | Django admin en español; moderadores con **subcontroles** por categoría y permiso. |
| Asistente | Responde dudas del sitio y busca obras/series/artistas con contexto de la base de datos y las FAQ cargadas en el panel. |
| Temas | Papel, Galería, Nocturno o automático (según el sistema), por dispositivo. |

## Puesta en marcha (desarrollo)

Requisitos: Python 3.11+, Node 20+, y PostgreSQL 16 (o Docker).

```powershell
# 1) Variables
copy .env.example .env        # en Linux/Mac: cp .env.example .env
# Editá .env: DEBUG=1, SECRET_KEY, GOOGLE_CLIENT_ID, GEMINI_API_KEY, DATABASE_URL

# 2) Backend
cd backend
python -m venv ..\.venv
..\.venv\Scripts\activate      # Linux/Mac: source ../.venv/bin/activate
pip install -r requirements-dev.txt
python manage.py migrate
python manage.py createsuperuser        # tu cuenta de administrador con contraseña
python manage.py seed_demo              # opcional: datos FICTICIOS de ejemplo
python manage.py collectstatic --noinput
uvicorn api.main:app --reload --port 8000

# 3) Frontend (otra terminal)
cd frontend
npm install
npm run dev                    # http://localhost:5173
```

Sin `GOOGLE_CLIENT_ID`, y con `DEBUG=1` y `DEV_LOGIN=1`, el botón «Ingresar» permite entrar con un usuario existente (por ejemplo `ana.paz` o `lara.traza` de los datos demo). **Nunca** actives `DEV_LOGIN` en producción.

### Con Docker (PostgreSQL + app compilada)

```bash
cp .env.example .env     # completá SECRET_KEY, GOOGLE_CLIENT_ID, GEMINI_API_KEY
docker compose up --build
docker compose exec app python manage.py createsuperuser
# Sitio: http://localhost:8000 · Panel: http://localhost:8000/admin/
```

## Configuración externa

**Google (ingreso):** Google Cloud Console → APIs y servicios → Credenciales → *Crear ID de cliente OAuth* → tipo «Aplicación web». En «Orígenes de JavaScript autorizados» agregá `http://localhost:5173`, `http://localhost:8000` y tu dominio. Copiá el ID en `GOOGLE_CLIENT_ID`.

**Gemini (asistente):** creá una API key en Google AI Studio y ponela en `GEMINI_API_KEY`. El modelo se cambia con `GEMINI_MODEL`. Cargá preguntas frecuentes en el panel (*Preguntas frecuentes*): el asistente las usa como conocimiento. Si falta la clave, el botón del asistente no aparece.

**Imágenes:** los artistas suben su archivo a un servicio público y pegan el **enlace directo a la imagen** (el que termina en .jpg/.png/.webp; en la mayoría de los sitios: clic derecho sobre la imagen → «Copiar dirección de imagen»). Recomendado: limitar `IMAGE_ALLOWED_HOSTS` a los servicios que la DBP apruebe.

## Administración y moderadores

1. Entrá a `/admin/` con el superusuario.
2. **Moderadores:** la persona primero ingresa al sitio con Google. Luego en *Moderadores → Agregar*, elegí su usuario y marcá:
   - categorías a cargo (vacío = todas), p. ej. `["manga", "comic"]`
   - moderar obras y series · moderar comentarios · gestionar reportes · suspender usuarios · gestionar proyectos DBP y FAQ
3. Al guardar, el sistema le da acceso al panel con **solo esos permisos**; ve únicamente el contenido de sus categorías y solo puede cambiar el estado (publicar/ocultar) y la nota de moderación. Desactivar el moderador le quita el acceso.
4. Moderadores y admin entran al panel con su misma sesión de Google (menú de usuario → *Panel de administración*).
5. *Proyectos DBP* aparecen en Descubrir; la acción «Enviar aviso a todos los usuarios» crea una notificación para cada cuenta.

## Seguridad y límites (leer)

- **Anti-descarga = disuasión.** Nadie puede impedir una captura de pantalla. Lo que sí hace el sistema: no expone el enlace original, entrega versiones reducidas (máx. 1600 px) con marca de agua, y bloquea clic derecho/arrastre. La versión original sigue siendo pública en el servicio donde el artista la subió.
- Enlaces de imágenes: solo `https`, se rechazan IPs privadas/locales (SSRF), máx. 15 MB, 3 redirecciones, formatos JPG/PNG/WEBP/GIF (GIF animado: primer cuadro). Queda una ventana teórica de *DNS rebinding*; restringir `IMAGE_ALLOWED_HOSTS` la cierra.
- Límites de frecuencia en memoria (publicar, comentar, me gusta, asistente). Con varias instancias del servidor conviene moverlos a Redis.
- Conexiones a la base: cada hilo del servidor mantiene su conexión (`DB_CONN_MAX_AGE`, 60 s por defecto). Con `--workers 2` y el pool por defecto de FastAPI (40 hilos) el máximo teórico es 80 conexiones; ajustá `max_connections` de PostgreSQL o bajá los workers.
- En producción: `DEBUG=0`, `SECRET_KEY` propia (el servidor no arranca con la de desarrollo), `COOKIE_SECURE=1` detrás de HTTPS, `ALLOWED_HOSTS` y `CSRF_TRUSTED_ORIGINS` con tu dominio.

## Pruebas

```bash
cd backend
pytest            # 17 pruebas: enlaces seguros, sesión, publicar, comunidad, moderadores, proxy, asistente
```

Con `DATABASE_URL` apuntando a PostgreSQL las pruebas corren contra PostgreSQL.

## Estructura

```
backend/
  config/            settings, urls (admin), asgi
  ilustra/           modelos, admin, moderación, sesión, datos demo, migraciones
  api/               FastAPI: main, deps, serialize, routers/, services/ (safefetch, imaging, ratelimit, notify)
  assets/            fuente para la marca de agua (Plus Jakarta Sans, licencia OFL)
  tests/
frontend/
  src/ds/            Design System DBP Ilustra (componentes, tokens, fuentes)
  src/components/    Layout, feed, comentarios, asistente, diálogos
  src/pages/         Inicio, Descubrir, Artistas, Categoría, Comunidad, Obra, Perfil, Serie, Lector, Publicar, Ajustes…
Dockerfile · docker-compose.yml · .env.example
```

El Design System vive en el artefacto «DBP Ilustra». `frontend/src/ds/ilustra.js` es su versión ES module: si cambiás componentes en el sistema, actualizá también esta copia.
