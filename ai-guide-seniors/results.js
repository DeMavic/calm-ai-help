// Results page logic
document.addEventListener('DOMContentLoaded', function() {
    const data = JSON.parse(sessionStorage.getItem('assessmentData'));
    
    if (!data) {
        // No assessment data - redirect back to assessment
        window.location.href = 'assessment.html';
        return;
    }
    
    // Clear the draft from localStorage
    localStorage.removeItem('assessmentDraft');
    
    // Generate personalized results
    generateResults(data);
});

function generateResults(data) {
    const container = document.getElementById('resultsContent');
    
    // Build the results HTML
    let html = `
        <section class="results-header">
            <p class="greeting">Hey ${escapeHtml(data.name)}! 👋</p>
            <h2>We've created a personalized plan just for you</h2>
            <p>Based on your answers, here's how we can help you get comfortable with AI.</p>
        </section>
    `;
    
    // Summary cards
    html += '<div class="summary-grid">';
    
    // Devices summary
    if (data.devices.length > 0 && !data.devices.includes('none')) {
        html += `
            <div class="summary-card">
                <h3><span class="icon">📱</span> Your Devices</h3>
                <ul>
                    ${data.devices.map(d => `<li>${getDeviceLabel(d)}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    // Goals summary
    if (data.goals.length > 0) {
        html += `
            <div class="summary-card">
                <h3><span class="icon">🎯</span> Your Goals</h3>
                <ul>
                    ${data.goals.slice(0, 3).map(g => `<li>${getGoalLabel(g)}</li>`).join('')}
                    ${data.goals.length > 3 ? `<li>...and ${data.goals.length - 3} more!</li>` : ''}
                </ul>
            </div>
        `;
    }
    
    // Comfort level
    html += `
        <div class="summary-card">
            <h3><span class="icon">⚡</span> Your Pace</h3>
            <ul>
                <li>${getComfortLabel(data.comfort)}</li>
            </ul>
        </div>
    `;
    
    html += '</div>';
    
    // Recommendations based on devices
    html += '<section class="recommendations">';
    html += '<h2>📖 Personalized Guides for You</h2>';
    
    if (data.devices.includes('none')) {
        html += `
            <div class="recommendation-item">
                <h3>Getting Started with AI</h3>
                <p>Since you don't have any AI devices yet, let's start with the basics! We'll help you understand what AI can do and recommend simple devices that match your goals.</p>
                <p>We recommend starting with a <strong>smartphone with a voice assistant</strong> (like Siri or Google Assistant). It's the easiest way to try AI without buying extra devices.</p>
                <a href="#contact" class="guide-link">→ Let's talk about which device is right for you</a>
            </div>
        `;
    } else {
        // Show guides for each device they have
        data.devices.forEach(device => {
            const guide = getDeviceGuide(device, data.goals);
            if (guide) {
                html += `
                    <div class="recommendation-item">
                        <span class="device-label">${getDeviceLabel(device)}</span>
                        <h3>${guide.title}</h3>
                        <p>${guide.description}</p>
                        <a href="${guide.link}" class="guide-link">→ ${guide.linkText}</a>
                    </div>
                `;
            }
        });
    }
    
    html += '</section>';
    
    // Next steps based on help preference
    html += '<section class="next-steps">';
    html += '<h2>🚀 Your Next Steps</h2>';
    
    const steps = getNextSteps(data);
    steps.forEach((step, index) => {
        html += `
            <div class="step-card">
                <h3><span class="step-number">${index + 1}</span>${step.title}</h3>
                <p>${step.description}</p>
            </div>
        `;
    });
    
    html += '</section>';
    
    // Contact/schedule section
    if (data.helpMethod === 'phone' || data.helpMethod === 'video' || data.helpMethod === 'combination') {
        html += `
            <section class="contact-section" id="contact">
                <h2>📞 Ready to Connect?</h2>
                <p>You mentioned you'd like ${getHelpMethodLabel(data.helpMethod)}. Let's make that happen!</p>
                <p><strong>Cliff will personally reach out to you within 24 hours</strong> to schedule a time that works for you.</p>
                
                <div class="contact-methods">
        `;
        
        html += `
                <a href="tel:+16033708578" class="contact-btn">
                    <span class="icon">📞</span>
                    Call Cliff: (603) 370-8578
                </a>
            `;
        
        if (data.email) {
            html += `
                <a href="mailto:calmaihelp@gmail.com?subject=AI Help - Ready to Get Started&body=Hi Cliff, I just completed the assessment.%0D%0A%0D%0AMy name: ${encodeURIComponent(data.name)}%0D%0AMy email: ${encodeURIComponent(data.email)}${data.phone ? '%0D%0AMy phone: ' + encodeURIComponent(data.phone) : ''}" class="contact-btn">
                    <span class="icon">✉️</span>
                    Email Cliff
                </a>
            `;
        }
        
        html += `
                </div>
                
                <div class="encouragement">
                    <p><strong>What to expect:</strong></p>
                    <p>Cliff will call or email to introduce himself, answer any questions you have, and set up a time to walk through things together. No pressure, no rush—we'll go at your pace.</p>
                </div>
            </section>
        `;
    } else {
        // Self-guided preference
        html += `
            <section class="contact-section" id="contact">
                <h2>📚 Learning at Your Own Pace</h2>
                <p>You mentioned you prefer written guides you can follow on your own. Perfect!</p>
                <p>The guides above are a great place to start. Take your time with them—bookmark this page and come back whenever you need.</p>
                
                <div class="encouragement">
                    <p><strong>Need help?</strong> Don't hesitate to reach out!</p>
                    <p>If you get stuck or have questions, Cliff is here to help. You can call, email, or schedule a video session anytime.</p>
                </div>
                
                <div class="contact-methods">
        `;
        
        html += `<a href="tel:+16033708578" class="contact-btn"><span class="icon">📞</span> Call Cliff</a>`;
        
        if (data.email) {
            html += `<a href="mailto:calmaihelp@gmail.com?subject=AI Help Question&body=Hi Cliff,%0D%0A%0D%0AMy name: ${encodeURIComponent(data.name)}%0D%0AMy email: ${encodeURIComponent(data.email)}${data.phone ? '%0D%0AMy phone: ' + encodeURIComponent(data.phone) : ''}" class="contact-btn"><span class="icon">✉️</span> Email Cliff</a>`;
        }
        
        html += `
                </div>
            </section>
        `;
    }
    
    container.innerHTML = html;
    
    // Save results to backend (we'll implement this later)
    saveToBackend(data);
}

// Helper functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getDeviceLabel(device) {
    const labels = {
        'smartphone': 'Smartphone',
        'alexa': 'Amazon Alexa',
        'google-home': 'Google Home',
        'siri': 'Apple Siri',
        'computer': 'Computer',
        'ring': 'Ring Doorbell',
        'nest': 'Nest Thermostat'
    };
    return labels[device] || device;
}

