-- Update vector dimensions to match OpenAI embeddings (1536)
-- Drop existing chunks table and recreate with correct dimensions
DROP TABLE IF EXISTS public.chunks CASCADE;

CREATE TABLE public.chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536), -- Updated to 1536 for OpenAI text-embedding-3-small
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS chunks_embedding_idx ON public.chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Enable RLS
ALTER TABLE public.chunks ENABLE ROW LEVEL SECURITY;

-- Service role only policy
CREATE POLICY "Service role only" ON public.chunks
  FOR ALL
  USING (false);

-- Update the match_chunks function to work with 1536 dimensions
CREATE OR REPLACE FUNCTION public.match_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.2,
  match_count int DEFAULT 6
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  url text,
  content text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  select
    chunks.id,
    chunks.document_id,
    chunks.url,
    chunks.content,
    1 - (chunks.embedding <=> query_embedding) as similarity
  from chunks
  where 1 - (chunks.embedding <=> query_embedding) > match_threshold
  order by chunks.embedding <=> query_embedding
  limit match_count;
$$;