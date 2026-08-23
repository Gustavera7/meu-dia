import type { AppState, ModuleId, Profile } from '@/core/types'
import { makeId } from '@/core/id'
import { buildEveningRoutine, buildMorningRoutine } from '@/domain/routines/defaults'

export const ALL_MODULES: ModuleId[] = [
  'treino', 'nutricao', 'motor', 'habitos', 'leitura',
  'rotina_manha', 'rotina_noite', 'checkin',
]

export function defaultProfile(): Profile {
  return {
    name: '',
    createdAt: new Date().toISOString(),
    basics: { age: null, sex: null, heightCm: null, weightKg: null },
    goals: [],
    training: {
      experience: 'iniciante',
      daysPerWeek: 3,
      sessionMinutes: 45,
      equipment: ['peso_corpo'],
      style: 'musculacao',
      modalities: ['musculacao'],
    },
    nutrition: {
      dietStyle: 'onivora',
      goal: 'mais_saude',
      restrictions: [],
      preferences: [],
      dislikes: [],
      mealsPerDay: 4,
    },
    routine: {
      wakeTime: '06:30',
      sleepTime: '23:00',
      morningMinutes: 30,
      eveningMinutes: 50,
    },
    motor: { focus: ['mobilidade', 'equilibrio', 'coordenacao'], sessionMinutes: 8 },
    personal: { readingFrequency: 'as_vezes', readingMinutes: 15, interests: [] },
    modules: Object.fromEntries(ALL_MODULES.map((m) => [m, true])) as Record<ModuleId, boolean>,
  }
}

export const STATE_VERSION = 3

export function emptyState(): AppState {
  const profile = defaultProfile()
  const agora = new Date().toISOString()
  return {
    version: STATE_VERSION,
    onboarded: false,
    profile,
    profileUpdatedAt: agora,
    routinesUpdatedAt: agora,
    trainingPlanUpdatedAt: agora,
    auth: { pinHash: null, lockEnabled: false },
    trainingPlan: null,
    meals: [],
    habits: [],
    routines: {
      manha: buildMorningRoutine(profile.routine.morningMinutes),
      noite: buildEveningRoutine(profile.routine.eveningMinutes),
    },
    books: [],
    goals: [],
    prescriptions: [],
    plans: {},
    logs: {},
    sync: { deviceId: makeId('dev'), lastSyncedAt: null, dirtySince: null },
  }
}
