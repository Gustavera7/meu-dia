import type { AppState } from '@/core/types'

/**
 * Contrato de um destino de dados.
 *
 * O app inteiro so conhece esta interface. Trocar localStorage por nuvem,
 * ou por um servidor proprio no futuro, e escrever um novo adaptador.
 */
export interface StorageAdapter {
  readonly id: 'local' | 'nuvem'
  readonly label: string
  /** Le o estado guardado, ou null se nao houver nada la. */
  read(): Promise<AppState | null>
  /** Grava o estado. Rejeita com SyncError em caso de conflito. */
  write(state: AppState): Promise<void>
  /** O adaptador consegue funcionar neste contexto? */
  available(): Promise<boolean>
}

export type SyncErrorCode =
  | 'conflito'
  | 'sem_permissao'
  | 'indisponivel'
  | 'muito_grande'
  | 'excesso_de_escritas'
  | 'falha'

export class SyncError extends Error {
  constructor(
    readonly code: SyncErrorCode,
    message: string,
  ) {
    super(message)
    this.name = 'SyncError'
  }
}

export const SYNC_MESSAGES: Record<SyncErrorCode, string> = {
  conflito: 'Outro aparelho salvou antes. Juntando as duas versoes.',
  sem_permissao: 'Este acesso e somente leitura, entao nada foi enviado.',
  indisponivel: 'Sincronizacao nao disponivel aqui. Os dados seguem neste aparelho.',
  muito_grande: 'Os dados passaram do tamanho permitido para envio.',
  excesso_de_escritas: 'Muitas gravacoes seguidas. Vou tentar de novo em instantes.',
  falha: 'Nao consegui enviar agora. Tento de novo na proxima alteracao.',
}
