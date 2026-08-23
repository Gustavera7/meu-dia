import type { AppState } from '@/core/types'
import type { StorageAdapter } from './types'
import { SyncError } from './types'
import { supabase } from '../auth'
import { TABELA } from '../supabaseConfig'

/**
 * Nuvem por conta, no Supabase.
 *
 * Uma linha por usuario, protegida por Row Level Security: a chave que vai
 * no navegador so alcanca a propria linha. O estado vai inteiro num campo
 * jsonb, e a juncao entre aparelhos continua sendo feita no cliente, em
 * `merge.ts`, registro a registro.
 */

let contaId: string | null = null

export function setContaSincronizada(id: string | null): void {
  contaId = id
}

export const supabaseAdapter: StorageAdapter = {
  id: 'nuvem',
  label: 'Sua conta',

  async available() {
    return supabase() !== null && contaId !== null
  },

  /**
   * Devolve null apenas quando a conta ainda nao tem linha (primeira
   * sincronizacao). Falha de rede e lancada: tratar erro como "nao ha nada
   * la" faria este aparelho publicar por cima e apagar o outro.
   */
  async read() {
    const sb = supabase()
    if (!sb || !contaId) throw new SyncError('indisponivel', 'Sem conta conectada.')

    const { data, error } = await sb
      .from(TABELA)
      .select('data')
      .eq('user_id', contaId)
      .maybeSingle()

    if (error) throw new SyncError('falha', error.message)
    if (!data?.data) return null

    const estado = data.data as AppState
    return estado?.profile ? estado : null
  },

  async write(state) {
    const sb = supabase()
    if (!sb || !contaId) throw new SyncError('indisponivel', 'Sem conta conectada.')

    const { error } = await sb.from(TABELA).upsert({
      user_id: contaId,
      data: state,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      const m = error.message.toLowerCase()
      if (m.includes('row-level security') || m.includes('permission')) {
        throw new SyncError('sem_permissao', error.message)
      }
      throw new SyncError('falha', error.message)
    }
  },
}
