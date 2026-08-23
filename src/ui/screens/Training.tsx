import { useState } from 'react'
import type { Scale5, Workout } from '@/core/types'
import { weekdayIndex } from '@/core/dates'
import { SCALE_LABELS } from '@/core/labels'
import { workoutForPlan } from '@/domain/planning/dayPlan'
import { useNavigate } from 'react-router-dom'
import { useToday } from '@/state/useApp'
import { activePrescription } from '@/state/selectors'
import { Screen } from '@/ui/components/Layout'
import {
  Button, Card, EmptyState, Field, Note, Scale, Section, Sheet,
  Stepper, Tag, TextArea, cx,
} from '@/ui/components/primitives'

const DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

function ExerciseList({ workout }: { workout: Workout }) {
  return (
    <div className="divide-y divide-line/60">
      {workout.blocks.map((b, i) => (
        <div key={`${b.exerciseId}-${i}`} className="py-3 first:pt-0 last:pb-0">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[15px] font-medium">{b.name}</p>
            <span className="shrink-0 text-[13px] tabular-nums text-accent">
              {b.sets} x {b.reps}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-faint">descanso {b.restSeconds}s</span>
            {b.note && <span className="text-[11px] text-faint">- {b.note}</span>}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Training() {
  const { state, dispatch, today, plan } = useToday()
  const navigate = useNavigate()
  const ficha = activePrescription(state, 'treino', today)
  const prescrito = state.trainingPlan?.source === 'prescrito'
  const [logging, setLogging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const weekly = state.trainingPlan
  const workout = workoutForPlan(state, plan)
  const log = state.logs[today]?.training

  const [difficulty, setDifficulty] = useState<Scale5 | null>(log?.difficulty ?? null)
  const [energy, setEnergy] = useState<Scale5 | null>(log?.energy ?? null)
  const [duration, setDuration] = useState(log?.durationMinutes ?? workout?.estimatedMinutes ?? 45)
  const [notes, setNotes] = useState(log?.notes ?? '')

  function saveLog(done: boolean) {
    dispatch({
      type: 'log_training',
      date: today,
      log: {
        date: today,
        workoutId: plan.workoutId,
        done,
        difficulty,
        energy,
        durationMinutes: done ? duration : null,
        notes,
      },
    })
    setLogging(false)
  }

  if (!weekly) {
    return (
      <Screen title="Treino">
        <EmptyState
          title="Sem rotina de treino"
          description="Gere uma rotina a partir do seu perfil para comecar."
          action={<Button onClick={() => dispatch({ type: 'regenerate_training' })}>Gerar rotina</Button>}
        />
      </Screen>
    )
  }

  const previewWorkout = preview ? weekly.workouts.find((w) => w.id === preview) : null
  // Le da rotina real, nao do perfil: uma meta com prazo pode ter mudado a frequencia.
  const diasComTreino = weekly.weekMap.filter(Boolean).length

  return (
    <Screen title="Treino" subtitle={`${diasComTreino}x por semana`}>
      {/* Origem da rotina: gerada aqui ou prescrita por alguem */}
      <Card accent={prescrito} className="mb-4" onClick={() => navigate('/planos/treino')}>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-faint">
              {prescrito ? 'Plano do personal' : 'Rotina gerada pelo app'}
            </p>
            <p className="mt-0.5 truncate text-[15px] font-medium">
              {ficha ? ficha.title : 'Montada a partir do seu perfil'}
            </p>
            {ficha?.professional.name && (
              <p className="text-[12px] text-muted">por {ficha.professional.name}</p>
            )}
          </div>
          <span className="shrink-0 text-xs text-accent">{ficha ? 'ver' : 'cadastrar'}</span>
        </div>
      </Card>

      {/* Semana */}
      <div className="mb-5 grid grid-cols-7 gap-1.5">
        {weekly.weekMap.map((id, i) => {
          const w = weekly.workouts.find((x) => x.id === id)
          const isToday = i === weekdayIndex(today)
          return (
            <button
              key={i}
              type="button"
              onClick={() => id && setPreview(id)}
              className={cx(
                'rounded-xl border px-1 py-2 text-center transition',
                isToday ? 'border-accent bg-accent-soft' : 'border-line bg-surface',
              )}
            >
              <span className="block text-[10px] text-faint">{DAYS[i]}</span>
              <span className={cx('mt-1 block text-[10px] leading-tight', w ? 'text-fg' : 'text-faint')}>
                {w ? w.name.replace('Corpo inteiro ', 'CI ') : 'off'}
              </span>
            </button>
          )
        })}
      </div>

      <Note>{weekly.goalSummary}</Note>

      <div className="h-4" />

      {workout ? (
        <Section
          title={workout.name}
          hint={`${workout.focus} - ${workout.estimatedMinutes} min`}
          action={log?.done ? <Tag tone="accent">feito</Tag> : undefined}
        >
          <Card>
            <ExerciseList workout={workout} />
          </Card>
          <div className="mt-3 flex gap-3">
            <Button full onClick={() => setLogging(true)}>
              {log ? 'Editar registro' : 'Registrar treino'}
            </Button>
          </div>
        </Section>
      ) : (
        <EmptyState
          title="Hoje e dia de folga"
          description="Descanso tambem faz parte do plano. Uma caminhada leve cai bem."
          action={
            <Button variant="subtle" onClick={() => setLogging(true)}>
              Treinei fora do plano
            </Button>
          }
        />
      )}

      <Section title="Sua rotina" hint="Toque em um treino para ver os exercicios">
        <div className="space-y-2">
          {weekly.workouts.map((w) => (
            <Card key={w.id} onClick={() => setPreview(w.id)}>
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-medium">{w.name}</p>
                  <p className="truncate text-[12px] text-faint">{w.focus}</p>
                </div>
                <span className="shrink-0 text-xs text-faint">{w.blocks.length} exercicios</span>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {prescrito ? (
        <Note>
          Esta rotina foi prescrita e o app nao a altera sozinho. Se um dia pedir
          mais leveza, o recado aparece em Hoje, mas as series continuam como
          seu personal passou.
        </Note>
      ) : (
        <Button
          variant="subtle"
          full
          onClick={() => {
            if (confirm('Gerar uma nova rotina de treino? A atual sera substituida.')) {
              dispatch({ type: 'regenerate_training' })
            }
          }}
        >
          Gerar nova rotina
        </Button>
      )}

      <Sheet open={!!previewWorkout} onClose={() => setPreview(null)} title={previewWorkout?.name ?? ''}>
        {previewWorkout && (
          <>
            <p className="mb-3 text-[13px] text-muted">{previewWorkout.focus}</p>
            <ExerciseList workout={previewWorkout} />
          </>
        )}
      </Sheet>

      <Sheet open={logging} onClose={() => setLogging(false)} title="Como foi o treino?">
        <Field label="Dificuldade">
          <Scale value={difficulty} onChange={setDifficulty} labels={SCALE_LABELS.dificuldade} />
        </Field>
        <Field label="Energia durante o treino">
          <Scale value={energy} onChange={setEnergy} labels={SCALE_LABELS.energia} />
        </Field>
        <Field label="Duracao">
          <Stepper value={duration} min={5} max={180} onChange={setDuration} suffix="min" />
        </Field>
        <Field label="Observacoes" hint="Cargas, dores, o que mudar da proxima vez">
          <TextArea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" />
        </Field>
        <div className="mt-2 flex gap-3">
          <Button variant="subtle" onClick={() => saveLog(false)}>
            Nao treinei
          </Button>
          <Button full onClick={() => saveLog(true)}>
            Salvar treino
          </Button>
        </div>
      </Sheet>
    </Screen>
  )
}
