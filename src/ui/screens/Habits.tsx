import { useState } from 'react'
import type { Habit, PillarId } from '@/core/types'
import { lastNDays, weekdayShort } from '@/core/dates'
import { createHabit } from '@/domain/habits/defaults'
import { PILLARS } from '@/domain/pillars/pillars'
import { useToday } from '@/state/useApp'
import { visibleHabits } from '@/state/selectors'
import { Screen } from '@/ui/components/Layout'
import {
  Button, Card, Chip, EmptyState, Field, Input, Section, Sheet, Stepper, cx,
} from '@/ui/components/primitives'

export default function Habits() {
  const { state, dispatch, today } = useToday()
  const log = state.logs[today]
  const week = lastNDays(7, today)

  const [editing, setEditing] = useState<Habit | null>(null)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [pillar, setPillar] = useState<PillarId>('bem_estar')
  const [target, setTarget] = useState(0)

  function save() {
    if (!name.trim()) return
    dispatch({
      type: 'add_habit',
      habit: createHabit({ name, pillar, target: target > 0 ? target : undefined, unit: target > 0 ? 'x' : undefined }),
    })
    setName('')
    setTarget(0)
    setCreating(false)
  }

  const todos = visibleHabits(state)
  const active = todos.filter((h) => h.active)

  return (
    <Screen title="Habitos" back subtitle={`${active.length} ativos`}>
      {todos.length === 0 ? (
        <EmptyState
          title="Nenhum habito ainda"
          description="Comece com dois ou tres. Consistencia vale mais que quantidade."
          action={<Button onClick={() => setCreating(true)}>Criar habito</Button>}
        />
      ) : (
        <Section title="Hoje e nos ultimos 7 dias">
          <div className="space-y-2">
            {todos.map((h) => {
              const done = !!log?.done[`habito:${h.id}`]
              return (
                <Card key={h.id} className={cx(!h.active && 'opacity-50')}>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'toggle_task', date: today, key: `habito:${h.id}` })}
                      className={cx(
                        'grid size-9 shrink-0 place-items-center rounded-xl text-[13px] font-bold transition',
                        done ? 'bg-accent text-ink' : 'bg-surface-2 text-faint',
                      )}
                    >
                      {h.icon}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(h)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate text-[15px] font-medium">{h.name}</p>
                      <p className="text-[11px] text-faint">
                        {PILLARS.find((p) => p.id === h.pillar)?.name}
                        {h.target ? ` - meta ${h.target}${h.unit ? ` ${h.unit}` : ''}` : ''}
                      </p>
                    </button>
                  </div>
                  <div className="mt-3 flex justify-between gap-1">
                    {week.map((d) => {
                      const hit = !!state.logs[d]?.done[`habito:${h.id}`]
                      return (
                        <div key={d} className="flex flex-1 flex-col items-center gap-1">
                          <span
                            className={cx(
                              'h-6 w-full rounded-md',
                              hit ? 'bg-accent' : 'bg-surface-2',
                            )}
                          />
                          <span className="text-[9px] text-faint">{weekdayShort(d).slice(0, 1)}</span>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )
            })}
          </div>
        </Section>
      )}

      <Button variant="subtle" full onClick={() => setCreating(true)}>
        Criar habito
      </Button>

      <Sheet open={creating} onClose={() => setCreating(false)} title="Novo habito">
        <Field label="Nome">
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: alongar antes de dormir" />
        </Field>
        <Field label="Pilar" hint="Serve para acompanhar a consistencia por area">
          <div className="grid grid-cols-2 gap-2">
            {PILLARS.map((p) => (
              <Chip key={p.id} label={p.name} hint={p.description} selected={pillar === p.id} onClick={() => setPillar(p.id)} />
            ))}
          </div>
        </Field>
        <Field label="Meta diaria" hint="Deixe em zero se for so marcar feito ou nao">
          <Stepper value={target} min={0} max={20} onChange={setTarget} />
        </Field>
        <Button full onClick={save} disabled={!name.trim()}>
          Criar
        </Button>
      </Sheet>

      <Sheet open={!!editing} onClose={() => setEditing(null)} title="Editar habito">
        {editing && (
          <>
            <Field label="Nome">
              <Input
                value={editing.name}
                onChange={(e) => {
                  setEditing({ ...editing, name: e.target.value })
                  dispatch({ type: 'update_habit', id: editing.id, patch: { name: e.target.value } })
                }}
              />
            </Field>
            <Field label="Pilar">
              <div className="grid grid-cols-2 gap-2">
                {PILLARS.map((p) => (
                  <Chip
                    key={p.id}
                    label={p.name}
                    selected={editing.pillar === p.id}
                    onClick={() => {
                      setEditing({ ...editing, pillar: p.id })
                      dispatch({ type: 'update_habit', id: editing.id, patch: { pillar: p.id } })
                    }}
                  />
                ))}
              </div>
            </Field>
            <Button
              variant="subtle"
              full
              onClick={() => {
                dispatch({ type: 'update_habit', id: editing.id, patch: { active: !editing.active } })
                setEditing(null)
              }}
            >
              {editing.active ? 'Pausar habito' : 'Reativar habito'}
            </Button>
            <button
              type="button"
              className="mt-4 w-full text-center text-xs text-red-300"
              onClick={() => {
                dispatch({ type: 'remove_habit', id: editing.id })
                setEditing(null)
              }}
            >
              Excluir habito
            </button>
          </>
        )}
      </Sheet>
    </Screen>
  )
}
