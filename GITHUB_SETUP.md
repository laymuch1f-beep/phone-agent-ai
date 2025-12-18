# GitHub Repository Setup

This guide helps you set up your AI Phone Agent on GitHub and deploy to Railway.

## Quick Start (5 minutes)

### 1. Initialize Git
```bash
cd realtime-ai-phone-agent
git init
git add .
git commit -m "Initial commit: AI phone agent with 5 advanced capabilities"
```

### 2. Create GitHub Repository
- Go to https://github.com/new
- Name it: `realtime-ai-phone-agent`
- Add description: "AI-powered phone agent with conversation memory, internet search, domain registration, and voice recognition"
- Choose Public or Private
- Click "Create repository"

### 3. Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/realtime-ai-phone-agent.git
git branch -M main
git push -u origin main
```

### 4. Deploy to Railway
- Go to https://railway.app
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your repository
- Set environment variables (see `.env.example`)
- Deploy!

---

## What's in This Repository

📦 **Production-Ready NestJS Application**
- 4 advanced AI services (Conversation, Search, Domain, Voice)
- 20 API endpoints
- Full TypeScript support
- Comprehensive documentation

🚀 **Deployment Ready**
- Docker support
- Railway configuration
- Environment variable templates
- GitHub Actions ready

📚 **Well-Documented**
- 7+ markdown guides
- Code examples
- API reference
- Troubleshooting guide

---

## Key Files

| File | Purpose |
|------|---------|
| `src/` | Source code |
| `package.json` | Dependencies & scripts |
| `Dockerfile` | Docker build config |
| `railway.toml` | Railway deployment config |
| `.env.example` | Environment variable template |
| `.gitignore` | Git ignore rules |
| `DEPLOYMENT_GUIDE.md` | GitHub & Railway setup |
| `QUICKSTART.md` | Quick setup guide |

---

## Important: Environment Variables

1. **Create `.env` locally** (copy from `.env.example`)
2. **Add your secrets** (API keys, tokens, etc.)
3. **Never commit `.env`** (it's in .gitignore)
4. **In Railway**: Set variables in the dashboard

---

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start

# Run tests
npm test

# Lint code
npm run lint
```

---

## Deployment

### Railway (Recommended)
1. Connect GitHub repo to Railway
2. Set environment variables in Railway dashboard
3. Auto-deploy on every push to main
4. Get production URL: `https://[your-railway-domain]`

### Docker
```bash
docker build -t phone-agent .
docker run -p 8080:8080 --env-file .env phone-agent
```

---

## API Endpoints

### Health Check
```bash
curl https://[YOUR-DOMAIN]/status
```

### Search
```bash
curl "https://[YOUR-DOMAIN]/search/query"
```

### Domain Check
```bash
curl "https://[YOUR-DOMAIN]/domain/check/example.com"
```

See [FEATURES.md](./FEATURES.md) for all endpoints.

---

## Support

- 📖 [QUICKSTART.md](./QUICKSTART.md) - Setup guide
- 📚 [FEATURES.md](./FEATURES.md) - Feature reference
- 🔧 [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Technical details
- 🚀 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - GitHub & Railway setup

---

## License

UNLICENSED

---

## Status

✅ Production Ready  
✅ Full Documentation  
✅ Ready for GitHub  
✅ Ready for Railway  

---

**Let's go!** 🚀

1. Push to GitHub: `git push origin main`
2. Deploy on Railway: Connect your repo
3. Set environment variables
4. Your AI Phone Agent is live!
