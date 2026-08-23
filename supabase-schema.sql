-- Meu Dia — esquema do Supabase
-- Cole este bloco inteiro em: Supabase Dashboard -> SQL Editor -> Run.
--
-- Cria a tabela de estado por usuario com Row Level Security ligada:
-- cada conta le e escreve apenas a propria linha. Sem a RLS, a chave
-- anonima que vai no navegador daria acesso aos dados de todo mundo.

create table if not exists public.meudia_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.meudia_state enable row level security;

drop policy if exists "own state" on public.meudia_state;
create policy "own state" on public.meudia_state
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
