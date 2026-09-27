from ilustra.models import Follow, Notification


def notify(recipient_id, actor_id, type_, text="", artwork=None, chapter=None):
    if recipient_id == actor_id:
        return None
    return Notification.objects.create(recipient_id=recipient_id, actor_id=actor_id, type=type_, text=text[:200],
                                       artwork=artwork, chapter=chapter)


def notify_followers(author_id, type_, text, artwork=None, chapter=None):
    ids = Follow.objects.filter(following_id=author_id).values_list("follower_id", flat=True)
    Notification.objects.bulk_create(
        [Notification(recipient_id=i, actor_id=author_id, type=type_, text=text[:200], artwork=artwork, chapter=chapter) for i in ids],
        batch_size=1000)
