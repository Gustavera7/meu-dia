import { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { RoutineKind, RoutineStep } from '@/core/types'
import {
  buildEveningRoutine, buildMorningRoutine, newRoutineStep, routineTimeLabel,
} from '@/domain/routines/defaults'
import { useToday } from '@/state/useApp'
import { Screen } from '@/ui/components/Layout'
import {
  Button, Card, CheckRow, Field, Input, Note, Section, Sheet, Stepper,
} from '@/ui/components/primitives'

const TITLES: Record<RoutineKind, { title: string; note: string }> = {
  manha: {
    title: 'Rotina da manha',
    note: 'Curta o suficiente para acontecer todo dia, mesmo nos dias ruins.',
  },
  noite: {
    title: 'Rotina da noite',
    note: 'Serve para desacelerar e preparar o amanha, nao para produzir mais.',
  },
}

export default function RoutineScreen() {
  const { kind } = useParams<{ kind: RoutineKind }>()
  const { state, dispatch, today } = useToday()
  const routineKind: RoutineKind = kind === 'noite' ? 'noite' : 'manha'
  const routine = state.routines[routineKind]
  const log = state.logs[today]

  const orcamento =
    routineKind === 'manha'
      ? state.profile.routine.morningMinutes
      : state.profile.routine.eveningMinutes

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [minutes, setMinutes] = useState(5)

  function update(steps: RoutineStep[]) {
    dispatch({ type: 'update_routine', kind: routineKind, routine: { kind: routineKind, steps } })
  }

  function move(index: number, delta: number) {
    const steps = [...routine.steps]
    const target = index + delta
    if (target < 0 || target >= steps.length) return
    const [item] = steps.splice(index, 1)
    steps.splice(target, 0, item)
    update(steps)
  }

  function addStep() {
    if (!name.trim()) return
    update([...routine.steps, { ...newRoutineStep(name.trim(), minutes) }])
    setName('')
    setMinutes(5)
    setEditing(false)
  }

  const info = TITLES[routineKind]

  return (
    <Screen title={info.title} back subtitle={routineTimeLabel(routine)}>
      <Note>{info.note}</Note>

      {/* O tempo disponivel decide quantos passos cabem. Deixar isso
          escondido no Perfil tornava a relacao invisivel: aqui a pessoa
          ve o orcamento e o resultado lado a lado. */}
      <Card className="mt-4">
        <p className="mb-2 text-[13px] font-medium text-muted">
          Tempo que voce tem {routineKind === 'manha' ? 'de manha' : 'a noite'}
        </p>
        <Stepper
          value={orcamento}
          min={10}
          max={120}
          suffix="min"
          onChange={(v) =>
            dispatch({
              type: 'update_profile',
              patch: {
                routine: {
                  ...state.profile.routine,
                  [routineKind === 'manha' ? 'morningMinutes' : 'eveningMinutes']: v,
                },
              },
            })
          }
        />
        <p className="mt-2 text-[11px] leading-snug text-faint">
          Os minutos de cada passo sao reserva, nao meta. Sobrar tempo e o
          resultado esperado.
        </p>
      </Card>

      <div className="h-4" />

      <Section title="Hoje">
        <Card>
          {routine.steps.map((s) => (
            <CheckRow
              key={s.id}
              label={s.name}
              sub={s.note}
              meta={`~${s.minutes} min`}
              done={!!log?.done[`${routineKind}:${s.id}`]}
              onToggle={() => dispatch({ type: 'toggle_task', date: today, key: `${routineKind}:${s.id}` })}
            />
          ))}
          {routine.steps.length === 0 && <p className="py-4 text-center text-sm text-faint">Rotina vazia</p>}
        </Card>
      </Section>

      <Section title="Editar passos" hint="Ordem, tempo e o que entra ou sai">
        <div className="space-y-2">
          {routine.steps.map((s, i) => (
            <Card key={s.id}>
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <Input
                    value={s.name}
                    onChange={(e) =>
                      update(routine.steps.map((x) => (x.id === s.id ? { ...x, name: e.target.value } : x)))
                    }
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <Stepper
                      value={s.minutes}
                      min={1}
                      max={60}
                      suffix="min"
                      onChange={(v) =>
                        update(routine.steps.map((x) => (x.id === s.id ? { ...x, minutes: v } : x)))
                      }
                    />
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button type="button" onClick={() => move(i, -1)} className="rounded-lg bg-surface-2 px-2 py-1 text-xs">
                    cima
                  </button>
                  <button type="button" onClick={() => move(i, 1)} className="rounded-lg bg-surface-2 px-2 py-1 text-xs">
                    baixo
                  </button>
                  <button
                    type="button"
                    onClick={() => update(routine.steps.filter((x) => x.id !== s.id))}
                    className="rounded-lg bg-red-500/10 px-2 py-1 text-xs text-red-300"
                  >
                    sair
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <div className="space-y-2">
        <Button variant="subtle" full onClick={() => setEditing(true)}>
          Adicionar passo
        </Button>
        <Button
          variant="ghost"
          full
          className="text-xs"
          onClick={() => {
            if (!confirm('Voltar para a sugestao do app? Os passos que voce criou serao perdidos.')) return
            update(
              (routineKind === 'manha'
                ? buildMorningRoutine(orcamento)
                : buildEveningRoutine(orcamento)
              ).steps,
            )
          }}
        >
          Restaurar sugestao do app
        </Button>
      </div>

      <Sheet open={editing} onClose={() => setEditing(false)} title="Novo passo">
        <Field label="O que voce vai fazer">
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: alongar" />
        </Field>
        <Field label="Duracao">
          <Stepper value={minutes} min={1} max={60} onChange={setMinutes} suffix="min" />
        </Field>
        <Button full onClick={addStep} disabled={!name.trim()}>
          Adicionar
        </Button>
      </Sheet>
    </Screen>
  )
}
