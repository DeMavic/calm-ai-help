# Calm AI Help - Backend Server

This server handles chat requests, assessment submissions, and contact forms for the Calm AI Help website.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

The server will run on `http://localhost:3000`

## 📡 API Endpoints

### Chat
- `POST /api/chat` - Send a message and get an AI response
  ```json
  {
    "message": "What is AI?",
    "sessionId": "optional-session-id"
  }
  ```

### Assessment
- `POST /api/assessment` - Save assessment results
- `GET /api/assessment/:id` - Get specific assessment
- `GET /api/assessments` - List all assessments

### Contact
- `POST /api/contact` - Submit contact form

### Health
- `GET /api/health` - Server health check

## 🤖 AI Integration

Currently uses **intelligent fallback responses** that work great for demos without requiring external AI services.

### Future AI Integration Options:

1. **OpenAI/Anthropic Direct**: Add API key and replace fallback logic
2. **OpenClaw Advanced**: Set up webhook integration for full OpenClaw responses
3. **Custom Model**: Host your own model and connect here

The fallback responses cover common questions about AI, technology, and senior-friendly topics.

## 💾 Data Storage

All submissions are saved in `./data/`:
- `assessments/` - Individual assessment JSON files
- `contacts/` - Contact form submissions
- `*.jsonl` - Summary logs for easy review

## 🔐 Security Notes

- Uses token authentication for OpenClaw (when enabled)
- CORS enabled for local development
- In production: Add rate limiting, validate inputs, secure data storage

## 📝 Development

```bash
# Start with auto-reload
npm run dev

# Requires nodemon
```

## 🎯 Demo vs Live AI Mode

The frontend has a toggle for:
- **Demo Mode**: Uses fallback responses (instant, offline-capable)
- **Live AI Mode**: Calls this server API (can be enhanced with real AI)

Both modes provide helpful responses! Demo mode is perfect for showcasing without external dependencies.

---

Built with ❤️ by Cliff Wilson
