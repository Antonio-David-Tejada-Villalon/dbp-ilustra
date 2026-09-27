from django.contrib import admin
from django.urls import path

from ilustra.admin_views import assistant_view, manual_view

admin.site.site_header = "DBP Ilustra · Administración"
admin.site.site_title = "DBP Ilustra"
admin.site.index_title = "Panel de control"

urlpatterns = [
    path("admin/asistente/", assistant_view),
    path("admin/manual/", manual_view, name="ilustra-manual"),
    path("admin/", admin.site.urls),
]
