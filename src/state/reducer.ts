import type { AppState, DayLog, ISODate } from '@/core/types'
import { addDays, today as todayISO } from '@/core/dates'
import { stamp } from '@/core/id'
import { buildDayPlan } from '@/domain/planning/dayPlan'
import { generateWeeklyPlan } from '@/domain/training/generator'
import { goalVolumeFactor, primaryGoal, weeklyTrainingFor } from '@/domain/goals/goals'
import { mealsFromPrescription, trainingPlanFromPrescription } from '@/domain/prescriptions/prescriptions'
import { emptyState } from '@/data/defaults'
import type { Action, LogPatch } from './actions'

function blankLog(date: ISODate): DayLog {
  return {
    date,
    updatedAt: stamp(),
    done: {},
    habitProgress: {},
    training: null,
    motor: null,
    reading: null,
    meals: [],
    checkIn: null,
  }
}

/** Aplica uma mudanca no log de um dia sem se preocupar se ele ja existe. */
function withLog(state: AppState, date: ISODate, patch: LogPatch): AppState {
  const current = state.logs[date] ?? blankLog(date)
  // O carimbo sai daqui para nenhuma acao poder esquecer dele: e ele que
  // decide quem ganha quando celular e computador se encontram.
  const next = { ...patch(current), updatedAt: stamp() }
  return { ...state, logs: { ...state.logs, [date]: next }, sync: dirty(state) }
}

/** Marca que existe alteracao local ainda nao enviada para a nuvem. */
function dirty(state: AppState): AppState['sync'] {
  return { ...state.sync, dirtySince: state.sync.dirtySince ?? stamp() }
}

/** Apagar deixa lapide: sem ela, o outro aparelho ressuscita o registro. */
function tombstone<T extends { id: string; updatedAt: string; deletedAt?: string | null }>(
  lista: T[],
  id: string,
): T[] {
  return lista.map((r) => (r.id === id ? { ...r, deletedAt: stamp(), updatedAt: stamp() } : r))
}

/**
 * Habitos e refeicoes sao catalogos vivos: criar um habito hoje precisa
 * refleti-lo no plano de hoje, nao so no de amanha. Planos passados ficam
 * como estao, para o historico continuar contando o que valia naquele dia.
 */
function syncCatalog(state: AppState): AppState {
  const from = todayISO()
  const habitIds = state.profile.modules.habitos
    ? state.habits.filter((h) => h.active && !h.deletedAt).map((h) => h.id)
    : []
  const mealIds = state.profile.modules.nutricao
    ? state.meals.filter((m) => m.recurring && !m.deletedAt).map((m) => m.id)
    : []

  const plans = { ...state.plans }
  for (const date of Object.keys(plans)) {
    if (date < from) continue
    plans[date] = { ...plans[date], habitIds, mealIds }
  }
  return { ...state, plans }
}

