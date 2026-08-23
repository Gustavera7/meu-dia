/**
 * Modelo de dominio do sistema pessoal.
 *
 * Regra desta camada: nada aqui conhece React, storage ou UI.
 * Tudo e serializavel em JSON (datas sempre como string "yyyy-mm-dd").
 */

export type ISODate = string
export type ID = string

/**
 * Todo registro que pode ser criado ou editado em mais de um aparelho
 * carrega estas marcas. A fusao entre celular e computador decide pelo
 * `updatedAt` mais recente, e `deletedAt` existe porque apagar sem deixar
 * rastro faz o outro aparelho ressuscitar o registro na proxima juncao.
 */
export interface Synced {
  updatedAt: string
  deletedAt?: string | null
}

/* ---------------------------------------------------------------- */
/* Perfil                                                            */
/* ---------------------------------------------------------------- */

export type Sex = 'masculino' | 'feminino' | 'outro'

export type GoalId =
  | 'ganhar_massa'
  | 'perder_gordura'
  | 'condicionamento'
  | 'forca'
  | 'mobilidade'
  | 'qualidade_vida'
  | 'energia'
  | 'disciplina'

export type Experience = 'iniciante' | 'intermediario' | 'avancado'

export type Equipment =
  | 'academia'
  | 'halteres'
  | 'barra'
  | 'kettlebell'
  | 'elastico'
  | 'barra_fixa'
  | 'peso_corpo'

export type TrainingStyle = 'musculacao' | 'funcional' | 'calistenia' | 'hibrido'

export type DietStyle = 'onivora' | 'vegetariana' | 'vegana' | 'low_carb' | 'flexivel'
export type NutritionGoal = 'ganhar_massa' | 'perder_gordura' | 'manter' | 'mais_saude'

export type MotorCategory =
  | 'mobilidade'
  | 'equilibrio'
  | 'coordenacao'
  | 'reflexo'
  | 'reacao'
  | 'propriocepcao'
  | 'controle_corporal'
  | 'olho_mao'
  | 'cognitivo_motor'

export type ReadingFrequency = 'nunca' | 'raramente' | 'as_vezes' | 'quase_sempre' | 'todo_dia'

export type ModuleId =
  | 'treino'
  | 'nutricao'
  | 'motor'
  | 'habitos'
  | 'leitura'
  | 'rotina_manha'
  | 'rotina_noite'
  | 'checkin'

export interface Profile {
  name: string
  createdAt: string
  basics: {
    age: number | null
    sex: Sex | null
    heightCm: number | null
    weightKg: number | null
  }
  goals: GoalId[]
  training: {
    experience: Experience
    daysPerWeek: number
    sessionMinutes: number
    equipment: Equipment[]
    style: TrainingStyle
  }
  nutrition: {
    dietStyle: DietStyle
    goal: NutritionGoal
    restrictions: string[]
    preferences: string[]
    dislikes: string[]
    mealsPerDay: number
  }
  routine: {
    wakeTime: string
    sleepTime: string
    morningMinutes: number
    eveningMinutes: number
  }
  motor: {
    focus: MotorCategory[]
    sessionMinutes: number
  }
  personal: {
    readingFrequency: ReadingFrequency
    readingMinutes: number
    interests: string[]
  }
  /** Liga/desliga areas do app sem perder os dados. */
  modules: Record<ModuleId, boolean>
}

/* ---------------------------------------------------------------- */
/* Treino                                                            */
/* ---------------------------------------------------------------- */

export type MuscleGroup =
  | 'peito' | 'costas' | 'ombro' | 'biceps' | 'triceps'
  | 'quadriceps' | 'posterior' | 'gluteo' | 'panturrilha'
  | 'core' | 'corpo_todo'

export type MovementPattern =
  | 'empurrar_horizontal' | 'empurrar_vertical'
  | 'puxar_horizontal' | 'puxar_vertical'
  | 'agachar' | 'dobradica' | 'unilateral'
  | 'core' | 'condicionamento' | 'isolado'

export interface Exercise {
  id: ID
  name: string
  pattern: MovementPattern
  primary: MuscleGroup
  equipment: Equipment[]
  /** 1 = composto principal, 2 = acessorio, 3 = isolado/finalizador */
  tier: 1 | 2 | 3
  level: Experience[]
  note?: string
}

export interface PlannedSet {
  exerciseId: ID
  name: string
  sets: number
  reps: string
  restSeconds: number
  note?: string
}

