import type { AppState, DayLog, DayPlan, ISODate, Synced } from '@/core/types'

/**
 * Fusao de dois estados vindos de aparelhos diferentes.
 *
 * Nao existe servidor arbitrando, entao a regra e sempre a mesma:
 * ganha o registro alterado por ultimo. A granularidade e por REGISTRO,
 * nao pelo estado inteiro. Isso importa: se voce marcou o treino no
 * celular e criou um habito no computador, as duas coisas sobrevivem.
 * Substituir o estado todo pelo mais recente perderia uma das duas.
 */

function maisNovo(a: string | null | undefined, b: string | null | undefined): boolean {
  return (a ?? '') >= (b ?? '')
}

/** Une duas listas de registros identificados, mantendo o mais recente de cada. */
function unirPorId<T extends Synced & { id: string }>(a: T[], b: T[]): T[] {
  const mapa = new Map<string, T>()
  for (const item of [...a, ...b]) {
    const atual = mapa.get(item.id)
    if (!atual || maisNovo(item.updatedAt, atual.updatedAt)) mapa.set(item.id, item)
  }
  return [...mapa.values()]
}

/** Une dois mapas por data, mantendo o registro alterado por ultimo. */
function unirLogs(
  a: Record<ISODate, DayLog>,
  b: Record<ISODate, DayLog>,
): Record<ISODate, DayLog> {
  const out: Record<ISODate, DayLog> = { ...a }
  for (const [data, log] of Object.entries(b)) {
    const atual = out[data]
    if (!atual || maisNovo(log.updatedAt, atual.updatedAt)) out[data] = log
  }
  return out
}

function unirPlanos(
  a: Record<ISODate, DayPlan>,
  b: Record<ISODate, DayPlan>,
): Record<ISODate, DayPlan> {
  const out: Record<ISODate, DayPlan> = { ...a }
  for (const [data, plano] of Object.entries(b)) {
    const atual = out[data]
    if (!atual || maisNovo(plano.generatedAt, atual.generatedAt)) out[data] = plano
  }
  return out
}

export function mergeStates(local: AppState, remoto: AppState): AppState {
  const perfilRemotoVence = maisNovo(remoto.profileUpdatedAt, local.profileUpdatedAt)
  const rotinaRemotaVence = maisNovo(remoto.routinesUpdatedAt, local.routinesUpdatedAt)
  const treinoRemotoVence = maisNovo(remoto.trainingPlanUpdatedAt, local.trainingPlanUpdatedAt)

  return {
    ...local,
    version: Math.max(local.version, remoto.version),
    onboarded: local.onboarded || remoto.onboarded,

    profile: perfilRemotoVence ? remoto.profile : local.profile,
    profileUpdatedAt: perfilRemotoVence ? remoto.profileUpdatedAt : local.profileUpdatedAt,
    // O PIN acompanha o perfil: e configuracao de conta, nao de aparelho.
    auth: perfilRemotoVence ? remoto.auth : local.auth,

    routines: rotinaRemotaVence ? remoto.routines : local.routines,
    routinesUpdatedAt: rotinaRemotaVence ? remoto.routinesUpdatedAt : local.routinesUpdatedAt,

    trainingPlan: treinoRemotoVence ? remoto.trainingPlan : local.trainingPlan,
    trainingPlanUpdatedAt: treinoRemotoVence
      ? remoto.trainingPlanUpdatedAt
      : local.trainingPlanUpdatedAt,

    meals: unirPorId(local.meals, remoto.meals),
    habits: unirPorId(local.habits, remoto.habits),
    books: unirPorId(local.books, remoto.books),
    goals: unirPorId(local.goals, remoto.goals),
    prescriptions: unirPorId(local.prescriptions, remoto.prescriptions),

    logs: unirLogs(local.logs, remoto.logs),
    plans: unirPlanos(local.plans, remoto.plans),

    // A identidade do aparelho nunca vem de fora.
    sync: { ...local.sync },
  }
}

/** Remove registros apagados que ja passaram do prazo de retencao. */
export function limparTumulos(state: AppState, diasDeRetencao = 60): AppState {
  const limite = new Date(Date.now() - diasDeRetencao * 86_400_000).toISOString()
  const vivo = <T extends Synced>(r: T) => !r.deletedAt || r.deletedAt > limite
  return {
    ...state,
    meals: state.meals.filter(vivo),
    habits: state.habits.filter(vivo),
    books: state.books.filter(vivo),
    goals: state.goals.filter(vivo),
    prescriptions: state.prescriptions.filter(vivo),
  }
}

/** Registros visiveis: tudo que nao foi apagado. */
export function ativos<T extends Synced>(lista: T[]): T[] {
  return lista.filter((r) => !r.deletedAt)
}
