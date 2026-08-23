import type { AppState, DayPlan, ISODate, Workout } from '@/core/types'
import { addDays, lastNDays, weekdayIndex } from '@/core/dates'
import { generateMotorSession, restorativeSession } from '@/domain/motor/generator'
import { lighterVersion } from '@/domain/training/generator'
import { computeAdjustments, hasCode, type Adjustment } from './adaptation'

/** Drills usados nos ultimos dias, para a sessao motora nao repetir. */
function recentDrills(state: AppState, date: ISODate, days = 4): string[] {
  return lastNDays(days, addDays(date, -1))
    .flatMap((d) => state.plans[d]?.motorSession?.drills ?? [])
    .map((d) => d.drillId)
}

/** Habito com pior aderencia nos ultimos 7 dias vira o foco do dia. */
function pickFocusHabit(state: AppState, date: ISODate): string | null {
  const active = state.habits.filter((h) => h.active && !h.deletedAt)
  if (active.length === 0) return null
  const window = lastNDays(7, addDays(date, -1))
  const scored = active.map((h) => ({
    id: h.id,
    hits: window.filter((d) => state.logs[d]?.done?.[`habito:${h.id}`]).length,
  }))
  scored.sort((a, b) => a.hits - b.hits)
  return scored[0].id
}

function workoutForDate(state: AppState, date: ISODate): string | null {
  const plan = state.trainingPlan
  if (!plan || !state.profile.modules.treino) return null
  return plan.weekMap[weekdayIndex(date)] ?? null
}

/**
 * Monta o plano de um dia a partir do estado atual.
 * Puro: nao grava nada, so devolve o plano com os ajustes aplicados.
 */
export function buildDayPlan(state: AppState, date: ISODate): DayPlan {
  const adjustments = computeAdjustments(state, date)
  const p = state.profile

  let workoutId = workoutForDate(state, date)
  // Cancelar o dia so vale para rotina gerada aqui dentro.
  if (hasCode(adjustments, 'treino_descanso') && state.trainingPlan?.source !== 'prescrito') {
    workoutId = null
  }

  const motorSession = p.modules.motor
    ? hasCode(adjustments, 'motor_restaurativo')
      ? restorativeSession(date)
      : generateMotorSession(p, date, recentDrills(state, date))
    : null

  const readingMinutes = hasCode(adjustments, 'leitura_reduzida')
    ? 10
    : p.personal.readingMinutes

  return {
    date,
    workoutId,
    mealIds: p.modules.nutricao
      ? state.meals.filter((m) => m.recurring && !m.deletedAt).map((m) => m.id)
      : [],
    motorSession,
    habitIds: p.modules.habitos
      ? state.habits.filter((h) => h.active && !h.deletedAt).map((h) => h.id)
      : [],
    readingMinutes: p.modules.leitura ? readingMinutes : 0,
    focusHabitId: p.modules.habitos ? pickFocusHabit(state, date) : null,
    adjustments: adjustments.map((a) => a.message),
    generatedAt: new Date().toISOString(),
  }
}

/** Ajustes completos (com motivo) para a tela "Seu amanha". */
export function explainPlan(state: AppState, date: ISODate): Adjustment[] {
  return computeAdjustments(state, date)
}

/**
 * O treino que deve aparecer no dia, ja considerando se o motor
 * pediu uma versao mais leve.
 */
export function workoutForPlan(state: AppState, plan: DayPlan): Workout | null {
  if (!plan.workoutId || !state.trainingPlan) return null
  const base = state.trainingPlan.workouts.find((w) => w.id === plan.workoutId)
  if (!base) return null
  // Plano de personal nao e reescrito pelo app: se o dia pede leveza, a
  // sugestao aparece como recado e a decisao continua sendo de quem prescreveu.
  if (state.trainingPlan.source === 'prescrito') return base

  const adjustments = computeAdjustments(state, plan.date)
  const aliviar =
    hasCode(adjustments, 'treino_leve') || hasCode(adjustments, 'meta_poupanca')
  return aliviar ? lighterVersion(base) : base
}
