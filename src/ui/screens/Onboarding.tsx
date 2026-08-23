import { useMemo, useState } from 'react'
import type { Equipment, GoalId, Modality, MotorCategory, Profile } from '@/core/types'
import {
  DIET_OPTIONS, EQUIPMENT_OPTIONS, EXPERIENCE_OPTIONS, GOALS, INTEREST_OPTIONS,
  MOTOR_OPTIONS, NUTRITION_GOAL_OPTIONS, READING_FREQ_OPTIONS, RESTRICTION_LABELS,
  RESTRICTION_OPTIONS, SEX_OPTIONS,
} from '@/core/labels'
import { MODALITIES } from '@/domain/training/modalities'
import { defaultProfile } from '@/data/defaults'
import { HABIT_SEEDS, habitFromSeed } from '@/domain/habits/defaults'
import { buildInitialMeals } from '@/domain/nutrition/meals'
import { buildEveningRoutine, buildMorningRoutine } from '@/domain/routines/defaults'
import { generateWeeklyPlan } from '@/domain/training/generator'
import { useApp } from '@/state/useApp'
import { today } from '@/core/dates'
import {
  Button, Chip, Field, Input, ProgressBar, Stepper, TextArea,
} from '@/ui/components/primitives'

/** Alterna um item numa lista de selecao multipla. */
function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

