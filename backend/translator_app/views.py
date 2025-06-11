from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from .forms import SignUpForm, LoginForm
from .models import CustomUser
from django.conf import settings
import requests
import json
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import hmac
import hashlib
from datetime import timedelta
from django.utils import timezone

def home_view(request):
    return render(request, 'index.html')

def signup_view(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('dashboard')
    else:
        form = SignUpForm()
    return render(request, 'signup.html', {'form': form})

def login_view(request):
    if request.method == 'POST':
        form = LoginForm(request=request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('dashboard')
    else:
        form = LoginForm()
    return render(request, 'login.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('home')

def dashboard_view(request):
    if not request.user.is_authenticated:
        return redirect('login')
    return render(request, 'dashboard.html')

def payment_view(request):
    plan = request.GET.get('plan')
    amount = 10 if plan == 'monthly' else 70
    context = {'plan': plan, 'amount': amount}
    return render(request, 'payment.html', context)

@csrf_exempt
def paystack_webhook_view(request):
    paystack_secret = settings.PAYSTACK_SECRET_KEY
    signature = request.headers.get('x-paystack-signature')
    
    # Securely verify the webhook signature
    if not signature or not hmac.compare_digest(
        hmac.new(paystack_secret.encode('utf-8'), request.body, hashlib.sha512).hexdigest(),
        signature
    ):
        return HttpResponse(status=400)

    payload = json.loads(request.body)
    event = payload['event']

    if event == 'charge.success':
        data = payload['data']
        email = data['customer']['email']
        amount = data['amount'] / 100 # Convert from kobo
        reference = data['reference']
        
        try:
            user = CustomUser.objects.get(email=email)
            user.is_premium = True
            user.subscription_end_date = timezone.now().date() + timedelta(days=30 if amount == 10 else 365)
            user.save()

            # Create a subscription record
            # ...
        except CustomUser.DoesNotExist:
            return HttpResponse(status=404)

    return HttpResponse(status=200)

def get_subscription_status_api(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    user = request.user
    return JsonResponse({
        'is_premium': user.is_premium,
        'trial_count': user.trial_count
    })

# Conceptual AI Integration View
def process_call_api(request):
    """
    This is a conceptual placeholder for how the backend would interact with the AI agents.
    In a real-world scenario, this view would handle audio streams and make API calls
    to the AI microservices.
    """
    if not request.user.is_premium and request.user.trial_count <= 0:
        return JsonResponse({'error': 'Subscription required'}, status=402)
    
    # 1. Receive audio stream from the client (e.g., via WebSocket)
    
    # 2. Authenticate the request (e.g., with a token)

    # 3. Decrement trial count if applicable
    if not request.user.is_premium:
        request.user.trial_count -= 1
        request.user.save()

    # 4. Make an HTTP request to the AI Orchestrator
    # ai_response = requests.post('http://ai-orchestrator-service/translate', data=audio_stream)

    # 5. Stream the translated audio back to the client

    return JsonResponse({'status': 'Call processed successfully'})