export interface Workout {
  id: ID
  name: string
  focus: string
  estimatedMinutes: number
  blocks: PlannedSet[]
}

export interface WeeklyTrainingPlan {
  id: ID
  createdAt: string
  goalSummary: string
  /** gerado pelo app ou prescrito por um profissional */
  source: 'gerado' | 'prescrito'
  sourcePlanId?: ID | null
  /** indice 0 = domingo ... 6 = sabado; null = descanso */
  weekMap: (ID | null)[]
  workouts: Workout[]
}

export interface TrainingLog {
  date: ISODate
  workoutId: ID | null
  done: boolean
  difficulty: Scale5 | null
  energy: Scale5 | null
  durationMinutes: number | null
  notes: string
}

/* ---------------------------------------------------------------- */
/* Nutricao                                                          */
/* ---------------------------------------------------------------- */

export type FoodRole = 'carbo' | 'proteina' | 'vegetal' | 'gordura' | 'fruta' | 'laticinio' | 'extra'

export interface Food {
  id: ID
  name: string
  role: FoodRole
  tags: string[]
  defaultAmount: string
}

export type MealSlot = 'cafe' | 'lanche_manha' | 'almoco' | 'lanche_tarde' | 'jantar' | 'ceia'

export interface MealComponent {
  foodId: ID | null
  name: string
  role: FoodRole
  amount: string
}

export interface Meal extends Synced {
  id: ID
  /** quando veio de um plano prescrito, o id desse plano */
  sourcePlanId?: ID | null
  name: string
  slot: MealSlot
  components: MealComponent[]
  /** Refeicao recorrente entra sozinha no plano do dia. */
  recurring: boolean
  timeHint?: string
}

export interface MealLog {
  mealId: ID
  status: 'feita' | 'trocada' | 'pulada'
  replacedWith?: string
}

export interface Recipe {
  id: ID
  name: string
  minutes: number
  slots: MealSlot[]
  tags: string[]
  goals: NutritionGoal[]
  ingredients: string[]
  steps: string[]
}

/* ---------------------------------------------------------------- */
/* Motor                                                             */
/* ---------------------------------------------------------------- */

export interface Drill {
  id: ID
  name: string
  category: MotorCategory
  minutes: number
  howTo: string
  needsObject?: boolean
}

export interface MotorSessionDrill {
  drillId: ID
  name: string
  category: MotorCategory
  minutes: number
  howTo: string
}

export interface MotorSession {
  id: ID
  date: ISODate
  totalMinutes: number
  drills: MotorSessionDrill[]
}

export interface MotorLog {
  sessionId: ID
  done: boolean
  difficulty: Scale5 | null
}

/* ---------------------------------------------------------------- */
/* Habitos, rotinas, leitura                                         */
/* ---------------------------------------------------------------- */

export type HabitCadence = 'diario' | 'dias_uteis' | 'semanal'

export interface Habit extends Synced {
  id: ID
  name: string
  icon: string
  cadence: HabitCadence
  /** meta numerica opcional, ex.: 8 copos de agua */
  target?: number
  unit?: string
  pillar: PillarId
  active: boolean
  createdAt: string
}

export type RoutineKind = 'manha' | 'noite'

export interface RoutineStep {
  id: ID
  name: string
  minutes: number
  note?: string
}

export interface Routine {
  kind: RoutineKind
  steps: RoutineStep[]
}

export interface Book extends Synced {
  id: ID
  title: string
  author: string
  area: string
  totalPages: number | null
  currentPage: number
  status: 'lendo' | 'concluido' | 'pausado'
  startedAt: string
}

export interface ReadingLog {
  bookId: ID | null
  minutes: number
  pages: number
}

/* ---------------------------------------------------------------- */
/* Check-in e dia                                                    */
/* ---------------------------------------------------------------- */

export type Scale5 = 1 | 2 | 3 | 4 | 5
export type FoodQuality = 'boa' | 'media' | 'ruim'

export interface CheckIn {
  sleep: Scale5
  energy: Scale5
  mood: Scale5
  stress: Scale5
  trainingDone: boolean
  foodQuality: FoodQuality
  readingDone: boolean
  notes: string
  createdAt: string
}

/** Tudo que foi PLANEJADO para um dia. */
export interface DayPlan {
  date: ISODate
  workoutId: ID | null
  mealIds: ID[]
  motorSession: MotorSession | null
  habitIds: ID[]
  readingMinutes: number
  focusHabitId: ID | null
  /** Explicacoes legiveis do que o motor de adaptacao mudou. */
  adjustments: string[]
  generatedAt: string
}

