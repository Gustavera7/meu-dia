import type { GoalFocus, GoalKind, ISODate, TimedGoal } from '@/core/types'
import { daysBetween, today as hoje } from '@/core/dates'
import { makeId, stamp } from '@/core/id'
import { templateDe, volumeDaFase } from './events'

/**
 * Metas com prazo.
 *
 * Diferente dos objetivos do perfil, que valem sempre, uma meta aqui tem
 * data marcada: uma prova, uma trilha, uma viagem. Enquanto ela corre, a
 * rotina aperta; quando passa, tudo volta ao normal sozinho.
 */

export const GOAL_KINDS: { id: GoalKind; label: string; hint: string }[] = [
  { id: 'prova', label: 'Prova', hint: 'Corrida, exame, teste fisico' },
  { id: 'trilha', label: 'Trilha', hint: 'Travessia, montanha, longa caminhada' },
  { id: 'competicao', label: 'Competicao', hint: 'Campeonato, torneio' },
  { id: 'viagem', label: 'Viagem', hint: 'Chegar bem para uma viagem' },
  { id: 'evento', label: 'Evento', hint: 'Casamento, apresentacao, data marcada' },
  { id: 'outro', label: 'Outro', hint: 'Qualquer objetivo com data' },
]

export const GOAL_FOCUS: { id: GoalFocus; label: string }[] = [
  { id: 'treino', label: 'Treino' },
  { id: 'nutricao', label: 'Alimentacao' },
  { id: 'motor', label: 'Mobilidade e motor' },
  { id: 'mente', label: 'Foco e mente' },
]

export const INTENSITY_LABELS = [
  { value: 0, label: 'So acompanhar', hint: 'Contagem regressiva, sem mudar a rotina' },
  { value: 1, label: 'Subir um pouco', hint: 'Mais um treino por semana' },
  { value: 2, label: 'Foco total', hint: 'Mais dois treinos e disciplina alimentar' },
] as const

export type GoalPhase = 'base' | 'construcao' | 'reta_final' | 'poupanca' | 'encerrada'

export const PHASE_LABELS: Record<GoalPhase, string> = {
  base: 'Base',
  construcao: 'Construcao',
  reta_final: 'Reta final',
  poupanca: 'Poupando energia',
  encerrada: 'Encerrada',
}

export function createGoal(input: {
  name: string
  kind: GoalKind
  targetDate: ISODate
  focus: GoalFocus[]
  intensity: 0 | 1 | 2
  weeklyTrainingTarget?: number | null
  notes?: string
  eventTemplate?: string | null
  sport?: TimedGoal['sport']
  target?: string
}): TimedGoal {
  return {
    id: makeId('meta'),
    name: input.name.trim(),
    kind: input.kind,
    focus: input.focus.length > 0 ? input.focus : ['treino'],
    startDate: hoje(),
    targetDate: input.targetDate,
    intensity: input.intensity,
    weeklyTrainingTarget: input.weeklyTrainingTarget ?? null,
    notes: input.notes ?? '',
    status: 'ativa',
    eventTemplate: input.eventTemplate ?? null,
    sport: input.sport ?? null,
    target: input.target ?? '',
    updatedAt: stamp(),
    deletedAt: null,
  }
}

/** Fracao do caminho ja percorrido, de 0 no inicio a 1 no dia do evento. */
export function goalProgress(goal: TimedGoal, date: ISODate = hoje()): number {
  const total = Math.max(1, daysBetween(goal.startDate, goal.targetDate))
  const andado = daysBetween(goal.startDate, date)
  return Math.min(1, Math.max(0, andado / total))
}

/** Semanas restantes ate a data, arredondadas para cima. */
export function weeksUntil(goal: TimedGoal, date: ISODate = hoje()): number {
  return Math.max(0, Math.ceil(daysUntil(goal, date) / 7))
}

export function daysUntil(goal: TimedGoal, date: ISODate = hoje()): number {
  return daysBetween(date, goal.targetDate)
}

/**
 * Em que ponto da preparacao a meta esta.
 * Os ultimos dias entram em poupanca de proposito: chegar cansado no dia
 * do objetivo desfaz o trabalho das semanas anteriores.
 */
export function goalPhase(goal: TimedGoal, date: ISODate = hoje()): GoalPhase {
  const faltam = daysUntil(goal, date)
  if (faltam < 0 || goal.status !== 'ativa') return 'encerrada'
  if (faltam <= 3) return 'poupanca'
  if (faltam <= 14) return 'reta_final'

  const total = Math.max(1, daysBetween(goal.startDate, goal.targetDate))
  const decorrido = daysBetween(goal.startDate, date)
  return decorrido / total < 0.5 ? 'base' : 'construcao'
}

export function isActive(goal: TimedGoal, date: ISODate = hoje()): boolean {
  return goal.status === 'ativa' && !goal.deletedAt && daysUntil(goal, date) >= 0
}

export function activeGoals(goals: TimedGoal[], date: ISODate = hoje()): TimedGoal[] {
  return goals
    .filter((g) => isActive(g, date))
    .sort((a, b) => daysUntil(a, date) - daysUntil(b, date))
}

/** A meta mais proxima e a que manda no dia. */
export function primaryGoal(goals: TimedGoal[], date: ISODate = hoje()): TimedGoal | null {
  return activeGoals(goals, date)[0] ?? null
}

export function countdownLabel(goal: TimedGoal, date: ISODate = hoje()): string {
  const faltam = daysUntil(goal, date)
  if (faltam < 0) return 'ja passou'
  if (faltam === 0) return 'e hoje'
  if (faltam === 1) return 'falta 1 dia'
  if (faltam < 7) return `faltam ${faltam} dias`
  const semanas = Math.round(faltam / 7)
  return semanas === 1 ? 'falta 1 semana' : `faltam ${semanas} semanas`
}

/** Quantos treinos por semana a meta pede, dado o padrao do perfil. */
export function weeklyTrainingFor(goal: TimedGoal, base: number): number {
  if (goal.weeklyTrainingTarget) return Math.min(6, goal.weeklyTrainingTarget)
  const modelo = templateDe(goal.eventTemplate)
  if (modelo && goal.focus.includes('treino')) {
    return goalPhase(goal) === 'poupanca'
      ? Math.max(2, modelo.diasPorSemana - 1)
      : modelo.diasPorSemana
  }
  if (!goal.focus.includes('treino')) return base
  if (goalPhase(goal) === 'poupanca') return Math.max(1, base - 1)
  return Math.min(6, base + goal.intensity)
}

/** Volume relativo pedido pela fase da preparacao. */
export function goalVolumeFactor(goal: TimedGoal | null, date: ISODate = hoje()): number {
  if (!goal?.eventTemplate) return 1
  return volumeDaFase(goal.eventTemplate, goalProgress(goal, date))
}