function getGoalLabel(goal) {
    const labels = {
        'answers': 'Get quick answers',
        'smart-home': 'Control smart home',
        'communication': 'Stay connected with family',
        'entertainment': 'Music & entertainment',
        'learning': 'Learn new things',
        'reminders': 'Manage schedule',
        'explore': 'Explore AI'
    };
    return labels[goal] || goal;
}

function getComfortLabel(comfort) {
    const labels = {
        'beginner': 'Taking it slow with step-by-step help',
        'intermediate': 'Building confidence with guidance',
        'advanced': 'Ready to dive in!'
    };
    return labels[comfort] || comfort;
}

function getHelpMethodLabel(method) {
    const labels = {
        'phone': 'a phone call',
        'video': 'a video session',
        'combination': 'a mix of guides and personal help'
    };
    return labels[method] || method;
}

function getDeviceGuide(device, goals) {
    const guides = {
        'smartphone': {
            title: 'Getting Started with Your Smartphone Assistant',
            description: 'Learn how to talk to Siri or Google Assistant on your phone. We\'ll show you simple commands to get weather, set reminders, send messages, and more.',
            link: 'guides/smartphone.html',
            linkText: 'View smartphone guide'
        },
        'alexa': {
            title: 'Mastering Your Alexa',
            description: 'Alexa can do so much! Learn how to ask questions, play music, control smart home devices, and set routines that make your life easier.',
            link: 'guides/alexa.html',
            linkText: 'View Alexa guide'
        },
        'google-home': {
            title: 'Making the Most of Google Home',
            description: 'Google Assistant is incredibly helpful. Discover how to get answers, manage your day, control devices, and connect with family.',
            link: 'guides/google-home.html',
            linkText: 'View Google Home guide'
        },
        'siri': {
            title: 'Siri Tips & Tricks',
            description: 'Siri can help with daily tasks, answer questions, and control your Apple devices. Learn the best commands and shortcuts.',
            link: 'guides/siri.html',
            linkText: 'View Siri guide'
        },
        'computer': {
            title: 'Using AI on Your Computer',
            description: 'Your computer can access powerful AI tools. We\'ll show you how to use ChatGPT, search smarter, and get help with tasks.',
            link: 'guides/computer-ai.html',
            linkText: 'View computer AI guide'
        },
        'ring': {
            title: 'Getting Started with Ring Doorbell',
            description: 'See who\'s at your door from anywhere! Learn how to view live video, talk to visitors, and get alerts on your phone when someone rings.',
            link: 'guides/ring-doorbell.html',
            linkText: 'View Ring doorbell guide'
        },
        'nest': {
            title: 'Mastering Your Nest Thermostat',
            description: 'Control your home temperature from anywhere, use voice commands, and let Nest learn your schedule to save energy automatically.',
            link: 'guides/nest-thermostat.html',
            linkText: 'View Nest thermostat guide'
        }
    };
    
    return guides[device];
}

