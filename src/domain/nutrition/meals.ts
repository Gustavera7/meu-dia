import type { Food, Meal, MealComponent, MealSlot, Profile } from '@/core/types'
import { DIET_BLOCKS, FOODS, FOOD_BY_ID, RESTRICTION_BLOCKS, fitsSlot } from './foods'
import { makeId, seededRandom, stamp } from '@/core/id'

/* ---------------- filtro do que a pessoa pode/quer comer ---------------- */

export function allowedFoods(profile: Profile): Food[] {
  const blocked = new Set<string>()
  for (const r of profile.nutrition.restrictions) {
    for (const tag of RESTRICTION_BLOCKS[r] ?? []) blocked.add(tag)
  }
  for (const tag of DIET_BLOCKS[profile.nutrition.dietStyle] ?? []) blocked.add(tag)

  const dislikes = profile.nutrition.dislikes.map((d) => d.toLowerCase().trim()).filter(Boolean)

  return FOODS.filter((f) => {
    if (f.tags.some((t) => blocked.has(t))) return false
    if (dislikes.some((d) => f.name.toLowerCase().includes(d) || f.id === d)) return false
    if (profile.nutrition.dietStyle === 'low_carb' && f.role === 'carbo') {
      return ['feijao', 'quinoa', 'aveia'].includes(f.id)
    }
    return true
  })
}

export function isAllowed(food: Food, profile: Profile): boolean {
  return allowedFoods(profile).some((f) => f.id === food.id)
}

/* ---------------- refeicoes iniciais ---------------- */

interface Template {
  name: string
  slot: MealSlot
  roles: { role: MealComponent['role']; prefer: string[] }[]
  timeHint: string
}

const TEMPLATES: Template[] = [
  {
    name: 'Cafe da manha', slot: 'cafe', timeHint: '07:00',
    roles: [
      { role: 'carbo', prefer: ['pao_integral', 'tapioca', 'aveia', 'cuscuz'] },
      { role: 'proteina', prefer: ['ovos', 'iogurte_proteico', 'whey', 'tofu'] },
      { role: 'fruta', prefer: ['banana', 'mamao', 'morango'] },
      { role: 'extra', prefer: ['cafe', 'cha'] },
    ],
  },
  {
    name: 'Lanche da manha', slot: 'lanche_manha', timeHint: '10:00',
    roles: [
      { role: 'fruta', prefer: ['maca', 'banana', 'laranja'] },
      { role: 'gordura', prefer: ['castanhas', 'pasta_amendoim'] },
    ],
  },
  {
    name: 'Almoco', slot: 'almoco', timeHint: '12:30',
    roles: [
      { role: 'carbo', prefer: ['arroz', 'arroz_integral', 'batata', 'quinoa'] },
      { role: 'proteina', prefer: ['frango', 'patinho', 'tilapia', 'grao_bico', 'tofu'] },
      { role: 'vegetal', prefer: ['legumes', 'salada', 'brocolis'] },
      { role: 'gordura', prefer: ['azeite'] },
    ],
  },
  {
    name: 'Lanche da tarde', slot: 'lanche_tarde', timeHint: '16:00',
    roles: [
      { role: 'proteina', prefer: ['iogurte_proteico', 'whey', 'ovos'] },
      { role: 'fruta', prefer: ['banana', 'morango', 'maca'] },
    ],
  },
  {
    name: 'Jantar', slot: 'jantar', timeHint: '19:30',
    roles: [
      { role: 'proteina', prefer: ['frango', 'tilapia', 'ovos', 'lentilha'] },
      { role: 'carbo', prefer: ['batata_doce', 'arroz_integral', 'mandioca'] },
      { role: 'vegetal', prefer: ['salada', 'legumes', 'abobrinha'] },
    ],
  },
  {
    name: 'Ceia', slot: 'ceia', timeHint: '22:00',
    roles: [
      { role: 'laticinio', prefer: ['iogurte', 'bebida_vegetal', 'leite'] },
      { role: 'gordura', prefer: ['castanhas'] },
    ],
  },
]

