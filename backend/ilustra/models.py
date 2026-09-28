from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models
from django.db.models import Q

User = settings.AUTH_USER_MODEL

CATEGORY_CHOICES = [
    ("ilustracion", "Ilustración"),
    ("comic", "Cómic"),
    ("manga", "Manga"),
    ("historieta", "Historieta"),
    ("boceto", "Boceto"),
]
SERIES_CATEGORY_CHOICES = [("comic", "Cómic"), ("manga", "Manga"), ("historieta", "Historieta")]
ACCENT_CHOICES = [("violet", "Violeta"), ("yellow", "Amarillo"), ("sky", "Celeste"), ("coral", "Coral")]
STATUS_CHOICES = [("published", "Publicada"), ("hidden", "Oculta por moderación")]

handle_validator = RegexValidator(r"^[a-z0-9._]{3,30}$", "Usá de 3 a 30 caracteres: minúsculas, números, punto o guion bajo.")


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    google_sub = models.CharField(max_length=64, unique=True, null=True, blank=True)
    handle = models.CharField("usuario", max_length=30, unique=True, validators=[handle_validator])
    display_name = models.CharField("nombre", max_length=80)
    avatar_url = models.URLField(max_length=1000, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    location = models.CharField("ubicación", max_length=100, blank=True)
    contact = models.CharField("contacto público", max_length=200, blank=True,
                               help_text="Correo, web o red social que el artista quiere mostrar.")
    disciplines = models.JSONField("disciplinas", default=list, blank=True)
    is_artist = models.BooleanField("es artista", default=False)
    accent = models.CharField("acento del muro", max_length=10, choices=ACCENT_CHOICES, default="violet")
    cover_url = models.URLField("portada", max_length=1000, blank=True)
    watermark_enabled = models.BooleanField("marca de agua en mis obras", default=False)
    suspended = models.BooleanField("suspendido", default=False)
    suspended_reason = models.CharField(max_length=200, blank=True)
    is_demo = models.BooleanField(default=False)
    created = models.DateTimeField("fecha", auto_now_add=True)

    class Meta:
        verbose_name = "perfil"
        verbose_name_plural = "perfiles"

    def __str__(self):
        return f"@{self.handle}"


class Artwork(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="artworks")
    title = models.CharField("título", max_length=120)
    description = models.TextField("descripción", max_length=2000, blank=True)
    category = models.CharField("categoría", max_length=20, choices=CATEGORY_CHOICES, db_index=True)
    image_url = models.CharField("enlace de la imagen", max_length=1000)
    width = models.PositiveIntegerField(default=0)
    height = models.PositiveIntegerField(default=0)
    tags = models.JSONField("etiquetas", default=list, blank=True)
    status = models.CharField("estado", max_length=12, choices=STATUS_CHOICES, default="published", db_index=True)
    moderation_note = models.CharField("nota de moderación", max_length=200, blank=True)
    like_count = models.PositiveIntegerField("me gusta", default=0)
    comment_count = models.PositiveIntegerField("comentarios", default=0)
    save_count = models.PositiveIntegerField("guardados", default=0)
    created = models.DateTimeField("creada", auto_now_add=True, db_index=True)
    updated = models.DateTimeField("actualizada", auto_now=True)

    class Meta:
        verbose_name = "obra"
        verbose_name_plural = "obras"
        ordering = ["-created"]

    def __str__(self):
        return self.title

    @property
    def ratio(self):
        return round(self.width / self.height, 4) if self.width and self.height else 0.8


class Series(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="series")
    title = models.CharField("título", max_length=120)
    description = models.TextField("descripción", max_length=2000, blank=True)
    category = models.CharField("categoría", max_length=20, choices=SERIES_CATEGORY_CHOICES, db_index=True)
    cover_url = models.CharField("portada", max_length=1000)
    cover_width = models.PositiveIntegerField(default=0)
    cover_height = models.PositiveIntegerField(default=0)
    status = models.CharField("estado", max_length=12, choices=STATUS_CHOICES, default="published", db_index=True)
    moderation_note = models.CharField(max_length=200, blank=True)
    created = models.DateTimeField("fecha", auto_now_add=True)
    updated = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        verbose_name = "serie"
        verbose_name_plural = "series"
        ordering = ["-updated"]

    def __str__(self):
        return self.title


class Chapter(models.Model):
    series = models.ForeignKey(Series, on_delete=models.CASCADE, related_name="chapters")
    number = models.PositiveIntegerField("número")
    title = models.CharField("título", max_length=120, blank=True)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default="published")
    like_count = models.PositiveIntegerField("me gusta", default=0)
    comment_count = models.PositiveIntegerField("comentarios", default=0)
    created = models.DateTimeField("fecha", auto_now_add=True)

    class Meta:
        verbose_name = "capítulo"
        verbose_name_plural = "capítulos"
        ordering = ["series", "number"]
        constraints = [models.UniqueConstraint(fields=["series", "number"], name="chapter_unique_number")]

    def __str__(self):
        return f"{self.series} · cap. {self.number}"


