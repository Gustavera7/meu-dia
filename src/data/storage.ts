import type { AppState, Modality, Synced } from '@/core/types'
import { STATE_VERSION, emptyState } from './defaults'
import { localAdapter } from './adapters/local'
import { migrarLegado, storageKey } from './scope'

/**
 * Porta de entrada dos dados.
 *
 * Aqui ficam so leitura local, migracoes e serializacao. A conversa com a
 * nuvem mora em `sync.ts`, que usa os adaptadores. Esta separacao existe
 * para que a tela nunca precise saber de onde o dado veio.
 */

type Migration = (state: AppState) => AppState

const AGORA = () => new Date().toISOString()

/** Preenche o que a v1 nao tinha: marcas de tempo, metas e sincronizacao. */
function v1ParaV2(state: AppState): AppState {
  const agora = AGORA()
  const carimbar = <T extends Synced>(lista: T[] | undefined): T[] =>
    (lista ?? []).map((r) => ({ ...r, updatedAt: r.updatedAt ?? agora, deletedAt: null }))

  return {
    ...state,
    version: 2,
    profileUpdatedAt: state.profileUpdatedAt ?? agora,
    routinesUpdatedAt: state.routinesUpdatedAt ?? agora,
    trainingPlanUpdatedAt: state.trainingPlanUpdatedAt ?? agora,
    meals: carimbar(state.meals),
    habits: carimbar(state.habits),
    books: carimbar(state.books),
    goals: state.goals ?? [],
    prescriptions: state.prescriptions ?? [],
    logs: Object.fromEntries(
      Object.entries(state.logs ?? {}).map(([data, log]) => [
        data,
        { ...log, updatedAt: log.updatedAt ?? agora },
      ]),
    ),
    sync: state.sync ?? { deviceId: crypto.randomUUID(), lastSyncedAt: null, dirtySince: null },
  }
}

/**
 * Perfis criados antes das modalidades nao tem o campo, e a tela quebraria
 * ao chamar `.includes` nele. Estado antigo NUNCA e apenas o novo com menos
 * chaves: os objetos aninhados vem inteiros do disco e precisam ser
 * completados um a um.
 */
function v2ParaV3(state: AppState): AppState {
  const training = state.profile?.training
  return {
    ...state,
    version: 3,
    profile: {
      ...state.profile,
      training: {
        ...training,
        modalities:
          training?.modalities?.length > 0
            ? training.modalities
            : ([training?.style === 'calistenia' ? 'calistenia' : 'musculacao'] as Modality[]),
      },
    },
  }
}

const MIGRATIONS: Record<number, Migration> = { 1: v1ParaV2, 2: v2ParaV3 }

function migrate(raw: AppState): AppState {
  let state = raw
  let voltas = 0
  while (state.version < STATE_VERSION && voltas++ < 10) {
    const passo = MIGRATIONS[state.version]
    state = passo ? passo(state) : { ...state, version: STATE_VERSION }
  }
  return state
}

/** Completa campos ausentes sem apagar nada do que ja existe. */
export function normalize(parsed: AppState): AppState {
  return { ...emptyState(), ...migrate(parsed) }
}

/** Leitura sincrona do aparelho, usada na partida do app. */
export function load(): AppState {
  try {
    migrarLegado()
    const raw = localStorage.getItem(storageKey())
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw) as AppState
    if (!parsed || typeof parsed !== 'object' || !parsed.profile) return emptyState()
    return normalize(parsed)
  } catch {
    return emptyState()
  }
}

let pendente: number | null = null

/** Escrita local adiada: varios cliques seguidos gravam uma vez so. */
export function save(state: AppState): void {
  if (pendente !== null) clearTimeout(pendente)
  pendente = window.setTimeout(() => {
    void localAdapter.write(state).catch((err) => console.error('Falha ao gravar', err))
    pendente = null
  }, 250)
}

export function saveNow(state: AppState): void {
  if (pendente !== null) clearTimeout(pendente)
  pendente = null
  void localAdapter.write(state)
}

export function clear(): void {
  localStorage.removeItem(storageKey())
}

export function exportJSON(state: AppState): string {
  return JSON.stringify(state, null, 2)
}

export function importJSON(text: string): AppState | null {
  try {
    const parsed = JSON.parse(text) as AppState
    if (!parsed?.profile) return null
    return normalize(parsed)
  } catch {
    return null
  }
}
