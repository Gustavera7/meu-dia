import type { Routine, RoutineStep } from '@/core/types'
import { makeId } from '@/core/id'

function step(name: string, minutes: number, note?: string): RoutineStep {
  return { id: makeId('st'), name, minutes, note }
}

/**
 * Rotinas curtas por principio: o que cabe no dia real e o que se sustenta.
 * O tempo disponivel informado no onboarding corta os passos opcionais.
 */
/**
 * Tempos com folga, de proposito.
 *
 * Numero apertado transforma rotina em corrida contra o relogio, e a
 * primeira coisa que se abandona e justamente o que deveria acalmar. Aqui
 * o minuto e RESERVA, nao meta: sobrar tempo e o resultado esperado.
 *
 * O nucleo e o que sustenta a rotina nos dias ruins e entra sempre. O
 * resto so entra se couber com conforto no tempo que a pessoa informou.
 */
const MORNING_CORE = [
  { name: 'Beber um copo de agua', minutes: 2, note: 'Antes de qualquer tela' },
  { name: 'Higiene', minutes: 10 },
  { name: 'Revisar o dia', minutes: 5, note: 'Uma prioridade, nao dez' },
]

const MORNING_EXTRA = [
  { name: 'Mobilidade', minutes: 6, note: 'Quadril, coluna e ombro, sem pressa' },
  { name: 'Respiracao', minutes: 4, note: 'Inspire em 4, expire em 6' },
  { name: 'Luz natural', minutes: 8, note: 'Sol nos olhos ajuda o sono a noite' },
  { name: 'Anotar 1 intencao', minutes: 4 },
]

const EVENING_CORE = [
  { name: 'Reduzir estimulos', minutes: 10, note: 'Luz baixa, celular longe' },
  { name: 'Higiene', minutes: 10 },
  { name: 'Preparar amanha', minutes: 6, note: 'Roupa, treino, primeira tarefa' },
]

const EVENING_EXTRA = [
  { name: 'Leitura', minutes: 20, note: 'Papel, se der' },
  { name: 'Check-in do dia', minutes: 4 },
  { name: 'Reflexao', minutes: 5, note: 'O que funcionou hoje?' },
  { name: 'Alongamento leve', minutes: 8 },
  { name: 'Anotar 1 gratidao', minutes: 3 },
]

/**
 * Encaixa os passos no tempo disponivel.
 * O nucleo entra inteiro mesmo que estoure, porque uma rotina sem ele
 * deixa de ser rotina. O opcional so entra enquanto sobrar espaco.
 */
function fit(
  core: { name: string; minutes: number; note?: string }[],
  extra: { name: string; minutes: number; note?: string }[],
  budget: number,
): RoutineStep[] {
  const steps = core.map((s) => step(s.name, s.minutes, s.note))
  let used = core.reduce((soma, s) => soma + s.minutes, 0)

  for (const s of extra) {
    if (used + s.minutes > budget) continue
    steps.push(step(s.name, s.minutes, s.note))
    used += s.minutes
  }
  return steps
}

export function buildMorningRoutine(availableMinutes: number): Routine {
  return { kind: 'manha', steps: fit(MORNING_CORE, MORNING_EXTRA, Math.max(17, availableMinutes)) }
}

export function buildEveningRoutine(availableMinutes: number): Routine {
  return { kind: 'noite', steps: fit(EVENING_CORE, EVENING_EXTRA, Math.max(26, availableMinutes)) }
}

export function newRoutineStep(name: string, minutes = 5): RoutineStep {
  return step(name, minutes)
}

export function routineMinutes(routine: Routine): number {
  return routine.steps.reduce((sum, s) => sum + s.minutes, 0)
}

/**
 * Como o tempo aparece na tela. "reserve ~25 min" comunica um bloco
 * separado na agenda; "25 min" comunica um cronometro correndo.
 */
export function routineTimeLabel(routine: Routine): string {
  return `reserve ~${routineMinutes(routine)} min`
}
