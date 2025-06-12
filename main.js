document.addEventListener('DOMContentLoaded', function () {
    const API_BASE_URL = window.location.origin;

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

    // --- Page Specific Logic ---
    const page = document.body.querySelector('main');
    if (page.id === 'main-content') {
        // We are on index.html
        handleLandingPage();
    } else if (page.querySelector('#dashboard-content')) {
        // We are on transeek.html
        handleDashboardPage();
    }

    function handleLandingPage() {
        const mainContent = document.getElementById('main-content');
        
        const routes = {
            '': 'template-landing',
            '#login': 'template-login',
            '#signup': 'template-signup'
        };

        function renderView(hash) {
            const templateId = routes[hash] || routes[''];
            const template = document.getElementById(templateId);
            if (template) {
                mainContent.innerHTML = ''; // Clear previous content
                mainContent.appendChild(template.content.cloneNode(true));
                bindEventListenersForView(hash);
            }
        }
        
        function bindEventListenersForView(hash){
            if (hash === '#login' || hash === ''){
                const switchToSignup = mainContent.querySelector('#login-switch-to-signup');
                if(switchToSignup) switchToSignup.addEventListener('click', () => renderView('#signup'));
                
                const loginForm = mainContent.querySelector('#login-form');
                if(loginForm) loginForm.addEventListener('submit', handleLogin);
            }
            if (hash === '#signup' || hash === ''){
                const switchToLogin = mainContent.querySelector('#signup-switch-to-login');
                if(switchToLogin) switchToLogin.addEventListener('click', () => renderView('#login'));
                
                const signupForm = mainContent.querySelector('#signup-form');
                if(signupForm) signupForm.addEventListener('submit', handleSignup);
                
                const heroSignupBtn = mainContent.querySelector('#hero-signup-btn');
                if(heroSignupBtn) heroSignupBtn.addEventListener('click', () => renderView('#signup'));
            }
        }
        
        // Navigation button listeners
        document.getElementById('nav-login-btn').addEventListener('click', (e) => { e.preventDefault(); window.location.hash = '#login'; });
        document.getElementById('nav-signup-btn').addEventListener('click', (e) => { e.preventDefault(); window.location.hash = '#signup'; });
        document.getElementById('mobile-nav-login-btn').addEventListener('click', (e) => { e.preventDefault(); window.location.hash = '#login'; });
        document.getElementById('mobile-nav-signup-btn').addEventListener('click', (e) => { e.preventDefault(); window.location.hash = '#signup'; });


        window.addEventListener('hashchange', () => renderView(window.location.hash));
        renderView(window.location.hash); // Initial render
    }

    function handleDashboardPage() {
        apiRequest('/api/user-status/')
            .then(data => {
                document.getElementById('welcome-message').textContent = `Welcome, ${data.username}!`;
                document.getElementById('user-greeting').textContent = `Hi, ${data.username}`;
                
                const statusMessage = document.getElementById('status-message');
                const trialMessage = document.getElementById('trial-usage-message');
                const startCallBtn = document.getElementById('start-call-btn');
                
                if (data.is_premium) {
                    statusMessage.textContent = `Your ${data.plan} Plan is active.`;
                    trialMessage.textContent = 'Enjoy unlimited real-time translation sessions.';
                    startCallBtn.disabled = false;
                } else {
                    statusMessage.textContent = 'You are currently on the Free Trial.';
                    if (data.trial_count > 0) {
                        trialMessage.innerHTML = `You have <strong>${data.trial_count}</strong> free session(s) remaining.`;
                        startCallBtn.disabled = false;
                    } else {
                        trialMessage.innerHTML = `Your free trial has ended. Please upgrade to continue.`;
                        startCallBtn.disabled = true;
                    }
                }
            })
            .catch(() => {
                // If status check fails, user is not authenticated. Redirect to login.
                window.location.href = '/#login';
            });
            
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
        document.getElementById('start-call-btn').addEventListener('click', handleUseTrial);
    }

    // --- AUTHENTICATION HANDLERS ---
    async function handleAuth(form, endpoint) {
        const errorDiv = form.querySelector('.form-error');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        errorDiv.classList.add('hidden');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            await apiRequest(endpoint, 'POST', data);
            window.location.href = '/app'; // Redirect to the main app page
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = form.id === 'login-form' ? 'Log In' : 'Create Free Account';
        }
    }

    function handleLogin(e) { e.preventDefault(); handleAuth(e.target, '/api/login/'); }
    function handleSignup(e) { e.preventDefault(); handleAuth(e.target, '/api/signup/'); }

    async function handleLogout(e) {
        e.preventDefault();
        try {
            await apiRequest('/api/logout/', 'POST');
            window.location.href = '/';
        } catch (error) {
            alert('Logout failed. Please try again.');
        }
    }
    
    // --- Dashboard Specific Handlers ---
    async function handleUseTrial(e) {
        const btn = e.currentTarget;
        btn.disabled = true;
        try {
             await apiRequest('/api/use-trial/', 'POST');
             // Reload to show updated count
             window.location.reload();
        } catch(error) {
            alert(error.message);
        } finally {
            btn.disabled = false;
        }
    }
    
    // Mobile Menu Toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if(mobileMenuButton) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
});
