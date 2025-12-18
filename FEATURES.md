# AI-Powered Phone Agent with Advanced Capabilities

A sophisticated NestJS-based phone agent with AI-driven conversations, internet search, memory management, domain registration tools, and voice recognition capabilities.

## 🚀 New Features Implemented

### 1. **Human-Like Conversation** 🗣️
- Powered by GPT-4 with enhanced prompts for natural communication
- Contextual awareness with full conversation memory
- Empathetic responses and understanding
- Natural flow with multi-turn conversations
- **Location**: `src/ai/ai.service.ts`

**Key Methods**:
- `generateResponse()` - Context-aware AI responses
- `addConversationTurn()` - Memory management
- `getContextualSystemPrompt()` - Dynamic prompt generation

### 2. **Internet Search** 🔍
- Real-time web search capabilities
- Integration with Google Custom Search API and SerpAPI
- Result caching for performance
- Information extraction and summarization
- **Location**: `src/search/search.service.ts`

**Key Methods**:
- `search()` - Perform web searches
- `getRelevantInfo()` - Extract relevant information
- `getCurrentInfo()` - Get latest information about topics

**Endpoints**:
```
GET  /search/:query
POST /search (with maxResults parameter)
```

### 3. **Conversation Memory** 💾
- Persistent conversation history per call
- Context tracking and updates
- Automatic cleanup after 1 hour of inactivity
- Full conversation summaries
- **Location**: `src/ai/ai.service.ts`

**Key Methods**:
- `initializeConversation()` - Start tracked conversations
- `getMemory()` - Retrieve conversation history
- `updateContext()` - Track call context
- `getConversationSummary()` - Generate call summaries

**Endpoints**:
```
GET    /conversation/:callId
GET    /conversation/:callId/summary
POST   /conversation/:callId/message
POST   /conversation/:callId/context
DELETE /conversation/:callId
```

### 4. **Domain Registration & Checking** 🌐
- Check domain availability in real-time
- Get registration quotes
- Domain suggestions based on keywords
- WHOIS integration and GoDaddy API support
- **Location**: `src/domain/domain.service.ts`

**Key Methods**:
- `checkDomainAvailability()` - Check if domain is available
- `getDomainQuote()` - Get registration pricing
- `getDomainSuggestions()` - Suggest available domains
- `getDomainSummary()` - Generate domain status summary

**Endpoints**:
```
GET /domain/check/:domain
POST /domain/check
GET /domain/suggest/:keyword
```

### 5. **Voice Recognition & Analysis** 🎤
- Voice quality assessment
- Sentiment detection (positive/negative/neutral)
- Intent recognition
- Language detection
- Speaker characteristics analysis
- Quality reports and recommendations
- **Location**: `src/voice/voice.service.ts`

**Key Methods**:
- `analyzeVoiceMetrics()` - Analyze audio characteristics
- `detectSentiment()` - Emotion detection
- `detectIntent()` - Extract caller intent
- `generateQualityReport()` - Comprehensive voice analysis
- `getVoiceRecommendations()` - Actionable suggestions

**Endpoints**:
```
GET  /voice/quality
POST /voice/analyze
```

## 📋 API Endpoints

### Health & Status
- `GET /` - Health check
- `GET /hello` - Simple greeting
- `GET /status` - Service status

### Phone & Webhook
- `POST /webhook` - OpenAI Realtime API webhook

### Search
- `GET /search/:query` - Search the internet
- `POST /search` - POST search with parameters

### Domain Management
- `GET /domain/check/:domain` - Check domain availability
- `POST /domain/check` - POST domain check
- `GET /domain/suggest/:keyword` - Get domain suggestions

### Conversation Management
- `GET /conversation/:callId` - Get conversation details
- `GET /conversation/:callId/summary` - Get conversation summary
- `POST /conversation/:callId/message` - Add message to conversation
- `POST /conversation/:callId/context` - Update conversation context
- `DELETE /conversation/:callId` - Clear conversation

