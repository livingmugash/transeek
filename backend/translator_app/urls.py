    from django.urls import path
    from . import views

    # This file now ONLY contains API endpoints.
    # The main urls.py file handles serving the single HTML page.
    urlpatterns = [
        path('signup/', views.signup_view, name='signup'),
        path('login/', views.login_view, name='login'),
        path('logout/', views.logout_view, name='logout'),
        path('user-status/', views.user_status_view, name='user_status'),
        path('use-trial/', views.use_trial_view, name='use_trial'),
        path('initiate-payment/', views.initiate_payment_view, name='initiate_payment'),
        path('paystack-webhook/', views.paystack_webhook_view, name='paystack_webhook'),
    ]
    
