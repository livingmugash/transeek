document.addEventListener('DOMContentLoaded', function() {
    // Client-side form validation can be added here for a better UX

    // Paystack Integration Logic
    const paymentForm = document.querySelector('#paystack-button-container');
    if (paymentForm) {
        const paystackBtn = document.getElementById('paystack-button');
        paystackBtn.addEventListener('click', function() {
            // This would be replaced with dynamic data from the backend
            const paystackPublicKey = 'YOUR_PAYSTACK_PUBLIC_KEY'; 
            const paymentAmount = 1000; // Amount in kobo (e.g., 1000 for NGN 10.00)
            const userEmail = 'user@example.com'; // Get from logged-in user data

            let handler = PaystackPop.setup({
                key: paystackPublicKey,
                email: userEmail,
                amount: paymentAmount,
                currency: 'USD', // or other supported currency
                ref: '' + Math.floor((Math.random() * 1000000000) + 1),
                callback: function(response) {
                    // This callback is called after payment is successful
                    // The backend webhook is the primary source of truth
                    window.location.href = '/dashboard?payment_ref=' + response.reference;
                },
                onClose: function() {
                    alert('Window closed.');
                }
            });
            handler.openIframe();
        });
    }

    // Trial Usage Tracking
    const startCallBtn = document.getElementById('start-call-btn');
    if (startCallBtn) {
        startCallBtn.addEventListener('click', function() {
            // This is a simplified client-side check.
            // The authoritative check must be done on the backend.
            fetch('/api/get_subscription_status')
                .then(response => response.json())
                .then(data => {
                    if (data.is_premium || data.trial_count > 0) {
                        alert('Starting a new call!');
                        // Here, you would decrement the trial count via an API call
                    } else {
                        alert('You have used all your free calls. Please upgrade to continue.');
                        window.location.href = '/payment';
                    }
                });
        });
    }
});
