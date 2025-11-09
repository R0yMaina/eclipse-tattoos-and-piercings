-- Fix search_path for match_chunks function
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
SECURITY DEFINER
SET search_path = public
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