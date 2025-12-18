# 🚀 Quick Start Guide

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:

```env
# Required
OPENAI_API_KEY=sk-proj-your_key_here
OPENAI_WEBHOOK_VERIFICATION_KEY=whsec_your_key_here

# Optional - Search (choose one)
SEARCH_ENGINE=google
SEARCH_API_KEY=AIzaSyxxxx
GOOGLE_SEARCH_ENGINE_ID=1234567890abc

# Optional - Domains
GODADDY_API_KEY=your_key
GODADDY_API_SECRET=your_secret
DOMAIN_API_KEY=your_whois_key
```

### 3. Build the Project
```bash
npm run build
```

### 4. Start the Server
```bash
# Production
npm run start

# Development (with auto-reload)
npm run start:dev

# Development with debugging
npm run start:debug
```

The server will start on `http://localhost:3000`

---

## ✅ Verify Installation

```bash
# Check health
curl http://localhost:3000

# Check status
curl http://localhost:3000/status

# Response should be:
{
  "status": "operational",
  "services": {
    "phoneAgent": "active",
    "aiConversation": "active",
    "internetSearch": "active",
    "domainCheck": "active",
    "voiceRecognition": "active"
  },
  "timestamp": "2024-12-17T..."
}
```

---

## 🎯 Quick Feature Tests

### Test 1: Search the Internet
```bash
curl "http://localhost:3000/search/latest%20AI%20news"

# Response:
{
  "query": "latest AI news",
  "resultsCount": 5,
  "results": [
    {
      "title": "...",
      "url": "...",
      "snippet": "...",
      "source": "Google"
    }
  ],
  "timestamp": "2024-12-17T..."
}
```

### Test 2: Check Domain Availability
```bash
curl "http://localhost:3000/domain/check/example.com"

# Response:
{
  "domain": "example.com",
  "available": false,
  "registered": true,
  "registrar": "VeriSign Global Registry Services",
  "quote": null,
  "timestamp": "2024-12-17T..."
}
```

### Test 3: Get Domain Suggestions
```bash
curl "http://localhost:3000/domain/suggest/techstartup"

# Response:
{
  "keyword": "techstartup",
  "suggestions": [
    "techstartup.com",
    "techstartup.io",
    "techstartup.app",
    "gettechstartup.com",
    "thetechstartup.com"
  ],
  "count": 5,
  "timestamp": "2024-12-17T..."
}
```

### Test 4: Analyze Voice Input
```bash
curl -X POST http://localhost:3000/voice/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "transcription": "I would love to book a table for 4 people tomorrow evening!",
    "audioMetrics": {
      "duration": 3.5,
      "sampleRate": 16000,
      "bitDepth": 16,
      "silence": 0.2
    }
  }'

# Response:
{
  "analysis": {
    "transcription": "I would love to book a table for 4 people tomorrow evening!",
    "language": "English",
    "sentiment": "positive",
    "intent": "booking",
    "confidence": 0.95,
    "metrics": {...}
  },
  "report": {
    "overallScore": 95,
    "issues": [],
    "suggestions": []
  },
  "timestamp": "2024-12-17T..."
}
```

### Test 5: Conversation Memory
```bash
# Add a message to conversation
curl -X POST http://localhost:3000/conversation/test-call-123/message \
  -H "Content-Type: application/json" \
  -d '{"role": "user", "content": "Hello, I want to make a reservation"}'

# Add AI response
curl -X POST http://localhost:3000/conversation/test-call-123/message \
  -H "Content-Type: application/json" \
  -d '{"role": "assistant", "content": "Of course! How many people will be joining?"}'

# Get conversation summary
curl http://localhost:3000/conversation/test-call-123/summary

# Response:
{
  "callId": "test-call-123",
  "summary": "Customer: Hello, I want to make a reservation\nAgent: Of course! How many people will be joining?",
  "timestamp": "2024-12-17T..."
}
```

---

## 🔧 Common Configuration Scenarios

### Scenario 1: Restaurant Call Center
```env
OPENAI_API_KEY=sk-proj-xxxxx
OPENAI_WEBHOOK_VERIFICATION_KEY=whsec_xxxxx
SEARCH_ENGINE=google
SEARCH_API_KEY=AIzaSyxxxxx
```

