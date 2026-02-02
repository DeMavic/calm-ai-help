// Assessment form handling
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('assessmentForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Collect form data
        const formData = new FormData(form);
        const data = {
            devices: formData.getAll('devices'),
            goals: formData.getAll('goals'),
            comfort: formData.get('comfort'),
            helpMethod: formData.get('help-method'),
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            notes: formData.get('notes'),
            timestamp: new Date().toISOString()
        };
        
        // Store data in sessionStorage for the results page
        sessionStorage.setItem('assessmentData', JSON.stringify(data));
        
        // Save to backend
        try {
            const response = await fetch('http://localhost:3000/api/assessment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Assessment saved:', result.id);
                // Store the assessment ID for potential follow-up
                sessionStorage.setItem('assessmentId', result.id);
            } else {
                console.warn('Failed to save assessment to server');
            }
        } catch (error) {
            console.error('Error saving assessment:', error);
            // Continue to results page even if save fails
        }
        
        // Redirect to results page
        window.location.href = 'results.html';
    });
    
    // Mutual exclusivity for "none of these" checkbox
    const deviceCheckboxes = document.querySelectorAll('input[name="devices"]');
    const noneCheckbox = document.querySelector('input[name="devices"][value="none"]');
    
    deviceCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.value === 'none' && this.checked) {
                // If "none" is checked, uncheck all others
                deviceCheckboxes.forEach(cb => {
                    if (cb.value !== 'none') cb.checked = false;
                });
            } else if (this.value !== 'none' && this.checked) {
                // If any other is checked, uncheck "none"
                if (noneCheckbox) noneCheckbox.checked = false;
            }
        });
    });
    
    // Auto-save progress to localStorage (in case they leave and come back)
    form.addEventListener('change', function() {
        const formData = new FormData(form);
        const data = {
            devices: formData.getAll('devices'),
            goals: formData.getAll('goals'),
            comfort: formData.get('comfort'),
            helpMethod: formData.get('help-method'),
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            notes: formData.get('notes')
        };
        localStorage.setItem('assessmentDraft', JSON.stringify(data));
    });
    
    // Restore from localStorage if available
    const savedDraft = localStorage.getItem('assessmentDraft');
    if (savedDraft) {
        try {
            const data = JSON.parse(savedDraft);
            
            // Restore checkboxes
            if (data.devices) {
                data.devices.forEach(value => {
                    const checkbox = document.querySelector(`input[name="devices"][value="${value}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            
            if (data.goals) {
                data.goals.forEach(value => {
                    const checkbox = document.querySelector(`input[name="goals"][value="${value}"]`);
                    if (checkbox) checkbox.checked = true;
                });
            }
            
            // Restore radio buttons
            if (data.comfort) {
                const radio = document.querySelector(`input[name="comfort"][value="${data.comfort}"]`);
                if (radio) radio.checked = true;
            }
            
            if (data.helpMethod) {
                const radio = document.querySelector(`input[name="help-method"][value="${data.helpMethod}"]`);
                if (radio) radio.checked = true;
            }
            
            // Restore text inputs
            if (data.name) document.getElementById('name').value = data.name;
            if (data.email) document.getElementById('email').value = data.email;
            if (data.phone) document.getElementById('phone').value = data.phone;
            if (data.notes) document.getElementById('notes').value = data.notes;
            
        } catch (e) {
            console.error('Error restoring draft:', e);
        }
    }
});
