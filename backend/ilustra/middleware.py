from django.conf import settings

from .sessions import user_from_token


class IlustraSessionMiddleware:
    """Si no hay sesión de Django, usa la cookie del sitio para usuarios staff (admin y moderadores)."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if not request.user.is_authenticated:
            user = user_from_token(request.COOKIES.get(settings.SESSION_COOKIE_NAME_ILUSTRA))
            if user is not None and user.is_staff:
                request.user = user
        return self.get_response(request)
