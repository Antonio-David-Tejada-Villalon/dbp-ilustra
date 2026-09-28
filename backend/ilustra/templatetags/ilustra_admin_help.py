"""Ayuda contextual («?») por sección del admin, con ejemplos concretos de uso."""
from django import template
from django.utils.safestring import mark_safe

register = template.Library()

# Clave: "app_label.model_name" (en minúsculas, como Django los expone en opts).
SECTION_HELP = {
    "ilustra.artwork": (
        "Obras",
        "Esta lista muestra las ilustraciones publicadas por los artistas. Usá los filtros "
        "(estado, categoría, fecha) o el buscador (por título o autor) para encontrar una en particular.<br><br>"
        "<strong>Para ocultar una obra:</strong> tildá su casilla y elegí «Ocultar (moderación)» en el "
        "menú de acciones, arriba de la lista. Para que vuelva a verse: «Volver a publicar / mostrar».<br><br>"
        "<em>Ejemplo:</em> alguien reporta una obra con contenido inapropiado → la buscás por título, "
        "la tildás, elegís «Ocultar (moderación)» y confirmás con «Ir»."
    ),
    "ilustra.series": (
        "Series",
        "Cómics, manga e historietas con capítulos. Mismas acciones que Obras: «Ocultar (moderación)» y "
        "«Volver a publicar / mostrar». Cada serie tiene sus capítulos editables ahí mismo, en una lista "
        "dentro de la misma pantalla (scrolleá hacia abajo al abrir una serie).<br><br>"
        "<em>Ejemplo:</em> una serie completa infringe derechos de autor → la buscás, la tildás y la ocultás; "
        "eso también saca de circulación sus capítulos."
    ),
    "ilustra.chapter": (
        "Capítulos",
        "Páginas de una serie, agrupadas por capítulo. Mismas acciones de ocultar/publicar que en Obras.<br><br>"
        "<em>Ejemplo:</em> un solo capítulo de una serie tiene un problema (el resto está bien) → buscalo por "
        "el título de la serie, tildá solo ese capítulo, y aplicá «Ocultar (moderación)» sin tocar los demás."
    ),
    "ilustra.comment": (
        "Comentarios",
        "Todos los comentarios del sitio. La columna «En» indica si el comentario está en una obra o en un "
        "capítulo. Mismas acciones: «Ocultar (moderación)» y «Volver a publicar / mostrar».<br><br>"
        "<em>Ejemplo:</em> alguien reporta un comentario ofensivo → lo buscás por texto o por el @usuario del "
        "autor, lo tildás y aplicás «Ocultar (moderación)»."
    ),
    "ilustra.report": (
        "Reportes",
        "Lo que la comunidad reporta con el botón de bandera. Hacé clic en el link de la columna «Contenido» "
        "para ver qué se reportó exactamente.<br><br>"
        "Acá <strong>no se oculta el contenido</strong>: solo se marca el reporte como atendido. Si hace falta "
        "actuar, andá a Obras/Series/Capítulos/Comentarios y ocultalo ahí.<br><br>"
        "<em>Ejemplo:</em> te llega un reporte por plagio → abrís el link, confirmás el problema, vas a Obras y "
        "la ocultás, y volvés acá para tildar el reporte y aplicar «Marcar como resuelto». Si el reporte no "
        "tiene fundamento, usá «Descartar» directamente."
    ),
    "ilustra.profile": (
        "Perfiles",
        "Cuentas de usuarios del sitio público (buscables por usuario, nombre o email).<br><br>"
        "<strong>Suspender:</strong> la persona no puede publicar ni comentar hasta que se le quite la "
        "suspensión. <strong>Quitar suspensión:</strong> revierte eso.<br><br>"
        "<em>Ejemplo:</em> un usuario spamea comentarios repetidos → lo buscás por su @usuario, lo tildás y "
        "aplicás «Suspender»."
    ),
    "ilustra.moderatorscope": (
        "Moderadores",
        "Acá le das acceso a este panel a alguien. Solo lo puede usar el superusuario.<br><br>"
        "<em>Ejemplo:</em> querés que Juana modere solo la categoría Manga y pueda gestionar reportes → "
        "«Agregar moderador», elegís su usuario (tiene que haber entrado antes al sitio con Google), en "
        "Categorías ponés «manga», y tildás «moderar obras y series» y «gestionar reportes». Guardás, y ya "
        "puede entrar a <code>/admin/</code> con exactamente esos permisos, nada más."
    ),
    "ilustra.project": (
        "Proyectos DBP",
        "Convocatorias, talleres o novedades que se muestran en Descubrir. Se pueden activar/desactivar y "
        "reordenar directo desde la lista (columnas editables).<br><br>"
        "<strong>Enviar aviso a todos los usuarios:</strong> crea una notificación para cada cuenta activa. "
        "No tiene vuelta atrás.<br><br>"
        "<em>Ejemplo:</em> hay un taller de historieta el mes que viene → cargás el proyecto con título y "
        "resumen, lo dejás «Activo», y cuando esté listo para anunciarse usás «Enviar aviso a todos los "
        "usuarios»."
    ),
    "ilustra.faq": (
        "Preguntas frecuentes",
        "Alimentan al <strong>asistente público</strong> del sitio (el que ven los visitantes, no este "
        "panel). Cada pregunta que dejes marcada «Activa» se le pasa como contexto para que responda mejor.<br><br>"
        "<em>Ejemplo:</em> muchos visitantes preguntan cómo protegen las obras → cargás una pregunta frecuente "
        "con esa duda y una respuesta clara, la dejás activa, y el asistente la va a usar."
    ),
    "ilustra.notification": (
        "Notificaciones",
        "Solo lectura, para superusuarios: acá se ve qué notificación recibió cada cuenta (por ejemplo, los "
        "avisos que salen de Proyectos DBP)."
    ),
    "auth.user": (
        "Usuarios",
        "Cuentas de Django para entrar a <code>/admin/</code> (staff o superusuario) — no son las cuentas de "
        "Google del sitio público.<br><br>"
        "<em>Ejemplo:</em> vas a dar de alta a otra persona del equipo con acceso total al panel → "
        "«Agregar usuario», le ponés usuario y contraseña, y después en su ficha marcás «Es staff» y, si "
        "corresponde, «Es superusuario»."
    ),
    "auth.group": (
        "Grupos",
        "Grupos de permisos estándar de Django. En este proyecto casi no se usan: los permisos reales de "
        "moderación se manejan desde <strong>Moderadores</strong>, no desde acá."
    ),
}


@register.simple_tag
def section_help(opts):
    key = f"{opts.app_label}.{opts.model_name}"
    entry = SECTION_HELP.get(key)
    if not entry:
        return ""
    title, body = entry
    html = (
        '<span class="ilustra-section-help">'
        '<button type="button" class="ilustra-section-help-btn" title="Ayuda: {title}" '
        'onclick="var p=this.nextElementSibling; p.style.display = p.style.display===\'block\' ? \'none\' : \'block\';">?</button>'
        '<div class="ilustra-section-help-panel" style="display:none;"><strong>{title}</strong><p>{body}</p></div>'
        "</span>"
    ).format(title=title, body=body)
    return mark_safe(html)