class ChapterPage(models.Model):
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name="pages")
    order = models.PositiveIntegerField()
    image_url = models.CharField(max_length=1000)
    width = models.PositiveIntegerField(default=0)
    height = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["chapter", "order"]
        verbose_name = "página"
        verbose_name_plural = "páginas"

    @property
    def ratio(self):
        return round(self.width / self.height, 4) if self.width and self.height else 0.7


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="likes")
    artwork = models.ForeignKey(Artwork, null=True, blank=True, on_delete=models.CASCADE, related_name="likes")
    chapter = models.ForeignKey(Chapter, null=True, blank=True, on_delete=models.CASCADE, related_name="likes")
    created = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "artwork"], condition=Q(artwork__isnull=False), name="like_unique_artwork"),
            models.UniqueConstraint(fields=["user", "chapter"], condition=Q(chapter__isnull=False), name="like_unique_chapter"),
        ]


class Save(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="saves")
    artwork = models.ForeignKey(Artwork, on_delete=models.CASCADE, related_name="saves")
    created = models.DateTimeField("fecha", auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "artwork"], name="save_unique")]


class Follow(models.Model):
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name="following_set")
    following = models.ForeignKey(User, on_delete=models.CASCADE, related_name="followers_set")
    created = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["follower", "following"], name="follow_unique"),
            models.CheckConstraint(condition=~Q(follower=models.F("following")), name="follow_not_self"),
        ]


