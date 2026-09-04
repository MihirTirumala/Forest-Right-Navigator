# fra_backend/urls.py
from django.contrib import admin
from django.urls import path, include  # Import include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('claims/', include('claims.urls')),  # Includes your claims/urls.py paths
    path('', include('claims.urls')),        # Fallback direct path
]
