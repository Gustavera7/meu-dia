import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { shortDate } from '@/core/dates'
import { PILLARS } from '@/domain/pillars/pillars'
import { buildReport } from '@/domain/report/report'
import { buildSuggestions } from '@/domain/report/suggestions'
import { countdownLabel, goalPhase, goalProgress, PHASE_LABELS } from '@/domain/goals/goals'
import { faseAtual, templateDe } from '@/domain/goals/events'
import { useApp } from '@/state/useApp'
import { openGoals } from '@/state/selectors'
import { Screen } from '@/ui/components/Layout'
import { Prumo } from '@/ui/components/Prumo'
import {
  Button, Card, EmptyState, ProgressBar, Section, Tag, cx,
} from '@/ui/components/primitives'

const PERIODOS = [
  { dias: 7, label: '7 dias' },
  { dias: 30, label: '30 dias' },
  { dias: 90, label: '90 dias' },
]

const ATALHOS = [
  { to: '/metas', label: 'Metas' },
  { to: '/habitos', label: 'Habitos' },
  { to: '/leitura', label: 'Leitura' },
  { to: '/pilares', label: 'Pilares' },
  { to: '/planos/nutricao', label: 'Plano do nutricionista' },
  { to: '/planos/treino', label: 'Plano do personal' },
]

export default function Evolucao() {
  const { state, today } = useApp()
  const navigate = useNavigate()
  const [dias, setDias] = useState(30)

  const rel = useMemo(() => buildReport(state, dias, today), [state, dias, today])
  const sugestoes = useMemo(() => buildSuggestions(state, rel, today), [state, rel, today])
  const meta = openGoals(state, today)[0] ?? null
  const fase = meta ? faseAtual(meta.eventTemplate, goalProgress(meta, today)) : null

  return (
    <Screen title="Evolucao" subtitle="Como voce esta e o que fazer a seguir">
      {/* Meta com prazo primeiro: ela muda a leitura de todo o resto */}
      {meta ? (
        <Card accent className="mb-4" onClick={() => navigate('/metas')}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-faint">
                {fase ? fase.nome : PHASE_LABELS[goalPhase(meta, today)]}
              </p>
              <p className="mt-0.5 truncate text-[17px] font-semibold">{meta.name}</p>
              {/* So repete o tipo se o nome nao disser a mesma coisa */}
              {templateDe(meta.eventTemplate) &&
                templateDe(meta.eventTemplate)!.label.toLowerCase() !== meta.name.trim().toLowerCase() && (
                  <p className="text-[12px] text-muted">{templateDe(meta.eventTemplate)!.label}</p>
                )}
            </div>
            <Tag tone="accent">{countdownLabel(meta, today)}</Tag>
          </div>
          <ProgressBar ratio={goalProgress(meta, today)} className="mt-3" />
        </Card>
      ) : (
        <Card className="mb-4" onClick={() => navigate('/metas')}>
          <p className="text-[15px] font-medium">Nenhuma meta com data</p>
          <p className="mt-0.5 text-[12px] text-muted">
            Uma prova, uma trilha, uma viagem. Prazo muda o comportamento.
          </p>
        </Card>
      )}

      {/* O que fazer a seguir, antes de qualquer numero */}
      <Section title="Sugestoes" hint="Do seu historico e das suas metas">
        <div className="space-y-2">
          {sugestoes.map((s) => (
            <Card key={s.id}>
              <p className="text-[15px] font-medium leading-snug">{s.title}</p>
              <p className="mt-1 text-[13px] leading-snug text-muted">{s.why}</p>
              <button
                type="button"
                onClick={() => navigate(s.to)}
                className="mt-2.5 text-[12px] font-medium text-accent"
              >
                {s.acao}
              </button>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        title="Como voce esta"
        hint={`${shortDate(rel.from)} a ${shortDate(rel.to)}`}
        action={
          <div className="flex gap-1">
            {PERIODOS.map((p) => (
              <button
                key={p.dias}
                type="button"
                onClick={() => setDias(p.dias)}
                className={cx(
                  'rounded-lg px-2 py-1 text-[11px] transition',
                  dias === p.dias ? 'bg-accent text-ink font-medium' : 'bg-surface-2 text-faint',
                )}
              >
                {p.dias}d
              </button>
            ))}
          </div>
        }
      >
        <Card>
          <p className="text-[15px] leading-snug">{rel.headline}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Tag>{rel.daysWithData} dias com registro</Tag>
            {rel.streakDays > 0 && <Tag tone="accent">{rel.streakDays} dias seguidos</Tag>}
          </div>
        </Card>
      </Section>

      {!rel.enough ? (
        <EmptyState
          title="Ainda cedo para um retrato"
          description="Registre alguns dias e os numeros comecam a fazer sentido. Cinco ja bastam."
        />
      ) : (
        <>
          {rel.strengths.length > 0 && (
            <Section title="Indo bem">
              <div className="space-y-2">
                {rel.strengths.slice(0, 4).map((i) => (
                  <Card key={i.id} className="border-accent/30">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[15px] font-medium leading-snug">{i.title}</p>
                        <p className="mt-1 text-[13px] leading-snug text-muted">{i.detail}</p>
                      </div>
                      <span className="shrink-0 rounded-lg bg-accent-soft px-2 py-1 text-[12px] font-semibold tabular-nums text-accent">
                        {i.metric}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </Section>
          )}

          <Section title="Aderencia por area" hint="Do que foi planejado, quanto aconteceu">
            <Card>
              <div className="space-y-2.5">
                {rel.scores.map((s) => (
                  <div key={s.area} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-[13px] text-muted">{s.label}</span>
                    <ProgressBar ratio={s.ratio} />
                    <span className="w-14 shrink-0 text-right text-[11px] tabular-nums text-faint">
                      {s.done}/{s.total}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </Section>

          {rel.trends.length > 0 && (
            <Section title="Como voce se sentiu" hint="Primeira metade do periodo contra a segunda">
              <Card>
                {rel.trends.map((t) => (
                  <div
                    key={t.label}
                    className="flex items-center justify-between border-b border-line/60 py-3 last:border-0"
                  >
                    <span className="text-[15px]">{t.label}</span>
                    <div className="flex items-center gap-2 text-[13px] tabular-nums">
                      <span className="text-faint">{t.before}</span>
                      <span className="text-faint">para</span>
                      <span
                        className={cx(
                          'font-semibold',
                          t.direction === 'melhor' && 'text-accent',
                          t.direction === 'pior' && 'text-warn',
                        )}
                      >
                        {t.after}
                      </span>
                    </div>
                  </div>
                ))}
              </Card>
            </Section>
          )}

          <Section title="Pilares" hint="Consistencia de presenca, nao avaliacao de saude">
            <Card onClick={() => navigate('/pilares')}>
              <div className="space-y-2.5">
                {PILLARS.map((p) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 text-[13px] text-muted">{p.name}</span>
                    <ProgressBar ratio={rel.pillars[p.id]} />
                    <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-faint">
                      {Math.round(rel.pillars[p.id] * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </Section>
        </>
      )}

      <Section title="Ajustar">
        <div className="grid grid-cols-2 gap-2">
          {ATALHOS.map((a) => (
            <Button key={a.to} variant="subtle" onClick={() => navigate(a.to)}>
              {a.label}
            </Button>
          ))}
        </div>
      </Section>

      <footer className="flex flex-col items-center gap-2 pb-6 pt-2">
        <Prumo size={24} />
        <span className="text-[10px] font-semibold tracking-[0.24em] text-faint">PRUMO</span>
      </footer>
    </Screen>
  )
}
