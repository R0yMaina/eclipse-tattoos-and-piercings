-- Enable pgvector extension for vector operations
create extension if not exists vector;

-- Documents table: stores metadata about crawled pages
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  url text unique not null,
  title text,
  hash text,
  chunk_count int default 0,
  updated_at timestamptz default now()
);

-- Chunks table: stores document chunks with embeddings
create table public.chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents(id) on delete cascade,
  url text not null,
  chunk_index int not null,
  content text not null,
  embedding vector(768),
  updated_at timestamptz default now()
);

-- Chat sessions table: stores chat conversation sessions
create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  client_token text not null,
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Chat messages table: stores individual messages in conversations
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.chat_sessions(id) on delete cascade,
  role text check (role in ('user','assistant','tool')) not null,
  content text not null,
  citations jsonb,
  tokens int,
  created_at timestamptz default now()
);

-- Message feedback table: stores user feedback on messages
create table public.message_feedback (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references public.chat_messages(id) on delete cascade,
  rating int check (rating in (-1,1)),
  comment text,
  created_at timestamptz default now()
);

-- Create indexes for performance
create index on public.chunks(document_id);
create index on public.chunks(url);
create index on public.chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index on public.chat_sessions(client_token);
create index on public.chat_messages(session_id);

-- Enable RLS on all tables
alter table public.documents enable row level security;
alter table public.chunks enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.message_feedback enable row level security;

-- Create policies: Only service role can access (all access through server-side functions)
-- No public access to any of these tables

-- Documents policies
create policy "Service role only" on public.documents
  for all
  using (false);

-- Chunks policies  
create policy "Service role only" on public.chunks
  for all
  using (false);

-- Chat sessions policies
create policy "Service role only" on public.chat_sessions
  for all
  using (false);

-- Chat messages policies
create policy "Service role only" on public.chat_messages
  for all
  using (false);

-- Message feedback policies
create policy "Service role only" on public.message_feedback
  for all
  using (false);