from django.contrib import admin
from django.urls import path

admin.site.site_header = "DBP Ilustra · Administración"
admin.site.site_title = "DBP Ilustra"
admin.site.index_title = "Panel de control"

urlpatterns = [path("admin/", admin.site.urls)]
