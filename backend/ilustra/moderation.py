"""Permisos de moderadores: el administrador asigna subcontroles con ModeratorScope."""
from django.contrib.auth.models import Permission
from django.db.models import Q

SCOPE_PERMS = {
    "can_moderate_artworks": ["view_artwork", "change_artwork", "view_series", "change_series", "view_chapter", "change_chapter"],
    "can_moderate_comments": ["view_comment", "change_comment"],
    "can_manage_reports": ["view_report", "change_report"],
    "can_suspend_users": ["view_profile", "change_profile"],
    "can_manage_projects": ["view_project", "add_project", "change_project", "delete_project",
                            "view_faq", "add_faq", "change_faq", "delete_faq"],
}


def sync_moderator_permissions(scope):
    """Aplica al usuario los permisos de Django que corresponden a su alcance."""
    user = scope.user
    codenames = set()
    if scope.active:
        for flag, perms in SCOPE_PERMS.items():
            if getattr(scope, flag):
                codenames.update(perms)
    managed = {c for perms in SCOPE_PERMS.values() for c in perms}
    current = set(user.user_permissions.filter(content_type__app_label="ilustra", codename__in=managed).values_list("codename", flat=True))
    to_add = Permission.objects.filter(content_type__app_label="ilustra", codename__in=codenames - current)
    to_remove = Permission.objects.filter(content_type__app_label="ilustra", codename__in=current - codenames)
    user.user_permissions.add(*to_add)
    user.user_permissions.remove(*to_remove)
    if not user.is_superuser:
        user.is_staff = bool(scope.active)
        user.save(update_fields=["is_staff"])


def scope_of(user):
    if user.is_superuser:
        return None
    return getattr(user, "moderator_scope", None)


def category_filter(user, field):
    """Q que limita un queryset a las categorías del moderador (None = sin límite)."""
    scope = scope_of(user)
    if scope is None or not scope.categories:
        return None
    return Q(**{f"{field}__in": scope.categories})
