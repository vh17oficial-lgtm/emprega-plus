-- ============================================
-- EMPREGA+ SUPABASE MIGRATION
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================

-- 1. PROFILES (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  nome text not null,
  email text not null,
  telefone text default '',
  cidade text default '',
  estado text default '',
  foto_perfil_url text default '',
  role text default 'user' check (role in ('user', 'admin')),
  send_credits integer default 1,
  auto_dispatch_access boolean default false,
  daily_dispatch_limit integer default 0,
  daily_dispatch_used integer default 0,
  daily_dispatch_unlimited boolean default false,
  last_dispatch_date text default '',
  is_priority_user boolean default false,
  pdf_download_access boolean default false,
  purchase_history jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, email, foto_perfil_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'nome',
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      ''
    ),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. JOBS
create table public.jobs (
  id bigint generated always as identity primary key,
  title text not null,
  company text not null,
  logo text default '',
  location text default '',
  description text default '',
  category text default '',
  work_type text default '',
  level text default '',
  salary text default '',
  carga_horaria text default '',
  badges jsonb default '[]'::jsonb,
  informal boolean default false,
  status text default 'ativa' check (status in ('ativa', 'encerrada')),
  created_at timestamptz default now(),
  closed_at timestamptz
);

-- 3. APPLICATIONS
create table public.applications (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  job_id bigint references public.jobs(id) on delete cascade not null,
  resume_id bigint,
  status text default 'enviada' check (status in ('enviada', 'em_analise', 'pre_selecionado', 'encerrada')),
  applied_at timestamptz default now(),
  unique(user_id, job_id)
);

-- 4. RESUMES
create table public.resumes (
  id bigint generated always as identity primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text default 'form' check (type in ('form', 'upload')),
  template text default 'classico',
  data jsonb default '{}'::jsonb,
  file_name text default '',
  file_size text default '',
  created_at timestamptz default now()
);

-- 5. CHAT CONVERSATIONS
create table public.chat_conversations (
  id text primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  user_name text default '',
  status text default 'active' check (status in ('active', 'resolved')),
  last_message text default '',
  last_message_at timestamptz default now(),
  unread_admin integer default 0,
  unread_user integer default 0,
  ticket_created boolean default false
);

-- 6. CHAT MESSAGES
create table public.chat_messages (
  id text primary key,
  conversation_id text references public.chat_conversations(id) on delete cascade not null,
  sender text not null check (sender in ('user', 'admin')),
  text text not null,
  created_at timestamptz default now()
);