export default function Onboarding() {
  const { dispatch } = useApp()
  const [step, setStep] = useState(0)
  const [p, setP] = useState<Profile>(defaultProfile)
  const [habitKeys, setHabitKeys] = useState<string[]>(['agua', 'treinar', 'leitura'])
  const [dislikesText, setDislikesText] = useState('')

  const set = (patch: Partial<Profile>) => setP((prev) => ({ ...prev, ...patch }))
  const setTraining = (patch: Partial<Profile['training']>) =>
    setP((prev) => ({ ...prev, training: { ...prev.training, ...patch } }))
  const setNutrition = (patch: Partial<Profile['nutrition']>) =>
    setP((prev) => ({ ...prev, nutrition: { ...prev.nutrition, ...patch } }))
  const setRoutine = (patch: Partial<Profile['routine']>) =>
    setP((prev) => ({ ...prev, routine: { ...prev.routine, ...patch } }))

  function finish() {
    const profile: Profile = {
      ...p,
      name: p.name.trim() || 'voce',
      nutrition: {
        ...p.nutrition,
        dislikes: dislikesText.split(',').map((s) => s.trim()).filter(Boolean),
      },
      personal: {
        ...p.personal,
        readingMinutes:
          READING_FREQ_OPTIONS.find((o) => o.id === p.personal.readingFrequency)?.minutes ?? 15,
      },
    }
    dispatch({
      type: 'finish_onboarding',
      profile,
      habits: HABIT_SEEDS.filter((s) => habitKeys.includes(s.key)).map(habitFromSeed),
      meals: buildInitialMeals(profile),
      plan: generateWeeklyPlan(profile),
      routines: {
        manha: buildMorningRoutine(profile.routine.morningMinutes),
        noite: buildEveningRoutine(profile.routine.eveningMinutes),
      },
    })
    dispatch({ type: 'ensure_plan', date: today() })
  }

  const steps = useMemo(
    () => [
      {
        title: 'Vamos comecar',
        hint: 'Sete perguntas rapidas. Da para mudar tudo depois.',
        valid: true,
        body: (
          <>
            <Field label="Como voce quer ser chamado?">
              <Input
                value={p.name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder="Seu nome"
                autoFocus
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Idade">
                <Input
                  type="number" inputMode="numeric" placeholder="30"
                  value={p.basics.age ?? ''}
                  onChange={(e) => set({ basics: { ...p.basics, age: Number(e.target.value) || null } })}
                />
              </Field>
              <Field label="Peso (kg)">
                <Input
                  type="number" inputMode="decimal" placeholder="75"
                  value={p.basics.weightKg ?? ''}
                  onChange={(e) => set({ basics: { ...p.basics, weightKg: Number(e.target.value) || null } })}
                />
              </Field>
              <Field label="Altura (cm)">
                <Input
                  type="number" inputMode="numeric" placeholder="178"
                  value={p.basics.heightCm ?? ''}
                  onChange={(e) => set({ basics: { ...p.basics, heightCm: Number(e.target.value) || null } })}
                />
              </Field>
            </div>
            <Field label="Sexo">
              <div className="grid grid-cols-3 gap-2">
                {SEX_OPTIONS.map((o) => (
                  <Chip key={o.id} label={o.label} selected={p.basics.sex === o.id}
                    onClick={() => set({ basics: { ...p.basics, sex: o.id } })} />
                ))}
              </div>
            </Field>
          </>
        ),
      },
      {
        title: 'O que voce quer conquistar?',
        hint: 'Pode escolher mais de um.',
        valid: p.goals.length > 0,
        body: (
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map((g) => (
              <Chip key={g.id} label={g.label} hint={g.hint} selected={p.goals.includes(g.id)}
                onClick={() => set({ goals: toggle<GoalId>(p.goals, g.id) })} />
            ))}
          </div>
        ),
      },
      {
        title: 'Seu treino',
        hint: 'Isso define a rotina semanal que vou montar.',
        valid: p.training.equipment.length > 0 && (p.training.modalities ?? []).length > 0,
        body: (
          <>
            <Field label="Experiencia">
              <div className="grid grid-cols-3 gap-2">
                {EXPERIENCE_OPTIONS.map((o) => (
                  <Chip key={o.id} label={o.label} hint={o.hint} selected={p.training.experience === o.id}
                    onClick={() => setTraining({ experience: o.id })} />
                ))}
              </div>
            </Field>
            <Field label="Treinos por semana">
              <Stepper value={p.training.daysPerWeek} min={1} max={6}
                onChange={(v) => setTraining({ daysPerWeek: v })} suffix="x" />
            </Field>
            <Field label="Tempo por treino">
              <Stepper value={p.training.sessionMinutes} min={15} max={120}
                onChange={(v) => setTraining({ sessionMinutes: v })} suffix="min" />
            </Field>
            <Field label="O que voce tem disponivel">
              <div className="grid grid-cols-2 gap-2">
                {EQUIPMENT_OPTIONS.map((o) => (
                  <Chip key={o.id} label={o.label} selected={p.training.equipment.includes(o.id)}
                    onClick={() => setTraining({ equipment: toggle<Equipment>(p.training.equipment, o.id) })} />
                ))}
              </div>
            </Field>
            <Field label="O que voce faz" hint="Pode marcar mais de um. A semana se divide entre eles.">
              <div className="grid grid-cols-2 gap-2">
                {MODALITIES.map((o) => (
                  <Chip key={o.id} label={o.label} hint={o.hint}
                    selected={(p.training.modalities ?? []).includes(o.id)}
                    onClick={() => setTraining({ modalities: toggle<Modality>(p.training.modalities ?? [], o.id) })} />
                ))}
              </div>
            </Field>
          </>
        ),
      },
      {
        title: 'Sua alimentacao',
        hint: 'Serve para montar suas refeicoes e as trocas.',
        valid: true,
        body: (
          <>
            <Field label="Como voce come hoje">
              <div className="grid grid-cols-2 gap-2">
                {DIET_OPTIONS.map((o) => (
                  <Chip key={o.id} label={o.label} selected={p.nutrition.dietStyle === o.id}
                    onClick={() => setNutrition({ dietStyle: o.id })} />
                ))}
              </div>
            </Field>
            <Field label="Objetivo alimentar">
              <div className="grid grid-cols-2 gap-2">
                {NUTRITION_GOAL_OPTIONS.map((o) => (
                  <Chip key={o.id} label={o.label} selected={p.nutrition.goal === o.id}
                    onClick={() => setNutrition({ goal: o.id })} />
                ))}
              </div>
            </Field>
            <Field label="Restricoes">
              <div className="grid grid-cols-2 gap-2">
                {RESTRICTION_OPTIONS.map((r) => (
                  <Chip key={r} label={RESTRICTION_LABELS[r]} selected={p.nutrition.restrictions.includes(r)}
                    onClick={() => setNutrition({ restrictions: toggle(p.nutrition.restrictions, r) })} />
                ))}
              </div>
            </Field>
            <Field label="Refeicoes por dia">
              <Stepper value={p.nutrition.mealsPerDay} min={2} max={6}
                onChange={(v) => setNutrition({ mealsPerDay: v })} />
            </Field>
            <Field label="Alimentos que voce nao gosta" hint="Separe por virgula. Eles nunca vao aparecer nas sugestoes.">
              <TextArea rows={2} value={dislikesText} placeholder="jiló, fígado, berinjela"
                onChange={(e) => setDislikesText(e.target.value)} />
            </Field>
          </>
        ),
      },
      {
        title: 'Seus horarios',
        hint: 'A rotina se encaixa no tempo que voce tem, nao o contrario.',
        valid: true,
        body: (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Acordo as">
                <Input type="time" value={p.routine.wakeTime}
                  onChange={(e) => setRoutine({ wakeTime: e.target.value })} />
              </Field>
              <Field label="Durmo as">
                <Input type="time" value={p.routine.sleepTime}
                  onChange={(e) => setRoutine({ sleepTime: e.target.value })} />
              </Field>
            </div>
            <Field label="Tempo livre de manha">
              <Stepper value={p.routine.morningMinutes} min={5} max={90}
                onChange={(v) => setRoutine({ morningMinutes: v })} suffix="min" />
            </Field>
            <Field label="Tempo livre a noite">
              <Stepper value={p.routine.eveningMinutes} min={5} max={120}
                onChange={(v) => setRoutine({ eveningMinutes: v })} suffix="min" />
            </Field>
          </>
        ),
      },
      {
        title: 'Desenvolvimento motor',
        hint: 'Sessoes de 5 a 10 minutos, todo dia. E onde a maioria dos apps nao chega.',
        valid: p.motor.focus.length > 0,
        body: (
          <>
            <Field label="No que voce quer evoluir">
              <div className="grid grid-cols-2 gap-2">
                {MOTOR_OPTIONS.map((o) => (
                  <Chip key={o.id} label={o.label} hint={o.hint} selected={p.motor.focus.includes(o.id)}
                    onClick={() => setP({ ...p, motor: { ...p.motor, focus: toggle<MotorCategory>(p.motor.focus, o.id) } })} />
                ))}
              </div>
            </Field>
            <Field label="Duracao da sessao">
              <Stepper value={p.motor.sessionMinutes} min={4} max={12}
                onChange={(v) => setP({ ...p, motor: { ...p.motor, sessionMinutes: v } })} suffix="min" />
            </Field>
          </>
        ),
      },
      {
        title: 'Leitura e habitos',
        hint: 'Ultimo passo. Comece com poucos habitos.',
        valid: true,
        body: (
          <>
            <Field label="Voce le hoje em dia?">
              <div className="grid grid-cols-2 gap-2">
                {READING_FREQ_OPTIONS.map((o) => (
                  <Chip key={o.id} label={o.label} selected={p.personal.readingFrequency === o.id}
                    onClick={() => setP({ ...p, personal: { ...p.personal, readingFrequency: o.id, readingMinutes: o.minutes } })} />
                ))}
              </div>
            </Field>
            <Field label="Areas de interesse">
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((i) => (
                  <Chip key={i} label={i} selected={p.personal.interests.includes(i)}
                    onClick={() => setP({ ...p, personal: { ...p.personal, interests: toggle(p.personal.interests, i) } })} />
                ))}
              </div>
            </Field>
            <Field label="Habitos para comecar" hint="Tres ou quatro ja e bastante. Da para adicionar mais depois.">
              <div className="grid grid-cols-2 gap-2">
                {HABIT_SEEDS.map((h) => (
                  <Chip key={h.key} label={h.name} selected={habitKeys.includes(h.key)}
                    onClick={() => setHabitKeys(toggle(habitKeys, h.key))} />
                ))}
              </div>
            </Field>
          </>
        ),
      },
    ],
    [p, habitKeys, dislikesText],
  )

  const current = steps[step]
  const isLast = step === steps.length - 1

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-8">
      <header className="safe-top pt-4">
        <ProgressBar ratio={(step + 1) / steps.length} />
        <p className="mt-2 text-[11px] text-faint">
          Passo {step + 1} de {steps.length}
        </p>
      </header>

      <main key={step} className="animate-rise flex-1 pt-6">
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight">{current.title}</h1>
        <p className="mb-6 mt-1.5 text-sm text-muted">{current.hint}</p>
        {current.body}
      </main>

      <footer className="sticky bottom-0 -mx-5 bg-ink/95 px-5 pb-6 pt-3 backdrop-blur">
        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="subtle" onClick={() => setStep(step - 1)}>
              Voltar
            </Button>
          )}
          <Button
            full
            disabled={!current.valid}
            onClick={() => (isLast ? finish() : setStep(step + 1))}
          >
            {isLast ? 'Montar minha rotina' : 'Continuar'}
          </Button>
        </div>
      </footer>
    </div>
  )
}
