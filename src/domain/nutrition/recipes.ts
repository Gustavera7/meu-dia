import type { Profile, Recipe } from '@/core/types'
import { DIET_BLOCKS, RESTRICTION_BLOCKS } from './foods'

/** Receitas curtas, praticas e de execucao rapida no dia a dia. */
export const RECIPES: Recipe[] = [
  {
    id: 'frango_legumes', name: 'Frango na frigideira com legumes', minutes: 20,
    slots: ['almoco', 'jantar'], tags: ['sem_gluten', 'sem_lactose'],
    goals: ['ganhar_massa', 'perder_gordura', 'manter', 'mais_saude'],
    ingredients: ['150 g de frango em cubos', '1 xicara de legumes picados', '1 col. de azeite', 'Alho, sal e pimenta'],
    steps: ['Aqueca a frigideira com azeite', 'Doure o frango por 6 a 8 minutos', 'Junte os legumes e refogue 5 minutos', 'Tempere e sirva'],
  },
  {
    id: 'omelete', name: 'Omelete completa', minutes: 10,
    slots: ['cafe', 'jantar'], tags: ['ovo', 'sem_gluten'],
    goals: ['ganhar_massa', 'perder_gordura', 'mais_saude'],
    ingredients: ['3 ovos', '40 g de queijo branco', 'Tomate e cebola', 'Sal e oregano'],
    steps: ['Bata os ovos com sal', 'Refogue os vegetais', 'Despeje os ovos e cozinhe em fogo baixo', 'Dobre ao meio e sirva'],
  },
  {
    id: 'bowl_arroz', name: 'Bowl de arroz, feijao e carne', minutes: 15,
    slots: ['almoco', 'jantar'], tags: ['carne_vermelha', 'sem_gluten'],
    goals: ['ganhar_massa', 'manter'],
    ingredients: ['150 g de arroz cozido', '1 concha de feijao', '150 g de patinho moido', 'Salada verde'],
    steps: ['Refogue a carne com alho e cebola', 'Monte o bowl com arroz e feijao', 'Cubra com a carne', 'Finalize com salada e azeite'],
  },
  {
    id: 'panqueca_aveia', name: 'Panqueca de aveia e banana', minutes: 10,
    slots: ['cafe', 'lanche_tarde'], tags: ['vegetariano', 'ovo', 'gluten'],
    goals: ['ganhar_massa', 'manter'],
    ingredients: ['1 banana', '2 ovos', '40 g de aveia', 'Canela'],
    steps: ['Amasse a banana e misture tudo', 'Aqueca a frigideira antiaderente', 'Cozinhe 2 minutos de cada lado', 'Sirva com canela'],
  },
  {
    id: 'tapioca_frango', name: 'Tapioca recheada com frango', minutes: 12,
    slots: ['cafe', 'lanche_tarde', 'jantar'], tags: ['sem_gluten'],
    goals: ['perder_gordura', 'manter', 'mais_saude'],
    ingredients: ['2 col. de goma de tapioca', '100 g de frango desfiado', 'Tomate picado'],
    steps: ['Espalhe a goma na frigideira quente', 'Quando firmar, recheie', 'Dobre e sirva'],
  },
  {
    id: 'salada_grao', name: 'Salada de grao de bico', minutes: 10,
    slots: ['almoco', 'jantar'], tags: ['vegano', 'sem_gluten'],
    goals: ['perder_gordura', 'mais_saude', 'manter'],
    ingredients: ['150 g de grao de bico cozido', 'Tomate, pepino e cebola roxa', 'Azeite e limao'],
    steps: ['Pique os vegetais', 'Misture com o grao de bico', 'Tempere com azeite, limao e sal'],
  },
  {
    id: 'iogurte_bowl', name: 'Bowl de iogurte proteico', minutes: 5,
    slots: ['cafe', 'lanche_manha', 'lanche_tarde', 'ceia'], tags: ['vegetariano', 'lactose'],
    goals: ['ganhar_massa', 'perder_gordura', 'mais_saude'],
    ingredients: ['170 g de iogurte proteico', '1 xicara de morango', '30 g de castanhas'],
    steps: ['Coloque o iogurte na tigela', 'Adicione as frutas', 'Finalize com castanhas'],
  },
  {
    id: 'peixe_forno', name: 'Peixe ao forno com batata doce', minutes: 30,
    slots: ['almoco', 'jantar'], tags: ['peixe', 'sem_gluten', 'sem_lactose'],
    goals: ['perder_gordura', 'mais_saude', 'manter'],
    ingredients: ['160 g de tilapia', '200 g de batata doce', 'Azeite, limao e ervas'],
    steps: ['Tempere o peixe com limao e ervas', 'Corte a batata em rodelas', 'Asse tudo a 200 graus por 25 minutos'],
  },
]

/** Receitas compativeis com dieta, restricoes e objetivo alimentar. */
export function recipesFor(profile: Profile): Recipe[] {
  const blocked = new Set<string>()
  for (const r of profile.nutrition.restrictions) {
    for (const tag of RESTRICTION_BLOCKS[r] ?? []) blocked.add(tag)
  }
  for (const tag of DIET_BLOCKS[profile.nutrition.dietStyle] ?? []) blocked.add(tag)

  return RECIPES.filter((r) => {
    if (r.tags.some((t) => blocked.has(t))) return false
    return r.goals.includes(profile.nutrition.goal)
  })
}

/** Receitas rapidas, usadas quando a aderencia alimentar cai. */
export function quickRecipes(profile: Profile, maxMinutes = 15): Recipe[] {
  return recipesFor(profile).filter((r) => r.minutes <= maxMinutes)
}
