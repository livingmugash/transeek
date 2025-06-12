    import hmac
    import hashlib
    import json
    import requests
    import datetime
    from django.shortcuts import render
    from django.http import JsonResponse, HttpResponse
    from django.views.decorators.csrf import csrf_exempt
    from django.contrib.auth import authenticate, login, logout, get_user_model
    from django.contrib.auth.decorators import login_required
    from django.conf import settings
    from .models import Subscription
    
    User = get_user_model()

    # --- Page Rendering View ---
    # This is the ONLY view that renders an HTML page.
    def index(request):
        return render(request, 'index.html')

    # --- API Views ---
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
                return JsonResponse({'message': 'User created successfully'}, status=201)
            except json.JSONDecodeError:
                return JsonResponse({'detail': 'Invalid JSON'}, status=400)
        return JsonResponse({'detail': 'Only POST method is allowed'}, status=405)

    @csrf_exempt
    def login_view(request):
        if request.method == 'POST':
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            user = authenticate(request, email=email, password=password) # Authenticate with email
            if user is not None:
                login(request, user)
                return JsonResponse({'message': 'Login successful'}, status=200)
            else:
                return JsonResponse({'detail': 'Invalid credentials or user does not exist.'}, status=401)
        return JsonResponse({'detail': 'Only POST method is allowed'}, status=405)

    @csrf_exempt
    def logout_view(request):
        if request.user.is_authenticated and request.method == 'POST':
            logout(request)
            return HttpResponse(status=204) # No Content
        return JsonResponse({'detail': 'User not authenticated or wrong method'}, status=401)

    def user_status_view(request):
        if not request.user.is_authenticated:
            return JsonResponse({'detail': 'Not authenticated'}, status=401)
        
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
            return JsonResponse({'detail': 'Authentication required'}, status=401)
        
        user = request.user
        if user.is_premium:
            return JsonResponse({'message': 'User is on a premium plan.'})
        
        if user.trial_count > 0:
            user.trial_count -= 1
            user.save(update_fields=['trial_count'])
            return JsonResponse({'message': 'Trial count decremented.', 'remaining': user.trial_count})
        else:
            return JsonResponse({'detail': 'No trial sessions remaining.'}, status=403)

    # --- Paystack and Conceptual AI Integration ---
    PLAN_AMOUNTS_KOBO = { 'monthly': 1000, 'yearly': 7000 }

    @csrf_exempt
    def initiate_payment_view(request):
        if not request.user.is_authenticated or request.method != 'POST':
            return JsonResponse({'detail': 'Authentication required'}, status=401)
            
        user = request.user
        data = json.loads(request.body)
        plan = data.get('plan')

        if plan not in PLAN_AMOUNTS_KOBO:
            return JsonResponse({'detail': 'Invalid plan selected'}, status=400)

        # For production, you'd create/update customer on Paystack here
        # For simplicity, we directly initiate payment
        return JsonResponse({
            'paystack_public_key': settings.PAYSTACK_PUBLIC_KEY,
            'email': user.email,
            'amount': PLAN_AMOUNTS_KOBO[plan],
            'reference': f"auratr_{user.id}_{datetime.datetime.now().timestamp()}"
        })

    @csrf_exempt
    def paystack_webhook_view(request):
        signature = request.headers.get('x-paystack-signature')
        body = request.body
        hash_val = hmac.new(settings.PAYSTACK_SECRET_KEY.encode('utf-8'), body, hashlib.sha512).hexdigest()
        if hash_val != signature:
            return HttpResponse(status=400)

        event = json.loads(body)
        if event['event'] == 'charge.success':
            data = event['data']
            email = data['customer']['email']
            user = User.objects.filter(email=email).first()
            if user:
                user.is_premium = True
                user.save(update_fields=['is_premium'])
                # You would also create/update the Subscription model instance here
        return HttpResponse(status=200)

    