-- 7. SITE CONFIG (single row)
create table public.site_config (
  id integer primary key default 1 check (id = 1),
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- 8. SEND PLANS
create table public.send_plans (
  id text primary key,
  name text not null,
  credits integer not null,
  price numeric(10,2) not null,
  active boolean default true,
  popular boolean default false,
  sort_order integer default 0
);

-- 9. DISPATCH CONFIG (single row)
create table public.dispatch_config (
  id integer primary key default 1 check (id = 1),
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- 10. UPSELL TEXTS (single row)
create table public.upsell_texts (
  id integer primary key default 1 check (id = 1),
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- 11. COMPANIES
create table public.companies (
  id bigint generated always as identity primary key,
  name text not null,
  logo text default '',
  active boolean default true
);

-- 12. TESTIMONIALS
create table public.testimonials (
  id bigint generated always as identity primary key,
  name text not null,
  role text default '',
  text text default '',
  photo text default '',
  stars integer default 5,
  active boolean default true
);

-- 13. VIDEOS
create table public.videos (
  id bigint generated always as identity primary key,
  title text not null,
  duration text default '',
  url text default '',
  icon text default '🎬',
  thumb text default '',
  active boolean default true
);

-- 14. SOCIAL PROOF CONFIG (single row)
create table public.social_proof_config (
  id integer primary key default 1 check (id = 1),
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- 15. ROTATION CONFIG (single row)
create table public.rotation_config (
  id integer primary key default 1 check (id = 1),
  config jsonb not null default '{}'::jsonb,
  last_rotation timestamptz,
  updated_at timestamptz default now()
);

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Default send plans
insert into public.send_plans (id, name, credits, price, active, popular, sort_order) values
  ('send-10', '10 Envios', 10, 4.99, true, false, 1),
  ('send-20', '20 Envios', 20, 8.99, true, false, 2),
  ('send-50', '50 Envios', 50, 14.99, true, true, 3);

-- Default dispatch config
insert into public.dispatch_config (id, config) values (1, '{
  "basePrice": 9.99,
  "initialDailyLimit": 10,
  "upgrades": [
    {"id": "dispatch-10", "label": "+10 disparos/dia", "amount": 10, "price": 4.99},
    {"id": "dispatch-20", "label": "+20 disparos/dia", "amount": 20, "price": 8.99},
    {"id": "dispatch-50", "label": "+50 disparos/dia", "amount": 50, "price": 19.99},
    {"id": "dispatch-unlimited", "label": "Ilimitado", "amount": -1, "price": 69.99}
  ]
}'::jsonb);

-- Default upsell texts
insert into public.upsell_texts (id, config) values (1, '{
  "sendLimitTitle": "Você atingiu o limite de envios",
  "sendLimitText": "Para continuar se candidatando, escolha um pacote abaixo:",
  "dispatchLockedTitle": "Desbloqueie o Disparo Automático",
  "dispatchLockedText": "Envie seu currículo para dezenas de vagas automaticamente com apenas um clique.",
  "dispatchLimitTitle": "Limite diário atingido",
  "dispatchLimitText": "Aumente seu limite diário de disparos automáticos:"
}'::jsonb);

-- Default social proof config
insert into public.social_proof_config (id, config) values (1, '{
  "enabled": true,
  "intervalMin": 8,
  "intervalMax": 20,
  "displayDuration": 5,
  "timeFormat": "relative",
  "noRepeat": true,
  "messages": [
    {"id": 1, "icon": "📄", "template": "{nome} acabou de criar um currículo", "active": true},
    {"id": 2, "icon": "✅", "template": "{nome} se candidatou a uma vaga", "active": true},
    {"id": 3, "icon": "🎉", "template": "{nome} foi pré-selecionado para uma vaga", "active": true},
    {"id": 4, "icon": "🚀", "template": "{nome} ativou o disparo automático", "active": true}
  ]
}'::jsonb);

-- Default rotation config
insert into public.rotation_config (id, config) values (1, '{
  "enabled": false,
  "intervalDays": 7,
  "rotateCount": 5,
  "closedMessages": ["Vaga preenchida", "Processo encerrado", "Encerrada pelo recrutador"]
}'::jsonb);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.resumes enable row level security;
alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;
alter table public.site_config enable row level security;
alter table public.send_plans enable row level security;
alter table public.dispatch_config enable row level security;
alter table public.upsell_texts enable row level security;
alter table public.companies enable row level security;
alter table public.testimonials enable row level security;
alter table public.videos enable row level security;
alter table public.social_proof_config enable row level security;
alter table public.rotation_config enable row level security;

-- PROFILES: users can read/update their own, admins can read all
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can update any profile" on public.profiles for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- JOBS: anyone can read, admins can manage
create policy "Anyone can view jobs" on public.jobs for select using (true);
create policy "Admins can insert jobs" on public.jobs for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can update jobs" on public.jobs for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can delete jobs" on public.jobs for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- APPLICATIONS: users see own, admins see all
create policy "Users can view own applications" on public.applications for select using (auth.uid() = user_id);
create policy "Users can insert own applications" on public.applications for insert with check (auth.uid() = user_id);
create policy "Users can update own applications" on public.applications for update using (auth.uid() = user_id);
create policy "Admins can view all applications" on public.applications for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can update all applications" on public.applications for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- RESUMES: users see own
create policy "Users can view own resumes" on public.resumes for select using (auth.uid() = user_id);
create policy "Users can insert own resumes" on public.resumes for insert with check (auth.uid() = user_id);
create policy "Users can update own resumes" on public.resumes for update using (auth.uid() = user_id);
create policy "Users can delete own resumes" on public.resumes for delete using (auth.uid() = user_id);
create policy "Admins can view all resumes" on public.resumes for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- CHAT: users see own conversations, admins see all
create policy "Users can view own conversations" on public.chat_conversations for select using (auth.uid() = user_id);
create policy "Users can insert own conversations" on public.chat_conversations for insert with check (auth.uid() = user_id);
create policy "Users can update own conversations" on public.chat_conversations for update using (auth.uid() = user_id);
create policy "Admins can view all conversations" on public.chat_conversations for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can update all conversations" on public.chat_conversations for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

create policy "Users can view own messages" on public.chat_messages for select using (
  exists (select 1 from public.chat_conversations where id = chat_messages.conversation_id and user_id = auth.uid())
);
create policy "Users can insert own messages" on public.chat_messages for insert with check (
  exists (select 1 from public.chat_conversations where id = chat_messages.conversation_id and user_id = auth.uid())
);
create policy "Admins can view all messages" on public.chat_messages for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can insert messages" on public.chat_messages for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- PUBLIC TABLES (anyone can read, admins can manage)
-- Site Config
create policy "Anyone can read site_config" on public.site_config for select using (true);
create policy "Admins can update site_config" on public.site_config for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can insert site_config" on public.site_config for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Send Plans
create policy "Anyone can read send_plans" on public.send_plans for select using (true);
create policy "Admins can manage send_plans" on public.send_plans for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Dispatch Config
create policy "Anyone can read dispatch_config" on public.dispatch_config for select using (true);
create policy "Admins can update dispatch_config" on public.dispatch_config for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can insert dispatch_config" on public.dispatch_config for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Upsell Texts
create policy "Anyone can read upsell_texts" on public.upsell_texts for select using (true);
create policy "Admins can update upsell_texts" on public.upsell_texts for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can insert upsell_texts" on public.upsell_texts for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Companies
create policy "Anyone can read companies" on public.companies for select using (true);
create policy "Admins can manage companies" on public.companies for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Testimonials
create policy "Anyone can read testimonials" on public.testimonials for select using (true);
create policy "Admins can manage testimonials" on public.testimonials for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Videos
create policy "Anyone can read videos" on public.videos for select using (true);
create policy "Admins can manage videos" on public.videos for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Social Proof Config
create policy "Anyone can read social_proof_config" on public.social_proof_config for select using (true);
create policy "Admins can update social_proof_config" on public.social_proof_config for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can insert social_proof_config" on public.social_proof_config for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Rotation Config
create policy "Anyone can read rotation_config" on public.rotation_config for select using (true);
create policy "Admins can update rotation_config" on public.rotation_config for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
create policy "Admins can insert rotation_config" on public.rotation_config for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ============================================
-- ENABLE REALTIME for chat tables
-- ============================================
alter publication supabase_realtime add table public.chat_conversations;
alter publication supabase_realtime add table public.chat_messages;
