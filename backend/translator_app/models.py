from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    trial_count = models.IntegerField(default=3)
    is_premium = models.BooleanField(default=False)
    subscription_end_date = models.DateField(null=True, blank=True)
    paystack_customer_code = models.CharField(max_length=100, blank=True, null=True)

class Subscription(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    plan = models.CharField(max_length=20)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    paystack_reference = models.CharField(max_length=100)
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f'{self.user.username} - {self.plan}'
