import { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { PrescribedPlan, PrescriptionKind } from '@/core/types'
import { MEAL_SLOTS } from '@/core/labels'
import { longDate, today as hoje } from '@/core/dates'
import {
  createPrescription, emptyPrescribedExercise, emptyPrescribedMeal,
  emptyPrescribedWorkout, isCurrent,
} from '@/domain/prescriptions/prescriptions'
import { useApp } from '@/state/useApp'
import { visiblePrescriptions } from '@/state/selectors'
import { Screen } from '@/ui/components/Layout'
import {
  Button, Card, EmptyState, Field, Input, Note, Section, Sheet, Tag, TextArea, cx,
} from '@/ui/components/primitives'

const DIAS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

const COPY: Record<PrescriptionKind, { title: string; who: string; nota: string }> = {
  nutricao: {
    title: 'Plano alimentar',
    who: 'Nutricionista',
    nota: 'Cadastre o plano exatamente como veio. Enquanto estiver ativo, ele substitui as refeicoes geradas pelo app, e o app deixa de reescrever a sua dieta: passa apenas a acompanhar e avisar.',
  },
  treino: {
    title: 'Plano de treino',
    who: 'Personal',
    nota: 'Cadastre a ficha como o personal passou. Enquanto estiver ativo, ela substitui a rotina gerada, e o app nao altera series nem exercicios por conta propria.',
  },
}

export default function Prescriptions() {
  const { kind } = useParams<{ kind: string }>()
  const tipo: PrescriptionKind = kind === 'treino' ? 'treino' : 'nutricao'
  const copy = COPY[tipo]
  const { state, dispatch, today } = useApp()
  const planos = visiblePrescriptions(state, tipo)

  const [criando, setCriando] = useState(false)
  const [editando, setEditando] = useState<PrescribedPlan | null>(null)
  const [titulo, setTitulo] = useState('')
  const [profissional, setProfissional] = useState('')
  const [inicio, setInicio] = useState(hoje())
  const [fim, setFim] = useState('')

  const atual = editando ? (state.prescriptions.find((p) => p.id === editando.id) ?? editando) : null

  function criar() {
    if (!titulo.trim() && !profissional.trim()) return
    const plan = createPrescription({
      kind: tipo,
      title: titulo,
      professionalName: profissional,
      startDate: inicio,
      endDate: fim || null,
    })
    dispatch({ type: 'add_prescription', plan })
    setTitulo(''); setProfissional(''); setFim(''); setCriando(false)
    setEditando(plan)
  }

  const patch = (p: Partial<PrescribedPlan>) => {
    if (!atual) return
    dispatch({ type: 'update_prescription', id: atual.id, patch: p })
  }

  return (
    <Screen title={copy.title} back subtitle={`Prescrito por ${copy.who.toLowerCase()}`}>
      <Note>{copy.nota}</Note>
      <div className="h-4" />

      {planos.length === 0 ? (
        <EmptyState
          title="Nenhum plano cadastrado"
          description={`Tem um plano que seu ${copy.who.toLowerCase()} passou? Cadastre aqui e ele passa a mandar no seu dia.`}
          action={<Button onClick={() => setCriando(true)}>Cadastrar plano</Button>}
        />
      ) : (
        <Section title="Seus planos">
          <div className="space-y-2">
            {planos.map((p) => {
              const vigente = isCurrent(p, today)
              const itens = tipo === 'nutricao' ? p.meals.length : p.workouts.length
              return (
                <Card key={p.id} accent={vigente}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold">{p.title}</p>
                      <p className="truncate text-[12px] text-faint">
                        {p.professional.name || copy.who} - desde {longDate(p.startDate)}
                      </p>
                    </div>
                    {vigente && <Tag tone="accent">ativo</Tag>}
                  </div>
                  <p className="mt-2 text-[12px] text-muted">
                    {itens} {tipo === 'nutricao' ? 'refeicoes' : 'treinos'} cadastrados
                  </p>
                  <div className="mt-3 flex gap-4">
                    <button type="button" className="text-[12px] text-accent" onClick={() => setEditando(p)}>
                      Abrir
                    </button>
                    <button
                      type="button"
                      className="text-[12px] text-muted"
                      onClick={() =>
                        dispatch({
                          type: p.active ? 'deactivate_prescription' : 'activate_prescription',
                          id: p.id,
                        })
                      }
                    >
                      {p.active ? 'Desativar' : 'Ativar'}
                    </button>
                    <button
                      type="button"
                      className="text-[12px] text-red-300"
                      onClick={() => dispatch({ type: 'remove_prescription', id: p.id })}
                    >
                      Excluir
                    </button>
                  </div>
                </Card>
              )
            })}
          </div>
        </Section>
      )}

      <Button variant="subtle" full onClick={() => setCriando(true)}>
        Cadastrar plano
      </Button>

      <Sheet open={criando} onClose={() => setCriando(false)} title="Novo plano">
        <Field label="Nome do plano">
          <Input autoFocus value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={copy.title} />
        </Field>
        <Field label={`Nome do ${copy.who.toLowerCase()}`}>
          <Input value={profissional} onChange={(e) => setProfissional(e.target.value)} placeholder="Quem passou" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Comeca em">
            <Input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </Field>
          <Field label="Vale ate" hint="Opcional">
            <Input type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
          </Field>
        </div>
        <Button full onClick={criar} disabled={!titulo.trim() && !profissional.trim()}>
          Criar e preencher
        </Button>
      </Sheet>

      <Sheet open={!!atual} onClose={() => setEditando(null)} title={atual?.title ?? ''}>
        {atual && tipo === 'nutricao' && (
          <>
            {atual.meals.map((m, mi) => (
              <Card key={m.id} className="mb-3">
                <div className="mb-2 grid grid-cols-2 gap-2">
                  <Input
                    value={m.name}
                    placeholder="Nome da refeicao"
                    onChange={(e) =>
                      patch({ meals: atual.meals.map((x, i) => (i === mi ? { ...x, name: e.target.value } : x)) })
                    }
                  />
                  <Input
                    value={m.timeHint}
                    placeholder="Horario"
                    onChange={(e) =>
                      patch({ meals: atual.meals.map((x, i) => (i === mi ? { ...x, timeHint: e.target.value } : x)) })
                    }
                  />
                </div>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {MEAL_SLOTS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() =>
                        patch({ meals: atual.meals.map((x, i) => (i === mi ? { ...x, slot: s.id } : x)) })
                      }
                      className={cx(
                        'rounded-lg px-2 py-1 text-[11px]',
                        m.slot === s.id ? 'bg-accent text-ink' : 'bg-surface-2 text-faint',
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                {m.items.map((it, ii) => (
                  <div key={ii} className="mb-1.5 grid grid-cols-[1fr_auto_auto] gap-2">
                    <Input
                      value={it.name}
                      placeholder="Alimento"
                      onChange={(e) =>
                        patch({
                          meals: atual.meals.map((x, i) =>
                            i === mi
                              ? { ...x, items: x.items.map((y, j) => (j === ii ? { ...y, name: e.target.value } : y)) }
                              : x,
                          ),
                        })
                      }
                    />
                    <Input
                      value={it.amount}
                      placeholder="Qtd"
                      className="w-24"
                      onChange={(e) =>
                        patch({
                          meals: atual.meals.map((x, i) =>
                            i === mi
                              ? { ...x, items: x.items.map((y, j) => (j === ii ? { ...y, amount: e.target.value } : y)) }
                              : x,
                          ),
                        })
                      }
                    />
                    <button
                      type="button"
                      className="px-1 text-xs text-red-300"
                      onClick={() =>
                        patch({
                          meals: atual.meals.map((x, i) =>
                            i === mi ? { ...x, items: x.items.filter((_, j) => j !== ii) } : x,
                          ),
                        })
                      }
                    >
                      x
                    </button>
                  </div>
                ))}
                <div className="mt-2 flex gap-3">
                  <button
                    type="button"
                    className="text-[12px] text-accent"
                    onClick={() =>
                      patch({
                        meals: atual.meals.map((x, i) =>
                          i === mi ? { ...x, items: [...x.items, { name: '', amount: '' }] } : x,
                        ),
                      })
                    }
                  >
                    Adicionar alimento
                  </button>
                  <button
                    type="button"
                    className="text-[12px] text-red-300"
                    onClick={() => patch({ meals: atual.meals.filter((_, i) => i !== mi) })}
                  >
                    Remover refeicao
                  </button>
                </div>
              </Card>
            ))}
            <Button
              variant="subtle"
              full
              onClick={() => patch({ meals: [...atual.meals, emptyPrescribedMeal()] })}
            >
              Adicionar refeicao
            </Button>
          </>
        )}

        {atual && tipo === 'treino' && (
          <>
            {atual.workouts.map((w, wi) => (
              <Card key={w.id} className="mb-3">
                <Input
                  value={w.name}
                  placeholder="Nome do treino (ex.: Treino A)"
                  className="mb-2"
                  onChange={(e) =>
                    patch({ workouts: atual.workouts.map((x, i) => (i === wi ? { ...x, name: e.target.value } : x)) })
                  }
                />
                <div className="mb-3 flex gap-1.5">
                  {DIAS.map((d, di) => (
                    <button
                      key={di}
                      type="button"
                      onClick={() =>
                        patch({
                          workouts: atual.workouts.map((x, i) =>
                            i === wi
                              ? {
                                  ...x,
                                  weekdays: x.weekdays.includes(di)
                                    ? x.weekdays.filter((n) => n !== di)
                                    : [...x.weekdays, di],
                                }
                              : x,
                          ),
                        })
                      }
                      className={cx(
                        'flex-1 rounded-lg py-2 text-[11px]',
                        w.weekdays.includes(di) ? 'bg-accent text-ink' : 'bg-surface-2 text-faint',
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                {w.exercises.map((e, ei) => {
                  const set = (campo: keyof typeof e, valor: string) =>
                    patch({
                      workouts: atual.workouts.map((x, i) =>
                        i === wi
                          ? { ...x, exercises: x.exercises.map((y, j) => (j === ei ? { ...y, [campo]: valor } : y)) }
                          : x,
                      ),
                    })
                  return (
                    <div key={ei} className="mb-2 rounded-xl bg-surface-2 p-2.5">
                      <Input value={e.name} placeholder="Exercicio" className="mb-1.5" onChange={(ev) => set('name', ev.target.value)} />
                      <div className="grid grid-cols-3 gap-1.5">
                        <Input value={e.sets} placeholder="Series" onChange={(ev) => set('sets', ev.target.value)} />
                        <Input value={e.reps} placeholder="Reps" onChange={(ev) => set('reps', ev.target.value)} />
                        <Input value={e.rest} placeholder="Descanso" onChange={(ev) => set('rest', ev.target.value)} />
                      </div>
                      <button
                        type="button"
                        className="mt-1.5 text-[11px] text-red-300"
                        onClick={() =>
                          patch({
                            workouts: atual.workouts.map((x, i) =>
                              i === wi ? { ...x, exercises: x.exercises.filter((_, j) => j !== ei) } : x,
                            ),
                          })
                        }
                      >
                        remover exercicio
                      </button>
                    </div>
                  )
                })}
                <div className="mt-2 flex gap-3">
                  <button
                    type="button"
                    className="text-[12px] text-accent"
                    onClick={() =>
                      patch({
                        workouts: atual.workouts.map((x, i) =>
                          i === wi ? { ...x, exercises: [...x.exercises, emptyPrescribedExercise()] } : x,
                        ),
                      })
                    }
                  >
                    Adicionar exercicio
                  </button>
                  <button
                    type="button"
                    className="text-[12px] text-red-300"
                    onClick={() => patch({ workouts: atual.workouts.filter((_, i) => i !== wi) })}
                  >
                    Remover treino
                  </button>
                </div>
              </Card>
            ))}
            <Button
              variant="subtle"
              full
              onClick={() => patch({ workouts: [...atual.workouts, emptyPrescribedWorkout()] })}
            >
              Adicionar treino
            </Button>
          </>
        )}

        {atual && (
          <>
            <div className="h-4" />
            <Field label="Observacoes do profissional">
              <TextArea rows={3} value={atual.notes} onChange={(e) => patch({ notes: e.target.value })} placeholder="Orientacoes gerais" />
            </Field>
            <Button
              full
              onClick={() => {
                dispatch({
                  type: atual.active ? 'deactivate_prescription' : 'activate_prescription',
                  id: atual.id,
                })
                setEditando(null)
              }}
            >
              {atual.active ? 'Desativar este plano' : 'Ativar este plano'}
            </Button>
          </>
        )}
      </Sheet>
    </Screen>
  )
}
