/// <reference lib="deno.ns" />
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Delete all chunks
    const { error: chunksError } = await supabase
      .from('chunks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (chunksError) throw chunksError;

    // Delete all documents
    const { error: docsError } = await supabase
      .from('documents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (docsError) throw docsError;

    // Trigger reingest
    const ingestResponse = await fetch(`${supabaseUrl}/functions/v1/rag-ingest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const ingestData = await ingestResponse.json();

    return new Response(JSON.stringify({
      success: true,
      message: 'Reindex complete',
      ...ingestData,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Reindex error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});