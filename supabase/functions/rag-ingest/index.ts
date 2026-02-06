/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_URLS = [
  'https://eclipse-tattoo-and-piercings.lovable.app/',
  'https://eclipse-tattoo-and-piercings.lovable.app/about',
  'https://eclipse-tattoo-and-piercings.lovable.app/services',
  'https://eclipse-tattoo-and-piercings.lovable.app/pricing',
  'https://eclipse-tattoo-and-piercings.lovable.app/contact',
];

function chunkText(text: string, maxTokens = 900, overlap = 50): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let i = 0;

  while (i < words.length) {
    const chunk = words.slice(i, i + maxTokens).join(' ');
    chunks.push(chunk);
    i += maxTokens - overlap;
  }

  return chunks;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openrouterKey = Deno.env.get('OPENROUTER_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    let totalChunks = 0;
    let totalDocs = 0;

    for (const url of SITE_URLS) {
      console.log(`Processing: ${url}`);

      // Fetch page
      const response = await fetch(url);
      const html = await response.text();

      // Parse HTML
      const doc = new DOMParser().parseFromString(html, 'text/html');
      if (!doc) continue;

      // Remove unwanted elements
      const unwanted = doc.querySelectorAll('nav, footer, script, style, noscript');
      unwanted.forEach(el => el.parentNode?.removeChild(el));

      // Extract title and content
      const titleEl = doc.querySelector('title');
      const title = titleEl?.textContent?.trim() || url;

      const mainEl = doc.querySelector('main') || doc.querySelector('body');
      const content = mainEl?.textContent?.trim() || '';

      if (!content) continue;

      // Clean content
      const cleanContent = content
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, '\n')
        .trim();

      // Chunk content
      const chunks = chunkText(cleanContent);

      // Check if document exists
      const { data: existingDoc } = await supabase
        .from('documents')
        .select('id')
        .eq('url', url)
        .maybeSingle();

      let docId = existingDoc?.id;

      if (!docId) {
        // Create document
        const { data: newDoc, error: docError } = await supabase
          .from('documents')
          .insert({
            url,
            title,
            chunk_count: chunks.length,
          })
          .select()
          .single();

        if (docError) throw docError;
        docId = newDoc.id;
        totalDocs++;
      } else {
        // Update document
        await supabase
          .from('documents')
          .update({ title, chunk_count: chunks.length, updated_at: new Date().toISOString() })
          .eq('id', docId);

        // Delete old chunks
        await supabase
          .from('chunks')
          .delete()
          .eq('document_id', docId);
      }

      // Create embeddings and insert chunks
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];

        // Create embedding
        const embedResponse = await fetch('https://openrouter.ai/api/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openrouterKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'openai/text-embedding-3-small',
            input: chunk,
          }),
        });

        if (!embedResponse.ok) {
          console.error('Embedding error for chunk:', chunk.substring(0, 50));
          continue;
        }

        const embedData = await embedResponse.json();
        const embedding = embedData.data[0].embedding;

        // Insert chunk
        const { error: chunkError } = await supabase
          .from('chunks')
          .insert({
            document_id: docId,
            url,
            chunk_index: i,
            content: chunk,
            embedding,
          });

        if (chunkError) {
          console.error('Chunk insert error:', chunkError);
        } else {
          totalChunks++;
        }
      }

      console.log(`✓ ${url}: ${chunks.length} chunks`);
    }

    return new Response(JSON.stringify({
      success: true,
      totalDocuments: totalDocs,
      totalChunks,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Ingest error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
