import type {
  Equipment, Exercise, GoalId, MovementPattern, PlannedSet,
  Profile, Workout, WeeklyTrainingPlan,
} from '@/core/types'
import { EXERCISES } from './exercises'
import { makeId, seededRandom } from '@/core/id'

/* ---------------- prescricao por objetivo ---------------- */

interface Prescription {
  sets: number
  reps: string
  rest: number
}

type Emphasis = 'forca' | 'hipertrofia' | 'metabolico' | 'saude'

function emphasisFor(goals: GoalId[]): Emphasis {
  if (goals.includes('forca')) return 'forca'
  if (goals.includes('ganhar_massa')) return 'hipertrofia'
  if (goals.includes('perder_gordura') || goals.includes('condicionamento')) return 'metabolico'
  return 'saude'
}

const TABLE: Record<Emphasis, Record<1 | 2 | 3, Prescription>> = {
  forca: {
    1: { sets: 5, reps: '3-5', rest: 150 },
    2: { sets: 4, reps: '6-8', rest: 120 },
    3: { sets: 3, reps: '10-12', rest: 60 },
  },
  hipertrofia: {
    1: { sets: 4, reps: '6-10', rest: 120 },
    2: { sets: 3, reps: '8-12', rest: 90 },
    3: { sets: 3, reps: '12-15', rest: 60 },
  },
  metabolico: {
    1: { sets: 3, reps: '10-12', rest: 60 },
    2: { sets: 3, reps: '12-15', rest: 45 },
    3: { sets: 3, reps: '15-20', rest: 45 },
  },
  saude: {
    1: { sets: 3, reps: '8-12', rest: 90 },
    2: { sets: 3, reps: '10-12', rest: 60 },
    3: { sets: 2, reps: '12-15', rest: 45 },
  },
}

/* ---------------- divisoes semanais ---------------- */

interface DayTemplate {
  name: string
  focus: string
  slots: MovementPattern[]
}

const FULL_A: DayTemplate = {
  name: 'Corpo inteiro A', focus: 'Base de forca geral',
  slots: ['agachar', 'empurrar_horizontal', 'puxar_horizontal', 'dobradica', 'empurrar_vertical', 'core'],
}
const FULL_B: DayTemplate = {
  name: 'Corpo inteiro B', focus: 'Posterior, costas e ombro',
  slots: ['dobradica', 'puxar_vertical', 'empurrar_vertical', 'unilateral', 'empurrar_horizontal', 'core'],
}
const FULL_C: DayTemplate = {
  name: 'Corpo inteiro C', focus: 'Unilateral e controle',
  slots: ['unilateral', 'empurrar_horizontal', 'puxar_horizontal', 'agachar', 'isolado', 'core'],
}
const SUP_A: DayTemplate = {
  name: 'Superior A', focus: 'Peito, costas e ombro',
  slots: ['empurrar_horizontal', 'puxar_vertical', 'empurrar_vertical', 'puxar_horizontal', 'isolado', 'isolado'],
}
const SUP_B: DayTemplate = {
  name: 'Superior B', focus: 'Costas, ombro e bracos',
  slots: ['puxar_horizontal', 'empurrar_vertical', 'puxar_vertical', 'empurrar_horizontal', 'isolado', 'isolado'],
}
const INF_A: DayTemplate = {
  name: 'Inferior A', focus: 'Quadriceps e gluteo',
  slots: ['agachar', 'dobradica', 'unilateral', 'isolado', 'core'],
}
const INF_B: DayTemplate = {
  name: 'Inferior B', focus: 'Posterior e estabilidade',
  slots: ['dobradica', 'agachar', 'unilateral', 'isolado', 'core'],
}
const PUSH: DayTemplate = {
  name: 'Empurrar', focus: 'Peito, ombro e triceps',
  slots: ['empurrar_horizontal', 'empurrar_vertical', 'empurrar_horizontal', 'isolado', 'isolado'],
}
const PULL: DayTemplate = {
  name: 'Puxar', focus: 'Costas e biceps',
  slots: ['puxar_vertical', 'puxar_horizontal', 'puxar_horizontal', 'isolado', 'isolado'],
}
const LEGS: DayTemplate = {
  name: 'Pernas', focus: 'Membros inferiores e core',
  slots: ['agachar', 'dobradica', 'unilateral', 'isolado', 'core'],
}

const SPLITS: Record<number, DayTemplate[]> = {
  1: [FULL_A],
  2: [FULL_A, FULL_B],
  3: [FULL_A, FULL_B, FULL_C],
  4: [SUP_A, INF_A, SUP_B, INF_B],
  5: [PUSH, PULL, LEGS, SUP_A, INF_A],
  6: [PUSH, PULL, LEGS, { ...PUSH, name: 'Empurrar B' }, { ...PULL, name: 'Puxar B' }, { ...LEGS, name: 'Pernas B' }],
}

/** Dias da semana escolhidos por frequencia (0 = domingo). */
const WEEK_SLOTS: Record<number, number[]> = {
  1: [3],
  2: [1, 4],
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 5, 6],
  6: [1, 2, 3, 4, 5, 6],
}

/* ---------------- selecao de exercicios ---------------- */

