import { useState } from 'react'
import type { GoalFocus, TimedGoal } from '@/core/types'
import { addDays, longDate, today as hoje } from '@/core/dates'
import {
  GOAL_FOCUS, INTENSITY_LABELS, countdownLabel, createGoal, daysUntil,
  goalProgress, weeksUntil, weeklyTrainingFor,
} from '@/domain/goals/goals'
import { EVENT_TEMPLATES, faseAtual, prazoCurto, templateDe } from '@/domain/goals/events'
import { modalityLabel } from '@/domain/training/modalities'
import { useApp } from '@/state/useApp'
import { visibleGoals } from '@/state/selectors'
import { Screen } from '@/ui/components/Layout'
import {
  Button, Card, Chip, EmptyState, Field, Input, Note, ProgressBar,
  Section, Sheet, Tag, TextArea, cx,
} from '@/ui/components/primitives'

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

export default function Goals() {
  const { state, dispatch, today } = useApp()
  const metas = visibleGoals(state)
  const abertas = metas.filter((g) => g.status === 'ativa' && daysUntil(g, today) >= 0)
  const passadas = metas.filter((g) => g.status !== 'ativa' || daysUntil(g, today) < 0)

  const [criando, setCriando] = useState(false)
  const [modelo, setModelo] = useState<string | null>(null)
  const [nome, setNome] = useState('')
  const [data, setData] = useState('')
  const [avancado, setAvancado] = useState(false)
  const [focus, setFocus] = useState<GoalFocus[]>(['treino'])
  const [intensidade, setIntensidade] = useState<0 | 1 | 2>(1)
  const [notas, setNotas] = useState('')
  const [detalhe, setDetalhe] = useState<TimedGoal | null>(null)

  const t = templateDe(modelo)
  const semanas = data ? Math.max(1, Math.round((new Date(data).getTime() - new Date(hoje()).getTime()) / 604800000)) : 0

  function escolher(id: string) {
    const tpl = templateDe(id)
    setModelo(id)
    setNome(tpl?.label ?? '')
    setFocus(tpl?.focus ?? ['treino'])
    if (tpl) setData(addDays(hoje(), tpl.semanasIdeais * 7))
  }

  function salvar() {
    if (!nome.trim() || !data) return
    dispatch({
      type: 'add_goal',
      goal: createGoal({
        name: nome,
        kind: modelo === 'data_marcada' ? 'evento' : modelo === 'forca' ? 'competicao' : 'prova',
        targetDate: data,
        focus,
        intensity: intensidade,
        notes: notas,
        eventTemplate: modelo,
        sport: t?.sport ?? null,
      }),
    })
    setCriando(false)
    setModelo(null)
    setNome('')
    setData('')
    setNotas('')
    setAvancado(false)
  }

  return (
    <Screen title="Metas" back subtitle="Preparacao com data marcada">
      {abertas.length === 0 ? (
        <EmptyState
          title="Nenhuma preparacao em andamento"
          description="Uma maratona daqui a tres meses, uma trilha, uma prova de forca. Escolha o evento e a data: treino e alimentacao se ajustam sozinhos."
          action={<Button onClick={() => setCriando(true)}>Criar preparacao</Button>}
        />
      ) : (
        <Section title="Em andamento">
          <div className="space-y-3">
            {abertas.map((g) => {
              const tpl = templateDe(g.eventTemplate)
              const fase = faseAtual(g.eventTemplate, goalProgress(g, today))
              const alvo = weeklyTrainingFor(g, state.profile.training.daysPerWeek)
              return (
                <Card key={g.id} accent={daysUntil(g, today) <= 21} onClick={() => setDetalhe(g)}>
                  <div className="mb-1 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-[17px] font-semibold">{g.name}</h3>
                      <p className="text-[12px] text-faint">
                        {longDate(g.targetDate)}
                        {g.sport ? ` - ${modalityLabel(g.sport)}` : ''}
                      </p>
                    </div>
                    <Tag tone={daysUntil(g, today) <= 21 ? 'accent' : 'default'}>
                      {countdownLabel(g, today)}
                    </Tag>
                  </div>
                  <ProgressBar ratio={goalProgress(g, today)} className="my-3" />
                  <div className="flex flex-wrap items-center gap-2">
                    {fase && <Tag tone="accent">{fase.nome}</Tag>}
                    {g.focus.includes('treino') && <Tag>{alvo} treinos por semana</Tag>}
                    {tpl && tpl.checklist.length > 0 && <Tag>{tpl.checklist.length} itens na lista</Tag>}
                  </div>
                  {fase && (
                    <p className="mt-2.5 text-[13px] leading-snug text-muted">{fase.treino}</p>
                  )}
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
        Nova preparacao
      </Button>

      {/* Criar: escolher o evento e a data ja basta */}
      <Sheet open={criando} onClose={() => setCriando(false)} title="Nova preparacao">
        {!modelo ? (
          <>
            <Note>Escolha o que voce vai fazer. O resto ja vem preenchido.</Note>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {EVENT_TEMPLATES.map((e) => (
                <Chip key={e.id} label={e.label} hint={e.hint} onClick={() => escolher(e.id)} />
              ))}
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setModelo(null)}
              className="mb-3 text-[12px] text-muted"
            >
              Trocar tipo de evento
            </button>

            <Field label="Nome">
              <Input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} />
            </Field>
            <Field
              label="Data do evento"
              hint={t ? `Preparacao tranquila leva cerca de ${t.semanasIdeais} semanas` : undefined}
            >
              <Input type="date" value={data} min={hoje()} onChange={(e) => setData(e.target.value)} />
            </Field>

            {data && prazoCurto(modelo, semanas) && (
              <Note tone="accent">
                {semanas} semanas e um prazo curto para isso. Da para seguir, mas com
                menos margem para imprevisto.
              </Note>
            )}

            {t && data && (
              <div className="mt-3 rounded-xl bg-surface-2 p-3.5">
                <p className="mb-2 text-[12px] font-medium text-muted">O que vai mudar</p>
                <ul className="space-y-1.5 text-[13px] leading-snug">
                  <li>- {t.diasPorSemana} treinos por semana{t.sport ? ` de ${modalityLabel(t.sport).toLowerCase()}` : ''}</li>
                  <li>- Volume sobe por fase e cai de proposito na reta final</li>
                  {t.focus.includes('nutricao') && <li>- Orientacao de alimentacao muda a cada fase</li>}
                  {t.checklist.length > 0 && <li>- Lista de {t.checklist.length} itens nas ultimas semanas</li>}
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={() => setAvancado(!avancado)}
              className="mt-4 text-[12px] text-muted"
            >
              {avancado ? 'Esconder ajustes finos' : 'Ajustes finos'}
            </button>

            {avancado && (
              <div className="mt-3">
                <Field label="O que deve apertar">
                  <div className="grid grid-cols-2 gap-2">
                    {GOAL_FOCUS.map((f) => (
                      <Chip
                        key={f.id}
                        label={f.label}
                        selected={focus.includes(f.id)}
                        onClick={() => setFocus(toggle(focus, f.id))}
                      />
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
                <Field label="Observacoes">
                  <TextArea rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} />
                </Field>
              </div>
            )}

            <div className="mt-4">
              <Button full onClick={salvar} disabled={!nome.trim() || !data}>
                Comecar preparacao
              </Button>
            </div>
          </>
        )}
      </Sheet>

      {/* Detalhe: fases, lista e encerramento */}
      <Sheet open={!!detalhe} onClose={() => setDetalhe(null)} title={detalhe?.name ?? ''}>
        {detalhe && (() => {
          const tpl = templateDe(detalhe.eventTemplate)
          const atual = faseAtual(detalhe.eventTemplate, goalProgress(detalhe, today))
          return (
            <>
              <div className="mb-4 flex flex-wrap gap-2">
                <Tag tone="accent">{countdownLabel(detalhe, today)}</Tag>
                <Tag>{weeksUntil(detalhe, today)} semanas restantes</Tag>
                {detalhe.sport && <Tag>{modalityLabel(detalhe.sport)}</Tag>}
              </div>

              {tpl && (
                <>
                  <p className="mb-2 text-[13px] font-medium text-muted">Fases da preparacao</p>
                  <div className="mb-4 space-y-2">
                    {tpl.fases.map((f) => (
                      <div
                        key={f.nome}
                        className={cx(
                          'rounded-xl border p-3',
                          f.nome === atual?.nome ? 'border-accent/60 bg-accent-soft' : 'border-line bg-surface-2',
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[14px] font-medium">{f.nome}</p>
                          {f.nome === atual?.nome && <Tag tone="accent">agora</Tag>}
                        </div>
                        <p className="mt-1 text-[12px] leading-snug text-muted">{f.treino}</p>
                        {detalhe.focus.includes('nutricao') && (
                          <p className="mt-1 text-[12px] leading-snug text-faint">{f.nutricao}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {tpl && tpl.checklist.length > 0 && (
                <>
                  <p className="mb-2 text-[13px] font-medium text-muted">Antes do dia</p>
                  <ul className="mb-4 space-y-1.5">
                    {tpl.checklist.map((c) => (
                      <li key={c} className="text-[13px] leading-snug text-fg">- {c}</li>
                    ))}
                  </ul>
                </>
              )}

              {detalhe.focus.includes('nutricao') && (
                <Note>
                  As orientacoes de alimentacao aqui sao gerais e servem para organizar
                  a rotina. Se voce tem acompanhamento, cadastre o plano do
                  nutricionista: ele passa a valer no lugar destas.
                </Note>
              )}

              <div className="mt-4 flex gap-3">
                <Button
                  variant="subtle"
                  full
                  onClick={() => {
                    dispatch({ type: 'regenerate_training' })
                    setDetalhe(null)
                  }}
                >
                  Regerar treino da fase
                </Button>
              </div>
              <button
                type="button"
                className="mt-4 w-full text-center text-xs text-muted"
                onClick={() => {
                  dispatch({ type: 'update_goal', id: detalhe.id, patch: { status: 'concluida' } })
                  setDetalhe(null)
                }}
              >
                Concluir preparacao
              </button>
            </>
          )
        })()}
      </Sheet>
    </Screen>
  )
}
