import { useMemo, useState } from 'react'
import type { Meal, MealComponent, MealSlot, Recipe } from '@/core/types'
import { MEAL_SLOTS } from '@/core/labels'
import { makeId, stamp } from '@/core/id'
import { allowedFoods, generateAlternatives, mealSummary } from '@/domain/nutrition/meals'
import { recipesFor } from '@/domain/nutrition/recipes'
import { useToday } from '@/state/useApp'
import { visibleMeals, activePrescription } from '@/state/selectors'
import { useNavigate } from 'react-router-dom'
import { Screen } from '@/ui/components/Layout'
import {
  Button, Card, Chip, EmptyState, Field, Input, Note, Section, Sheet, Tag, cx,
} from '@/ui/components/primitives'

const ROLE_LABEL: Record<string, string> = {
  carbo: 'Carboidrato', proteina: 'Proteina', vegetal: 'Vegetal',
  gordura: 'Gordura', fruta: 'Fruta', laticinio: 'Laticinio', extra: 'Extra',
}

export default function Nutrition() {
  const { state, dispatch, today } = useToday()
  const log = state.logs[today]
  const dieta = activePrescription(state, 'nutricao', today)
  const navigate = useNavigate()

  const [tiredOf, setTiredOf] = useState<Meal | null>(null)
  const [editing, setEditing] = useState<Meal | null>(null)
  const [picker, setPicker] = useState(false)
  const [search, setSearch] = useState('')
  const [recipe, setRecipe] = useState<Recipe | null>(null)

  const foods = useMemo(() => allowedFoods(state.profile), [state.profile])
  const recipes = useMemo(() => recipesFor(state.profile), [state.profile])
  const alternatives = useMemo(
    () => (tiredOf ? generateAlternatives(tiredOf, state.profile, 5) : []),
    [tiredOf, state.profile],
  )

  const meals = visibleMeals(state)

  function applyToday(components: MealComponent[], label: string) {
    if (!tiredOf) return
    dispatch({
      type: 'log_meal',
      date: today,
      log: { mealId: tiredOf.id, status: 'trocada', replacedWith: label },
    })
    dispatch({ type: 'update_meal', id: tiredOf.id, patch: { components } })
    setTiredOf(null)
  }

  function addComponent(foodId: string) {
    if (!editing) return
    const food = foods.find((f) => f.id === foodId)
    if (!food) return
    const components = [
      ...editing.components,
      { foodId: food.id, name: food.name, role: food.role, amount: food.defaultAmount },
    ]
    setEditing({ ...editing, components })
    dispatch({ type: 'update_meal', id: editing.id, patch: { components } })
    setPicker(false)
    setSearch('')
  }

  function removeComponent(index: number) {
    if (!editing) return
    const components = editing.components.filter((_, i) => i !== index)
    setEditing({ ...editing, components })
    dispatch({ type: 'update_meal', id: editing.id, patch: { components } })
  }

  function newMeal(slot: MealSlot) {
    const meal: Meal = {
      id: makeId('meal'),
      name: MEAL_SLOTS.find((s) => s.id === slot)?.label ?? 'Refeicao',
      slot,
      components: [],
      recurring: true,
      timeHint: MEAL_SLOTS.find((s) => s.id === slot)?.time,
      updatedAt: stamp(),
      deletedAt: null,
    }
    dispatch({ type: 'add_meal', meal })
    setEditing(meal)
  }

  return (
    <Screen title="Alimentacao" subtitle={`${meals.length} ${meals.length === 1 ? 'refeicao' : 'refeicoes'} no seu dia`}>
      {/* Plano prescrito: quem manda no dia aparece antes de tudo */}
      <Card
        accent={!!dieta}
        className="mb-4"
        onClick={() => navigate('/planos/nutricao')}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-faint">
              {dieta ? 'Plano do nutricionista' : 'Plano proprio'}
            </p>
            <p className="mt-0.5 truncate text-[15px] font-medium">
              {dieta ? dieta.title : 'Refeicoes montadas pelo app'}
            </p>
            {dieta?.professional.name && (
              <p className="text-[12px] text-muted">por {dieta.professional.name}</p>
            )}
          </div>
          <span className="shrink-0 text-xs text-accent">
            {dieta ? 'ver' : 'cadastrar'}
          </span>
        </div>
      </Card>

      <Section
        title="Hoje"
        hint={
          dieta
            ? 'Seguindo o plano prescrito. Toque para marcar.'
            : 'Toque para marcar. Enjoou? Peca uma troca.'
        }
      >
        {meals.length === 0 ? (
          <EmptyState title="Nenhuma refeicao cadastrada" description="Adicione a sua primeira refeicao abaixo." />
        ) : (
          <div className="space-y-2">
            {meals.map((meal) => {
              const done = !!log?.done[`refeicao:${meal.id}`]
              const swapped = log?.meals.find((m) => m.mealId === meal.id && m.status === 'trocada')
              return (
                <Card key={meal.id} className={cx(done && 'border-accent/40')}>
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'toggle_task', date: today, key: `refeicao:${meal.id}` })}
                      aria-label={`Marcar ${meal.name}`}
                      className={cx(
                        'mt-0.5 grid size-6 shrink-0 place-items-center rounded-lg border transition',
                        done ? 'border-accent bg-accent text-ink' : 'border-line bg-surface-2',
                      )}
                    >
                      {done && (
                        <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate text-[15px] font-medium">{meal.name}</p>
                        <span className="shrink-0 text-[11px] text-faint">{meal.timeHint}</span>
                      </div>
                      <p className="mt-0.5 text-[13px] leading-snug text-muted">{mealSummary(meal)}</p>
                      {swapped && <Tag tone="warn">trocada hoje</Tag>}
                      <div className="mt-2 flex gap-4">
                        {!meal.sourcePlanId && (
                          <button type="button" onClick={() => setTiredOf(meal)} className="text-[12px] text-accent">
                            Estou enjoado disso
                          </button>
                        )}
                        <button type="button" onClick={() => setEditing(meal)} className="text-[12px] text-muted">
                          Editar
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </Section>

      <Section title="Adicionar refeicao">
        <div className="flex flex-wrap gap-2">
          {MEAL_SLOTS.map((s) => (
            <Chip key={s.id} label={s.label} onClick={() => newMeal(s.id)} />
          ))}
        </div>
      </Section>

      <Section title="Receitas" hint="Rapidas e alinhadas ao seu objetivo">
        {recipes.length === 0 ? (
          <Note>Nenhuma receita compativel com as suas restricoes ainda.</Note>
        ) : (
          <div className="space-y-2">
            {recipes.map((r) => (
              <Card key={r.id} onClick={() => setRecipe(r)}>
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-[15px] font-medium">{r.name}</p>
                  <span className="shrink-0 text-xs text-faint">{r.minutes} min</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {/* Enjoou da refeicao */}
      <Sheet open={!!tiredOf} onClose={() => setTiredOf(null)} title="Trocar a refeicao">
        {tiredOf && (
          <>
            {tiredOf.sourcePlanId && (
              <Note tone="accent">
                Esta refeicao veio do seu nutricionista. Trocar aqui muda so no app,
                nao no plano. Vale combinar a substituicao com quem prescreveu.
              </Note>
            )}
            <Note>Atual: {mealSummary(tiredOf)}</Note>
            <p className="mb-2 mt-4 text-[13px] text-muted">Alternativas parecidas:</p>
            <div className="space-y-2">
              {alternatives.map((alt) => (
                <Card key={alt.id} onClick={() => applyToday(alt.components, alt.label)}>
                  <p className="text-[15px]">{alt.label}</p>
                  <p className="mt-0.5 text-[11px] text-faint">{alt.changed}</p>
                </Card>
              ))}
              {alternatives.length === 0 && (
                <Note>Poucos alimentos liberados para gerar trocas. Revise as restricoes no perfil.</Note>
              )}
            </div>
          </>
        )}
      </Sheet>

      {/* Editor de refeicao */}
      <Sheet open={!!editing} onClose={() => setEditing(null)} title="Editar refeicao">
        {editing && (
          <>
            <Field label="Nome">
              <Input
                value={editing.name}
                onChange={(e) => {
                  setEditing({ ...editing, name: e.target.value })
                  dispatch({ type: 'update_meal', id: editing.id, patch: { name: e.target.value } })
                }}
              />
            </Field>
            <p className="mb-2 text-[13px] font-medium text-muted">Alimentos</p>
            <div className="mb-3 space-y-1.5">
              {editing.components.map((c, i) => (
                <div key={`${c.foodId}-${i}`} className="flex items-center gap-3 rounded-xl bg-surface-2 px-3 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{c.name}</p>
                    <p className="text-[11px] text-faint">{ROLE_LABEL[c.role]} - {c.amount}</p>
                  </div>
                  <button type="button" onClick={() => removeComponent(i)} className="text-xs text-red-300">
                    remover
                  </button>
                </div>
              ))}
              {editing.components.length === 0 && <Note>Nenhum alimento ainda.</Note>}
            </div>
            <Button variant="subtle" full onClick={() => setPicker(true)}>
              Adicionar alimento
            </Button>
            <button
              type="button"
              className="mt-4 w-full text-center text-xs text-red-300"
              onClick={() => {
                dispatch({ type: 'remove_meal', id: editing.id })
                setEditing(null)
              }}
            >
              Excluir refeicao
            </button>
          </>
        )}
      </Sheet>

      {/* Buscador de alimentos */}
      <Sheet open={picker} onClose={() => setPicker(false)} title="Escolher alimento">
        <Input
          autoFocus
          placeholder="Buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-3"
        />
        <div className="space-y-1.5">
          {foods
            .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
            .slice(0, 24)
            .map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => addComponent(f.id)}
                className="flex w-full items-center justify-between rounded-xl bg-surface-2 px-3 py-2.5 text-left"
              >
                <span className="text-sm">{f.name}</span>
                <span className="text-[11px] text-faint">{ROLE_LABEL[f.role]}</span>
              </button>
            ))}
        </div>
      </Sheet>

      {/* Receita */}
      <Sheet open={!!recipe} onClose={() => setRecipe(null)} title={recipe?.name ?? ''}>
        {recipe && (
          <>
            <Tag tone="accent">{recipe.minutes} min</Tag>
            <p className="mb-2 mt-4 text-[13px] font-medium text-muted">Ingredientes</p>
            <ul className="mb-4 space-y-1">
              {recipe.ingredients.map((i) => (
                <li key={i} className="text-sm text-fg">- {i}</li>
              ))}
            </ul>
            <p className="mb-2 text-[13px] font-medium text-muted">Modo de fazer</p>
            <ol className="space-y-2">
              {recipe.steps.map((s, i) => (
                <li key={s} className="flex gap-3 text-sm">
                  <span className="grid size-5 shrink-0 place-items-center rounded-md bg-surface-2 text-[11px] text-faint">
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ol>
          </>
        )}
      </Sheet>
    </Screen>
  )
}
