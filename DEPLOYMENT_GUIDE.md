# 🚀 Railway & GitHub Deployment Guide

## Part 1: GitHub Setup

### 1. Initialize Git Repository

```bash
# If not already initialized
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: AI-powered phone agent with conversation, search, domain, and voice capabilities"
```

### 2. Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create new repository (example: `realtime-ai-phone-agent`)
3. Choose **Public** (for open source) or **Private** (for personal use)
4. DO NOT initialize with README (we already have one)

### 3. Push to GitHub

```bash
# Add remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/realtime-ai-phone-agent.git

# Push to main branch
git branch -M main
git push -u origin main
```

### 4. Verify on GitHub

Visit `https://github.com/YOUR_USERNAME/realtime-ai-phone-agent` - you should see all files

---

## Part 2: Railway Setup

### 1. Create Railway Account

1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub (recommended for easy deployment)
3. Connect your GitHub account

### 2. Create New Project

#### Option A: Deploy from GitHub (Recommended)

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select your repository (`realtime-ai-phone-agent`)
4. Railway auto-detects Node.js project
5. Click "Deploy"

#### Option B: Deploy from Docker

1. Click "New Project"
2. Select "Docker"
3. Connect your GitHub repo
4. Railway uses the Dockerfile

### 3. Configure Environment Variables

1. Go to your Railway project
2. Click "Variables" tab
3. Add all required environment variables:

```
OPENAI_API_KEY=sk-proj-xxxxx
OPENAI_WEBHOOK_VERIFICATION_KEY=whsec_xxxxx
TWILIO_ACCOUNT_SID=ACxxxxx (optional)
TWILIO_AUTH_TOKEN=xxxxx (optional)
TWILIO_PHONE_NUMBER=+1234567890 (optional)
SEARCH_ENGINE=google
SEARCH_API_KEY=AIzaSyxxxxx
NODE_ENV=production
PORT=3000
```

**Important**: Never commit `.env` - use Railway's dashboard instead

### 4. Set Up Auto-Deploy

1. In Railway, go to "Settings"
2. Enable "Auto Deploy on Push"
3. Select "main" branch
4. Every push to main triggers automatic deployment

### 5. Get Your Production URL

1. Go to "Deployments" tab
2. Click on successful deployment
3. Find "Domain" (example: `https://realtime-ai-phone-agent-production.up.railway.app`)
4. Use this URL for OpenAI webhooks

---

## 3. Configure OpenAI Webhook

1. Go to OpenAI Dashboard
2. Set Webhook URL to: `https://[YOUR-RAILWAY-DOMAIN]/webhook`
3. Use the `OPENAI_WEBHOOK_VERIFICATION_KEY` from your Railway variables
4. Test the webhook

---

## 4. GitHub Best Practices

### .gitignore is Already Configured

✅ `.env` files are ignored  
✅ `node_modules/` is ignored  
✅ `dist/` build output is ignored  
✅ Sensitive files are protected  

### Commit Workflow

```bash
# Make changes
git add .
git commit -m "Descriptive message about changes"

# Push to GitHub (auto-deploys if connected)
git push origin main
```

### .env.example for Reference

The `.env.example` file shows all variables needed without actual secrets. Share this with team members!

---

## 5. Verify Deployment

### Test Health Check

```bash
curl https://[YOUR-RAILWAY-DOMAIN]/status
```

Should return:
```json
{
  "status": "operational",
  "services": {
    "phoneAgent": "active",
    "aiConversation": "active",
    "internetSearch": "active",
    "domainCheck": "active",
    "voiceRecognition": "active"
  }
}
```

### View Logs

In Railway:
1. Click "Deployments"
2. Select active deployment
3. View logs in real-time

---

## 6. Troubleshooting

### Build Fails

**Check logs**:
- Go to Railway Deployments
- Scroll through build logs
- Most common: missing environment variables

**Solution**:
```bash
# Verify locally first
npm run build
npm run start
```

### App Crashes After Deploy

**Check**:
1. All required env vars are set in Railway
2. OpenAI API key is valid
3. Build log shows no errors

**Solution**: Restart deployment or check logs for specific errors

### Webhook URL Not Working

1. Verify Railway domain is correct
2. Test: `curl https://[domain]/status`
3. Check OpenAI webhook verification key matches
4. Review Railway logs for 404 or 401 errors

---

## 7. Project Structure for GitHub

```
realtime-ai-phone-agent/
├── src/                          # Source code
│   ├── ai/                       # AI service
│   ├── search/                   # Search service
│   ├── domain/                   # Domain service
│   ├── voice/                    # Voice service
│   ├── phone/                    # Phone service
│   └── ...
├── dist/                         # Build output (ignored)
├── node_modules/                 # Dependencies (ignored)
├── .env                          # Secrets (ignored)
├── .env.example                  # Template (included)
├── .gitignore                    # Git ignore rules
├── Dockerfile                    # Docker config
├── railway.toml                  # Railway config
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── README.md                     # Project overview
├── QUICKSTART.md                 # Setup guide
├── FEATURES.md                   # Feature docs
└── ...
```

---

## 8. GitHub Actions (Optional)

To add automated testing on push:

```bash
# Create directory
mkdir -p .github/workflows

# Create workflow file
touch .github/workflows/test.yml
```

Add to `.github/workflows/test.yml`:

```yaml
name: Test & Build

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Lint
        run: npm run lint
      
      - name: Test
        run: npm test
```

---

## 9. Monitoring & Maintenance

### Check Deployment Status

```bash
# In Railway dashboard
# Deployments tab → Check latest build
```

### Update Code

```bash
# Make changes locally
git add .
git commit -m "Update message"
git push origin main

# Railway auto-deploys within 1-2 minutes
```

### Rollback (if needed)

In Railway:
1. Go to Deployments
2. Click previous successful deployment
3. Click "Redeploy"

---

## 10. Security Checklist

✅ API keys in Railway variables (not in code)  
✅ `.env` in `.gitignore` (never committed)  
✅ `.env.example` shows template only  
✅ GitHub repository privacy set correctly  
✅ Dockerfile uses multi-stage build  
✅ Production mode enabled (`NODE_ENV=production`)  

---

## 11. Quick Reference

### Railway Command Line (Optional)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link [project-id]

# Deploy
railway up

# View logs
railway logs

# View environment
railway env
```

### Useful URLs

- GitHub: `https://github.com/YOUR_USERNAME/realtime-ai-phone-agent`
- Railway: `https://railway.app/dashboard`
- Production API: `https://[YOUR-RAILWAY-DOMAIN]`
- OpenAI Webhook: `https://[YOUR-RAILWAY-DOMAIN]/webhook`

---

## 12. Next Steps

1. ✅ Push to GitHub: `git push origin main`
2. ✅ Create Railway project from GitHub
3. ✅ Set environment variables in Railway
4. ✅ Configure OpenAI webhook URL
5. ✅ Test health endpoint
6. ✅ Monitor logs for errors
7. ✅ Make improvements and push updates

---

## 🎉 You're Ready!

Your AI Phone Agent is now:
- ✅ On GitHub (backed up & collaborative)
- ✅ Deployed on Railway (live & scalable)
- ✅ Auto-deploying (push → live in minutes)
- ✅ Production-ready (monitoring included)

**Production URL**: `https://[YOUR-RAILWAY-DOMAIN]`

---

**Questions?**
- Railway Docs: https://docs.railway.app
- GitHub Docs: https://docs.github.com
- NestJS Docs: https://docs.nestjs.com