/** Ordem em que as refeicoes entram conforme a quantidade escolhida. */
const ORDER_BY_COUNT: Record<number, MealSlot[]> = {
  2: ['almoco', 'jantar'],
  3: ['cafe', 'almoco', 'jantar'],
  4: ['cafe', 'almoco', 'lanche_tarde', 'jantar'],
  5: ['cafe', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar'],
  6: ['cafe', 'lanche_manha', 'almoco', 'lanche_tarde', 'jantar', 'ceia'],
}

function componentFor(
  role: MealComponent['role'],
  prefer: string[],
  pool: Food[],
  rand: () => number,
): MealComponent | null {
  const preferred = prefer.map((id) => pool.find((f) => f.id === id)).filter(Boolean) as Food[]
  const sameRole = pool.filter((f) => f.role === role)
  const list = preferred.length > 0 ? preferred : sameRole
  if (list.length === 0) return null
  const food = list[Math.floor(rand() * Math.min(list.length, 3))] ?? list[0]
  return { foodId: food.id, name: food.name, role: food.role, amount: food.defaultAmount }
}

/** Monta o conjunto inicial de refeicoes a partir do onboarding. */
export function buildInitialMeals(profile: Profile, seed = 'meals'): Meal[] {
  const rand = seededRandom(seed)
  const pool = allowedFoods(profile)
  const count = Math.min(6, Math.max(2, profile.nutrition.mealsPerDay))
  const slots = ORDER_BY_COUNT[count] ?? ORDER_BY_COUNT[4]

  return slots.map((slot) => {
    const t = TEMPLATES.find((x) => x.slot === slot)!
    const components = t.roles
      .map((r) => componentFor(r.role, r.prefer, pool, rand))
      .filter(Boolean) as MealComponent[]
    return {
      id: makeId('meal'),
      name: t.name,
      slot: t.slot,
      components,
      recurring: true,
      timeHint: t.timeHint,
      updatedAt: stamp(),
      deletedAt: null,
    }
  })
}

/* ---------------- "estou enjoado dessa refeicao" ---------------- */

export interface MealAlternative {
  id: string
  label: string
  components: MealComponent[]
  /** o que mudou em relacao a refeicao original */
  changed: string
}

/**
 * Resumo curto da refeicao.
 *
 * Itens de papel "extra" (cafe, cha) sao ruido no resumo e ficam de fora -
 * mas so quando ha outra coisa para mostrar. Refeicoes vindas de um plano
 * prescrito tem todos os itens como texto livre, e escondê-los deixaria o
 * card vazio.
 */
function describe(components: MealComponent[]): string {
  const principais = components.filter((c) => c.role !== 'extra')
  const usar = principais.length > 0 ? principais : components
  return usar.map((c) => c.name.toLowerCase()).filter(Boolean).join(' + ')
}

/**
 * Gera alternativas nutricionalmente parecidas trocando componentes
 * do MESMO papel (carbo por carbo, proteina por proteina...).
 * A estrutura da refeicao e preservada.
 */
export function generateAlternatives(
  meal: Meal,
  profile: Profile,
  max = 5,
): MealAlternative[] {
  const pool = allowedFoods(profile)
  const swappable = meal.components.filter((c) => c.role !== 'extra')
  const rand = seededRandom(meal.id)

  const swap = (target: MealComponent, food: Food): MealComponent[] =>
    meal.components.map((c) =>
      c === target
        ? { foodId: food.id, name: food.name, role: food.role, amount: food.defaultAmount }
        : c,
    )

  // Uma fila de trocas possiveis por componente, embaralhada.
  const queues = swappable.map((target) => ({
    target,
    options: pool
      .filter(
        (f) =>
          f.role === target.role &&
          f.id !== target.foodId &&
          fitsSlot(f.id, meal.slot),
      )
      .sort(() => rand() - 0.5),
  }))

  const out: MealAlternative[] = []
  const seen = new Set<string>([describe(meal.components)])

  // Rodizio entre os componentes: a lista alterna carbo, proteina, vegetal...
  // em vez de gastar todas as sugestoes trocando so o primeiro item.
  let round = 0
  while (out.length < max && queues.some((q) => q.options.length > round)) {
    for (const q of queues) {
      if (out.length >= max) break
      const food = q.options[round]
      if (!food) continue
      const components = swap(q.target, food)
      const key = describe(components)
      if (seen.has(key)) continue
      seen.add(key)
      out.push({
        id: makeId('alt'),
        label: key,
        components,
        changed: `${q.target.name} vira ${food.name}`,
      })
    }
    round++
  }

  // Uma variacao com duas trocas, para quando a pessoa quer algo bem diferente.
  if (swappable.length >= 2 && queues[0].options.length && queues[1].options.length) {
    const fa = queues[0].options[0]
    const fb = queues[1].options[0]
    const components = meal.components.map((c) => {
      if (c === queues[0].target) return { foodId: fa.id, name: fa.name, role: fa.role, amount: fa.defaultAmount }
      if (c === queues[1].target) return { foodId: fb.id, name: fb.name, role: fb.role, amount: fb.defaultAmount }
      return c
    })
    const key = describe(components)
    if (!seen.has(key)) {
      out.splice(max - 1, out.length, {
        id: makeId('alt'),
        label: key,
        components,
        changed: `${queues[0].target.name} e ${queues[1].target.name} mudam`,
      })
    }
  }

  return out.slice(0, max)
}

export function mealSummary(meal: Meal): string {
  return describe(meal.components) || 'Refeicao vazia'
}

export function foodName(id: string | null): string {
  return id ? FOOD_BY_ID[id]?.name ?? id : ''
}
