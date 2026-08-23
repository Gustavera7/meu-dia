import type { AppState, Book, Habit, Meal, PrescribedPlan, TimedGoal } from '@/core/types'
import { MEAL_SLOTS } from '@/core/labels'
import { activeGoals } from '@/domain/goals/goals'
import { currentPlan } from '@/domain/prescriptions/prescriptions'
import { today as hoje } from '@/core/dates'

/**
 * Leituras derivadas do estado.
 *
 * Existe por um motivo concreto: apagar deixa lapide (para a fusao entre
 * aparelhos funcionar), e nenhuma tela deveria precisar lembrar disso.
 * Toda listagem passa por aqui e ja vem limpa.
 */

const vivo = <T extends { deletedAt?: string | null }>(r: T) => !r.deletedAt

export function visibleMeals(state: AppState): Meal[] {
  return state.meals
    .filter(vivo)
    .sort(
      (a, b) =>
        MEAL_SLOTS.findIndex((s) => s.id === a.slot) -
        MEAL_SLOTS.findIndex((s) => s.id === b.slot),
    )
}

export function visibleHabits(state: AppState): Habit[] {
  return state.habits.filter(vivo)
}

export function activeHabits(state: AppState): Habit[] {
  return state.habits.filter((h) => vivo(h) && h.active)
}

export function visibleBooks(state: AppState): Book[] {
  return state.books.filter(vivo)
}

export function visibleGoals(state: AppState): TimedGoal[] {
  return state.goals.filter(vivo)
}

export function openGoals(state: AppState, date = hoje()): TimedGoal[] {
  return activeGoals(visibleGoals(state), date)
}

export function visiblePrescriptions(state: AppState, kind?: PrescribedPlan['kind']): PrescribedPlan[] {
  return state.prescriptions
    .filter(vivo)
    .filter((p) => !kind || p.kind === kind)
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
}

export function activePrescription(
  state: AppState,
  kind: PrescribedPlan['kind'],
  date = hoje(),
): PrescribedPlan | null {
  return currentPlan(state.prescriptions.filter(vivo), kind, date)
}

export function findMeal(state: AppState, id: string): Meal | undefined {
  return state.meals.find((m) => m.id === id && vivo(m))
}

export function findHabit(state: AppState, id: string): Habit | undefined {
  return state.habits.find((h) => h.id === id && vivo(h))
}
