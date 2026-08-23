import type { AppState } from '@/core/types'
import { stamp } from '@/core/id'
import { cloudAdapter } from './adapters/cloud'
import { supabaseAdapter } from './adapters/supabase'
import { localAdapter } from './adapters/local'
import { SYNC_MESSAGES, SyncError, type StorageAdapter } from './adapters/types'
import { mergeStates, limparTumulos } from './merge'
import { normalize } from './storage'

/**
 * Sincronizacao entre aparelhos.
 *
 * Nao existe servidor arbitrando: cada aparelho grava o estado inteiro e a
 * juncao acontece na leitura, registro a registro, pelo `updatedAt`.
 * Por isso a ordem aqui e sempre PUXAR, JUNTAR e so entao ENVIAR.
 */

export type SyncStatus =
  | 'local'
  | 'verificando'
  | 'sincronizado'
  | 'pendente'
  | 'enviando'
  | 'erro'

export interface SyncSnapshot {
  status: SyncStatus
  message: string
  lastSyncedAt: string | null
  /** onde os dados estao sendo guardados */
  destino: string
}

/**
 * Antes de publicar guardamos o estado aqui. Em caso de conflito o runtime
 * recarrega a pagina, e o que estiver so na memoria some junto.
 */
const STASH = 'sistema-pessoal:pendente'

let adapter: StorageAdapter = localAdapter

/**
 * Trava de seguranca. Enquanto nao conseguirmos LER a nuvem, nao gravamos
 * nela: publicar sem saber o que ja esta la apagaria o outro aparelho.
 */
let leituraConfirmada = false
let snapshot: SyncSnapshot = {
  status: 'local',
  message: 'Guardando neste aparelho',
  lastSyncedAt: null,
  destino: localAdapter.label,
}

const ouvintes = new Set<(s: SyncSnapshot) => void>()

function anunciar(patch: Partial<SyncSnapshot>): void {
  snapshot = { ...snapshot, ...patch }
  for (const fn of ouvintes) fn(snapshot)
}

export function onSyncChange(fn: (s: SyncSnapshot) => void): () => void {
  ouvintes.add(fn)
  fn(snapshot)
  return () => ouvintes.delete(fn)
}

export function syncSnapshot(): SyncSnapshot {
  return snapshot
}

/**
 * Escolhe o destino dos dados, do mais especifico para o mais generico:
 * conta no Supabase (quando ha login), depois a nuvem do proprio artifact,
 * e por fim o aparelho. Trocar de destino zera a trava de leitura.
 */
export async function detectAdapter(): Promise<StorageAdapter> {
  const anterior = adapter.id

  if (await supabaseAdapter.available()) adapter = supabaseAdapter
  else if (await cloudAdapter.available()) adapter = cloudAdapter
  else adapter = localAdapter

  if (adapter.id !== anterior || adapter.label !== snapshot.destino) leituraConfirmada = false

  anunciar({
    destino: adapter.label,
    status: adapter.id === 'nuvem' ? 'verificando' : 'local',
    message:
      adapter.id === 'nuvem'
        ? 'Procurando alteracoes de outros aparelhos'
        : 'Guardando so neste aparelho',
    lastSyncedAt: null,
  })
  return adapter
}

export function isCloud(): boolean {
  return adapter.id === 'nuvem'
}

/** Recupera o que ficou pendente quando um conflito recarregou a pagina. */
function lerPendente(): AppState | null {
  try {
    const raw = sessionStorage.getItem(STASH)
    return raw ? normalize(JSON.parse(raw) as AppState) : null
  } catch {
    return null
  }
}

function limparPendente(): void {
  try {
    sessionStorage.removeItem(STASH)
  } catch {
    /* sem sessionStorage: seguimos sem rede de seguranca */
  }
}

/**
 * Junta o estado local com o que estiver na nuvem e com o que sobrou de um
 * conflito anterior. Devolve sempre um estado utilizavel, mesmo offline.
 */
export async function pull(local: AppState): Promise<AppState> {
  let resultado = local

  const pendente = lerPendente()
  if (pendente) {
    resultado = mergeStates(resultado, pendente)
    limparPendente()
  }

  if (adapter.id !== 'nuvem') {
    anunciar({ status: 'local', message: 'Guardando neste aparelho' })
    return resultado
  }

  try {
    const remoto = await adapter.read()
    if (remoto) resultado = mergeStates(resultado, normalize(remoto))
    leituraConfirmada = true
    anunciar({
      status: resultado.sync.dirtySince ? 'pendente' : 'sincronizado',
      message: remoto ? 'Dados juntados' : 'Primeira sincronizacao',
      lastSyncedAt: resultado.sync.lastSyncedAt,
    })
  } catch (err) {
    leituraConfirmada = false
    const detalhe = err instanceof SyncError ? err.message : ''
    anunciar({
      status: 'erro',
      message:
        detalhe ||
        'Nao consegui ler a nuvem. Nada sera enviado ate conseguir, para nao apagar o outro aparelho.',
    })
  }

  return limparTumulos(resultado)
}

/**
 * Envia o estado. Devolve o estado com as marcas de sincronizacao
 * atualizadas, ou o proprio estado se nao houver o que enviar.
 */
export async function push(state: AppState): Promise<AppState> {
  if (adapter.id !== 'nuvem') {
    await localAdapter.write(state)
    return state
  }

  if (!leituraConfirmada) {
    // Tenta de novo antes de desistir: pode ter sido uma falha passageira.
    try {
      await adapter.read()
      leituraConfirmada = true
    } catch {
      anunciar({
        status: 'erro',
        message: 'Envio bloqueado: ainda nao consegui ler a nuvem. Seus dados estao salvos neste aparelho.',
      })
      return state
    }
  }

  anunciar({ status: 'enviando', message: 'Enviando' })

  // Rede de seguranca antes de publicar: um conflito recarrega a pagina.
  try {
    sessionStorage.setItem(STASH, JSON.stringify(state))
  } catch {
    /* segue sem rede de seguranca */
  }

  try {
    await adapter.write(state)
    limparPendente()
    const agora = stamp()
    anunciar({ status: 'sincronizado', message: 'Tudo sincronizado', lastSyncedAt: agora })
    return { ...state, sync: { ...state.sync, lastSyncedAt: agora, dirtySince: null } }
  } catch (err) {
    const code = err instanceof SyncError ? err.code : 'falha'
    // No conflito o runtime ja esta recarregando esta aba: o estado fica
    // no pendente e volta na proxima carga, sem perder nada.
    anunciar({
      status: code === 'conflito' ? 'verificando' : 'erro',
      message: SYNC_MESSAGES[code],
    })
    if (code === 'indisponivel' || code === 'sem_permissao') {
      adapter = localAdapter
      limparPendente()
      anunciar({ status: 'local', destino: localAdapter.label })
    }
    return state
  }
}
