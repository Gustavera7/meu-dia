import { useNavigate } from 'react-router-dom'
import { longDate, tomorrow as nextDay } from '@/core/dates'
import { mealSummary } from '@/domain/nutrition/meals'
import { quickRecipes } from '@/domain/nutrition/recipes'
import { explainPlan, workoutForPlan } from '@/domain/planning/dayPlan'
import { hasCode } from '@/domain/planning/adaptation'
import { useApp } from '@/state/useApp'
import { Screen } from '@/ui/components/Layout'
import { Button, Card, Section, Tag } from '@/ui/components/primitives'

function Row({ label, value, meta }: { label: string; value: string; meta?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line/60 py-3 last:border-0">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-faint">{label}</p>
        <p className="mt-0.5 text-[15px] leading-snug">{value}</p>
      </div>
      {meta && <span className="shrink-0 text-xs text-faint">{meta}</span>}
    </div>
  )
}

export default function Tomorrow() {
  const { state, planFor } = useApp()
  const navigate = useNavigate()
  const date = nextDay()
  const plan = planFor(date)
  const adjustments = explainPlan(state, date)

  // mesma funcao do dashboard: se o motor pediu treino leve, e ele que aparece
  const workout = workoutForPlan(state, plan)
  const simpleMeals = hasCode(adjustments, 'refeicoes_simples')
  const fastRecipes = simpleMeals ? quickRecipes(state.profile, 15) : []
  const focusHabit = state.habits.find((h) => h.id === plan.focusHabitId)
  const meals = plan.mealIds
    .map((id) => state.meals.find((m) => m.id === id))
    .filter(Boolean)

  return (
    <Screen title="Seu amanha" back subtitle={longDate(date)}>
      <Section title="O que mudou" hint="Baseado no seu check-in e nos ultimos dias">
        <div className="space-y-2">
          {adjustments.map((a) => (
            <Card key={a.code} accent={a.code !== 'manter_ritmo'}>
              <p className="text-[15px] leading-snug">{a.message}</p>
              <p className="mt-1 text-[12px] leading-snug text-faint">{a.reason}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="O plano">
        <Card>
          <Row
            label="Treino"
            value={workout ? `${workout.name} - ${workout.focus}` : 'Sem treino programado'}
            meta={workout ? `${workout.estimatedMinutes} min` : undefined}
          />
          {meals.length > 0 && (
            <Row
              label="Refeicoes"
              value={meals.map((m) => m!.name).join(', ')}
              meta={`${meals.length}`}
            />
          )}
          {plan.motorSession && (
            <Row
              label="Motor"
              value={plan.motorSession.drills.map((d) => d.name).join(', ')}
              meta={`${plan.motorSession.totalMinutes} min`}
            />
          )}
          {focusHabit && <Row label="Habito principal" value={focusHabit.name} />}
          {plan.readingMinutes > 0 && (
            <Row label="Leitura" value={`${plan.readingMinutes} minutos`} />
          )}
          <Row
            label="Manha"
            value={state.routines.manha.steps.map((s) => s.name).join(' - ') || 'Sem rotina'}
            meta={`${state.routines.manha.steps.reduce((s, x) => s + x.minutes, 0)} min`}
          />
          <Row
            label="Noite"
            value={state.routines.noite.steps.map((s) => s.name).join(' - ') || 'Sem rotina'}
            meta={`${state.routines.noite.steps.reduce((s, x) => s + x.minutes, 0)} min`}
          />
        </Card>
      </Section>

      {fastRecipes.length > 0 && (
        <Section title="Receitas rapidas" hint="Menos de 15 minutos, para o dia voltar ao lugar">
          <div className="space-y-2">
            {fastRecipes.map((r) => (
              <Card key={r.id}>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[15px] font-medium">{r.name}</p>
                  <Tag>{r.minutes} min</Tag>
                </div>
                <p className="mt-0.5 text-[13px] text-muted">{r.ingredients.slice(0, 3).join(", ")}</p>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {meals.length > 0 && (
        <Section title={simpleMeals ? "Suas refeicoes" : "Sugestao de refeicoes"}>
          <div className="space-y-2">
            {meals.map((m) => (
              <Card key={m!.id}>
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[15px] font-medium">{m!.name}</p>
                  <Tag>{m!.timeHint}</Tag>
                </div>
                <p className="mt-0.5 text-[13px] text-muted">{mealSummary(m!)}</p>
              </Card>
            ))}
          </div>
        </Section>
      )}

      <Button full onClick={() => navigate('/')}>
        Boa noite
      </Button>
    </Screen>
  )
}
