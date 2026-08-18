-- Royal Palms Realty — Supabase schema
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
-- Safe to re-run: every statement uses "if not exists" / "on conflict do nothing".

-- Generic key/value config — currently just holds the admin password and the
-- OpenAI knowledge-base vector store ID, but built to hold future one-off
-- settings without needing a new table each time.
create table if not exists app_config (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- Set (or change) the admin password by running this any time:
--   insert into app_config (key, value) values ('admin_password', 'your-password-here')
--   on conflict (key) do update set value = excluded.value, updated_at = now();
insert into app_config (key, value)
values ('admin_password', 'CHANGE-ME-BEFORE-USE')
on conflict (key) do nothing;

create table if not exists blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  seo_title text not null,
  meta_description text not null default '',
  category text not null,
  tags text[] not null default '{}',
  author text not null,
  body text not null default '',
  cover_image text,
  cover_image_alt text,
  status text not null default 'draft' check (status in ('draft', 'pending_approval', 'published')),
  created_at timestamptz not null default now(),
  published_at timestamptz,
  cta_text text,
  cta_href text,
  verify_warnings text[] not null default '{}',
  related_slugs text[]
);

-- Placeholder seed posts used to exist here so the blog wasn't empty before
-- the AI writer worked. Removed per Scott's request — the blog now only ever
-- shows posts actually generated/edited/published through the admin panel.

-- Lead queue — flexible jsonb payload since contact/home-value/neighborhood-
-- alert/chatbot forms each collect different fields. Replaces .data/leads.jsonl.
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  tags text[] not null default '{}',
  payload jsonb not null,
  ghl_error text,
  created_at timestamptz not null default now()
);

-- Chatbot knowledge-base file metadata — the actual document content lives
-- on OpenAI's servers (Files API + vector store); this just tracks what's
-- been uploaded so the admin page can list/delete without extra API calls.
create table if not exists knowledge_base_files (
  id uuid primary key default gen_random_uuid(),
  openai_file_id text not null,
  filename text not null,
  size_bytes bigint not null,
  status text not null default 'processing' check (status in ('processing', 'ready', 'failed')),
  uploaded_at timestamptz not null default now()
);
