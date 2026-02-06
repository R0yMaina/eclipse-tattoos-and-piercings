/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting configuration
const RATE_LIMIT_REQUESTS = 20; // Max requests per window
const RATE_LIMIT_WINDOW_SECONDS = 60; // Window in seconds

interface Citation {
  index: number;
  url: string;
  title: string;
  snippet: string;
}

interface Chunk {
  url: string;
  title?: string;
  content: string;
}

async function logSecurityEvent(
  eventType: string,
  severity: 'info' | 'warn' | 'error',
  ipAddress: string,
  details: Record<string, unknown>
): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    await fetch(`${supabaseUrl}/rest/v1/security_events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        event_type: eventType,
        severity,
        ip_address: ipAddress,
        details
      })
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const upstashUrl = Deno.env.get('UPSTASH_REDIS_REST_URL');
  const upstashToken = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');

  if (!upstashUrl || !upstashToken) {
    console.warn('Upstash Redis not configured, skipping rate limiting');
    return { allowed: true, remaining: RATE_LIMIT_REQUESTS, resetIn: 0 };
  }

  const key = `ratelimit:chat:${ip}`;

  try {
    // Get current count
    const getResponse = await fetch(`${upstashUrl}/get/${key}`, {
      headers: { Authorization: `Bearer ${upstashToken}` },
    });
    const getData = await getResponse.json();
    const currentCount = parseInt(getData.result || '0', 10);

    if (currentCount >= RATE_LIMIT_REQUESTS) {
      // Get TTL to know when limit resets
      const ttlResponse = await fetch(`${upstashUrl}/ttl/${key}`, {
        headers: { Authorization: `Bearer ${upstashToken}` },
      });
      const ttlData = await ttlResponse.json();
      const resetIn = Math.max(0, parseInt(ttlData.result || '0', 10));

      return { allowed: false, remaining: 0, resetIn };
    }

    // Increment counter with pipeline
    const newCount = currentCount + 1;

    if (currentCount === 0) {
      // First request in window - set with expiry
      await fetch(`${upstashUrl}/setex/${key}/${RATE_LIMIT_WINDOW_SECONDS}/${newCount}`, {
        headers: { Authorization: `Bearer ${upstashToken}` },
      });
    } else {
      // Increment existing key
      await fetch(`${upstashUrl}/incr/${key}`, {
        headers: { Authorization: `Bearer ${upstashToken}` },
      });
    }

    return {
      allowed: true,
      remaining: RATE_LIMIT_REQUESTS - newCount,
      resetIn: RATE_LIMIT_WINDOW_SECONDS
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open - allow request if Redis is unavailable
    return { allowed: true, remaining: RATE_LIMIT_REQUESTS, resetIn: 0 };
  }
}

function getClientIP(req: Request): string {
  // Check various headers for the real IP
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = req.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfIP = req.headers.get('cf-connecting-ip');
  if (cfIP) {
    return cfIP;
  }

  return 'unknown';
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check rate limit first
    const clientIP = getClientIP(req);
    const rateLimit = await checkRateLimit(clientIP);

    if (!rateLimit.allowed) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);

      // Log rate limit event for monitoring
      await logSecurityEvent('rate_limit_exceeded', 'warn', clientIP, {
        endpoint: 'chat',
        resetIn: rateLimit.resetIn
      });

      return new Response(
        JSON.stringify({
          error: 'Too many requests. Please wait before sending more messages.',
          retryAfter: rateLimit.resetIn
        }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimit.resetIn),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.resetIn)
          },
        }
      );
    }

    const { message, sessionId, clientToken } = await req.json();

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openrouterKey = Deno.env.get('OPENROUTER_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get or create session
    let session = null;
    if (sessionId) {
      const { data } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .maybeSingle();
      session = data;
    }

    if (!session && clientToken) {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({ client_token: clientToken, title: message.substring(0, 50) })
        .select()
        .single();

      if (error) throw error;
      session = data;
    }

    if (!session) {
      throw new Error('Could not create or find session');
    }

    // Save user message
    const { data: userMsg, error: userMsgError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: session.id,
        role: 'user',
        content: message,
      })
      .select()
      .single();

    if (userMsgError) throw userMsgError;

    // Retrieve context from RAG
    const embedResponse = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://eclipse-tattoo-and-piercings.lovable.app/',
        'X-Title': 'Eclipse AI Concierge',
      },
      body: JSON.stringify({
        model: 'openai/text-embedding-3-small',
        input: message,
      }),
    });

    if (!embedResponse.ok) {
      console.error('Embedding error:', await embedResponse.text());
      throw new Error('Failed to create embedding');
    }

    const embedData = await embedResponse.json();
    const embedding = embedData.data[0].embedding;

    // Vector search
    const { data: chunks, error: searchError } = await supabase.rpc('match_chunks', {
      query_embedding: embedding,
      match_threshold: 0.2,
      match_count: 6,
    });

    if (searchError) {
      console.error('Search error:', searchError);
    }

    // Build context
    let context = '';
    const citations: Citation[] = [];

    if (chunks && chunks.length > 0) {
      context = (chunks as Chunk[]).map((c: Chunk, idx: number) => {
        citations.push({
          index: idx + 1,
          url: c.url,
          title: c.title || c.url,
          snippet: c.content.substring(0, 150),
        });
        return `[${idx + 1}] ${c.content}`;
      }).join('\n\n');
    }

    // System prompt
    const systemPrompt = `You are Eclipse AI Concierge for Eclipse Tattoo & Piercings.

Voice: Refined, confident, minimal, luxurious.

Goals:
- Answer accurately using the provided CONTEXT from the site
- Provide clear booking guidance
- Be concise and premium in tone
- When uncertain, ask a clarifying question or route to contact

Safety:
- No medical, legal, or aftercare advice beyond studio-provided guidance
- Advise professional consultation for health questions

Always cite sources as [1], [2], etc. when answers are based on retrieved documents.
Offer next steps (book, view services, pricing, contact) with clear CTAs.
Keep formatting readable and mobile-friendly.

${context ? `\n\nCONTEXT from Eclipse's site:\n${context}` : '\n\nNo specific context available. Provide helpful general guidance and suggest contacting the studio for details.'}`;

    // Get chat history
    const { data: history } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })
      .limit(10);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).slice(0, -1).map((h: { role: string; content: string }) => ({
        role: h.role,
        content: h.content,
      })),
      { role: 'user', content: message },
    ];

    // Stream response from OpenRouter
    const chatResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://eclipse-tattoo-and-piercings.lovable.app/',
        'X-Title': 'Eclipse AI Concierge',
        'X-Omit-Reasoning': 'true',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1',
        messages,
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1000,
        stream: true,
      }),
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      console.error('OpenRouter error:', errorText);
      throw new Error('Failed to get response from AI');
    }

    // Stream to client and collect response
    const encoder = new TextEncoder();
    let fullResponse = '';

    const stream = new ReadableStream({
      async start(controller) {
        const reader = chatResponse.body!.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  // Save assistant message with citations
                  await supabase
                    .from('chat_messages')
                    .insert({
                      session_id: session.id,
                      role: 'assistant',
                      content: fullResponse,
                      citations: citations.length > 0 ? citations : null,
                    });

                  controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;

                  if (content) {
                    fullResponse += content;
                    controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                  }
                } catch (e) {
                  console.error('Parse error:', e);
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});