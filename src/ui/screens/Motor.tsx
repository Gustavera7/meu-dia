import { useEffect, useRef, useState } from 'react'
import type { Scale5 } from '@/core/types'
import { SCALE_LABELS } from '@/core/labels'
import { MOTOR_CATEGORY_LABEL } from '@/domain/motor/drills'
import { useToday } from '@/state/useApp'
import { Screen } from '@/ui/components/Layout'
import {
  Button, Card, EmptyState, Field, Note, ProgressRing, Scale, Section, Sheet, Tag, cx,
} from '@/ui/components/primitives'

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function Motor() {
  const { state, dispatch, today, plan } = useToday()
  const session = plan.motorSession
  const log = state.logs[today]?.motor

  const [playing, setPlaying] = useState(false)
  const [index, setIndex] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [rating, setRating] = useState(false)
  const [difficulty, setDifficulty] = useState<Scale5 | null>(log?.difficulty ?? null)
  const timer = useRef<number | null>(null)

  const drill = session?.drills[index]

  useEffect(() => {
    if (!playing || !drill) return
    timer.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(timer.current!)
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => {
      if (timer.current) window.clearInterval(timer.current)
    }
  }, [playing, index, drill])

  function start() {
    if (!session) return
    setIndex(0)
    setRemaining(session.drills[0].minutes * 60)
    setPlaying(true)
  }

  // Passa sozinho quando o tempo acaba: a sessao e feita longe da tela.
  useEffect(() => {
    if (!playing || remaining !== 0 || !drill) return
    const id = window.setTimeout(() => nextDrill(), 900)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, remaining, drill])

  function nextDrill() {
    if (!session) return
    if (index + 1 >= session.drills.length) {
      setPlaying(false)
      setRating(true)
      return
    }
    const i = index + 1
    setIndex(i)
    setRemaining(session.drills[i].minutes * 60)
  }

  function finish(done: boolean) {
    if (!session) return
    dispatch({ type: 'log_motor', date: today, log: { sessionId: session.id, done, difficulty } })
    setRating(false)
    setPlaying(false)
  }

  if (!session) {
    return (
      <Screen title="Motor">
        <EmptyState
          title="Modulo motor desligado"
          description="Ative em Perfil para receber sessoes diarias de 5 a 10 minutos."
        />
      </Screen>
    )
  }

  // Modo guiado em tela cheia
  if (playing && drill) {
    const total = drill.minutes * 60
    return (
      // cobre a barra de abas: durante a sessao a tela e so o exercicio
      <div className="fixed inset-0 z-50 mx-auto flex max-w-md flex-col justify-between overflow-y-auto bg-ink px-6 py-10">
        <div className="text-center">
          <Tag tone="accent">{MOTOR_CATEGORY_LABEL[drill.category]}</Tag>
          <p className="mt-3 text-[13px] text-faint">
            {index + 1} de {session.drills.length}
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <ProgressRing ratio={1 - remaining / total} size={200} label={formatClock(remaining)} />
          <div className="text-center">
            <h1 className="text-[24px] font-semibold leading-tight">{drill.name}</h1>
            <p className="mx-auto mt-2 max-w-[30ch] text-[15px] leading-snug text-muted">{drill.howTo}</p>
          </div>
        </div>

        <div className="space-y-3">
          <Button full onClick={nextDrill}>
            {index + 1 >= session.drills.length ? 'Terminar sessao' : 'Proximo exercicio'}
          </Button>
          <Button variant="ghost" full onClick={() => setPlaying(false)}>
            Sair
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Screen title="Motor" subtitle={`Sessao de ${session.totalMinutes} minutos`}>
      <Note>
        Capacidades que treino comum nao cobre: mobilidade, equilibrio, coordenacao, reflexo e
        controle do corpo. Poucos minutos, todo dia.
      </Note>

      <div className="h-4" />

      <Section title="Sessao de hoje" action={log?.done ? <Tag tone="accent">feita</Tag> : undefined}>
        <Card>
          <div className="divide-y divide-line/60">
            {session.drills.map((d, i) => (
              <div key={d.drillId} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-surface-2 text-[11px] text-faint">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-[15px] font-medium">{d.name}</p>
                    <span className="shrink-0 text-[12px] text-accent">{d.minutes} min</span>
                  </div>
                  <p className="mt-0.5 text-[12px] leading-snug text-faint">{d.howTo}</p>
                  <span className="mt-1 inline-block text-[11px] text-faint">
                    {MOTOR_CATEGORY_LABEL[d.category]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="mt-3 flex gap-3">
          <Button full onClick={start}>
            Iniciar sessao guiada
          </Button>
          <Button
            variant="subtle"
            onClick={() => setRating(true)}
            className={cx(log?.done && 'opacity-60')}
          >
            Registrar
          </Button>
        </div>
      </Section>

      <Sheet open={rating} onClose={() => setRating(false)} title="Como foi a sessao?">
        <Field label="Dificuldade">
          <Scale value={difficulty} onChange={setDifficulty} labels={SCALE_LABELS.dificuldade} />
        </Field>
        <div className="flex gap-3">
          <Button variant="subtle" onClick={() => finish(false)}>
            Nao fiz
          </Button>
          <Button full onClick={() => finish(true)}>
            Concluir
          </Button>
        </div>
      </Sheet>
    </Screen>
  )
}
