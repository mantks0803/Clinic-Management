from django.contrib import admin
from django.urls import path, include, re_path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions


schema_view = get_schema_view(
    openapi.Info(
        title='Clinic Management API',
        default_version='v1',
        description='API documentation',
        contact=openapi.Contact(email='dephucau@gmail.com'),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('core_clinic.urls')),
    path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),  # OAuth2
    re_path(r'^swagger/$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),

]


