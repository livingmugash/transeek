from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Subscription

class CustomUserAdmin(UserAdmin):
    """
    Defines the admin interface for the CustomUser model.
    """
    model = CustomUser
    # Add custom fields to the admin display
    list_display = ['username', 'email', 'is_premium', 'trial_count', 'subscription_end_date']
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('trial_count', 'is_premium', 'subscription_end_date', 'paystack_customer_code')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('email',)}),
    )

class SubscriptionAdmin(admin.ModelAdmin):
    """
    Defines the admin interface for the Subscription model.
    """
    list_display = ['user', 'plan', 'amount', 'start_date', 'end_date', 'is_active']
    search_fields = ['user__username', 'plan']
    list_filter = ['plan', 'is_active']

# Register your models here.
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Subscription, SubscriptionAdmin)