function getNextSteps(data) {
    const steps = [];
    
    if (data.comfort === 'beginner') {
        steps.push({
            title: 'Start Small',
            description: 'Pick just ONE thing from the guides above. Don\'t try to learn everything at once! Master one simple command or task first.'
        });
    }
    
    if (data.devices.includes('none')) {
        steps.push({
            title: 'Choose Your First Device',
            description: 'Based on your goals, we\'ll help you pick the right AI device or service to start with. Most people find smartphones easiest!'
        });
    } else {
        steps.push({
            title: 'Try the Basics',
            description: 'Start with simple commands like "What\'s the weather?" or "Set a timer for 10 minutes." Build your confidence with easy wins!'
        });
    }
    
    if (data.helpMethod === 'phone' || data.helpMethod === 'video') {
        steps.push({
            title: 'Schedule Your Session',
            description: 'Cliff will reach out within 24 hours to set up a time. Have your device handy so we can practice together!'
        });
    }
    
    steps.push({
        title: 'Practice Daily',
        description: 'Use your AI assistant a little bit every day. The more you practice, the more natural it becomes. Remember: there\'s no such thing as a dumb question!'
    });
    
    if (data.goals.includes('communication')) {
        steps.push({
            title: 'Stay Connected',
            description: 'Once you\'re comfortable with the basics, we\'ll help you use AI to video call family, send messages, and share photos. Staying in touch has never been easier!'
        });
    }
    
    return steps;
}

async function saveToBackend(data) {
    // This is called from the results page, but the data should already be saved
    // from the assessment page. This is just a fallback.
    
    // Check if we already have an assessment ID
    const assessmentId = sessionStorage.getItem('assessmentId');
    if (assessmentId) {
        console.log('Assessment already saved with ID:', assessmentId);
        return;
    }
    
    // If not saved yet, save it now
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
            console.log('Assessment saved from results page:', result.id);
            sessionStorage.setItem('assessmentId', result.id);
        }
    } catch (error) {
        console.error('Error saving assessment from results page:', error);
    }
}
