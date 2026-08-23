import { useNavigate } from 'react-router-dom'
import { greeting, longDate } from '@/core/dates'
import { PILLARS } from '@/domain/pillars/pillars'
import { explainPlan, workoutForPlan } from '@/domain/planning/dayPlan'
import { dayProgress, dayTasks, pillarConsistency, streak } from '@/domain/planning/progress'
import { mealSummary } from '@/domain/nutrition/meals'
import { routineTimeLabel } from '@/domain/routines/defaults'
import { useApp, useToday } from '@/state/useApp'
import { openGoals } from '@/state/selectors'
import { countdownLabel, goalPhase, PHASE_LABELS } from '@/domain/goals/goals'
import { Screen } from '@/ui/components/Layout'
import {
  Card, CheckRow, Note, ProgressBar, ProgressRing, Tag, cx,
} from '@/ui/components/primitives'

function CardHead({
  title, meta, onOpen, ratio,
}: {
  title: string
  meta?: string
  onOpen?: () => void
  ratio?: number
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <h3 className="truncate text-[15px] font-semibold">{title}</h3>
        {meta && <span className="shrink-0 text-xs text-faint">{meta}</span>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {ratio !== undefined && (
          <span className="text-[11px] tabular-nums text-faint">{Math.round(ratio * 100)}%</span>
        )}
        {onOpen && (
          <button type="button" onClick={onOpen} className="text-xs text-accent">
            abrir
          </button>
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { state, dispatch, today, plan } = useToday()
  const { sync } = useApp()
  const navigate = useNavigate()
  const metas = openGoals(state, today)
  const meta = metas[0] ?? null
  const log = state.logs[today]
  const m = state.profile.modules

  const progress = dayProgress(state, plan)
  const tasks = dayTasks(state, plan)
  const next = tasks.find((t) => !t.done)
  const workout = workoutForPlan(state, plan)
  const consistency = pillarConsistency(state, 7)
  const days = streak(state, today)

  const toggle = (key: string) => dispatch({ type: 'toggle_task', date: today, key })
  const ratioOf = (prefix: string) => {
    const group = tasks.filter((t) => t.key.startsWith(prefix))
    return group.length ? group.filter((t) => t.done).length / group.length : 0
  }

  const hour = new Date().getHours()
  const eveningTime = hour >= 18
  /**
   * O que aparece no topo do dia.
   *
   * Silencio significa plano sem mudanca, entao "manter_ritmo" nao vira
   * aviso. A contagem regressiva tambem sai: o card da meta logo acima ja
   * diz isso, e repetir a mesma informacao duas vezes deixa a abertura do
   * app cansativa. No maximo tres recados, para a tela continuar leve.
   */
  const ignorados = new Set(['manter_ritmo', meta ? 'meta_contagem' : ''])
  const realAdjustments = explainPlan(state, today)
    .filter((a) => !ignorados.has(a.code))
    .slice(0, 3)

  return (
    <Screen>
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] text-faint">{longDate(today)}</p>
          <h1 className="mt-0.5 truncate text-[26px] font-semibold tracking-tight">
            {greeting()}, {state.profile.name}
          </h1>
        </div>
        {/* Perfil saiu da barra de abas para dar lugar a Evolucao, e passou
            a morar aqui: ajuste e coisa de vez em quando, nao de todo dia. */}
        <button
          type="button"
          onClick={() => navigate('/perfil')}
          aria-label="Perfil e ajustes"
          className="mt-1 grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-muted"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.1a2 2 0 1 1-4 0v-.2a1.7 1.7 0 0 0-3-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0-1.2-2.9H3a2 2 0 1 1 0-4h.2a1.7 1.7 0 0 0 1.1-3l-.1-.1A2 2 0 1 1 7 4.1l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.7 1.7 0 0 0-1.5 1Z" />
          </svg>
        </button>
      </header>

      {/* Resumo do dia */}
      <Card className="mb-4 flex items-center gap-4">
        <ProgressRing
          ratio={progress.ratio}
          label={`${progress.done}/${progress.total}`}
          sublabel="do dia"
        />
        <div className="min-w-0 flex-1">
          {next ? (
            <>
              <p className="text-xs text-faint">Proximo passo</p>
              <p className="truncate text-[17px] font-semibold">{next.label}</p>
            </>
          ) : (
            <>
              <p className="text-xs text-faint">Dia completo</p>
              <p className="text-[17px] font-semibold">Tudo feito. Descanse.</p>
            </>
          )}
          {days > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <Tag tone="accent">{days} {days === 1 ? 'dia seguido' : 'dias seguidos'}</Tag>
            </div>
          )}
        </div>
      </Card>

      {/* Meta com prazo: a contagem regressiva fica acima de tudo */}
      {meta && (
        <Card accent className="mb-4" onClick={() => navigate('/metas')}>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-faint">
                {PHASE_LABELS[goalPhase(meta, today)]}
              </p>
              <p className="mt-0.5 truncate text-[17px] font-semibold">{meta.name}</p>
            </div>
            <Tag tone="accent">{countdownLabel(meta, today)}</Tag>
          </div>
        </Card>
      )}

      {realAdjustments.length > 0 && (
        <div className="mb-4 space-y-2">
          {realAdjustments.map((a) => (
            <Note key={a.code} tone="accent">{a.message}</Note>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {/* Rotina da manha */}
        {m.rotina_manha && state.routines.manha.steps.length > 0 && (
          <Card>
            <CardHead
              title="Rotina da manha"
              meta={routineTimeLabel(state.routines.manha)}
              ratio={ratioOf('manha:')}
              onOpen={() => navigate('/rotina/manha')}
            />
            {state.routines.manha.steps.slice(0, 5).map((s) => (
              <CheckRow
                key={s.id}
                label={s.name}
                sub={s.note}
                meta={`~${s.minutes} min`}
                done={!!log?.done[`manha:${s.id}`]}
                onToggle={() => toggle(`manha:${s.id}`)}
              />
            ))}
          </Card>
        )}

        {/* Treino */}
        {m.treino && (
          <Card>
            <CardHead title="Treino de hoje" onOpen={() => navigate('/treino')} />
            {workout ? (
              <>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[17px] font-semibold">{workout.name}</p>
                  <span className="text-xs text-faint">{workout.estimatedMinutes} min</span>
                </div>
                <p className="mt-0.5 text-[13px] text-muted">{workout.focus}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {workout.blocks.slice(0, 4).map((b) => (
                    <Tag key={b.exerciseId}>{b.name}</Tag>
                  ))}
                  {workout.blocks.length > 4 && <Tag>+{workout.blocks.length - 4}</Tag>}
                </div>
                <div className="mt-3">
                  <CheckRow
                    label="Marcar treino como feito"
                    done={!!log?.done.treino}
                    onToggle={() => toggle('treino')}
                    onOpen={() => navigate('/treino')}
                  />
                </div>
              </>
            ) : (
              <p className="text-[15px] text-muted">
                Dia sem treino programado. Aproveite para se mover leve.
              </p>
            )}
          </Card>
        )}

        {/* Refeicoes */}
        {m.nutricao && plan.mealIds.length > 0 && (
          <Card>
            <CardHead title="Alimentacao" ratio={ratioOf('refeicao:')} onOpen={() => navigate('/nutricao')} />
            {plan.mealIds.map((id) => {
              const meal = state.meals.find((x) => x.id === id)
              if (!meal) return null
              return (
                <CheckRow
                  key={id}
                  label={meal.name}
                  sub={mealSummary(meal)}
                  meta={meal.timeHint}
                  done={!!log?.done[`refeicao:${id}`]}
                  onToggle={() => toggle(`refeicao:${id}`)}
                  onOpen={() => navigate('/nutricao')}
                />
              )
            })}
          </Card>
        )}

        {/* Motor */}
        {m.motor && plan.motorSession && (
          <Card>
            <CardHead
              title="Motor"
              meta={`reserve ~${plan.motorSession.totalMinutes} min`}
              onOpen={() => navigate('/motor')}
            />
            <div className="mb-2 flex flex-wrap gap-1.5">
              {plan.motorSession.drills.map((d) => (
                <Tag key={d.drillId}>{d.name}</Tag>
              ))}
            </div>
            <CheckRow
              label="Sessao motora"
              done={!!log?.done.motor}
              onToggle={() => toggle('motor')}
              onOpen={() => navigate('/motor')}
            />
          </Card>
        )}

        {/* Habitos */}
        {m.habitos && plan.habitIds.length > 0 && (
          <Card>
            <CardHead title="Habitos" ratio={ratioOf('habito:')} onOpen={() => navigate('/habitos')} />
            <div className="grid grid-cols-2 gap-2">
              {plan.habitIds.map((id) => {
                const habit = state.habits.find((h) => h.id === id)
                if (!habit) return null
                const done = !!log?.done[`habito:${id}`]
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggle(`habito:${id}`)}
                    className={cx(
                      'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition active:scale-[0.98]',
                      done ? 'border-accent/60 bg-accent-soft' : 'border-line bg-surface-2',
                    )}
                  >
                    <span
                      className={cx(
                        'grid size-6 shrink-0 place-items-center rounded-lg text-[11px] font-bold',
                        done ? 'bg-accent text-ink' : 'bg-surface text-faint',
                      )}
                    >
                      {habit.icon}
                    </span>
                    <span className={cx('truncate', done ? 'text-fg' : 'text-muted')}>{habit.name}</span>
                  </button>
                )
              })}
            </div>
            {plan.focusHabitId && (
              <p className="mt-3 text-[12px] text-faint">
                Foco de hoje:{' '}
                <span className="text-muted">
                  {state.habits.find((h) => h.id === plan.focusHabitId)?.name}
                </span>
              </p>
            )}
          </Card>
        )}

        {/* Leitura */}
        {m.leitura && plan.readingMinutes > 0 && (
          <Card>
            <CardHead title="Leitura" meta={`${plan.readingMinutes} min`} onOpen={() => navigate('/leitura')} />
            <CheckRow
              label={state.books.find((b) => b.status === 'lendo')?.title ?? 'Ler um pouco'}
              done={!!log?.done.leitura}
              onToggle={() => toggle('leitura')}
              onOpen={() => navigate('/leitura')}
            />
          </Card>
        )}

        {/* Rotina da noite */}
        {m.rotina_noite && state.routines.noite.steps.length > 0 && (
          <Card accent={eveningTime}>
            <CardHead
              title="Rotina da noite"
              meta={routineTimeLabel(state.routines.noite)}
              ratio={ratioOf('noite:')}
              onOpen={() => navigate('/rotina/noite')}
            />
            {state.routines.noite.steps.slice(0, 6).map((s) => (
              <CheckRow
                key={s.id}
                label={s.name}
                sub={s.note}
                meta={`~${s.minutes} min`}
                done={!!log?.done[`noite:${s.id}`]}
                onToggle={() => toggle(`noite:${s.id}`)}
              />
            ))}
          </Card>
        )}

        {/* Check-in */}
        {m.checkin && (
          <Card accent={eveningTime && !log?.checkIn} onClick={() => navigate('/checkin')}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-[15px] font-semibold">
                  {log?.checkIn ? 'Check-in feito' : 'Check-in do dia'}
                </h3>
                <p className="mt-0.5 text-[13px] text-muted">
                  {log?.checkIn
                    ? 'Ver como foi e preparar o amanha'
                    : 'Seis perguntas rapidas antes de dormir'}
                </p>
              </div>
              <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-faint" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Card>
        )}

        {/* Pilares */}
        <Card onClick={() => navigate('/pilares')}>
          <CardHead title="Pilares" meta="ultimos 7 dias" />
          <div className="space-y-2.5">
            {PILLARS.map((pillar) => (
              <div key={pillar.id} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-[13px] text-muted">{pillar.name}</span>
                <ProgressBar ratio={consistency[pillar.id]} />
                <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-faint">
                  {Math.round(consistency[pillar.id] * 100)}%
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-snug text-faint">
            Consistencia de presenca, nao avaliacao de saude.
          </p>
        </Card>
      </div>

      <p className="pt-4 text-center text-[11px] text-faint">
        {sync.destino} - {sync.message}
      </p>
    </Screen>
  )
}
