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

    // --- Page Specific Logic Determination ---
    // Check the current URL path to determine which page logic to run.
    // Assuming 'index.html' or 'transeek.html' could be the landing page.
    // '/app' (or whatever your dashboard route will be) is the dashboard.
    const path = window.location.pathname;

    if (path === '/' || path.includes('/index.html') || path.includes('/transeek.html')) {
        // This is likely the landing page with login/signup/pricing
        handleLandingPage();
    } else if (path.includes('/app')) { // Adjust '/app' if your dashboard URL is different
        // This is the dashboard page (transeek.html's original purpose)
        handleDashboardPage();
    } else {
        // Fallback for local testing or unhandled paths, assume landing
        handleLandingPage();
    }

    // Logic for the Landing Page (index.html or transeek.html if it's acting as landing)
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
                // Bind event listeners AFTER the content is rendered for dynamic elements
                bindEventListenersForView(hash);
            }
        }
        
        function bindEventListenersForView(hash){
            // Listeners for login/signup forms within the dynamically loaded content
            if (hash === '#login' || hash === ''){ // If landing or login view is active
                const switchToSignup = mainContent.querySelector('#login-switch-to-signup');
                if(switchToSignup) switchToSignup.addEventListener('click', (e) => { e.preventDefault(); renderView('#signup'); });
                
                const loginForm = mainContent.querySelector('#login-form');
                if(loginForm) loginForm.addEventListener('submit', handleLogin);
            }
            if (hash === '#signup' || hash === ''){ // If landing or signup view is active
                const switchToLogin = mainContent.querySelector('#signup-switch-to-login');
                if(switchToLogin) switchToLogin.addEventListener('click', (e) => { e.preventDefault(); renderView('#login'); });
                
                const signupForm = mainContent.querySelector('#signup-form');
                if(signupForm) signupForm.addEventListener('submit', handleSignup);
                
                // Hero button on landing page to sign up
                // Using a more generic selector for the "Start Your Free Trial" buttons
                const heroSignupButtons = mainContent.querySelectorAll('.action-button.nav-link[data-view="signup"]');
                heroSignupButtons.forEach(button => {
                    button.addEventListener('click', (e) => { 
                        e.preventDefault();
                        window.location.hash = '#signup';
                    });
                });

                // Pricing card buttons to sign up
                const pricingButtons = mainContent.querySelectorAll('.pricing-btn, .pricing-btn-popular');
                pricingButtons.forEach(button => {
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        window.location.hash = '#signup'; // Direct hash change for consistency
                    });
                });
            }
            // FAQ Accordion logic (if present in the current view)
            const faqQuestions = mainContent.querySelectorAll('.faq-question');
            faqQuestions.forEach(question => {
                question.addEventListener('click', () => {
                    const faqItem = question.closest('.faq-item');
                    if (faqItem) {
                        faqItem.classList.toggle('open');
                        const answer = faqItem.querySelector('.faq-answer');
                        if (answer) {
                            // Reset max-height to 0 before setting, to trigger transition on close
                            answer.style.maxHeight = '0'; 
                            if (faqItem.classList.contains('open')) {
                                answer.style.maxHeight = answer.scrollHeight + 'px';
                            }
                        }
                    }
                });
            });
        }
        
        // Global navigation button listeners (these are always in the DOM, not dynamic templates)
        // These are assumed to be in the main HTML file itself, not inside templates.
        const navLoginBtn = document.getElementById('nav-login-btn');
        const navSignupBtn = document.getElementById('nav-signup-btn');
        const mobileNavLoginBtn = document.getElementById('mobile-nav-login-btn');
        const mobileNavSignupBtn = document.getElementById('mobile-nav-signup-btn');
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');


        if(navLoginBtn) navLoginBtn.addEventListener('click', (e) => { e.preventDefault(); window.location.hash = '#login'; });
        if(navSignupBtn) navSignupBtn.addEventListener('click', (e) => { e.preventDefault(); window.location.hash = '#signup'; });
        if(mobileNavLoginBtn) mobileNavLoginBtn.addEventListener('click', (e) => { e.preventDefault(); window.location.hash = '#login'; });
        if(mobileNavSignupBtn) mobileNavSignupBtn.addEventListener('click', (e) => { e.preventDefault(); window.location.hash = '#signup'; });
        
        // Mobile Menu Toggle - kept here as these elements are static
        if(mobileMenuButton) {
            mobileMenuButton.addEventListener('click', () => {
                if(mobileMenu) mobileMenu.classList.toggle('hidden');
            });
        }

        window.addEventListener('hashchange', () => renderView(window.location.hash));
        renderView(window.location.hash); // Initial render based on URL hash
    }

    // Logic for the Dashboard Page (e.g., /app/ or transeek.html if it's specifically the dashboard)
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
            .catch((error) => {
                console.error("User status check failed:", error); // Log error for debugging
                // If status check fails, user is not authenticated. Redirect to login.
                // Ensure full path for reliability when redirecting to root with hash
                window.location.href = `${API_BASE_URL}/#login`;
            });
            
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
        document.getElementById('start-call-btn').addEventListener('click', handleUseTrial);
    }

    // --- AUTHENTICATION HANDLERS ---
    async function handleAuth(form, endpoint) {
        const errorDiv = form.querySelector('.form-error');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        if (errorDiv) errorDiv.classList.add('hidden'); // Ensure errorDiv exists before manipulating
        if (submitBtn) { // Ensure submitBtn exists
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            await apiRequest(endpoint, 'POST', data);
            window.location.href = '/app'; // Redirect to the main app page (transeek.html or your dashboard)
        } catch (error) {
            if (errorDiv) { // Check again before trying to set text/class
                errorDiv.textContent = error.message;
                errorDiv.classList.remove('hidden');
            }
            if (submitBtn) { // Check again before manipulating
                submitBtn.disabled = false;
                submitBtn.textContent = form.id === 'login-form' ? 'Log In' : 'Create Free Account';
            }
        }
    }

    function handleLogin(e) { e.preventDefault(); handleAuth(e.target, '/api/login/'); }
    function handleSignup(e) { e.preventDefault(); handleAuth(e.target, '/api/signup/'); }

    async function handleLogout(e) {
        e.preventDefault();
        try {
            await apiRequest('/api/logout/', 'POST');
            window.location.href = '/'; // Redirect to landing page root
        } catch (error) {
            alert('Logout failed. Please try again.');
            console.error("Logout error:", error); // Log for debugging
        }
    }
    
    // --- Dashboard Specific Handlers ---
    async function handleUseTrial(e) {
        const btn = e.currentTarget;
        btn.disabled = true; // Disable button immediately
        try {
            await apiRequest('/api/use-trial/', 'POST');
            // Reload to show updated count (backend has decremented)
            window.location.reload();
        } catch(error) {
            alert(`Failed to start call: ${error.message}`);
            console.error("Use trial error:", error); // Log for debugging
        } finally {
            // Re-enable only if reload doesn't happen (e.g., in case of error)
            btn.disabled = false;
        }
    }

    // No direct HTML changes needed for index.html or transeek.html beyond
    // ensuring the main content area (if it exists) has id="main-content"
    // for the landing page's dynamic rendering.
});
