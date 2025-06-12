 from django.contrib import admin
from django.urls import path, include
from translator_app import views as translator_views

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', include('translator_app.urls')),
    
    # Page rendering endpoints
    path('app', translator_views.app_view, name='app'),
    
    # The root path serves the landing page
    path('', translator_views.index_view, name='index'),
]

