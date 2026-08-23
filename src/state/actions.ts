import type {
  AppState, Book, CheckIn, DayLog, Habit, ISODate, Meal, MealLog,
  MotorLog, Profile, ReadingLog, Routine, RoutineKind, TrainingLog,
  ModuleId, WeeklyTrainingPlan, TimedGoal, PrescribedPlan,
} from '@/core/types'

export type Action =
  | { type: 'hydrate'; state: AppState }
  | { type: 'finish_onboarding'; profile: Profile; habits: Habit[]; meals: Meal[]; plan: WeeklyTrainingPlan; routines: Record<RoutineKind, Routine> }
  | { type: 'update_profile'; patch: Partial<Profile> }
  | { type: 'set_module'; module: ModuleId; enabled: boolean }
  | { type: 'ensure_plan'; date: ISODate }
  | { type: 'regenerate_plan'; date: ISODate }
  | { type: 'regenerate_training' }
  | { type: 'toggle_task'; date: ISODate; key: string; value?: boolean }
  | { type: 'set_habit_progress'; date: ISODate; habitId: string; value: number }
  | { type: 'log_training'; date: ISODate; log: TrainingLog }
  | { type: 'log_motor'; date: ISODate; log: MotorLog }
  | { type: 'log_reading'; date: ISODate; log: ReadingLog }
  | { type: 'log_meal'; date: ISODate; log: MealLog }
  | { type: 'save_checkin'; date: ISODate; checkIn: CheckIn }
  | { type: 'add_habit'; habit: Habit }
  | { type: 'update_habit'; id: string; patch: Partial<Habit> }
  | { type: 'remove_habit'; id: string }
  | { type: 'add_meal'; meal: Meal }
  | { type: 'update_meal'; id: string; patch: Partial<Meal> }
  | { type: 'remove_meal'; id: string }
  | { type: 'update_routine'; kind: RoutineKind; routine: Routine }
  | { type: 'add_book'; book: Book }
  | { type: 'update_book'; id: string; patch: Partial<Book> }
  | { type: 'remove_book'; id: string }
  | { type: 'add_goal'; goal: TimedGoal }
  | { type: 'update_goal'; id: string; patch: Partial<TimedGoal> }
  | { type: 'remove_goal'; id: string }
  | { type: 'add_prescription'; plan: PrescribedPlan }
  | { type: 'update_prescription'; id: string; patch: Partial<PrescribedPlan> }
  | { type: 'remove_prescription'; id: string }
  | { type: 'activate_prescription'; id: string }
  | { type: 'deactivate_prescription'; id: string }
  | { type: 'set_pin'; pinHash: string | null }
  | { type: 'reset_all' }

export type LogPatch = (log: DayLog) => DayLog
