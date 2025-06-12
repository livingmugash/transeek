import hmac
import hashlib
import json
import requests
import datetime
from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.contrib.auth.decorators import login_required
from django.conf import settings
from .models import Subscription

User = get_user_model()

# --- Page Rendering Views ---
@ensure_csrf_cookie
def index_view(request):
    """Serves the main landing/auth page (index.html)."""
    return render(request, 'index.html')

@login_required(login_url='/#login')
def app_view(request):
    """Serves the main application dashboard (transeek.html)."""
    return render(request, 'transeek.html')

# --- API Views (largely unchanged, but with robust checks) ---
@csrf_exempt
def signup_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            username = data.get('username')
            password = data.get('password')

            if not all([email, username, password]):
                return JsonResponse({'detail': 'All fields are required.'}, status=400)
            if User.objects.filter(email=email).exists():
                 return JsonResponse({'detail': 'An account with this email already exists.'}, status=400)
            if User.objects.filter(username=username).exists():
                 return JsonResponse({'detail': 'This username is already taken.'}, status=400)
            
            user = User.objects.create_user(username=username, email=email, password=password)
            login(request, user)
            return JsonResponse({'message': 'User created successfully.'}, status=201)
        except json.JSONDecodeError:
            return JsonResponse({'detail': 'Invalid JSON format.'}, status=400)
    return JsonResponse({'detail': 'Only POST method is allowed.'}, status=405)

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            user = authenticate(request, email=email, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse({'message': 'Login successful.'}, status=200)
            else:
                return JsonResponse({'detail': 'Invalid credentials or user does not exist.'}, status=401)
        except json.JSONDecodeError:
            return JsonResponse({'detail': 'Invalid JSON format.'}, status=400)
    return JsonResponse({'detail': 'Only POST method is allowed.'}, status=405)

@csrf_exempt
def logout_view(request):
    if request.user.is_authenticated and request.method == 'POST':
        logout(request)
        return HttpResponse(status=204)
    return JsonResponse({'detail': 'User not authenticated or wrong method.'}, status=401)

def user_status_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({'detail': 'Not authenticated.'}, status=401)
    
    user = request.user
    subscription = Subscription.objects.filter(user=user, is_active=True).first()
    plan_name = subscription.plan if subscription else 'Free'
    
    return JsonResponse({
        'username': user.username,
        'is_premium': user.is_premium,
        'trial_count': user.trial_count,
        'plan': plan_name.capitalize(),
    })
    
@csrf_exempt
def use_trial_view(request):
    if not request.user.is_authenticated or request.method != 'POST':
        return JsonResponse({'detail': 'Authentication required.'}, status=401)
    
    user = request.user
    if user.is_premium:
        return JsonResponse({'message': 'User is on a premium plan.'})
    
    if user.trial_count > 0:
        user.trial_count -= 1
        user.save(update_fields=['trial_count'])
        return JsonResponse({'message': 'Trial count decremented.', 'remaining': user.trial_count})
    else:
        return JsonResponse({'detail': 'No trial sessions remaining.'}, status=403)