/** Tudo que foi EXECUTADO num dia. */
export interface DayLog {
  date: ISODate
  /** ultima alteracao neste dia, usada para juntar dois aparelhos */
  updatedAt: string
  /** chaves: "treino" | "motor" | "leitura" | "manha:<id>" | "noite:<id>" | "habito:<id>" | "refeicao:<id>" */
  done: Record<string, boolean>
  habitProgress: Record<ID, number>
  training: TrainingLog | null
  motor: MotorLog | null
  reading: ReadingLog | null
  meals: MealLog[]
  checkIn: CheckIn | null
}

/* ---------------------------------------------------------------- */
/* Metas com prazo                                                   */
/* ---------------------------------------------------------------- */

export type GoalKind = 'prova' | 'trilha' | 'competicao' | 'viagem' | 'evento' | 'outro'
export type GoalFocus = 'treino' | 'nutricao' | 'motor' | 'mente'

/**
 * Objetivo com data marcada: uma prova, uma trilha, uma viagem.
 * Diferente dos objetivos permanentes do perfil, esta meta tem fim e
 * aperta a rotina enquanto durar.
 */
export interface TimedGoal extends Synced {
  id: ID
  name: string
  kind: GoalKind
  focus: GoalFocus[]
  startDate: ISODate
  targetDate: ISODate
  /** 0 = so acompanhar, 1 = subir um pouco, 2 = foco total */
  intensity: 0 | 1 | 2
  /** treinos por semana durante a preparacao; nulo mantem o do perfil */
  weeklyTrainingTarget: number | null
  notes: string
  status: 'ativa' | 'concluida' | 'abandonada'
}

/* ---------------------------------------------------------------- */
/* Planos prescritos por profissional                                */
/* ---------------------------------------------------------------- */

export type PrescriptionKind = 'nutricao' | 'treino'

export interface PrescribedItem {
  name: string
  amount: string
}

export interface PrescribedMeal {
  id: ID
  name: string
  slot: MealSlot
  timeHint: string
  items: PrescribedItem[]
  notes: string
}

export interface PrescribedExercise {
  name: string
  sets: string
  reps: string
  rest: string
  notes: string
}

export interface PrescribedWorkout {
  id: ID
  name: string
  /** dias da semana em que este treino acontece (0 = domingo) */
  weekdays: number[]
  exercises: PrescribedExercise[]
  notes: string
}

/**
 * Plano vindo de fora: nutricionista ou personal.
 * Quando ativo, ele manda no dia e o gerador interno fica de reserva.
 * E a peca que, no futuro, o profissional preenche pelo lado dele.
 */
export interface PrescribedPlan extends Synced {
  id: ID
  kind: PrescriptionKind
  title: string
  professional: { name: string; role: string; contact: string }
  startDate: ISODate
  endDate: ISODate | null
  active: boolean
  notes: string
  meals: PrescribedMeal[]
  workouts: PrescribedWorkout[]
}

/* ---------------------------------------------------------------- */
/* Pilares                                                           */
/* ---------------------------------------------------------------- */

export type PillarId = 'corpo' | 'movimento' | 'mente' | 'bem_estar'

export interface Pillar {
  id: PillarId
  name: string
  description: string
  accent: string
  subItems: string[]
}

/* ---------------------------------------------------------------- */
/* Estado persistido                                                 */
/* ---------------------------------------------------------------- */

/** Estado da sincronizacao entre aparelhos. */
export interface SyncState {
  /** identifica este aparelho, para saber de quem veio a ultima escrita */
  deviceId: string
  lastSyncedAt: string | null
  /** ultima alteracao local ainda nao enviada */
  dirtySince: string | null
}

export interface AppState {
  version: number
  onboarded: boolean
  profile: Profile
  /** marca de tempo do perfil e das rotinas, que sao objetos unicos */
  profileUpdatedAt: string
  routinesUpdatedAt: string
  trainingPlanUpdatedAt: string
  auth: { pinHash: string | null; lockEnabled: boolean }
  trainingPlan: WeeklyTrainingPlan | null
  meals: Meal[]
  habits: Habit[]
  routines: Record<RoutineKind, Routine>
  books: Book[]
  goals: TimedGoal[]
  prescriptions: PrescribedPlan[]
  plans: Record<ISODate, DayPlan>
  logs: Record<ISODate, DayLog>
  sync: SyncState
}
