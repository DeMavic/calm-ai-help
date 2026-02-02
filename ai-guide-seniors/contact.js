// Contact form handling
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const successMessage = document.getElementById('formSuccess');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Disable submit button to prevent double-submission
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        // Collect form data
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            contactPreference: formData.get('contactPreference'),
            timestamp: new Date().toISOString()
        };
        
        // Send to backend
        try {
            const response = await fetch('http://localhost:3000/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Contact form saved:', result.id);
                
                // Show success message
                form.style.display = 'none';
                successMessage.style.display = 'block';
                successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                throw new Error('Server responded with error');
            }
        } catch (error) {
            console.error('Error submitting contact form:', error);
            // Show error message
            alert('Sorry, there was a problem sending your message. Please try emailing us directly at calmaihelp@gmail.com');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
});
