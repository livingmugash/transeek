document.addEventListener('DOMContentLoaded', function () {
    const API_BASE_URL = window.location.origin;

    // --- Helper Functions (UNCHANGED) ---
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
    // Check for presence of #view-container (for index.html) or #dashboard-content (for transeek.html)
    const viewContainer = document.getElementById('view-container');
    const dashboardContent = document.getElementById('dashboard-content');

    if (viewContainer) {
        // We are on index.html, which now has all views directly visible
        handleLandingPage();
    } else if (dashboardContent) {
        // We are on transeek.html (the dashboard page)
        handleDashboardPage();
    } else {
        // Fallback for local testing or unhandled paths, assuming it's the landing page
        console.warn("Could not determine page type. Defaulting to landing page logic (index.html).");
        handleLandingPage();
    }

    // --- Simplified Logic for Landing Page (index.html) ---
    function handleLandingPage() {
        // --- Form Submissions ---
        const loginForm = document.getElementById('login-form');
        if(loginForm) {
            loginForm.addEventListener('submit', handleLogin);
            // Ensure error div is hidden initially
            const errorDiv = loginForm.querySelector('.form-error');
            if (errorDiv) errorDiv.classList.add('hidden');
        }
        
        const signupForm = document.getElementById('signup-form');
        if(signupForm) {
            signupForm.addEventListener('submit', handleSignup);
            // Ensure error div is hidden initially
            const errorDiv = signupForm.querySelector('.form-error');
            if (errorDiv) errorDiv.classList.add('hidden');
        }
        
        // --- FAQ Accordion Logic ---
        const faqQuestions = document.querySelectorAll('.faq-question');
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.closest('.faq-item');
                if (faqItem) {
                    faqItem.classList.toggle('open');
                    const answer = faqItem.querySelector('.faq-answer');
                    if (answer) {
                        if (faqItem.classList.contains('open')) {
                            answer.style.maxHeight = answer.scrollHeight + 'px';
                        } else {
                            answer.style.maxHeight = '0';
                        }
                    }
                }
            });
        });

        // --- Mobile Menu Toggle ---
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        if(mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // IMPORTANT: No more `renderView` or `window.addEventListener('hashchange')`
        // for main views as they are now always present.
        // Navigation links now rely on native browser anchor scrolling.
    }

    // --- Logic for the Dashboard Page (transeek.html - UNCHANGED) ---
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
                    if(startCallBtn) startCallBtn.disabled = false;
                } else {
                    statusMessage.textContent = 'You are currently on the Free Trial.';
                    if (data.trial_count > 0) {
                        trialMessage.innerHTML = `You have <strong>${data.trial_count}</strong> free session(s) remaining.`;
                        if(startCallBtn) startCallBtn.disabled = false;
                    } else {
                        trialMessage.innerHTML = `Your free trial has ended. Please upgrade to continue.`;
                        if(startCallBtn) startCallBtn.disabled = true;
                    }
                }
            })
            .catch((error) => {
                console.error("User status check failed:", error);
                window.location.href = `${API_BASE_URL}/#view-login`; // Redirect to login on index.html
            });
            
        const logoutBtn = document.getElementById('logout-btn');
        if(logoutBtn) logoutBtn.addEventListener('click', handleLogout);

        const startCallBtn = document.getElementById('start-call-btn');
        if(startCallBtn) startCallBtn.addEventListener('click', handleUseTrial);
    }

    // --- AUTHENTICATION HANDLERS (UNCHANGED, except redirect path for consistency) ---
    async function handleAuth(form, endpoint) {
        const errorDiv = form.querySelector('.form-error');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        if (errorDiv) errorDiv.classList.add('hidden');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            await apiRequest(endpoint, 'POST', data);
            window.location.href = '/app'; // Redirect to the main app page (dashboard)
        } catch (error) {
            console.error("Auth error:", error);
            if (errorDiv) {
                const errorMessage = error.message || 'An unexpected error occurred.';
                errorDiv.textContent = errorMessage;
                errorDiv.classList.remove('hidden');
            }
            if (submitBtn) {
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
            console.error("Logout error:", error);
        }
    }
    
    // --- Dashboard Specific Handlers (UNCHANGED) ---
    async function handleUseTrial(e) {
        const btn = e.currentTarget;
        btn.disabled = true;
        try {
            await apiRequest('/api/use-trial/', 'POST');
            window.location.reload();
        } catch(error) {
            alert(`Failed to start call: ${error.message}`);
            console.error("Use trial error:", error);
        } finally {
            btn.disabled = false;
        }
    }
});
