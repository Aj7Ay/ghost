import type { VercelRequest, VercelResponse } from '@vercel/node';

interface ChatRequest {
  message: string;
  provider: 'openrouter' | 'groq';
  model?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

interface OpenRouterResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

interface GroqResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, provider, model, conversationHistory = [] }: ChatRequest = req.body;

    if (!message || !provider) {
      return res.status(400).json({ error: 'Message and provider are required' });
    }

    let response: Response;
    let responseData: OpenRouterResponse | GroqResponse;

    if (provider === 'openrouter') {
      const openRouterApiKey = process.env.OPENROUTER_API_KEY;
      if (!openRouterApiKey) {
        return res.status(500).json({ error: 'OpenRouter API key not configured' });
      }

      const selectedModel = model || 'openai/gpt-4o-mini';
      
      // Build messages array with system prompt for Kubernetes context
      const messages = [
        {
          role: 'system',
          content: 'You are a helpful Kubernetes assistant. You help users understand Kubernetes concepts, troubleshoot issues, and provide guidance on best practices. Be concise, clear, and educational.'
        },
        ...conversationHistory,
        {
          role: 'user',
          content: message
        }
      ];

      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || 'https://k8s-adventure.vercel.app',
          'X-Title': 'Kubernetes Explorer'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: messages
        })
      });

      responseData = await response.json() as OpenRouterResponse;

      if (!response.ok) {
        return res.status(response.status).json({ 
          error: 'OpenRouter API error', 
          details: responseData 
        });
      }

    } else if (provider === 'groq') {
      const groqApiKey = process.env.GROQ_API_KEY;
      if (!groqApiKey) {
        return res.status(500).json({ error: 'Groq API key not configured' });
      }

      const selectedModel = model || 'llama-3.1-8b-instant';
      
      // Build messages array with system prompt for Kubernetes context
      const messages = [
        {
          role: 'system',
          content: 'You are a helpful Kubernetes assistant. You help users understand Kubernetes concepts, troubleshoot issues, and provide guidance on best practices. Be concise, clear, and educational.'
        },
        ...conversationHistory,
        {
          role: 'user',
          content: message
        }
      ];

      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: messages
        })
      });

      responseData = await response.json() as GroqResponse;

      if (!response.ok) {
        return res.status(response.status).json({ 
          error: 'Groq API error', 
          details: responseData 
        });
      }
    } else {
      return res.status(400).json({ error: 'Invalid provider. Use "openrouter" or "groq"' });
    }

    // Extract the assistant's response
    const assistantMessage = responseData.choices?.[0]?.message?.content || 'No response generated';

    return res.status(200).json({
      success: true,
      message: assistantMessage,
      provider,
      model: selectedModel
    });

  } catch (error: any) {
    console.error('Chat API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}