class Comment(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")
    artwork = models.ForeignKey(Artwork, null=True, blank=True, on_delete=models.CASCADE, related_name="comments")
    chapter = models.ForeignKey(Chapter, null=True, blank=True, on_delete=models.CASCADE, related_name="comments")
    parent = models.ForeignKey("self", null=True, blank=True, on_delete=models.CASCADE, related_name="replies")
    text = models.TextField("texto", max_length=1000)
    status = models.CharField(max_length=12, choices=[("visible", "Visible"), ("hidden", "Oculto")], default="visible", db_index=True)
    like_count = models.PositiveIntegerField("me gusta", default=0)
    created = models.DateTimeField("fecha", auto_now_add=True)

    class Meta:
        verbose_name = "comentario"
        verbose_name_plural = "comentarios"
        ordering = ["created"]

    def __str__(self):
        return self.text[:60]

    @property
    def category(self):
        if self.artwork_id:
            return self.artwork.category
        if self.chapter_id:
            return self.chapter.series.category
        return None


class CommentLike(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name="likes")

    class Meta:
        constraints = [models.UniqueConstraint(fields=["user", "comment"], name="commentlike_unique")]


class Notification(models.Model):
    TYPES = [("like", "Me gusta"), ("comment", "Comentario"), ("reply", "Respuesta"), ("follow", "Seguidor"),
             ("chapter", "Nuevo capítulo"), ("dbp", "Aviso DBP")]
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    actor = models.ForeignKey(User, null=True, blank=True, on_delete=models.CASCADE, related_name="+")
    type = models.CharField(max_length=10, choices=TYPES)
    artwork = models.ForeignKey(Artwork, null=True, blank=True, on_delete=models.CASCADE)
    chapter = models.ForeignKey(Chapter, null=True, blank=True, on_delete=models.CASCADE)
    text = models.CharField(max_length=200, blank=True)
    read = models.BooleanField(default=False, db_index=True)
    created = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created"]
        verbose_name = "notificación"
        verbose_name_plural = "notificaciones"


class Report(models.Model):
    TARGETS = [("artwork", "Obra"), ("chapter", "Capítulo"), ("comment", "Comentario"), ("user", "Usuario")]
    REASONS = [("copia", "No es obra del autor / plagio"), ("ofensivo", "Contenido ofensivo"), ("spam", "Spam"),
               ("sensible", "Contenido sensible sin aviso"), ("otro", "Otro")]
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reports")
    target_type = models.CharField("tipo", max_length=10, choices=TARGETS)
    target_id = models.PositiveBigIntegerField()
    category = models.CharField(max_length=20, blank=True, db_index=True)
    reason = models.CharField("motivo", max_length=10, choices=REASONS)
    details = models.TextField("detalle", max_length=1000, blank=True)
    status = models.CharField("estado", max_length=10, choices=[("open", "Abierto"), ("resolved", "Resuelto"), ("dismissed", "Descartado")], default="open", db_index=True)
    resolved_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="+")
    created = models.DateTimeField("fecha", auto_now_add=True)

    class Meta:
        ordering = ["-created"]
        verbose_name = "reporte"
        verbose_name_plural = "reportes"


class ModeratorScope(models.Model):
    """Subcontroles que el administrador asigna a cada moderador."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="moderator_scope")
    categories = models.JSONField("categorías a cargo", default=list, blank=True,
                                  help_text="Vacío = todas. Ej.: [\"manga\", \"comic\"]")
    can_moderate_artworks = models.BooleanField("moderar obras y series", default=True)
    can_moderate_comments = models.BooleanField("moderar comentarios", default=True)
    can_manage_reports = models.BooleanField("gestionar reportes", default=True)
    can_suspend_users = models.BooleanField("suspender usuarios", default=False)
    can_manage_projects = models.BooleanField("gestionar proyectos DBP y FAQ", default=False)
    active = models.BooleanField("activo", default=True)
    notes = models.CharField(max_length=200, blank=True)

    class Meta:
        verbose_name = "moderador"
        verbose_name_plural = "moderadores"

    def __str__(self):
        return f"Moderador {self.user}"

    def covers(self, category):
        return not self.categories or category in self.categories


class Project(models.Model):
    """Proyectos culturales DBP (convocatorias, talleres, muestras) que se muestran en Descubrir."""
    title = models.CharField("título", max_length=120)
    summary = models.CharField("resumen", max_length=300)
    image_url = models.CharField("imagen", max_length=1000, blank=True)
    link_url = models.URLField("enlace", blank=True)
    active = models.BooleanField("visible", default=True)
    order = models.PositiveIntegerField("orden", default=0)
    created = models.DateTimeField("fecha", auto_now_add=True)

    class Meta:
        ordering = ["order", "-created"]
        verbose_name = "proyecto DBP"
        verbose_name_plural = "proyectos DBP"

    def __str__(self):
        return self.title


class FAQ(models.Model):
    """Preguntas frecuentes: conocimiento que usa el asistente Gemini."""
    question = models.CharField("pregunta", max_length=200)
    answer = models.TextField("respuesta", max_length=2000)
    active = models.BooleanField("activa", default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]
        verbose_name = "pregunta frecuente"
        verbose_name_plural = "preguntas frecuentes"

    def __str__(self):
        return self.question
