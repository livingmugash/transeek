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
    // Now checking for the presence of #view-container (from index.html) or #dashboard-content (from transeek.html)
    const viewContainer = document.getElementById('view-container');
    const dashboardContent = document.getElementById('dashboard-content'); // This ID is in transeek.html

    if (viewContainer) {
        // We are on index.html, which manages multiple views via hidden class
        handleLandingPage();
    } else if (dashboardContent) {
        // We are on transeek.html (the dashboard page)
        handleDashboardPage();
    } else {
        // Fallback or unexpected page structure, assume landing page logic
        console.warn("Could not determine page type. Defaulting to landing page logic.");
        handleLandingPage();
    }

    // Logic for the Landing Page (index.html, which manages #view-landing, #view-login, #view-signup)
    function handleLandingPage() {
        const allViews = document.querySelectorAll('.view'); // Select all view divs
        
        function renderView(hash) {
            // Determine which view to show
            let targetViewId = 'view-landing'; // Default to landing
            if (hash === '#login') {
                targetViewId = 'view-login';
            } else if (hash === '#signup') {
                targetViewId = 'view-signup';
            }

            allViews.forEach(view => {
                if (view.id === targetViewId) {
                    view.classList.remove('hidden'); // Show the target view
                    view.classList.add('animate-fade-in'); // Re-add animation for visual effect
                } else {
                    view.classList.add('hidden'); // Hide other views
                    view.classList.remove('animate-fade-in'); // Remove animation class when hidden
                }
            });
        }
        
        // --- Bind ALL Event Listeners for the Landing Page once on DOMContentLoaded ---
        // Navigation buttons (in header, static)
        const navLinks = document.querySelectorAll('.nav-link'); // Select all elements with nav-link class
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Get the hash from href attribute or data-view (preferred for clarity)
                const targetHash = link.getAttribute('href') || `#${link.dataset.view}`;
                window.location.hash = targetHash;
            });
        });

        // Form submissions
        const loginForm = document.getElementById('login-form');
        if(loginForm) loginForm.addEventListener('submit', handleLogin);
        
        const signupForm = document.getElementById('signup-form');
        if(signupForm) signupForm.addEventListener('submit', handleSignup);
        
        // FAQ Accordion logic
        const faqQuestions = document.querySelectorAll('.faq-question');
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.closest('.faq-item');
                if (faqItem) {
                    faqItem.classList.toggle('open');
                    const answer = faqItem.querySelector('.faq-answer');
                    if (answer) {
                        // Reset max-height to '0' before setting, to trigger transition on close
                        if (faqItem.classList.contains('open')) {
                            answer.style.maxHeight = answer.scrollHeight + 'px';
                        } else {
                            answer.style.maxHeight = '0';
                        }
                    }
                }
            });
        });

        // Mobile Menu Toggle (still global/static elements)
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        if(mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Initial render based on URL hash
        renderView(window.location.hash);
        // Listen for hash changes to re-render view
        window.addEventListener('hashchange', () => renderView(window.location.hash));
    }

    // Logic for the Dashboard Page (transeek.html)
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
                // If status check fails, user is not authenticated. Redirect to login on the landing page.
                window.location.href = `${API_BASE_URL}/#login`;
            });
            
        // Logout button listener for dashboard
        const logoutBtn = document.getElementById('logout-btn');
        if(logoutBtn) logoutBtn.addEventListener('click', handleLogout);

        // Start call button listener for dashboard
        const startCallBtn = document.getElementById('start-call-btn');
        if(startCallBtn) startCallBtn.addEventListener('click', handleUseTrial);
    }

    // --- AUTHENTICATION HANDLERS ---
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
                // Check if the error object has a 'detail' property for specific messages
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
    
    // --- Dashboard Specific Handlers ---
    async function handleUseTrial(e) {
        const btn = e.currentTarget;
        btn.disabled = true;
        try {
            await apiRequest('/api/use-trial/', 'POST');
            // Reload to show updated count (backend has decremented)
            window.location.reload();
        } catch(error) {
            alert(`Failed to start call: ${error.message}`);
            console.error("Use trial error:", error);
        } finally {
            // Re-enable only if reload doesn't happen (e.g., in case of error)
            btn.disabled = false;
        }
    }
});
