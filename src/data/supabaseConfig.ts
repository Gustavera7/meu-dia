/**
 * Conexao com o Supabase.
 *
 * A chave abaixo e a chave ANONIMA do projeto: ela nasce para ficar no
 * navegador e nao da acesso a nada sozinha. Quem protege os dados e a
 * Row Level Security no banco, definida em `supabase-schema.sql`: cada
 * conta so enxerga a propria linha.
 *
 * Para usar um projeto proprio, troque estes dois valores por
 * Project URL e anon key (Supabase, Settings, API) e rode o SQL do
 * arquivo `supabase-schema.sql` no editor do painel.
 */
export const SUPABASE_URL = 'https://yeilsajnttrmkxnewpun.supabase.co'
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllaWxzYWpudHRybWt4bmV3cHVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4Mjk5MDAsImV4cCI6MjEwMjQwNTkwMH0.dqFnTtaiwKKuEPbFK4xfguM9rJFYqW4cEwMCn_x7UqY'

/** Tabela propria deste app, separada do controle financeiro. */
export const TABELA = 'meudia_state'

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