function ensurePlan(state: AppState, date: ISODate): AppState {
  if (state.plans[date]) return state
  return { ...state, plans: { ...state.plans, [date]: buildDayPlan(state, date) } }
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate':
      return action.state

    case 'finish_onboarding': {
      const next: AppState = {
        ...state,
        onboarded: true,
        profile: action.profile,
        habits: action.habits,
        meals: action.meals,
        trainingPlan: action.plan,
        routines: action.routines,
        profileUpdatedAt: stamp(),
        routinesUpdatedAt: stamp(),
        trainingPlanUpdatedAt: stamp(),
        sync: dirty(state),
      }
      return next
    }

    case 'update_profile':
      return {
        ...state,
        profile: { ...state.profile, ...action.patch },
        profileUpdatedAt: stamp(),
        sync: dirty(state),
      }

    case 'set_module':
      return syncCatalog({
        ...state,
        profile: {
          ...state.profile,
          modules: { ...state.profile.modules, [action.module]: action.enabled },
        },
        profileUpdatedAt: stamp(),
        sync: dirty(state),
      })

    case 'ensure_plan':
      return ensurePlan(state, action.date)

    case 'regenerate_plan':
      return { ...state, plans: { ...state.plans, [action.date]: buildDayPlan(state, action.date) } }

    case 'regenerate_training': {
      // Se existe meta com prazo pedindo mais treinos, a rotina ja nasce nela.
      const meta = primaryGoal(state.goals, todayISO())
      const frequencia = meta
        ? weeklyTrainingFor(meta, state.profile.training.daysPerWeek)
        : undefined
      // A fase da preparacao decide o volume: base sobe devagar, pico
      // exige mais, e a reta final corta de proposito.
      const volume = goalVolumeFactor(meta, todayISO())
      const plan = generateWeeklyPlan(state.profile, undefined, frequencia, volume)
      // planos futuros ficam obsoletos quando a rotina de treino muda
      const cutoff = todayISO()
      const plans = Object.fromEntries(
        Object.entries(state.plans).filter(([date]) => date <= cutoff),
      )
      return {
        ...state,
        trainingPlan: plan,
        trainingPlanUpdatedAt: stamp(),
        plans,
        sync: dirty(state),
      }
    }

    case 'toggle_task':
      return withLog(state, action.date, (log) => {
        const value = action.value ?? !log.done[action.key]
        return { ...log, done: { ...log.done, [action.key]: value } }
      })

    case 'set_habit_progress':
      return withLog(state, action.date, (log) => ({
        ...log,
        habitProgress: { ...log.habitProgress, [action.habitId]: action.value },
      }))

    case 'log_training':
      return withLog(state, action.date, (log) => ({
        ...log,
        training: action.log,
        done: { ...log.done, treino: action.log.done },
      }))

    case 'log_motor':
      return withLog(state, action.date, (log) => ({
        ...log,
        motor: action.log,
        done: { ...log.done, motor: action.log.done },
      }))

    case 'log_reading':
      return withLog(state, action.date, (log) => ({
        ...log,
        reading: action.log,
        done: { ...log.done, leitura: action.log.minutes > 0 },
      }))

    case 'log_meal':
      return withLog(state, action.date, (log) => ({
        ...log,
        meals: [...log.meals.filter((m) => m.mealId !== action.log.mealId), action.log],
        done: { ...log.done, [`refeicao:${action.log.mealId}`]: action.log.status !== 'pulada' },
      }))

    case 'save_checkin': {
      const withCheckIn = withLog(state, action.date, (log) => ({
        ...log,
        checkIn: action.checkIn,
        done: { ...log.done, checkin: true },
      }))
      // o check-in e o gatilho da preparacao do dia seguinte
      const next = addDays(action.date, 1)
      return {
        ...withCheckIn,
        plans: { ...withCheckIn.plans, [next]: buildDayPlan(withCheckIn, next) },
      }
    }

    case 'add_habit':
      return syncCatalog({ ...state, habits: [...state.habits, action.habit], sync: dirty(state) })

    case 'update_habit':
      return syncCatalog({
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.id ? { ...h, ...action.patch, updatedAt: stamp() } : h,
        ),
        sync: dirty(state),
      })

    case 'remove_habit':
      return syncCatalog({ ...state, habits: tombstone(state.habits, action.id), sync: dirty(state) })

    case 'add_meal':
      return syncCatalog({ ...state, meals: [...state.meals, action.meal], sync: dirty(state) })

    case 'update_meal':
      return syncCatalog({
        ...state,
        meals: state.meals.map((m) =>
          m.id === action.id ? { ...m, ...action.patch, updatedAt: stamp() } : m,
        ),
        sync: dirty(state),
      })

    case 'remove_meal':
      return syncCatalog({ ...state, meals: tombstone(state.meals, action.id), sync: dirty(state) })

    case 'update_routine':
      return {
        ...state,
        routines: { ...state.routines, [action.kind]: action.routine },
        routinesUpdatedAt: stamp(),
        sync: dirty(state),
      }

    case 'add_book':
      return { ...state, books: [...state.books, action.book], sync: dirty(state) }

    case 'update_book':
      return {
        ...state,
        books: state.books.map((b) =>
          b.id === action.id ? { ...b, ...action.patch, updatedAt: stamp() } : b,
        ),
        sync: dirty(state),
      }

    case 'remove_book':
      return { ...state, books: tombstone(state.books, action.id), sync: dirty(state) }

    case 'add_goal': {
      let next: AppState = {
        ...state,
        goals: [...state.goals, action.goal],
        sync: dirty(state),
      }

      // Preparar uma maratona sem corrida na semana nao faria sentido: o
      // esporte da meta entra no perfil se ainda nao estiver la.
      const esporte = action.goal.sport
      if (esporte && !(next.profile.training.modalities ?? []).includes(esporte)) {
        next = {
          ...next,
          profile: {
            ...next.profile,
            training: {
              ...next.profile.training,
              modalities: [esporte, ...(next.profile.training.modalities ?? [])],
            },
          },
          profileUpdatedAt: stamp(),
        }
      }

      // Rotina prescrita por profissional nunca e substituida pelo app.
      const prescrito = next.trainingPlan?.source === 'prescrito'
      if (!prescrito && action.goal.focus.includes('treino')) {
        next = {
          ...next,
          trainingPlan: generateWeeklyPlan(
            next.profile,
            undefined,
            weeklyTrainingFor(action.goal, next.profile.training.daysPerWeek),
            goalVolumeFactor(action.goal, todayISO()),
          ),
          trainingPlanUpdatedAt: stamp(),
        }
      }
      return next
    }

    case 'update_goal':
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.id ? { ...g, ...action.patch, updatedAt: stamp() } : g,
        ),
        sync: dirty(state),
      }

    case 'remove_goal':
      return { ...state, goals: tombstone(state.goals, action.id), sync: dirty(state) }

    case 'add_prescription':
      return { ...state, prescriptions: [...state.prescriptions, action.plan], sync: dirty(state) }

    case 'update_prescription':
      return {
        ...state,
        prescriptions: state.prescriptions.map((p) =>
          p.id === action.id ? { ...p, ...action.patch, updatedAt: stamp() } : p,
        ),
        sync: dirty(state),
      }

    case 'remove_prescription':
      return {
        ...state,
        prescriptions: tombstone(state.prescriptions, action.id),
        sync: dirty(state),
      }

    case 'activate_prescription': {
      const alvo = state.prescriptions.find((p) => p.id === action.id)
      if (!alvo) return state
      // So um plano ativo por area: dois planos de nutricionista ao mesmo
      // tempo deixariam o dia ambiguo.
      const prescriptions = state.prescriptions.map((p) =>
        p.kind === alvo.kind
          ? { ...p, active: p.id === alvo.id, updatedAt: stamp() }
          : p,
      )
      let next: AppState = { ...state, prescriptions, sync: dirty(state) }

      if (alvo.kind === 'nutricao') {
        // As refeicoes proprias ficam guardadas como lapide reversivel:
        // desativar o plano traz tudo de volta.
        const proprias = next.meals.map((m) =>
          m.sourcePlanId ? m : { ...m, deletedAt: stamp(), updatedAt: stamp() },
        )
        next = { ...next, meals: [...proprias, ...mealsFromPrescription(alvo)] }
      } else {
        next = {
          ...next,
          trainingPlan: trainingPlanFromPrescription(alvo),
          trainingPlanUpdatedAt: stamp(),
        }
      }
      return syncCatalog(next)
    }

    case 'deactivate_prescription': {
      const alvo = state.prescriptions.find((p) => p.id === action.id)
      if (!alvo) return state
      const prescriptions = state.prescriptions.map((p) =>
        p.id === action.id ? { ...p, active: false, updatedAt: stamp() } : p,
      )
      let next: AppState = { ...state, prescriptions, sync: dirty(state) }

      if (alvo.kind === 'nutricao') {
        // Some o que veio do plano e voltam as refeicoes de antes.
        const semPlano = next.meals
          .filter((m) => m.sourcePlanId !== alvo.id)
          .map((m) => (m.sourcePlanId ? m : { ...m, deletedAt: null, updatedAt: stamp() }))
        next = { ...next, meals: semPlano }
      } else if (next.trainingPlan?.sourcePlanId === alvo.id) {
        next = {
          ...next,
          trainingPlan: generateWeeklyPlan(next.profile),
          trainingPlanUpdatedAt: stamp(),
        }
      }
      return syncCatalog(next)
    }

    case 'set_pin':
      return {
        ...state,
        auth: { pinHash: action.pinHash, lockEnabled: action.pinHash !== null },
        profileUpdatedAt: stamp(),
        sync: dirty(state),
      }

    case 'reset_all':
      return emptyState()

    default:
      return state
  }
}
