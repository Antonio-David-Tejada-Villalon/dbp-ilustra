from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone
from fastapi import APIRouter, Depends, Query

from ilustra.models import Artwork, Follow, Profile, Project, Series

from .. import serialize
from ..deps import current_user
from .artworks import trending, visible, with_flags
from .series import visible_series
from .social import artist_cards

router = APIRouter(tags=["descubrir"])


def _artists(qs, user, n=10):
    return artist_cards(list(qs.select_related("user")[:n]), user)


@router.get("/discover")
def discover(user=Depends(current_user)):
    since = timezone.now() - timedelta(days=14)
    base = Profile.objects.filter(is_artist=True, suspended=False, user__is_active=True)
    trending_artists = base.annotate(
        score=Count("user__followers_set", filter=Q(user__followers_set__created__gte=since), distinct=True)
        + Count("user__artworks__likes", filter=Q(user__artworks__likes__created__gte=since), distinct=True)
    ).order_by("-score", "-created")
    recommended = base
    if user is not None:
        mine = Follow.objects.filter(follower=user).values("following")
        recommended = base.filter(user__followers_set__follower__in=mine).exclude(user__in=mine).exclude(user=user).distinct()
        if not recommended.exists():
            recommended = base.exclude(user__in=mine).exclude(user=user)
    recommended = recommended.annotate(f=Count("user__followers_set", distinct=True)).order_by("-f")

    def series_of(cat):
        return [serialize.series(s) for s in visible_series().filter(category=cat, chapters__isnull=False).distinct().order_by("-updated")[:12]]

    return {
        "trendingArtists": _artists(trending_artists, user),
        "newArtists": _artists(base.order_by("-created"), user),
        "recommended": _artists(recommended, user, 8),
        "featured": with_flags(trending(visible())[:10], user),
        "newIllustrations": with_flags(visible().filter(category="ilustracion").order_by("-created")[:15], user),
        "comics": series_of("comic"), "manga": series_of("manga"), "historietas": series_of("historieta"),
        "projects": [{"id": p.pk, "title": p.title, "summary": p.summary, "link": p.link_url,
                      "image": f"/api/img/project/{p.pk}" if p.image_url else None}
                     for p in Project.objects.filter(active=True)[:8]],
    }


@router.get("/search")
def search(q: str = Query(min_length=2, max_length=80), user=Depends(current_user)):
    q = q.strip()
    art = visible().filter(Q(title__icontains=q) | Q(description__icontains=q) | Q(tags__icontains=q.lower())).order_by("-like_count")[:30]
    ser = visible_series().filter(Q(title__icontains=q) | Q(description__icontains=q)).order_by("-updated")[:12]
    people = Profile.objects.filter(suspended=False).filter(Q(display_name__icontains=q) | Q(handle__icontains=q.lower().lstrip("@")))
    return {"artworks": with_flags(art, user), "series": [serialize.series(s) for s in ser],
            "artists": artist_cards(list(people.select_related("user")[:12]), user)}
