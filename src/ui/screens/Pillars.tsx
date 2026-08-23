import { PILLARS } from '@/domain/pillars/pillars'
import { pillarConsistency } from '@/domain/planning/progress'
import { useApp } from '@/state/useApp'
import { Screen } from '@/ui/components/Layout'
import { Card, Note, ProgressBar, Section, Tag } from '@/ui/components/primitives'

/**
 * Leitura de consistencia, nunca de saude.
 * As faixas baixas ficam descritivas de proposito: dizer que um pilar esta
 * "torto" seria julgamento, e o app nao existe para cobrar.
 */
function level(ratio: number): string {
  if (ratio >= 0.8) return 'no prumo'
  if (ratio >= 0.5) return 'firmando'
  if (ratio > 0) return 'aparecendo pouco'
  return 'sem registro'
}

export default function Pillars() {
  const { state, today } = useApp()
  const week = pillarConsistency(state, 7, today)
  const month = pillarConsistency(state, 30, today)

  return (
    <Screen title="Pilares" back subtitle="Como o seu dia a dia se distribui">
      <Note>
        Isto e um retrato de consistencia, nao uma avaliacao de saude. Serve para voce enxergar
        onde esta colocando atencao e onde esta faltando.
      </Note>

      <div className="h-4" />

      <Section title="Ultimos 7 dias">
        <div className="space-y-3">
          {PILLARS.map((p) => (
            <Card key={p.id}>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <div>
                  <h3 className="text-[15px] font-semibold">{p.name}</h3>
                  <p className="text-[12px] text-faint">{p.description}</p>
                </div>
                <Tag tone={week[p.id] >= 0.5 ? 'accent' : 'default'}>{level(week[p.id])}</Tag>
              </div>
              <ProgressBar ratio={week[p.id]} />
              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {p.subItems.map((s) => (
                    <span key={s} className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] text-faint">
                      {s}
                    </span>
                  ))}
                </div>
                <span className="shrink-0 text-[11px] tabular-nums text-faint">
                  30d: {Math.round(month[p.id] * 100)}%
                </span>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </Screen>
  )
}
