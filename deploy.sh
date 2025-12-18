#!/bin/bash
# GitHub & Railway Deployment Script
# Run this to push your AI Phone Agent to GitHub

set -e

echo "🚀 AI Phone Agent - GitHub & Railway Deployment Setup"
echo "======================================================="
echo ""

# Step 1: Initialize Git
echo "📋 Step 1: Initializing Git Repository..."
if [ -d .git ]; then
    echo "✅ Git already initialized"
else
    git init
    echo "✅ Git initialized"
fi

# Step 2: Verify .env is ignored
echo ""
echo "🔒 Step 2: Verifying .env is ignored..."
if grep -q "^.env$" .gitignore; then
    echo "✅ .env is in .gitignore"
else
    echo "⚠️  .env might not be properly ignored"
fi

# Step 3: Check git status
echo ""
echo "📊 Step 3: Checking git status..."
echo "Files to be committed:"
git add .
git status --short | head -20

# Step 4: Verify .env not included
echo ""
echo "🔐 Step 4: Verifying .env won't be committed..."
if git status --short | grep -q "\.env"; then
    echo "❌ ERROR: .env file will be committed!"
    echo "Check your .gitignore"
    exit 1
else
    echo "✅ .env file is properly ignored"
fi

# Step 5: Commit
echo ""
echo "💾 Step 5: Creating initial commit..."
git commit -m "Initial commit: AI-powered phone agent

- Human-like conversation with GPT-4 and memory
- Internet search integration (Google & SerpAPI)
- Conversation memory with auto-cleanup
- Domain registration and checking tools
- Voice recognition and analysis

Features:
- 20 production-ready API endpoints
- Full TypeScript support
- Comprehensive documentation
- Ready for Railway deployment
- Docker support included"

echo "✅ Commit created"

# Step 6: Instructions
echo ""
echo "🎉 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Create GitHub repository at: https://github.com/new"
echo "   - Name: realtime-ai-phone-agent"
echo "   - Description: AI-powered phone agent with conversation, search, domain, and voice"
echo "   - Choose Public or Private"
echo "   - DO NOT initialize with README"
echo ""
echo "2. Copy these commands and run them:"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/realtime-ai-phone-agent.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Deploy on Railway:"
echo "   - Go to https://railway.app/dashboard"
echo "   - Click 'New Project'"
echo "   - Select 'Deploy from GitHub repo'"
echo "   - Choose your repository"
echo "   - Click 'Deploy'"
echo ""
echo "4. Set environment variables in Railway:"
echo "   - OPENAI_API_KEY"
echo "   - OPENAI_WEBHOOK_VERIFICATION_KEY"
echo "   - NODE_ENV=production"
echo ""
echo "📖 For detailed instructions, see:"
echo "   - RAILWAY_GITHUB_SETUP.md (Quick guide)"
echo "   - DEPLOYMENT_CHECKLIST.md (Step-by-step)"
echo "   - DEPLOYMENT_GUIDE.md (Complete guide)"
echo ""
echo "🚀 You're ready to deploy!"
