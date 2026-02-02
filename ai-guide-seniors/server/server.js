const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..')));

// Ensure data directory exists
const DATA_DIR = path.join(__dirname, 'data');
async function ensureDataDir() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (error) {
        console.error('Error creating data directory:', error);
    }
}
ensureDataDir();

// ===== OpenClaw Integration =====

async function sendToOpenClaw(message, sessionId = 'demo') {
    // Note: OpenClaw's HTTP gateway doesn't directly expose a simple chat endpoint.
    // For true AI integration, you would need to either:
    // 1. Use OpenClaw's webhook system to receive responses
    // 2. Create a dedicated sub-agent session
    // 3. Use a third-party AI API (OpenAI, Anthropic, etc.)
    //
    // For now, this returns fallback responses which work great for the demo!
    throw new Error('OpenClaw HTTP API integration not configured - using fallback responses');
}

// ===== API Routes =====

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        // Send to OpenClaw
        const response = await sendToOpenClaw(message, sessionId || 'demo');
        
        res.json({ 
            success: true,
            response: response 
        });
        
    } catch (error) {
        console.error('Chat error:', error);
        
        // Fallback responses if OpenClaw is unavailable
        const fallbackResponse = getFallbackResponse(req.body.message);
        
        res.json({ 
            success: true,
            response: fallbackResponse,
            fallback: true 
        });
    }
});

// Save assessment results
app.post('/api/assessment', async (req, res) => {
    try {
        const data = req.body;
        data.id = `assessment_${Date.now()}`;
        data.submittedAt = new Date().toISOString();
        
        // Save to file
        const filename = `${data.id}.json`;
        const filepath = path.join(DATA_DIR, 'assessments', filename);
        
        await fs.mkdir(path.join(DATA_DIR, 'assessments'), { recursive: true });
        await fs.writeFile(filepath, JSON.stringify(data, null, 2));
        
        // Log to summary file
        const summaryPath = path.join(DATA_DIR, 'assessment-summary.jsonl');
        const summaryLine = JSON.stringify({
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            devices: data.devices,
            helpMethod: data.helpMethod,
            submittedAt: data.submittedAt
        }) + '\n';
        
        await fs.appendFile(summaryPath, summaryLine);
        
        console.log(`Assessment saved: ${data.name} (${data.email})`);
        
        res.json({ 
            success: true,
            id: data.id,
            message: 'Assessment saved successfully' 
        });
        
    } catch (error) {
        console.error('Assessment save error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to save assessment' 
        });
    }
});

// Contact form submission
app.post('/api/contact', async (req, res) => {
    try {
        const data = req.body;
        data.id = `contact_${Date.now()}`;
        data.submittedAt = new Date().toISOString();
        
        // Save to file
        const filename = `${data.id}.json`;
        const filepath = path.join(DATA_DIR, 'contacts', filename);
        
        await fs.mkdir(path.join(DATA_DIR, 'contacts'), { recursive: true });
        await fs.writeFile(filepath, JSON.stringify(data, null, 2));
        
        // Log to summary file
        const summaryPath = path.join(DATA_DIR, 'contact-summary.jsonl');
        const summaryLine = JSON.stringify({
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            subject: data.subject,
            submittedAt: data.submittedAt
        }) + '\n';
        
        await fs.appendFile(summaryPath, summaryLine);
        
        console.log(`Contact form saved: ${data.name} - ${data.subject}`);
        
        res.json({ 
            success: true,
            id: data.id,
            message: 'Contact form submitted successfully' 
        });
        
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to submit contact form' 
        });
    }
});

// Get assessment by ID (for follow-up)
app.get('/api/assessment/:id', async (req, res) => {
    try {
        const filepath = path.join(DATA_DIR, 'assessments', `${req.params.id}.json`);
        const data = await fs.readFile(filepath, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(404).json({ error: 'Assessment not found' });
    }
});

// List all assessments (admin endpoint - add auth in production!)
app.get('/api/assessments', async (req, res) => {
    try {
        const summaryPath = path.join(DATA_DIR, 'assessment-summary.jsonl');
        const content = await fs.readFile(summaryPath, 'utf8');
        const assessments = content
            .trim()
            .split('\n')
            .map(line => JSON.parse(line))
            .reverse(); // Most recent first
        
        res.json({ 
            success: true,
            count: assessments.length,
            assessments: assessments 
        });
    } catch (error) {
        res.json({ 
            success: true,
            count: 0,
            assessments: [] 
        });
    }
});

// Fallback responses if OpenClaw is unavailable
function getFallbackResponse(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('what is ai') || msg.includes('what ai')) {
        return "AI (Artificial Intelligence) is like having a very smart assistant that can help you with tasks, answer questions, and learn from information. Think of it as a computer program that can understand what you say or type, and respond in a helpful way.\n\nFor example, when you ask Siri or Alexa a question, that's AI! It's technology designed to make your life easier.";
    }
    
    if (msg.includes('help me') || msg.includes('daily life')) {
        return "AI can help you in many ways:\n\n• Control smart home devices with your voice\n• Make video calls to family\n• Set reminders and manage your schedule\n• Get weather updates and news\n• Answer questions instantly\n\nWould you like to learn more about any of these?";
    }
    
    return "That's a great question! For personalized help, I recommend taking our assessment or contacting Cliff directly at calmaihelp@gmail.com. He can provide hands-on assistance tailored to your needs.";
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        openclaw: process.env.OPENCLAW_GATEWAY_URL ? 'configured' : 'not configured'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🌊 Calm AI Help server running on http://localhost:${PORT}`);
    console.log(`📁 Data directory: ${DATA_DIR}`);
    console.log(`🤖 OpenClaw: ${process.env.OPENCLAW_GATEWAY_URL || 'Not configured'}`);
});