function availableFor(equipment: Equipment[], level: Profile['training']['experience']): Exercise[] {
  const eq = equipment.length > 0 ? equipment : (['peso_corpo'] as Equipment[])
  return EXERCISES.filter(
    (e) => e.equipment.some((x) => eq.includes(x)) && e.level.includes(level),
  )
}

/** Quantos exercicios cabem no tempo disponivel. */
function exerciseCount(minutes: number): number {
  if (minutes <= 25) return 4
  if (minutes <= 40) return 5
  if (minutes <= 55) return 6
  if (minutes <= 70) return 7
  return 8
}

function pickForSlot(
  pool: Exercise[],
  pattern: MovementPattern,
  used: Set<string>,
  rand: () => number,
): Exercise | null {
  const exact = pool.filter((e) => e.pattern === pattern && !used.has(e.id))
  const fallback = pool.filter((e) => !used.has(e.id))
  const list = exact.length > 0 ? exact : fallback
  if (list.length === 0) return null
  // prioriza tier mais baixo (composto) mas sem ficar previsivel demais
  const sorted = [...list].sort((a, b) => a.tier - b.tier)
  const top = sorted.slice(0, Math.max(2, Math.ceil(sorted.length / 2)))
  return top[Math.floor(rand() * top.length)]
}

function buildWorkout(
  template: DayTemplate,
  profile: Profile,
  rand: () => number,
): Workout {
  const emphasis = emphasisFor(profile.goals)
  const pool = availableFor(profile.training.equipment, profile.training.experience)
  const target = exerciseCount(profile.training.sessionMinutes)
  const used = new Set<string>()
  const blocks: PlannedSet[] = []

  const slots = [...template.slots]
  while (slots.length < target) slots.push('isolado')

  for (const pattern of slots.slice(0, target)) {
    const ex = pickForSlot(pool, pattern, used, rand)
    if (!ex) continue
    used.add(ex.id)
    const p = TABLE[emphasis][ex.tier]
    const isCore = ex.pattern === 'core'
    blocks.push({
      exerciseId: ex.id,
      name: ex.name,
      sets: isCore ? 3 : p.sets,
      reps: isCore ? '30-45s' : p.reps,
      restSeconds: isCore ? 45 : p.rest,
      note: ex.note,
    })
  }

  // Finalizador de condicionamento quando faz sentido para o objetivo
  const wantsConditioning =
    profile.goals.includes('condicionamento') || profile.goals.includes('perder_gordura')
  if (wantsConditioning) {
    const cond = pool.filter((e) => e.pattern === 'condicionamento' && !used.has(e.id))
    if (cond.length > 0) {
      const ex = cond[Math.floor(rand() * cond.length)]
      blocks.push({
        exerciseId: ex.id,
        name: ex.name,
        sets: 4,
        reps: '30s forte / 30s leve',
        restSeconds: 30,
        note: 'Finalizador. Pare 2 repeticoes antes da falha.',
      })
    }
  }

  return {
    id: makeId('wk'),
    name: template.name,
    focus: template.focus,
    estimatedMinutes: profile.training.sessionMinutes,
    blocks,
  }
}

/* ---------------- API publica ---------------- */

const EMPHASIS_LABEL: Record<Emphasis, string> = {
  forca: 'Foco em forca: cargas maiores, menos repeticoes, descanso longo.',
  hipertrofia: 'Foco em hipertrofia: volume moderado e progressao de carga.',
  metabolico: 'Foco metabolico: densidade alta e descansos curtos.',
  saude: 'Foco em consistencia: estimulo suficiente sem desgaste.',
}

export function generateWeeklyPlan(
  profile: Profile,
  seed = makeId('seed'),
  /** frequencia pedida por uma meta com prazo; sem ela vale a do perfil */
  daysPerWeekOverride?: number,
): WeeklyTrainingPlan {
  const days = Math.min(6, Math.max(1, daysPerWeekOverride ?? profile.training.daysPerWeek))
  const rand = seededRandom(seed)
  const templates = SPLITS[days] ?? SPLITS[3]
  const workouts = templates.map((t) => buildWorkout(t, profile, rand))

  const weekMap: (string | null)[] = Array(7).fill(null)
  const slots = WEEK_SLOTS[days] ?? WEEK_SLOTS[3]
  slots.forEach((dayIndex, i) => {
    weekMap[dayIndex] = workouts[i % workouts.length].id
  })

  return {
    id: makeId('plan'),
    createdAt: new Date().toISOString(),
    goalSummary: EMPHASIS_LABEL[emphasisFor(profile.goals)],
    source: 'gerado',
    sourcePlanId: null,
    weekMap,
    workouts,
  }
}

/**
 * Versao mais leve do mesmo treino, usada quando o check-in mostra
 * energia ou sono baixos. Nao troca os exercicios: reduz o volume.
 */
export function lighterVersion(workout: Workout): Workout {
  return {
    ...workout,
    id: workout.id,
    name: `${workout.name} (leve)`,
    estimatedMinutes: Math.round(workout.estimatedMinutes * 0.7),
    blocks: workout.blocks
      .slice(0, Math.max(3, workout.blocks.length - 2))
      .map((b) => ({ ...b, sets: Math.max(2, b.sets - 1) })),
  }
}

export function workoutVolume(workout: Workout): number {
  return workout.blocks.reduce((sum, b) => sum + b.sets, 0)
}
