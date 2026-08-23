/**
 * Conexao com o Supabase deste app.
 *
 * O Meu Dia tem projeto PROPRIO, separado de qualquer outro app. Enquanto
 * estes dois valores estiverem vazios, o app funciona normalmente guardando
 * tudo no aparelho: apenas login e sincronizacao ficam indisponiveis.
 *
 * Para ligar:
 *   1. Crie um projeto no Supabase.
 *   2. Rode o conteudo de `supabase-schema.sql` no SQL Editor do projeto.
 *   3. Cole abaixo a Project URL e a chave ANONIMA (anon / publishable).
 *
 * A chave anonima nasce para ficar no navegador e nao da acesso a nada
 * sozinha: quem protege os dados e a Row Level Security do banco.
 * NUNCA coloque aqui a chave `service_role` — essa ignora a RLS e daria
 * acesso a tudo para qualquer pessoa que abrisse o site.
 */
export const SUPABASE_URL = ''
export const SUPABASE_ANON_KEY = ''

/** Tabela deste app dentro do projeto. */
export const TABELA = 'meudia_state'

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
