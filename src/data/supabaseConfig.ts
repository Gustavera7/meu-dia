/**
 * Conexao com o Supabase deste app.
 *
 * O Prumo tem projeto PROPRIO, separado de qualquer outro app. Enquanto
 * estes dois valores estiverem vazios, o app funciona normalmente guardando
 * tudo no aparelho: apenas login e sincronizacao ficam indisponiveis.
 *
 * A URL e a do PROJETO, sem `/rest/v1/` no final: o cliente monta os
 * caminhos sozinho a partir dela.
 *
 * A chave anonima nasce para ficar no navegador e nao da acesso a nada
 * sozinha: quem protege os dados e a Row Level Security do banco.
 * NUNCA coloque aqui a chave `service_role` — essa ignora a RLS e daria
 * acesso a tudo para qualquer pessoa que abrisse o site.
 */
export const SUPABASE_URL = 'https://crekkxoqlbjhreyxvqxl.supabase.co'
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyZWtreG9xbGJqaHJleXh2cXhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MjExOTAsImV4cCI6MjEwMzA5NzE5MH0.cmsqGz3NIRvZ8E8VCjupWIzDRBGlrCXg6xfGIXWMfrc'

/**
 * Tabela deste app dentro do projeto.
 * Mantem o nome antigo de proposito: renomear exigiria rodar SQL de novo
 * e migrar as linhas existentes, sem nenhum ganho para quem usa o app.
 */
export const TABELA = 'meudia_state'

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
