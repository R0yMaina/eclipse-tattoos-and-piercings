-- Create vector similarity search function
create or replace function match_chunks(
  query_embedding vector(768),
  match_threshold float default 0.2,
  match_count int default 6
)
returns table (
  id uuid,
  document_id uuid,
  url text,
  content text,
  similarity float
)
language sql stable
as $$
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