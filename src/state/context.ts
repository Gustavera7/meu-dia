import { createContext } from 'react'
import type { AppState, DayPlan, ISODate } from '@/core/types'
import type { Action } from './actions'
import type { SyncSnapshot } from '@/data/sync'
import type { Conta } from '@/data/auth'

export interface AppContextValue {
  state: AppState
  dispatch: (action: Action) => void
  /** Data corrente do app. Vira sozinha quando o dia muda. */
  today: ISODate
  /** Plano do dia pedido, criado na hora se ainda nao existir. */
  planFor: (date: ISODate) => DayPlan
  /** Estado da sincronizacao entre aparelhos. */
  sync: SyncSnapshot
  /** Forca um envio agora, sem esperar o intervalo. */
  syncNow: () => void
  /** Conta conectada, ou null para uso sem login. */
  conta: Conta | null
  /** A sessao ja foi verificada? Evita piscar a tela de login. */
  authPronto: boolean
  sairDaConta: () => void
}

/**
 * O contexto mora num arquivo proprio para que AppContext.tsx exporte
 * apenas um componente. Isso mantem o Fast Refresh funcionando e evita
 * que qualquer edicao no provider derrube o estado da sessao.
 */
export const AppContext = createContext<AppContextValue | null>(null)
