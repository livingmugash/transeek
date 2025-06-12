document.addEventListener('DOMContentLoaded', function () {
    // --- Application State and Configuration ---
    const API_BASE_URL = window.location.origin;
    const state = {
        isAuthenticated: false,
        user: null,
    };

    // --- DOM Element References ---
    const pages = document.querySelectorAll('.page-section');
    const navLinks = document.querySelectorAll('.nav-link');
    const desktopMenu = document.getElementById('desktop-menu');
    const authMenu = document.getElementById('auth-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    // --- Helper Functions ---
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    async function apiRequest(endpoint, method = 'GET', body = null) {
        const headers = { 'Content-Type': 'application/json', 'X-CSRFToken': getCookie('csrftoken') };
        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);

        const response = await fetch(API_BASE_URL + endpoint, options);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'An unknown server error occurred.' }));
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
        }
        return response.status === 204 ? null : await response.json();
    }

    // --- UI and Navigation ---
    function showPage(pageId) {
        pages.forEach(page => {
            page.classList.toggle('hidden', page.id !== pageId);
        });
        window.scrollTo(0, 0);
    }

    function updateNavUI() {
        if (state.isAuthenticated) {
            desktopMenu.classList.add('hidden');
            authMenu.classList.remove('hidden');
            document.getElementById('user-greeting').textContent = `Hi, ${state.user.username}`;
        } else {
            desktopMenu.classList.remove('hidden');
            authMenu.classList.add('hidden');
        }
    }

    function handleNavigation(e) {
        e.preventDefault();
        const targetPage = e.currentTarget.dataset.page;
        if (targetPage) {
            // Update URL hash for bookmarking/history
            window.location.hash = targetPage.replace('page-', '');
            // The router will handle showing the page
        }
    }

    // --- Page Loaders and Logic ---
    function loadDashboard() {
        const data = state.user;
        document.getElementById('welcome-message').textContent = `Welcome, ${data.username}!`;
        const statusMessage = document.getElementById('status-message');
        const trialMessage = document.getElementById('trial-usage-message');
        const startCallBtn = document.getElementById('start-call-btn');

        if (data.is_premium) {
            statusMessage.innerHTML = `Your <strong>${data.plan} Plan</strong> is active. Enjoy unlimited translations!`;
            trialMessage.textContent = '';
            startCallBtn.disabled = false;
        } else {
            statusMessage.innerHTML = `You are on the <strong>Free Trial</strong>.`;
            if (data.trial_count > 0) {
                trialMessage.innerHTML = `You have <strong>${data.trial_count}</strong> free session(s) remaining. <a href="#payment" data-page="page-payment" class="nav-link text-accent font-bold hover:underline">Upgrade Now</a>.`;
                startCallBtn.disabled = false;
            } else {
                trialMessage.innerHTML = `You have used all your free sessions. <a href="#payment" data-page="page-payment" class="nav-link text-accent font-bold hover:underline">Please upgrade</a>.`;
                startCallBtn.disabled = true;
            }
        }
        // Re-attach event listeners for dynamically added nav-links inside dashboard
        document.querySelectorAll('#page-dashboard .nav-link').forEach(link => link.addEventListener('click', handleNavigation));
    }

    function loadPaymentPage() {
        const hash = window.location.hash;
        const planMatch = hash.match(/plan=(\w+)/);
        const plan = planMatch ? planMatch[1] : 'monthly';

        const plans = {
            monthly: { name: 'Monthly Plan', amount: 1000, display: '$10' },
            yearly: { name: 'Yearly Plan', amount: 7000, display: '$70' }
        };
        const selectedPlan = plans[plan];

        document.getElementById('payment-details').innerHTML = `
            <h3 class="text-xl font-display font-bold text-primary">${selectedPlan.name}</h3>
            <p class="text-3xl font-bold text-dark-text mt-2">${selectedPlan.display}</p>
        `;
        // Store plan for payment handler
        document.getElementById('pay-btn').dataset.plan = plan;
    }

    // --- Router ---
    async function router() {
        try {
            const userData = await apiRequest('/api/user-status/');
            state.isAuthenticated = true;
            state.user = userData;
            showPage('page-dashboard');
            loadDashboard();
        } catch (error) {
            state.isAuthenticated = false;
            state.user = null;
            const hash = window.location.hash.split('?')[0];
            switch (hash) {
                case '#login': showPage('page-login'); break;
                case '#signup': showPage('page-signup'); break;
                case '#payment': 
                    // Redirect to login if trying to access payment while not authenticated
                    window.location.hash = 'login';
                    break;
                default: showPage('page-landing');
            }
        }
        updateNavUI();
    }

    // --- Event Handlers ---
    async function handleAuthForm(e, formId, errorId, endpoint, isLogin = false) {
        e.preventDefault();
        const form = document.getElementById(formId);
        const errorDiv = document.getElementById(errorId);
        const submitBtn = form.querySelector('button[type="submit"]');
        
        errorDiv.classList.add('hidden');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        // For login, the field is 'email', not 'username'
        if(isLogin) data.email = data.email;

        try {
            await apiRequest(endpoint, 'POST', data);
            window.location.hash = 'dashboard';
            router(); // Re-route to dashboard
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = isLogin ? 'Log In' : 'Create Account';
        }
    }

    async function handleLogout(e) {
        e.preventDefault();
        try {
            await apiRequest('/api/logout/', 'POST');
            state.isAuthenticated = false;
            state.user = null;
            window.location.hash = '';
            router(); // Re-route to landing page
        } catch (error) {
            alert('Logout failed. Please try again.');
        }
    }
    
    async function handlePaystackPayment(e) {
        const payBtn = e.currentTarget;
        payBtn.disabled = true;
        payBtn.textContent = 'Initializing...';
        const errorDiv = document.getElementById('payment-form-error');
        errorDiv.classList.add('hidden');
        
        try {
            const plan = payBtn.dataset.plan;
            const sessionData = await apiRequest('/api/initiate-payment/', 'POST', { plan });
            
            const handler = PaystackPop.setup({
                key: sessionData.paystack_public_key,
                email: sessionData.email,
                amount: sessionData.amount,
                ref: sessionData.reference,
                callback: function(response) {
                   window.location.hash = 'dashboard';
                   router(); // Re-route to show updated status
                },
                onClose: function() {
                   payBtn.disabled = false;
                   payBtn.textContent = 'Proceed to Secure Payment';
                }
            });
            handler.openIframe();

        } catch (error) {
            errorDiv.textContent = `Payment failed: ${error.message}`;
            errorDiv.classList.remove('hidden');
            payBtn.disabled = false;
            payBtn.textContent = 'Proceed to Secure Payment';
        }
    }

    async function handleUseTrial(e) {
        const btn = e.currentTarget;
        btn.disabled = true;
        try {
             const updatedUser = await apiRequest('/api/use-trial/', 'POST');
             state.user.trial_count = updatedUser.remaining;
             loadDashboard(); // Reload dashboard UI with new data
        } catch(error) {
            alert(error.message);
        } finally {
            btn.disabled = false;
        }
    }
    
    // --- Event Listeners ---
    document.getElementById('signup-form').addEventListener('submit', (e) => handleAuthForm(e, 'signup-form', 'signup-form-error', '/api/signup/'));
    document.getElementById('login-form').addEventListener('submit', (e) => handleAuthForm(e, 'login-form', 'login-form-error', '/api/login/', true));
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    document.getElementById('pay-btn').addEventListener('click', handlePaystackPayment);
    document.getElementById('start-call-btn').addEventListener('click', handleUseTrial);
    
    navLinks.forEach(link => link.addEventListener('click', handleNavigation));

    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
    
    // Listen for hash changes to navigate
    window.addEventListener('hashchange', () => {
        // If not authenticated, route to the correct page
        if (!state.isAuthenticated) {
            const hash = window.location.hash.split('?')[0];
            const pageId = `page-${hash.substring(1) || 'landing'}`;
            showPage(pageId);
            if (hash.startsWith('#payment')) {
                loadPaymentPage();
            }
        } else {
             router(); // If authenticated, always re-validate and show dashboard
        }
    });

    // --- Initial Load ---
    router();
});

