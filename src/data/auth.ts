import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from './supabaseConfig'

/**
 * Contas.
 *
 * O login existe para dois motivos: separar os dados de cada pessoa e
 * permitir abrir o mesmo perfil no celular e no computador. Quem nao quiser
 * conta continua usando o app: os dados ficam no aparelho.
 */

export interface Conta {
  id: string
  email: string
}

let cliente: SupabaseClient | null = null

export function supabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null
  cliente ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true },
  })
  return cliente
}

export function authDisponivel(): boolean {
  return supabase() !== null
}

function paraConta(user: User | null): Conta | null {
  return user ? { id: user.id, email: user.email ?? '' } : null
}

export async function contaAtual(): Promise<Conta | null> {
  const sb = supabase()
  if (!sb) return null
  const { data } = await sb.auth.getSession()
  return paraConta(data.session?.user ?? null)
}

export function onContaChange(fn: (conta: Conta | null) => void): () => void {
  const sb = supabase()
  if (!sb) return () => {}
  const { data } = sb.auth.onAuthStateChange((_evento, session) => {
    fn(paraConta(session?.user ?? null))
  })
  return () => data.subscription.unsubscribe()
}

/** Traduz o que o Supabase devolve para algo que ajuda a resolver. */
export function traduzErro(mensagem: string): string {
  const m = mensagem.toLowerCase()
  if (m.includes('invalid login')) return 'E-mail ou senha nao conferem.'
  if (m.includes('already registered')) return 'Ja existe uma conta com esse e-mail. Tente entrar.'
  if (m.includes('rate limit')) return 'Muitas tentativas seguidas. Espere um minuto.'
  if (m.includes('valid email')) return 'Esse e-mail nao parece valido.'
  if (m.includes('password')) return 'A senha precisa de pelo menos 6 caracteres.'
  if (m.includes('failed to fetch')) return 'Sem conexao com o servidor agora.'
  return mensagem
}

export async function entrar(email: string, senha: string): Promise<string | null> {
  const sb = supabase()
  if (!sb) return 'Login indisponivel nesta versao.'
  const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: senha })
  return error ? traduzErro(error.message) : null
}

export async function criarConta(email: string, senha: string): Promise<string | null> {
  const sb = supabase()
  if (!sb) return 'Login indisponivel nesta versao.'
  const { data, error } = await sb.auth.signUp({ email: email.trim(), password: senha })
  if (error) return traduzErro(error.message)
  // Sem sessao imediata o projeto exige confirmacao por e-mail.
  if (!data.session) return 'Conta criada. Confirme pelo e-mail que enviamos e depois entre.'
  return null
}

export async function sair(): Promise<void> {
  await supabase()?.auth.signOut()
}

export async function recuperarSenha(email: string): Promise<string | null> {
  const sb = supabase()
  if (!sb) return 'Indisponivel nesta versao.'
  const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: window.location.origin + window.location.pathname,
  })
  return error ? traduzErro(error.message) : null
}
