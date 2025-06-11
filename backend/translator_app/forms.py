from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from .models import CustomUser

class SignUpForm(UserCreationForm):
    """
    A form for user registration that includes email.
    """
    class Meta(UserCreationForm.Meta):
        model = CustomUser
        fields = ('username', 'email')

class LoginForm(AuthenticationForm):
    """
    A standard login form for user authentication.
    """
    def __init__(self, *args, **kwargs):
        super(LoginForm, self).__init__(*args, **kwargs)
