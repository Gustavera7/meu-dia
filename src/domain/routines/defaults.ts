import type { Routine, RoutineStep } from '@/core/types'
import { makeId } from '@/core/id'

function step(name: string, minutes: number, note?: string): RoutineStep {
  return { id: makeId('st'), name, minutes, note }
}

/**
 * Rotinas curtas por principio: o que cabe no dia real e o que se sustenta.
 * O tempo disponivel informado no onboarding corta os passos opcionais.
 */
const MORNING_CORE = [
  { name: 'Beber um copo de agua', minutes: 1, note: 'Antes de qualquer tela' },
  { name: 'Higiene', minutes: 5 },
  { name: 'Mobilidade rapida', minutes: 3, note: 'Quadril, coluna e ombro' },
  { name: 'Respiracao', minutes: 2, note: '4 segundos inspira, 6 expira' },
  { name: 'Revisar o dia', minutes: 2, note: 'Uma prioridade, nao dez' },
]

const MORNING_EXTRA = [
  { name: 'Luz natural', minutes: 5, note: 'Sol nos olhos ajuda o sono a noite' },
  { name: 'Anotar 1 intencao', minutes: 2 },
]

const EVENING_CORE = [
  { name: 'Reduzir estimulos', minutes: 5, note: 'Luz baixa, celular longe' },
  { name: 'Higiene', minutes: 5 },
  { name: 'Leitura', minutes: 15 },
  { name: 'Reflexao', minutes: 3, note: 'O que funcionou hoje?' },
  { name: 'Check-in do dia', minutes: 2 },
  { name: 'Preparar amanha', minutes: 3, note: 'Roupa, treino, primeira tarefa' },
]

const EVENING_EXTRA = [
  { name: 'Alongamento leve', minutes: 5 },
  { name: 'Anotar 1 gratidao', minutes: 2 },
]

function fit(
  core: { name: string; minutes: number; note?: string }[],
  extra: { name: string; minutes: number; note?: string }[],
  budget: number,
): RoutineStep[] {
  const steps: RoutineStep[] = []
  let used = 0
  for (const s of core) {
    if (used + s.minutes > budget && steps.length >= 3) break
    steps.push(step(s.name, s.minutes, s.note))
    used += s.minutes
  }
  for (const s of extra) {
    if (used + s.minutes > budget) break
    steps.push(step(s.name, s.minutes, s.note))
    used += s.minutes
  }
  return steps
}

export function buildMorningRoutine(availableMinutes: number): Routine {
  return { kind: 'manha', steps: fit(MORNING_CORE, MORNING_EXTRA, Math.max(8, availableMinutes)) }
}

export function buildEveningRoutine(availableMinutes: number): Routine {
  return { kind: 'noite', steps: fit(EVENING_CORE, EVENING_EXTRA, Math.max(12, availableMinutes)) }
}

export function newRoutineStep(name: string, minutes = 5): RoutineStep {
  return step(name, minutes)
}

export function routineMinutes(routine: Routine): number {
  return routine.steps.reduce((sum, s) => sum + s.minutes, 0)
}
