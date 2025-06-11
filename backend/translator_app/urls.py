from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='home'),
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/', views.dashboard_view, name='dashboard'),
    path('payment/', views.payment_view, name='payment'),
    path('paystack/webhook/', views.paystack_webhook_view, name='paystack-webhook'),
    path('api/get_subscription_status/', views.get_subscription_status_api, name='get-subscription-status'),
    path('api/process_call/', views.process_call_api, name='process-call'),
]
