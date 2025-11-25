# Deployment Guide

## Backend API Deployment (Vercel)

### Prerequisites
- Node.js installed
- Vercel account (sign up at https://vercel.com)
- API keys for OpenRouter and/or Groq

### Step 1: Install Dependencies

```bash
cd ghost-api
npm install
```

### Step 2: Get API Keys

1. **OpenRouter API Key**:
   - Sign up at https://openrouter.ai
   - Go to your dashboard
   - Copy your API key (starts with `sk-or-v1-`)

2. **Groq API Key**:
   - Sign up at https://console.groq.com
   - Create an API key
   - Copy your API key (starts with `gsk_`)

### Step 3: Deploy to Vercel

1. Install Vercel CLI (if not already installed):
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy the project:
```bash
cd ghost-api
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No** (for first deployment)
- Project name? **ghost-api** (or your preferred name)
- Directory? **./** (current directory)
- Override settings? **No**

### Step 4: Configure Environment Variables

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project (`ghost-api`)
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

   - **OPENROUTER_API_KEY**: Your OpenRouter API key
   - **GROQ_API_KEY**: Your Groq API key
   - **OPENROUTER_HTTP_REFERER**: `https://k8s-adventure.vercel.app` (or your frontend URL)

5. After adding variables, redeploy:
   - Go to **Deployments** tab
   - Click the three dots on the latest deployment
   - Select **Redeploy**

### Step 5: Get Your API URL

After deployment, Vercel will provide you with a URL like:
```
https://ghost-api.vercel.app
```

Your chat API endpoint will be:
```
https://ghost-api.vercel.app/api/chat
```

### Step 6: Update Frontend (Optional)

If you want to use a custom backend URL, update the frontend `.env` file:

```bash
cd ../k8s-adventure
echo "VITE_CHAT_API_URL=https://ghost-api.vercel.app/api/chat" > .env
```

Or update the `ChatBot` component props in `App.tsx`:
```tsx
<ChatBot apiUrl="https://your-custom-url.vercel.app/api/chat" />
```

## Testing the API

You can test the API using curl:

```bash
curl -X POST https://ghost-api.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is Kubernetes?",
    "provider": "groq"
  }'
```

## Troubleshooting

### API returns 500 error
- Check that environment variables are set correctly in Vercel
- Verify API keys are valid
- Check Vercel function logs in the dashboard

### CORS errors
- The API already includes CORS headers
- Make sure you're using the correct API URL

### Rate limiting
- OpenRouter and Groq have rate limits
- Check your API provider's documentation for limits
- Consider implementing rate limiting in the backend