### Voice Analysis
- `GET /voice/quality` - Get optimal voice parameters
- `POST /voice/analyze` - Analyze voice transcription

## 🔧 Environment Variables

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_WEBHOOK_VERIFICATION_KEY=your_webhook_key

# Search (optional - choose one)
SEARCH_ENGINE=google  # or 'serpapi'
SEARCH_API_KEY=your_search_api_key
GOOGLE_SEARCH_ENGINE_ID=your_google_cx_id  # for Google Custom Search

# Domain APIs (optional)
GODADDY_API_KEY=your_godaddy_key
GODADDY_API_SECRET=your_godaddy_secret
DOMAIN_API_KEY=your_whois_api_key
```

## 🏗️ Project Structure

```
src/
├── ai/                    # AI conversation service
│   ├── ai.module.ts
│   └── ai.service.ts
├── search/               # Internet search service
│   ├── search.module.ts
│   └── search.service.ts
├── domain/              # Domain registration service
│   ├── domain.module.ts
│   └── domain.service.ts
├── voice/               # Voice recognition service
│   ├── voice.module.ts
│   └── voice.service.ts
├── phone/               # Phone handling service (enhanced)
│   ├── phone.module.ts
│   └── phone.service.ts
├── app.controller.ts    # Main API routes
├── app.service.ts
├── app.module.ts        # Main module with all imports
└── main.ts
```

## 💡 Usage Examples

### Start the Application
```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start
```

### Check Domain Availability
```bash
curl http://localhost:3000/domain/check/example.com
```

### Search the Internet
```bash
curl "http://localhost:3000/search/latest AI news"
```

### Analyze Voice Input
```bash
curl -X POST http://localhost:3000/voice/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "transcription": "I would like to book a reservation for tomorrow evening",
    "audioMetrics": {
      "duration": 3.5,
      "sampleRate": 16000,
      "bitDepth": 16
    }
  }'
```

### Get Conversation Summary
```bash
curl http://localhost:3000/conversation/call-123/summary
```

## 🎯 Key Capabilities

### AI-Powered Conversation Features
- **Natural Language Understanding**: Contextual conversation flow
- **Empathy & Warmth**: Professional yet friendly tone
- **Memory**: Remembers details from the conversation
- **Multi-topic Handling**: Smooth transitions between topics
- **Error Gracefully**: Honest about limitations

### Real-Time Information
- **Web Search**: Access current information instantly
- **Domain Intelligence**: Check availability and pricing
- **Sentiment Analysis**: Understand caller emotions
- **Intent Recognition**: Identify what the caller wants

### Voice Excellence
- **Quality Assessment**: Evaluate audio clarity
- **Emotion Detection**: Understand caller sentiment
- **Intent Recognition**: Identify caller goals
- **Language Detection**: Support multiple languages
- **Recommendations**: Provide actionable suggestions

## 🔐 Security Considerations

1. **API Keys**: All sensitive keys in environment variables
2. **Webhook Verification**: OpenAI webhook signature validation
3. **Memory Isolation**: Per-call conversation isolation
4. **Auto-Cleanup**: Automatic memory cleanup after 1 hour
5. **Rate Limiting**: Recommended for production (add middleware)

## 📈 Performance Optimization

- **Search Caching**: Reduces API calls for repeated queries
- **Memory Management**: Automatic cleanup prevents memory leaks
- **Efficient Prompting**: Context-aware prompts reduce token usage
- **Connection Pooling**: WebSocket connection management

## 🚀 Future Enhancements

- [ ] Multi-language support
- [ ] Database integration for persistent storage
- [ ] Advanced NLP models
- [ ] Call recording and transcription
- [ ] Real-time analytics dashboard
- [ ] Integration with CRM systems
- [ ] Custom business logic routing
- [ ] A/B testing framework

## 📝 License

UNLICENSED

## 🤝 Contributing

Submit issues and pull requests for improvements.

---

**Created with ❤️ for enhanced AI phone conversations**
