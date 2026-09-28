from django.contrib import admin, messages
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.urls import reverse
from django.utils.html import format_html

from .models import (FAQ, Artwork, Chapter, ChapterPage, Character, Comment, ModeratorScope, Notification, Profile,
                     Project, Report, Series)
from .moderation import category_filter, scope_of

User = get_user_model()


class ScopedAdmin(admin.ModelAdmin):
    """Limita el listado a las categorías asignadas al moderador y protege los campos de contenido."""
    category_field = None
    moderation_fields = ("status", "moderation_note")

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if self.category_field:
            q = category_filter(request.user, self.category_field)
            if q is not None:
                qs = qs.filter(q)
        return qs

    def get_readonly_fields(self, request, obj=None):
        if request.user.is_superuser:
            return self.readonly_fields
        editable = set(self.moderation_fields)
        return [f.name for f in self.model._meta.fields if f.name not in editable]

    def has_add_permission(self, request):
        return request.user.is_superuser

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser


@admin.action(description="Ocultar (moderación)")
def hide(modeladmin, request, queryset):
    field = "status"
    value = "hidden"
    n = queryset.update(**{field: value})
    messages.success(request, f"{n} elemento(s) ocultos.")


@admin.action(description="Volver a publicar / mostrar")
def publish(modeladmin, request, queryset):
    value = "visible" if queryset.model is Comment else "published"
    n = queryset.update(status=value)
    messages.success(request, f"{n} elemento(s) visibles.")


@admin.register(Artwork)
class ArtworkAdmin(ScopedAdmin):
    category_field = "category"
    list_display = ("thumb", "title", "author_handle", "category", "status", "like_count", "comment_count", "created")
    list_filter = ("status", "category", "created")
    search_fields = ("title", "description", "author__profile__handle")
    actions = [hide, publish]
    list_per_page = 50

    @admin.display(description="Obra")
    def thumb(self, obj):
        return format_html('<img src="/api/img/a/{}?w=400" style="height:56px;border-radius:6px" alt="">', obj.pk)

    @admin.display(description="Artista")
    def author_handle(self, obj):
        return getattr(getattr(obj.author, "profile", None), "handle", obj.author.username)


class ChapterInline(admin.TabularInline):
    model = Chapter
    extra = 0
    fields = ("number", "title", "status", "like_count", "comment_count")
    readonly_fields = ("like_count", "comment_count")
    show_change_link = True


class CharacterInline(admin.TabularInline):
    model = Character
    extra = 0
    fields = ("order", "name", "description", "image_url", "voice")


@admin.register(Series)
class SeriesAdmin(ScopedAdmin):
    category_field = "category"
    list_display = ("title", "author", "category", "status", "updated")
    list_filter = ("status", "category")
    search_fields = ("title", "author__profile__handle")
    inlines = [ChapterInline, CharacterInline]
    actions = [hide, publish]


class PageInline(admin.TabularInline):
    model = ChapterPage
    extra = 0
    fields = ("order", "image_url", "width", "height")


@admin.register(Chapter)
class ChapterAdmin(ScopedAdmin):
    category_field = "series__category"
    moderation_fields = ("status",)
    list_display = ("__str__", "status", "like_count", "comment_count", "created")
    list_filter = ("status", "series__category")
    search_fields = ("series__title", "title")
    inlines = [PageInline]
    actions = [hide, publish]


@admin.register(Comment)
class CommentAdmin(ScopedAdmin):
    moderation_fields = ("status",)
    list_display = ("text", "author", "where", "status", "created")
    list_filter = ("status", "created")
    search_fields = ("text", "author__profile__handle")
    actions = [hide, publish]

    def get_queryset(self, request):
        qs = super().get_queryset(request).select_related("artwork", "chapter__series", "author__profile")
        scope = scope_of(request.user)
        if scope is not None and scope.categories:
            qs = qs.filter(Q(artwork__category__in=scope.categories) | Q(chapter__series__category__in=scope.categories))
        return qs

    @admin.display(description="En")
    def where(self, obj):
        if obj.artwork_id:
            return f"Obra: {obj.artwork}"
        if obj.chapter_id:
            return f"Capítulo: {obj.chapter}"
        return "-"


@admin.action(description="Marcar como resuelto")
def resolve(modeladmin, request, queryset):
    queryset.update(status="resolved", resolved_by=request.user)


@admin.action(description="Descartar")
def dismiss(modeladmin, request, queryset):
    queryset.update(status="dismissed", resolved_by=request.user)


@admin.register(Report)
class ReportAdmin(ScopedAdmin):
    category_field = "category"
    moderation_fields = ("status",)
    list_display = ("created", "target_type", "target_link", "reason", "category", "status", "reporter")
    list_filter = ("status", "target_type", "reason", "category")
    actions = [resolve, dismiss]

    @admin.display(description="Contenido")
    def target_link(self, obj):
        model = {"artwork": "artwork", "chapter": "chapter", "comment": "comment", "user": "profile"}[obj.target_type]
        if obj.target_type == "user":
            prof = Profile.objects.filter(user_id=obj.target_id).first()
            if not prof:
                return "-"
            return format_html('<a href="{}">@{}</a>', reverse("admin:ilustra_profile_change", args=[prof.pk]), prof.handle)
        return format_html('<a href="{}">#{}</a>', reverse(f"admin:ilustra_{model}_change", args=[obj.target_id]), obj.target_id)


@admin.action(description="Suspender")
def suspend(modeladmin, request, queryset):
    queryset.update(suspended=True)


@admin.action(description="Quitar suspensión")
def unsuspend(modeladmin, request, queryset):
    queryset.update(suspended=False, suspended_reason="")


@admin.register(Profile)
class ProfileAdmin(ScopedAdmin):
    moderation_fields = ("suspended", "suspended_reason")
    list_display = ("handle", "display_name", "is_artist", "suspended", "created")
    list_filter = ("is_artist", "suspended", "is_demo")
    search_fields = ("handle", "display_name", "user__email")
    actions = [suspend, unsuspend]


@admin.register(ModeratorScope)
class ModeratorScopeAdmin(admin.ModelAdmin):
    list_display = ("user", "active", "categories", "can_moderate_artworks", "can_moderate_comments",
                    "can_manage_reports", "can_suspend_users", "can_manage_projects")
    autocomplete_fields = ("user",)

    def has_module_permission(self, request):
        return request.user.is_superuser

    def has_view_permission(self, request, obj=None):
        return request.user.is_superuser


@admin.action(description="Enviar aviso a todos los usuarios")
def broadcast(modeladmin, request, queryset):
    from .models import Notification as N
    total = 0
    for project in queryset:
        batch = [N(recipient_id=uid, type="dbp", text=f"DBP: {project.title}"[:200])
                 for uid in User.objects.filter(is_active=True).values_list("id", flat=True)]
        N.objects.bulk_create(batch, batch_size=1000)
        total += len(batch)
    messages.success(request, f"Se enviaron {total} notificaciones.")


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "active", "order", "created")
    list_editable = ("active", "order")
    actions = [broadcast]


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ("question", "active", "order")
    list_editable = ("active", "order")


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("recipient", "type", "text", "read", "created")
    list_filter = ("type", "read")

    def has_module_permission(self, request):
        return request.user.is_superuser