### Scenario 2: Tech Support Line
```env
OPENAI_API_KEY=sk-proj-xxxxx
OPENAI_WEBHOOK_VERIFICATION_KEY=whsec_xxxxx
SEARCH_ENGINE=serpapi
SEARCH_API_KEY=your_serpapi_key
```

### Scenario 3: Domain Sales Service
```env
OPENAI_API_KEY=sk-proj-xxxxx
OPENAI_WEBHOOK_VERIFICATION_KEY=whsec_xxxxx
GODADDY_API_KEY=xxxxx
GODADDY_API_SECRET=xxxxx
SEARCH_ENGINE=google
SEARCH_API_KEY=AIzaSyxxxxx
```

---

## 📱 Phone Webhook Setup (OpenAI)

The agent listens for incoming calls via OpenAI's webhook system.

### 1. Set up OpenAI Webhook
- Go to OpenAI Dashboard
- Configure webhook URL: `https://your-domain.com/webhook`
- Use `OPENAI_WEBHOOK_VERIFICATION_KEY` from your settings

### 2. Test Webhook
```bash
# The webhook will receive POST requests like:
{
  "type": "realtime.call.incoming",
  "data": {
    "call_id": "call-123abc..."
  }
}
```

---

## 📝 Logging & Monitoring

### View Logs
```bash
# Development with console logs
npm run start:dev
```

### Log Levels
The agent logs with these prefixes:
- `✅` - Success operations
- `❌` - Errors
- `📞` - Phone operations
- `💬` - Conversation operations
- `🔍` - Search operations
- `🌐` - Domain operations
- `🎤` - Voice analysis
- `🗑️` - Cleanup operations

---

## 🐛 Troubleshooting

### Problem: "OPENAI_API_KEY not found"
**Solution**: Check `.env` file exists and has the correct key

### Problem: Search returns empty results
**Solution**: 
- Verify `SEARCH_API_KEY` is valid
- Check API quota hasn't been exceeded
- Ensure `SEARCH_ENGINE` is set to 'google' or 'serpapi'

### Problem: Domain check fails
**Solution**:
- Domain APIs are optional - service degrades gracefully
- Check `DOMAIN_API_KEY` if you want WHOIS lookups
- GoDaddy APIs are faster if configured

### Problem: WebSocket connection fails
**Solution**:
- Verify `OPENAI_API_KEY` is correct
- Check WebSocket headers are being sent
- Ensure TLS certificate is valid (production)

### Problem: Voice analysis returns "Unknown"
**Solution**:
- This is normal - simple heuristic-based detection
- For production, consider upgrading to full speech-to-text service

---

## 🚀 Deploy to Production

### Using Docker
```bash
# Build image
docker build -t phone-agent .

# Run container
docker run -e OPENAI_API_KEY=sk-proj-xxxxx \
           -e OPENAI_WEBHOOK_VERIFICATION_KEY=whsec_xxxxx \
           -p 3000:3000 \
           phone-agent
```

### Using Railway (Recommended)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Environment Variables in Production
1. Never commit `.env` files
2. Use secrets management:
   - Docker Secrets
   - Kubernetes Secrets
   - Railway Secrets
   - Environment variable services

---

## 📊 API Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request |
| 401 | Unauthorized (invalid webhook signature) |
| 404 | Not Found (call ID not found) |
| 500 | Server Error |

---

## 🎓 Next Steps

1. **Customize Prompts**: Edit `SYSTEM_PROMPT` in `AIService`
2. **Add Domain**: Set up GoDaddy or WHOIS API
3. **Add Search**: Configure Google or SerpAPI
4. **Integrate Database**: Store conversations persistently
5. **Add Analytics**: Track call metrics
6. **Deploy**: Use Railway or Docker

---

## 📞 Getting Help

Check these resources:
1. [FEATURES.md](./FEATURES.md) - Feature documentation
2. [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Technical deep dive
3. [OpenAI Docs](https://platform.openai.com/docs) - API reference
4. Create an issue on GitHub

---

## ✨ What's Included

✅ AI-powered phone agent  
✅ Real-time internet search  
✅ Conversation memory system  
✅ Domain availability checking  
✅ Voice analysis & sentiment detection  
✅ Automatic memory cleanup  
✅ Production-ready logging  
✅ Error handling & recovery  
✅ TypeScript support  
✅ WebSocket management  

---

**Ready to launch your AI phone agent? Start with `npm run start:dev`!** 🚀
