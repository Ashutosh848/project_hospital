from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root(request):
    """API root endpoint"""
    return JsonResponse({
        'message': 'Hospital Claims API',
        'endpoints': {
            'admin': '/admin/',
            'auth': '/api/auth/',
            'claims': '/api/claims/',
        }
    })

urlpatterns = [
    path('', api_root, name='api_root'),
    path('api/', api_root, name='api_root'),
    path('admin/', admin.site.urls),
    
    # Auth endpoints (login etc.)
    path('api/auth/', include('authentication.urls')),
    
    # Claims endpoints
    path('api/claims/', include('claims.urls')),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
