// Demo chat functionality
document.addEventListener('DOMContentLoaded', function() {
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatMessages = document.getElementById('chatMessages');
    const exampleButtons = document.querySelectorAll('.example-btn');
    const aiModeToggle = document.getElementById('aiModeToggle');
    const modeLabel = document.getElementById('modeLabel');
    const modeHint = document.getElementById('modeHint');
    const statusDot = document.querySelector('.status-dot');
    
    // API configuration
    const API_URL = 'http://localhost:3000/api/chat';
    let useRealAI = false;
    let apiAvailable = false;
    
    // Check if API is available
    async function checkAPI() {
        try {
            const response = await fetch('http://localhost:3000/api/health', {
                method: 'GET',
                timeout: 3000
            });
            apiAvailable = response.ok;
        } catch (error) {
            apiAvailable = false;
        }
        updateModeDisplay();
    }
    
    // Load saved preference
    const savedMode = localStorage.getItem('aiMode');
    if (savedMode === 'real') {
        aiModeToggle.checked = true;
        useRealAI = true;
    }
    
    // Check API on load
    checkAPI();
    
    // Handle mode toggle
    aiModeToggle.addEventListener('change', function() {
        useRealAI = this.checked;
        localStorage.setItem('aiMode', useRealAI ? 'real' : 'demo');
        updateModeDisplay();
        
        if (useRealAI && !apiAvailable) {
            checkAPI(); // Recheck in case server was started
        }
    });
    
    function updateModeDisplay() {
        if (useRealAI) {
            if (apiAvailable) {
                modeLabel.textContent = 'Live AI Mode';
                modeHint.textContent = 'Connected to OpenClaw';
                statusDot.style.background = '#4caf50';
            } else {
                modeLabel.textContent = 'Live AI (Offline)';
                modeHint.textContent = 'Server not available - using demo';
                statusDot.style.background = '#ff9800';
            }
        } else {
            modeLabel.textContent = 'Demo Mode';
            modeHint.textContent = 'Using pre-written responses';
            statusDot.style.background = '#667eea';
        }
    }

    // Handle example button clicks
    exampleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const question = this.getAttribute('data-question');
            userInput.value = question;
            chatForm.dispatchEvent(new Event('submit'));
        });
    });

    // Handle form submission
    chatForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const message = userInput.value.trim();
        if (!message) return;

        // Add user message to chat
        addMessage(message, 'user');
        userInput.value = '';

        // Disable input while processing
        userInput.disabled = true;
        sendBtn.disabled = true;

        // Show typing indicator
        showTypingIndicator();

        // Get AI response
        let response;
        try {
            if (useRealAI && apiAvailable) {
                response = await getRealAIResponse(message);
            } else {
                // Simulate AI thinking time for mock responses
                await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
                response = getMockResponse(message);
            }
        } catch (error) {
            console.error('AI response error:', error);
            // Fallback to mock if API fails
            await new Promise(resolve => setTimeout(resolve, 500));
            response = getMockResponse(message);
            
            // Update status if API became unavailable
            if (useRealAI && apiAvailable) {
                apiAvailable = false;
                updateModeDisplay();
            }
        }
        
        removeTypingIndicator();
        addMessage(response, 'assistant');

        // Re-enable input
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
    });

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Convert markdown-style formatting to HTML
        const formattedText = formatMessage(text);
        contentDiv.innerHTML = formattedText;
        
        messageDiv.appendChild(contentDiv);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function formatMessage(text) {
        // Simple markdown-style formatting
        let formatted = text
            // Bold
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Paragraphs (double line breaks)
            .split('\n\n')
            .map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`)
            .join('');
        
        return formatted;
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant';
        typingDiv.id = 'typing-indicator';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
        
        typingDiv.appendChild(contentDiv);
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    async function getRealAIResponse(userMessage) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    sessionId: 'demo-' + Date.now()
                })
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }
            
            const data = await response.json();
            return data.response || data.message || 'Sorry, I didn\'t get a response. Please try again.';
            
        } catch (error) {
            console.error('Real AI error:', error);
            throw error; // Let caller handle fallback
        }
    }
    
    function getMockResponse(userMessage) {
        // Mock responses for demo purposes
        
        const message = userMessage.toLowerCase();
        
        if (message.includes('what is ai') || message.includes('what ai')) {
            return "AI (Artificial Intelligence) is like having a very smart assistant that can help you with tasks, answer questions, and learn from information. Think of it as a computer program that can understand what you say or type, and respond in a helpful way.\n\nFor example, when you ask Siri or Alexa a question, that's AI! It's technology designed to make your life easier.";
        }
        
        if (message.includes('help me') || message.includes('daily life')) {
            return "AI can help you in many ways every day:\n\n**Around the house:** Control lights, thermostats, and other smart devices with your voice\n\n**Staying connected:** Make video calls to family, send messages, share photos\n\n**Managing your day:** Set reminders, manage your calendar, create shopping lists\n\n**Learning & entertainment:** Listen to music, audiobooks, podcasts, get news updates\n\n**Quick answers:** Get weather, directions, recipes, answers to questions—instantly!\n\nThe best part? You can do most of this just by talking!";
        }
        
        if (message.includes('cookie') || message.includes('recipe')) {
            return "Here's a simple chocolate chip cookie recipe:\n\n**Ingredients:**\n- 1 cup butter, softened\n- 3/4 cup sugar\n- 3/4 cup brown sugar\n- 2 eggs\n- 2 teaspoons vanilla\n- 2 1/4 cups flour\n- 1 teaspoon baking soda\n- 1 teaspoon salt\n- 2 cups chocolate chips\n\n**Instructions:**\n1. Mix butter and sugars until fluffy\n2. Add eggs and vanilla\n3. In another bowl, mix flour, baking soda, and salt\n4. Combine wet and dry ingredients\n5. Stir in chocolate chips\n6. Drop spoonfuls onto baking sheet\n7. Bake at 375°F for 9-11 minutes\n\nEnjoy! 🍪";
        }
        
        if (message.includes('exercise') || message.includes('senior')) {
            return "Great exercises for seniors (always check with your doctor first!):\n\n**Walking:** The best all-around exercise. Start with 10 minutes and build up.\n\n**Chair exercises:** Seated leg lifts, arm raises, gentle twists—perfect if standing is difficult.\n\n**Water aerobics:** Easy on joints, great for flexibility and strength.\n\n**Stretching:** Improves flexibility. Try gentle yoga or tai chi.\n\n**Balance exercises:** Stand on one foot (hold a chair for support), heel-to-toe walking.\n\n**Tip:** Start slow, listen to your body, and make it a daily habit!";
        }
        
        if (message.includes('video call') || message.includes('family')) {
            return "Video calling your family is easier than you think!\n\n**iPhone/iPad:** Use FaceTime. Just say \"Hey Siri, FaceTime [name]\" or tap the FaceTime app.\n\n**Android:** Use Google Duo or WhatsApp. Open the app, find their name, tap the video icon.\n\n**Computer:** Use Zoom, Skype, or Google Meet. Someone can send you a link—just click it!\n\n**Smart displays:** If you have an Echo Show or Google Nest Hub, just say \"Call [name].\"\n\n**Tips:**\n- Make sure you're in good lighting\n- Position the camera at eye level\n- Test it with a friend first!\n\nWant help setting this up? That's exactly what we're here for!";
        }
        
        if (message.includes('podcast')) {
            return "A podcast is like a radio show you can listen to anytime!\n\n**What is it?** Audio episodes on topics you care about—news, stories, comedy, learning, hobbies, and more.\n\n**How do I listen?** \n- Ask your smart speaker: \"Alexa, play [podcast name]\"\n- Use apps on your phone: Apple Podcasts (iPhone) or Google Podcasts (Android)\n- Listen while driving, cooking, or relaxing!\n\n**Popular podcasts for beginners:**\n- NPR News (daily news)\n- TED Talks Daily (inspiring ideas)\n- Stuff You Should Know (learn about anything!)\n\n**Best part?** They're free and there's a podcast about every topic imaginable!";
        }
        
        // Default response
        return "That's a great question! While I can give you general information, the best way to get personalized help is to connect with Cliff directly. He can walk you through exactly what you need.\n\nFeel free to ask me something else, or take the assessment to get personalized recommendations!";
    }
});
