from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import ModeratorScope
from .moderation import sync_moderator_permissions


@receiver(post_save, sender=ModeratorScope)
def scope_saved(sender, instance, **kwargs):
    sync_moderator_permissions(instance)


@receiver(post_delete, sender=ModeratorScope)
def scope_deleted(sender, instance, **kwargs):
    instance.active = False
    sync_moderator_permissions(instance)
