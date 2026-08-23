import { useMemo, useState } from 'react'
import { shortDate } from '@/core/dates'
import { PILLARS } from '@/domain/pillars/pillars'
import { buildReport, type Insight } from '@/domain/report/report'
import { useApp } from '@/state/useApp'
import { Screen } from '@/ui/components/Layout'
import {
  Card, EmptyState, Note, ProgressBar, Section, Tag, cx,
} from '@/ui/components/primitives'

const PERIODOS = [
  { dias: 7, label: '7 dias' },
  { dias: 30, label: '30 dias' },
  { dias: 90, label: '90 dias' },
]

function InsightCard({ insight, tone }: { insight: Insight; tone: 'forte' | 'melhorar' }) {
  return (
    <Card className={cx(tone === 'forte' && 'border-accent/30')}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-medium leading-snug">{insight.title}</p>
          <p className="mt-1 text-[13px] leading-snug text-muted">{insight.detail}</p>
        </div>
        <span
          className={cx(
            'shrink-0 rounded-lg px-2 py-1 text-[12px] font-semibold tabular-nums',
            tone === 'forte' ? 'bg-accent-soft text-accent' : 'bg-warn/10 text-warn',
          )}
        >
          {insight.metric}
        </span>
      </div>
    </Card>
  )
}

export default function Report() {
  const { state, today } = useApp()
  const [dias, setDias] = useState(30)
  const rel = useMemo(() => buildReport(state, dias, today), [state, dias, today])

  return (
    <Screen title="Relatorio" back subtitle={`${shortDate(rel.from)} a ${shortDate(rel.to)}`}>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {PERIODOS.map((p) => (
          <button
            key={p.dias}
            type="button"
            onClick={() => setDias(p.dias)}
            className={cx(
              'rounded-xl border py-2.5 text-sm transition',
              dias === p.dias ? 'border-accent bg-accent-soft text-fg' : 'border-line bg-surface text-muted',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <Card className="mb-4">
        <p className="text-[15px] leading-snug">{rel.headline}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Tag>{rel.daysWithData} dias com registro</Tag>
          {rel.streakDays > 0 && <Tag tone="accent">{rel.streakDays} dias seguidos</Tag>}
        </div>
      </Card>

      {!rel.enough ? (
        <EmptyState
          title="Ainda cedo para um retrato"
          description="Registre alguns dias e o relatorio comeca a fazer sentido. Cinco ja bastam."
        />
      ) : (
        <>
          <Section title="Pontos fortes" hint="O que esta sustentando a sua rotina">
            {rel.strengths.length === 0 ? (
              <Note>Nenhuma area passou de 80% no periodo. Escolha uma para puxar primeiro.</Note>
            ) : (
              <div className="space-y-2">
                {rel.strengths.map((i) => (
                  <InsightCard key={i.id} insight={i} tone="forte" />
                ))}
              </div>
            )}
          </Section>

          <Section title="Pontos a melhorar" hint="Onde a rotina esta escapando">
            {rel.improvements.length === 0 ? (
              <Note>Nada abaixo da linha de corte no periodo. Bom sinal.</Note>
            ) : (
              <div className="space-y-2">
                {rel.improvements.map((i) => (
                  <InsightCard key={i.id} insight={i} tone="melhorar" />
                ))}
              </div>
            )}
          </Section>

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
            <Card>
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
    </Screen>
  )
}
