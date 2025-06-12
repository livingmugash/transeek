    from django.contrib import admin
    from django.urls import path, include, re_path
    from translator_app import views as translator_views

    urlpatterns = [
        path('admin/', admin.site.urls),
        
        # All API calls are routed to the translator_app's urls
        path('api/', include('translator_app.urls')),
        
        # All other paths are caught by this regex and served by the index view.
        # This allows your single-page app to handle routing on the client side.
        re_path(r'^.*$', translator_views.index, name='index'),
    ]
    
