import { useState } from 'react'
import type { GoalFocus, GoalKind, TimedGoal } from '@/core/types'
import { addDays, longDate, today as hoje } from '@/core/dates'
import {
  GOAL_FOCUS, GOAL_KINDS, INTENSITY_LABELS, PHASE_LABELS,
  countdownLabel, createGoal, daysUntil, goalPhase, weeklyTrainingFor,
} from '@/domain/goals/goals'
import { useApp } from '@/state/useApp'
import { visibleGoals } from '@/state/selectors'
import { Screen } from '@/ui/components/Layout'
import {
  Button, Card, Chip, EmptyState, Field, Input, Note, ProgressBar,
  Section, Sheet, Stepper, Tag, TextArea, cx,
} from '@/ui/components/primitives'

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

/** Quanto da preparacao ja passou. */
function progresso(goal: TimedGoal, date: string): number {
  const total = Math.max(1, daysUntil({ ...goal, targetDate: goal.targetDate }, goal.startDate))
  const restam = Math.max(0, daysUntil(goal, date))
  return Math.min(1, Math.max(0, 1 - restam / total))
}

export default function Goals() {
  const { state, dispatch, today } = useApp()
  const metas = visibleGoals(state)
  const abertas = metas.filter((g) => g.status === 'ativa' && daysUntil(g, today) >= 0)
  const passadas = metas.filter((g) => g.status !== 'ativa' || daysUntil(g, today) < 0)

  const [criando, setCriando] = useState(false)
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState<GoalKind>('prova')
  const [data, setData] = useState(addDays(hoje(), 42))
  const [focus, setFocus] = useState<GoalFocus[]>(['treino'])
  const [intensidade, setIntensidade] = useState<0 | 1 | 2>(1)
  const [alvoSemanal, setAlvoSemanal] = useState(0)
  const [notas, setNotas] = useState('')

  function salvar() {
    if (!nome.trim()) return
    dispatch({
      type: 'add_goal',
      goal: createGoal({
        name: nome,
        kind: tipo,
        targetDate: data,
        focus,
        intensity: intensidade,
        weeklyTrainingTarget: alvoSemanal > 0 ? alvoSemanal : null,
        notes: notas,
      }),
    })
    setNome(''); setNotas(''); setAlvoSemanal(0); setCriando(false)
  }

  return (
    <Screen title="Metas" back subtitle="Objetivos com data marcada">
      <Note>
        Uma meta com prazo aperta a rotina enquanto dura e solta sozinha quando
        passa. Serve para prova, trilha, viagem, o que tiver dia certo.
      </Note>
      <div className="h-4" />

      {abertas.length === 0 ? (
        <EmptyState
          title="Nenhuma meta em andamento"
          description="Tem alguma prova, trilha ou viagem chegando? Coloque a data aqui."
          action={<Button onClick={() => setCriando(true)}>Criar meta</Button>}
        />
      ) : (
        <Section title="Em andamento">
          <div className="space-y-3">
            {abertas.map((g) => {
              const fase = goalPhase(g, today)
              const alvo = weeklyTrainingFor(g, state.profile.training.daysPerWeek)
              return (
                <Card key={g.id} accent={daysUntil(g, today) <= 14}>
                  <div className="mb-1 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-[17px] font-semibold">{g.name}</h3>
                      <p className="text-[12px] text-faint">
                        {GOAL_KINDS.find((k) => k.id === g.kind)?.label} - {longDate(g.targetDate)}
                      </p>
                    </div>
                    <Tag tone={daysUntil(g, today) <= 14 ? 'accent' : 'default'}>
                      {countdownLabel(g, today)}
                    </Tag>
                  </div>
                  <ProgressBar ratio={progresso(g, today)} className="my-3" />
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag>{PHASE_LABELS[fase]}</Tag>
                    {g.focus.map((f) => (
                      <Tag key={f}>{GOAL_FOCUS.find((x) => x.id === f)?.label}</Tag>
                    ))}
                    {g.intensity > 0 && g.focus.includes('treino') && (
                      <Tag tone="accent">{alvo} treinos por semana</Tag>
                    )}
                  </div>
                  {g.notes && <p className="mt-2 text-[13px] text-muted">{g.notes}</p>}
                  <div className="mt-3 flex gap-4">
                    <button
                      type="button"
                      className="text-[12px] text-accent"
                      onClick={() => dispatch({ type: 'regenerate_training' })}
                    >
                      Ajustar treino para esta meta
                    </button>
                    <button
                      type="button"
                      className="text-[12px] text-muted"
                      onClick={() => dispatch({ type: 'update_goal', id: g.id, patch: { status: 'concluida' } })}
                    >
                      Concluir
                    </button>
                  </div>
                </Card>
              )
            })}
          </div>
        </Section>
      )}

      {passadas.length > 0 && (
        <Section title="Encerradas">
          <div className="space-y-2">
            {passadas.map((g) => (
              <Card key={g.id} className="opacity-70">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px]">{g.name}</p>
                    <p className="text-[11px] text-faint">{longDate(g.targetDate)}</p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 text-[11px] text-red-300"
                    onClick={() => dispatch({ type: 'remove_goal', id: g.id })}
                  >
                    excluir
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}

      <Button variant="subtle" full onClick={() => setCriando(true)}>
        Nova meta
      </Button>

      <Sheet open={criando} onClose={() => setCriando(false)} title="Nova meta">
        <Field label="O que voce vai fazer">
          <Input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: trilha da Pedra Grande" />
        </Field>
        <Field label="Tipo">
          <div className="grid grid-cols-2 gap-2">
            {GOAL_KINDS.map((k) => (
              <Chip key={k.id} label={k.label} hint={k.hint} selected={tipo === k.id} onClick={() => setTipo(k.id)} />
            ))}
          </div>
        </Field>
        <Field label="Quando" hint="A contagem regressiva sai daqui">
          <Input type="date" value={data} min={hoje()} onChange={(e) => setData(e.target.value)} />
        </Field>
        <Field label="O que precisa apertar">
          <div className="grid grid-cols-2 gap-2">
            {GOAL_FOCUS.map((f) => (
              <Chip key={f.id} label={f.label} selected={focus.includes(f.id)} onClick={() => setFocus(toggle(focus, f.id))} />
            ))}
          </div>
        </Field>
        <Field label="Quanto apertar">
          <div className="space-y-2">
            {INTENSITY_LABELS.map((i) => (
              <button
                key={i.value}
                type="button"
                onClick={() => setIntensidade(i.value)}
                className={cx(
                  'w-full rounded-xl border px-3 py-2.5 text-left transition',
                  intensidade === i.value ? 'border-accent bg-accent-soft' : 'border-line bg-surface',
                )}
              >
                <span className="block text-sm font-medium">{i.label}</span>
                <span className="block text-[11px] text-faint">{i.hint}</span>
              </button>
            ))}
          </div>
        </Field>
        <Field label="Treinos por semana na preparacao" hint="Zero mantem o que ja esta no seu perfil">
          <Stepper value={alvoSemanal} min={0} max={6} onChange={setAlvoSemanal} suffix="x" />
        </Field>
        <Field label="Observacoes">
          <TextArea rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Opcional" />
        </Field>
        <Button full onClick={salvar} disabled={!nome.trim()}>
          Criar meta
        </Button>
      </Sheet>
    </Screen>
  )
}
