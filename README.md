# Ghost API - Kubernetes Explorer Chatbot Backend

Backend API for the Kubernetes Explorer chatbot, providing secure proxy endpoints for OpenRouter and Groq APIs.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your API keys:
```bash
cp .env.example .env
```

3. Get your API keys:
   - **OpenRouter**: Sign up at https://openrouter.ai and get your API key
   - **Groq**: Sign up at https://console.groq.com and get your API key

4. Add the API keys to your `.env` file:
```
OPENROUTER_API_KEY=sk-or-v1-...
GROQ_API_KEY=gsk_...
```

## Deployment to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to Environment Variables
   - Add `OPENROUTER_API_KEY` and `GROQ_API_KEY`

## API Endpoints

### POST `/api/chat`

Send a chat message to either OpenRouter or Groq API.

**Request Body:**
```json
{
  "message": "What is a Kubernetes pod?",
  "provider": "openrouter" | "groq",
  "model": "openai/gpt-4o-mini" (optional),
  "conversationHistory": [
    {
      "role": "user",
      "content": "Previous message"
    },
    {
      "role": "assistant",
      "content": "Previous response"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "A Kubernetes pod is...",
  "provider": "openrouter",
  "model": "openai/gpt-4o-mini"
}
```

## Local Development

Run the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000/api/chat`

# ghost
