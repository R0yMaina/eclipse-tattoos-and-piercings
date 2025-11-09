import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
    const citations: any[] = [];
    
    if (chunks && chunks.length > 0) {
      context = chunks.map((c: any, idx: number) => {
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
      ...(history || []).slice(0, -1).map((h: any) => ({
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