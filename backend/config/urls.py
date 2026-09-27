from django.contrib import admin
from django.urls import path

from ilustra.admin_views import assistant_view

admin.site.site_header = "DBP Ilustra · Administración"
admin.site.site_title = "DBP Ilustra"
admin.site.index_title = "Panel de control"

urlpatterns = [
    path("admin/asistente/", assistant_view),
    path("admin/", admin.site.urls),
]
