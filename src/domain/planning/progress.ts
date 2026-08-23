import type { AppState, DayLog, DayPlan, ISODate, PillarId } from '@/core/types'
import { lastNDays } from '@/core/dates'

export interface DayTask {
  key: string
  label: string
  area: 'treino' | 'nutricao' | 'motor' | 'habitos' | 'leitura' | 'manha' | 'noite' | 'checkin'
  done: boolean
}

const EMPTY_LOG = (date: ISODate): DayLog => ({
  date,
  updatedAt: '',
  done: {},
  habitProgress: {},
  training: null,
  motor: null,
  reading: null,
  meals: [],
  checkIn: null,
})

export function logFor(state: AppState, date: ISODate): DayLog {
  return state.logs[date] ?? EMPTY_LOG(date)
}

/** Lista plana de tudo que o dia pede, com o status atual de cada item. */
export function dayTasks(state: AppState, plan: DayPlan): DayTask[] {
  const log = logFor(state, plan.date)
  const m = state.profile.modules
  const tasks: DayTask[] = []

  if (m.rotina_manha) {
    for (const s of state.routines.manha.steps) {
      tasks.push({ key: `manha:${s.id}`, label: s.name, area: 'manha', done: !!log.done[`manha:${s.id}`] })
    }
  }
  if (m.treino && plan.workoutId) {
    tasks.push({ key: 'treino', label: 'Treino', area: 'treino', done: !!log.done.treino })
  }
  if (m.nutricao) {
    for (const id of plan.mealIds) {
      const meal = state.meals.find((x) => x.id === id)
      if (!meal) continue
      tasks.push({ key: `refeicao:${id}`, label: meal.name, area: 'nutricao', done: !!log.done[`refeicao:${id}`] })
    }
  }
  if (m.motor && plan.motorSession) {
    tasks.push({ key: 'motor', label: 'Sessao motora', area: 'motor', done: !!log.done.motor })
  }
  if (m.habitos) {
    for (const id of plan.habitIds) {
      const habit = state.habits.find((x) => x.id === id)
      if (!habit) continue
      tasks.push({ key: `habito:${id}`, label: habit.name, area: 'habitos', done: !!log.done[`habito:${id}`] })
    }
  }
  if (m.leitura && plan.readingMinutes > 0) {
    tasks.push({ key: 'leitura', label: 'Leitura', area: 'leitura', done: !!log.done.leitura })
  }
  if (m.rotina_noite) {
    for (const s of state.routines.noite.steps) {
      tasks.push({ key: `noite:${s.id}`, label: s.name, area: 'noite', done: !!log.done[`noite:${s.id}`] })
    }
  }
  if (m.checkin) {
    tasks.push({ key: 'checkin', label: 'Check-in do dia', area: 'checkin', done: !!log.checkIn })
  }

  return tasks
}

export interface Progress {
  done: number
  total: number
  ratio: number
}

/**
 * Progresso do dia contado por BLOCO, nao por item.
 *
 * Cada rotina vale um bloco (feita quando todos os passos sairam), enquanto
 * treino, refeicoes, motor, habitos, leitura e check-in valem um cada.
 * Sem isso, uma rotina de 6 passos pesaria mais que o treino inteiro e o
 * numero no topo da tela deixaria de refletir como o dia realmente foi.
 */
export function dayProgress(state: AppState, plan: DayPlan): Progress {
  const tasks = dayTasks(state, plan)
  const grouped = ['manha', 'noite'] as const

  const units: boolean[] = tasks
    .filter((t) => !grouped.includes(t.area as (typeof grouped)[number]))
    .map((t) => t.done)

  for (const area of grouped) {
    const steps = tasks.filter((t) => t.area === area)
    if (steps.length > 0) units.push(steps.every((t) => t.done))
  }

  const done = units.filter(Boolean).length
  return { done, total: units.length, ratio: units.length ? done / units.length : 0 }
}

export function areaProgress(state: AppState, plan: DayPlan, area: DayTask['area']): Progress {
  const tasks = dayTasks(state, plan).filter((t) => t.area === area)
  const done = tasks.filter((t) => t.done).length
  return { done, total: tasks.length, ratio: tasks.length ? done / tasks.length : 0 }
}

/* ---------------- consistencia dos pilares ---------------- */

/**
 * Consistencia = com que frequencia o pilar apareceu no dia a dia.
 * Nao e indicador de saude nem diagnostico: e presenca ao longo do tempo.
 */
export function pillarConsistency(
  state: AppState,
  days = 7,
  end?: ISODate,
): Record<PillarId, number> {
  const window = lastNDays(days, end)
  const acc: Record<PillarId, { hits: number; slots: number }> = {
    corpo: { hits: 0, slots: 0 },
    movimento: { hits: 0, slots: 0 },
    mente: { hits: 0, slots: 0 },
    bem_estar: { hits: 0, slots: 0 },
  }

  const habitPillar = new Map(state.habits.map((h) => [h.id, h.pillar]))

  for (const date of window) {
    const log = state.logs[date]
    const plan = state.plans[date]
    if (!log && !plan) continue

    if (state.profile.modules.treino && plan?.workoutId) {
      acc.corpo.slots++
      if (log?.training?.done || log?.done.treino) acc.corpo.hits++
    }
    if (state.profile.modules.nutricao && plan?.mealIds.length) {
      acc.corpo.slots++
      const feitas = plan.mealIds.filter((id) => log?.done[`refeicao:${id}`]).length
      if (feitas >= Math.ceil(plan.mealIds.length / 2)) acc.corpo.hits++
    }
    if (log?.checkIn) {
      acc.corpo.slots++
      if (log.checkIn.sleep >= 3) acc.corpo.hits++
      acc.bem_estar.slots += 2
      if (log.checkIn.mood >= 3) acc.bem_estar.hits++
      if (log.checkIn.stress <= 3) acc.bem_estar.hits++
    }
    if (state.profile.modules.motor && plan?.motorSession) {
      acc.movimento.slots++
      if (log?.done.motor) acc.movimento.hits++
    }
    if (state.profile.modules.leitura && (plan?.readingMinutes ?? 0) > 0) {
      acc.mente.slots++
      if (log?.done.leitura) acc.mente.hits++
    }
    for (const id of plan?.habitIds ?? []) {
      const pillar = habitPillar.get(id)
      if (!pillar) continue
      acc[pillar].slots++
      if (log?.done[`habito:${id}`]) acc[pillar].hits++
    }
  }

  return {
    corpo: acc.corpo.slots ? acc.corpo.hits / acc.corpo.slots : 0,
    movimento: acc.movimento.slots ? acc.movimento.hits / acc.movimento.slots : 0,
    mente: acc.mente.slots ? acc.mente.hits / acc.mente.slots : 0,
    bem_estar: acc.bem_estar.slots ? acc.bem_estar.hits / acc.bem_estar.slots : 0,
  }
}

/** Dias seguidos com pelo menos metade do dia concluido. */
export function streak(state: AppState, end?: ISODate): number {
  const window = lastNDays(60, end).reverse()
  let count = 0
  for (const date of window) {
    const plan = state.plans[date]
    if (!plan) break
    const p = dayProgress(state, plan)
    if (p.total === 0 || p.ratio < 0.5) break
    count++
  }
  return count
}
