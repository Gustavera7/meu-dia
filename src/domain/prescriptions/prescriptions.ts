import type {
  ISODate, Meal, PrescribedExercise, PrescribedMeal, PrescribedPlan,
  PrescribedWorkout, PrescriptionKind, Workout, WeeklyTrainingPlan,
} from '@/core/types'
import { makeId, stamp } from '@/core/id'
import { today as hoje } from '@/core/dates'

/**
 * Planos vindos de fora: nutricionista ou personal.
 *
 * Principio que rege este arquivo: um plano prescrito e palavra de outra
 * pessoa. O app pode LEMBRAR, ACOMPANHAR e ACONSELHAR, mas nunca reescrever
 * silenciosamente o que um profissional prescreveu. Por isso o plano
 * ativado vira a fonte da verdade e o motor de adaptacao passa a sugerir
 * em vez de alterar.
 */

export function createPrescription(input: {
  kind: PrescriptionKind
  title: string
  professionalName: string
  professionalRole?: string
  contact?: string
  startDate?: ISODate
  endDate?: ISODate | null
  notes?: string
}): PrescribedPlan {
  return {
    id: makeId('presc'),
    kind: input.kind,
    title: input.title.trim() || (input.kind === 'nutricao' ? 'Plano alimentar' : 'Treino'),
    professional: {
      name: input.professionalName.trim(),
      role: input.professionalRole ?? (input.kind === 'nutricao' ? 'Nutricionista' : 'Personal'),
      contact: input.contact ?? '',
    },
    startDate: input.startDate ?? hoje(),
    endDate: input.endDate ?? null,
    active: false,
    notes: input.notes ?? '',
    meals: [],
    workouts: [],
    updatedAt: stamp(),
    deletedAt: null,
  }
}

export function emptyPrescribedMeal(): PrescribedMeal {
  return { id: makeId('pmeal'), name: '', slot: 'almoco', timeHint: '', items: [], notes: '' }
}

export function emptyPrescribedWorkout(): PrescribedWorkout {
  return { id: makeId('pwk'), name: '', weekdays: [], exercises: [], notes: '' }
}

export function emptyPrescribedExercise(): PrescribedExercise {
  return { name: '', sets: '3', reps: '10', rest: '60s', notes: '' }
}

export function isCurrent(plan: PrescribedPlan, date: ISODate = hoje()): boolean {
  if (plan.deletedAt || !plan.active) return false
  if (date < plan.startDate) return false
  return !plan.endDate || date <= plan.endDate
}

export function currentPlan(
  plans: PrescribedPlan[],
  kind: PrescriptionKind,
  date: ISODate = hoje(),
): PrescribedPlan | null {
  return plans.find((p) => p.kind === kind && isCurrent(p, date)) ?? null
}

/* ---------------- conversao para o formato do app ---------------- */

/**
 * Um item prescrito vira componente livre de refeicao: `foodId` nulo
 * preserva exatamente o que o profissional escreveu, sem tentar encaixar
 * no catalogo interno.
 */
export function mealsFromPrescription(plan: PrescribedPlan): Meal[] {
  return plan.meals.map((m) => ({
    id: m.id,
    name: m.name || 'Refeicao',
    slot: m.slot,
    components: m.items.map((i) => ({
      foodId: null,
      name: i.name,
      role: 'extra' as const,
      amount: i.amount,
    })),
    recurring: true,
    timeHint: m.timeHint,
    sourcePlanId: plan.id,
    updatedAt: stamp(),
    deletedAt: null,
  }))
}

/** "3-4" vira 3, e o texto original fica na observacao para nao se perder. */
function parseSets(raw: string): { sets: number; extra: string | null } {
  const limpo = raw.trim()
  const n = parseInt(limpo, 10)
  const simples = String(n) === limpo
  return { sets: Number.isFinite(n) && n > 0 ? n : 3, extra: simples ? null : limpo }
}

function parseRest(raw: string): number {
  const n = parseInt(raw, 10)
  if (!Number.isFinite(n)) return 60
  return /min/i.test(raw) ? n * 60 : n
}

export function workoutFromPrescribed(w: PrescribedWorkout): Workout {
  return {
    id: w.id,
    name: w.name || 'Treino',
    focus: w.notes || 'Prescrito pelo seu profissional',
    estimatedMinutes: Math.max(20, w.exercises.length * 8),
    blocks: w.exercises.map((e) => {
      const { sets, extra } = parseSets(e.sets)
      const notas = [extra && `series: ${extra}`, e.notes].filter(Boolean).join(' - ')
      return {
        exerciseId: `presc-${w.id}-${e.name}`,
        name: e.name,
        sets,
        reps: e.reps,
        restSeconds: parseRest(e.rest),
        note: notas || undefined,
      }
    }),
  }
}

/** Monta a rotina semanal a partir dos dias marcados em cada treino. */
export function trainingPlanFromPrescription(plan: PrescribedPlan): WeeklyTrainingPlan {
  const weekMap: (string | null)[] = Array(7).fill(null)
  for (const w of plan.workouts) {
    for (const dia of w.weekdays) {
      if (dia >= 0 && dia <= 6) weekMap[dia] = w.id
    }
  }
  return {
    id: makeId('plan'),
    createdAt: stamp(),
    goalSummary: `Prescrito por ${plan.professional.name || 'seu profissional'}.`,
    source: 'prescrito',
    sourcePlanId: plan.id,
    weekMap,
    workouts: plan.workouts.map(workoutFromPrescribed),
  }
}
