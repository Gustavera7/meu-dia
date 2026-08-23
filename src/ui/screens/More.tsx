import { useNavigate } from 'react-router-dom'
import { countdownLabel } from '@/domain/goals/goals'
import { useApp } from '@/state/useApp'
import { openGoals } from '@/state/selectors'
import { Screen } from '@/ui/components/Layout'
import { Card, Section, Tag, cx } from '@/ui/components/primitives'

interface Destino {
  to: string
  label: string
  hint: string
}

const ACOMPANHAR: Destino[] = [
  { to: '/relatorio', label: 'Relatorio', hint: 'Pontos fortes e o que melhorar' },
  { to: '/metas', label: 'Metas', hint: 'Objetivos com data marcada' },
  { to: '/pilares', label: 'Pilares', hint: 'Consistencia por area' },
  { to: '/amanha', label: 'Seu amanha', hint: 'O plano do proximo dia' },
]

const ROTINA: Destino[] = [
  { to: '/habitos', label: 'Habitos', hint: 'Criar, pausar e acompanhar' },
  { to: '/leitura', label: 'Leitura', hint: 'Livros e registro diario' },
  { to: '/rotina/manha', label: 'Rotina da manha', hint: 'Editar os passos' },
  { to: '/rotina/noite', label: 'Rotina da noite', hint: 'Editar os passos' },
]

const PLANOS: Destino[] = [
  { to: '/planos/nutricao', label: 'Plano do nutricionista', hint: 'Cadastrar e ativar' },
  { to: '/planos/treino', label: 'Plano do personal', hint: 'Cadastrar e ativar' },
]

function Grade({ itens }: { itens: Destino[] }) {
  const navigate = useNavigate()
  return (
    <div className="grid grid-cols-2 gap-2">
      {itens.map((d) => (
        <Card key={d.to} onClick={() => navigate(d.to)} className="h-full">
          <p className="text-[15px] font-medium">{d.label}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-faint">{d.hint}</p>
        </Card>
      ))}
    </div>
  )
}

export default function More() {
  const { state, today, sync } = useApp()
  const navigate = useNavigate()
  const metas = openGoals(state, today)

  return (
    <Screen title="Mais" subtitle="Tudo que nao cabe no dia a dia">
      {metas.length > 0 && (
        <Card accent className="mb-4" onClick={() => navigate('/metas')}>
          <p className="text-[11px] uppercase tracking-wide text-faint">Meta em andamento</p>
          <p className="mt-1 text-[17px] font-semibold">{metas[0].name}</p>
          <p className="mt-0.5 text-[13px] text-accent">{countdownLabel(metas[0], today)}</p>
        </Card>
      )}

      <Section title="Acompanhar">
        <Grade itens={ACOMPANHAR} />
      </Section>

      <Section title="Sua rotina">
        <Grade itens={ROTINA} />
      </Section>

      <Section title="Planos de profissionais" hint="Nutricionista e personal">
        <Grade itens={PLANOS} />
      </Section>

      <Section title="Conta">
        <Card onClick={() => navigate('/perfil')}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[15px] font-medium">Perfil e ajustes</p>
              <p className="mt-0.5 text-[11px] text-faint">
                Objetivos, treino, dieta, horarios e dados
              </p>
            </div>
            <Tag tone={sync.status === 'sincronizado' ? 'accent' : 'default'}>{sync.destino}</Tag>
          </div>
        </Card>
      </Section>

      <p className={cx('pb-4 text-center text-[11px] text-faint')}>{sync.message}</p>
    </Screen>
  )
}
