"""Asistente interno del panel de administración: le explica a admins/moderadores cómo usar
/admin/, reusando el mismo modelo Gemini que el asistente público (ver api/routers/assistant.py)
pero con un system prompt distinto y sin exponerse fuera del panel.
"""
import json

from django.conf import settings
from django.contrib.admin.views.decorators import staff_member_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_POST
from fastapi import HTTPException

SYSTEM = """Sos el asistente interno del panel de administración de DBP Ilustra (Django admin).
Tu única tarea es explicarle al staff (administradores y moderadores) cómo usar ESTE panel.
No sos el asistente público del sitio: no hables de cómo publicar obras desde el lado del artista
ni de la sesión con Google del sitio público.
Reglas:
- Respondé en español rioplatense con voseo, breve y con pasos numerados cuando ayude.
- Usá SOLO la guía de abajo. Si te preguntan algo que no está ahí, decí que no lo sabés con certeza
  y sugerí revisar el manual o probar directamente en el panel.
- No inventes botones, menús ni permisos que no estén en la guía."""

GUIA_PANEL = """GUÍA DEL PANEL (secciones del menú izquierdo)

Autenticación y Autorización
- Usuarios: cuentas de Django (staff/superusuarios). Acá se crean cuentas con usuario y contraseña
  propios del panel, distintas de las cuentas de Google del sitio público.
- Grupos: permisos reutilizables entre varios usuarios (poco usado en este proyecto; los permisos
  reales de moderación se manejan con Moderadores, no con Grupos).

DBP Ilustra
- Obras: listado de ilustraciones/páginas publicadas. Acciones: «Ocultar (moderación)» y «Volver a
  publicar / mostrar». Se puede filtrar por estado, categoría y fecha, y buscar por título o autor.
- Series: cómics/manga/historietas con capítulos. Mismas acciones que Obras. Cada serie tiene sus
  capítulos como sub-lista editable ahí mismo (inline).
- Capítulos: páginas de una serie. Mismas acciones de ocultar/publicar.
- Comentarios: moderación de comentarios, con las mismas acciones ocultar/publicar. La columna «En»
  indica si el comentario es de una obra o de un capítulo.
- Reportes: lo que reportan los usuarios con el botón de bandera. Acciones: «Marcar como resuelto» y
  «Descartar». La columna «Contenido» linkea directo a lo reportado.
- Perfiles: cuentas de usuarios del sitio público. Acciones: «Suspender» y «Quitar suspensión». Un
  perfil suspendido no puede publicar ni comentar en el sitio.
- Moderadores: SOLO lo ve el superusuario. Acá se le da acceso al panel a alguien: se elige su
  usuario, en qué categorías puede moderar (vacío = todas) y qué puede hacer (moderar obras/series,
  moderar comentarios, gestionar reportes, suspender usuarios, gestionar proyectos DBP y FAQ).
  Desactivar el moderador (desmarcar «Activo») le quita el acceso sin borrar el registro.
- Proyectos DBP: convocatorias/novedades que aparecen en Descubrir. Se pueden activar/desactivar y
  ordenar directo desde el listado. Acción «Enviar aviso a todos los usuarios»: crea una notificación
  para cada cuenta activa del sitio — usar con cuidado, no tiene vuelta atrás.
- Preguntas frecuentes: la base de conocimiento del asistente PÚBLICO del sitio (el que ven los
  visitantes). Cada pregunta/respuesta que se carga acá y se deja «Activa» se le pasa como contexto a
  ese asistente. No tiene que ver con este asistente interno del panel.
- Notificaciones: solo lectura para superusuarores, para ver qué se les mandó a los usuarios.

Cómo entrar como staff sin ser superusuario: un superusuario tiene que crear el registro en
Moderadores para tu cuenta (tu usuario ya tiene que existir; si entraste al sitio público con Google,
ya existe). Ahí se define a qué categorías y funciones tenés acceso."""


def call_admin_assistant(message: str) -> str:
    from api.routers.assistant import call_gemini

    return call_gemini(SYSTEM + "\n\n" + GUIA_PANEL, [], message)


@staff_member_required
@csrf_protect
@require_POST
def assistant_view(request):
    from api.services import ratelimit

    if not settings.GEMINI_API_KEY:
        return JsonResponse({"detail": "El asistente todavía no está configurado."}, status=503)
    try:
        body = json.loads(request.body or b"{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"detail": "Pedido inválido."}, status=400)
    message = (body.get("message") or "").strip()[:800]
    if not message:
        return JsonResponse({"detail": "Escribí una pregunta."}, status=400)
    try:
        ratelimit.check("admin_assistant", f"u{request.user.pk}", 30, 600)
    except HTTPException as e:
        return JsonResponse({"detail": e.detail}, status=e.status_code)
    try:
        reply = call_admin_assistant(message)
    except Exception:
        return JsonResponse({"detail": "El asistente no está disponible en este momento. Probá de nuevo."}, status=502)
    return JsonResponse({"reply": reply or "No encontré una respuesta. Probá reformular la pregunta."})
