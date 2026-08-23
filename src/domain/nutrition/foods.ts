import type { Food, MealSlot } from '@/core/types'

/**
 * Catalogo de alimentos por papel na refeicao.
 * O motor de substituicao troca alimentos DENTRO do mesmo papel,
 * mantendo a estrutura da refeicao parecida.
 */
export const FOODS: Food[] = [
  // ---- Carboidratos ----
  { id: 'arroz', name: 'Arroz branco', role: 'carbo', tags: ['vegano', 'sem_gluten'], defaultAmount: '150 g' },
  { id: 'arroz_integral', name: 'Arroz integral', role: 'carbo', tags: ['vegano', 'sem_gluten'], defaultAmount: '150 g' },
  { id: 'batata', name: 'Batata', role: 'carbo', tags: ['vegano', 'sem_gluten'], defaultAmount: '200 g' },
  { id: 'batata_doce', name: 'Batata doce', role: 'carbo', tags: ['vegano', 'sem_gluten'], defaultAmount: '200 g' },
  { id: 'macarrao', name: 'Macarrao', role: 'carbo', tags: ['vegano', 'gluten'], defaultAmount: '120 g' },
  { id: 'mandioca', name: 'Mandioca', role: 'carbo', tags: ['vegano', 'sem_gluten'], defaultAmount: '180 g' },
  { id: 'pao_integral', name: 'Pao integral', role: 'carbo', tags: ['vegano', 'gluten'], defaultAmount: '2 fatias' },
  { id: 'tapioca', name: 'Tapioca', role: 'carbo', tags: ['vegano', 'sem_gluten'], defaultAmount: '2 col. sopa' },
  { id: 'aveia', name: 'Aveia', role: 'carbo', tags: ['vegetariano', 'vegano'], defaultAmount: '40 g' },
  { id: 'cuscuz', name: 'Cuscuz', role: 'carbo', tags: ['vegano', 'sem_gluten'], defaultAmount: '80 g' },
  { id: 'feijao', name: 'Feijao', role: 'carbo', tags: ['vegano', 'sem_gluten'], defaultAmount: '1 concha' },
  { id: 'quinoa', name: 'Quinoa', role: 'carbo', tags: ['vegano', 'sem_gluten'], defaultAmount: '120 g' },

  // ---- Proteinas ----
  { id: 'frango', name: 'Frango grelhado', role: 'proteina', tags: ['sem_gluten', 'sem_lactose'], defaultAmount: '150 g' },
  { id: 'patinho', name: 'Carne magra (patinho)', role: 'proteina', tags: ['carne_vermelha', 'sem_gluten'], defaultAmount: '150 g' },
  { id: 'tilapia', name: 'Tilapia', role: 'proteina', tags: ['peixe', 'sem_gluten'], defaultAmount: '160 g' },
  { id: 'salmao', name: 'Salmao', role: 'proteina', tags: ['peixe', 'sem_gluten'], defaultAmount: '140 g' },
  { id: 'atum', name: 'Atum', role: 'proteina', tags: ['peixe', 'sem_gluten'], defaultAmount: '1 lata' },
  { id: 'ovos', name: 'Ovos', role: 'proteina', tags: ['vegetariano', 'ovo', 'sem_gluten'], defaultAmount: '3 unidades' },
  { id: 'porco', name: 'Lombo suino', role: 'proteina', tags: ['porco', 'sem_gluten'], defaultAmount: '150 g' },
  { id: 'tofu', name: 'Tofu', role: 'proteina', tags: ['vegano', 'vegetariano', 'sem_gluten'], defaultAmount: '180 g' },
  { id: 'grao_bico', name: 'Grao de bico', role: 'proteina', tags: ['vegano', 'vegetariano', 'sem_gluten'], defaultAmount: '150 g' },
  { id: 'lentilha', name: 'Lentilha', role: 'proteina', tags: ['vegano', 'vegetariano', 'sem_gluten'], defaultAmount: '150 g' },
  { id: 'whey', name: 'Whey protein', role: 'proteina', tags: ['vegetariano', 'lactose'], defaultAmount: '1 scoop' },
  { id: 'iogurte_proteico', name: 'Iogurte proteico', role: 'proteina', tags: ['vegetariano', 'lactose', 'sem_gluten'], defaultAmount: '170 g' },

  // ---- Vegetais ----
  { id: 'legumes', name: 'Legumes no vapor', role: 'vegetal', tags: ['vegano', 'sem_gluten'], defaultAmount: '1 xicara' },
  { id: 'salada', name: 'Salada verde', role: 'vegetal', tags: ['vegano', 'sem_gluten'], defaultAmount: 'a vontade' },
  { id: 'brocolis', name: 'Brocolis', role: 'vegetal', tags: ['vegano', 'sem_gluten'], defaultAmount: '1 xicara' },
  { id: 'abobrinha', name: 'Abobrinha', role: 'vegetal', tags: ['vegano', 'sem_gluten'], defaultAmount: '1 xicara' },
  { id: 'cenoura', name: 'Cenoura', role: 'vegetal', tags: ['vegano', 'sem_gluten'], defaultAmount: '1 unidade' },
  { id: 'tomate', name: 'Tomate', role: 'vegetal', tags: ['vegano', 'sem_gluten'], defaultAmount: '1 unidade' },
  { id: 'couve', name: 'Couve refogada', role: 'vegetal', tags: ['vegano', 'sem_gluten'], defaultAmount: '1 xicara' },

  // ---- Gorduras ----
  { id: 'azeite', name: 'Azeite', role: 'gordura', tags: ['vegano', 'sem_gluten'], defaultAmount: '1 col. sopa' },
  { id: 'abacate', name: 'Abacate', role: 'gordura', tags: ['vegano', 'sem_gluten'], defaultAmount: '1/2 unidade' },
  { id: 'castanhas', name: 'Castanhas', role: 'gordura', tags: ['vegano', 'sem_gluten'], defaultAmount: '30 g' },
  { id: 'pasta_amendoim', name: 'Pasta de amendoim', role: 'gordura', tags: ['vegano', 'amendoim'], defaultAmount: '1 col. sopa' },

  // ---- Frutas ----
  { id: 'banana', name: 'Banana', role: 'fruta', tags: ['vegano', 'sem_gluten'], defaultAmount: '1 unidade' },
  { id: 'maca', name: 'Maca', role: 'fruta', tags: ['vegano', 'sem_gluten'], defaultAmount: '1 unidade' },
  { id: 'mamao', name: 'Mamao', role: 'fruta', tags: ['vegano', 'sem_gluten'], defaultAmount: '1 fatia' },
  { id: 'morango', name: 'Morango', role: 'fruta', tags: ['vegano', 'sem_gluten'], defaultAmount: '1 xicara' },
  { id: 'laranja', name: 'Laranja', role: 'fruta', tags: ['vegano', 'sem_gluten'], defaultAmount: '1 unidade' },

  // ---- Laticinios ----
  { id: 'iogurte', name: 'Iogurte natural', role: 'laticinio', tags: ['vegetariano', 'lactose'], defaultAmount: '170 g' },
  { id: 'queijo', name: 'Queijo branco', role: 'laticinio', tags: ['vegetariano', 'lactose'], defaultAmount: '40 g' },
  { id: 'leite', name: 'Leite', role: 'laticinio', tags: ['vegetariano', 'lactose'], defaultAmount: '200 ml' },
  { id: 'bebida_vegetal', name: 'Bebida vegetal', role: 'laticinio', tags: ['vegano', 'sem_lactose'], defaultAmount: '200 ml' },

  // ---- Extras ----
  { id: 'cafe', name: 'Cafe', role: 'extra', tags: ['vegano', 'sem_gluten'], defaultAmount: '1 xicara' },
  { id: 'cha', name: 'Cha', role: 'extra', tags: ['vegano', 'sem_gluten'], defaultAmount: '1 xicara' },
]

export const FOOD_BY_ID: Record<string, Food> = Object.fromEntries(FOODS.map((f) => [f.id, f]))

/** Tags que cada restricao proibe. */
export const RESTRICTION_BLOCKS: Record<string, string[]> = {
  sem_lactose: ['lactose'],
  sem_gluten: ['gluten'],
  sem_carne_vermelha: ['carne_vermelha'],
  sem_porco: ['porco'],
  sem_frutos_do_mar: ['peixe', 'frutos_do_mar'],
  sem_ovo: ['ovo'],
  sem_amendoim: ['amendoim'],
}

/** Alimentos proibidos pelo estilo de dieta. */
export const DIET_BLOCKS: Record<string, string[]> = {
  vegetariana: ['carne_vermelha', 'porco', 'peixe', 'frutos_do_mar'],
  vegana: ['carne_vermelha', 'porco', 'peixe', 'frutos_do_mar', 'lactose', 'ovo'],
  onivora: [],
  flexivel: [],
  low_carb: [],
}

/**
 * Onde cada alimento faz sentido no dia.
 * So aparecem aqui os que precisam de limite: quem nao esta listado
 * e considerado livre para qualquer refeicao.
 */
export const FOOD_SLOTS: Record<string, MealSlot[]> = {
  aveia: ['cafe', 'lanche_manha', 'lanche_tarde', 'ceia'],
  pao_integral: ['cafe', 'lanche_manha', 'lanche_tarde'],
  tapioca: ['cafe', 'lanche_manha', 'lanche_tarde', 'jantar'],
  cuscuz: ['cafe', 'lanche_manha', 'jantar'],
  whey: ['cafe', 'lanche_manha', 'lanche_tarde', 'ceia'],
  iogurte_proteico: ['cafe', 'lanche_manha', 'lanche_tarde', 'ceia'],
  arroz: ['almoco', 'jantar'],
  arroz_integral: ['almoco', 'jantar'],
  macarrao: ['almoco', 'jantar'],
  mandioca: ['almoco', 'jantar'],
  feijao: ['almoco', 'jantar'],
  quinoa: ['almoco', 'jantar'],
  batata: ['almoco', 'jantar'],
  batata_doce: ['almoco', 'jantar'],
  patinho: ['almoco', 'jantar'],
  porco: ['almoco', 'jantar'],
  salmao: ['almoco', 'jantar'],
  tilapia: ['almoco', 'jantar'],
  frango: ['almoco', 'jantar', 'lanche_tarde'],
  couve: ['almoco', 'jantar'],
  salada: ['almoco', 'jantar'],
  legumes: ['almoco', 'jantar'],
  brocolis: ['almoco', 'jantar'],
  abobrinha: ['almoco', 'jantar'],
  leite: ['cafe', 'lanche_manha', 'lanche_tarde', 'ceia'],
  bebida_vegetal: ['cafe', 'lanche_manha', 'lanche_tarde', 'ceia'],
  iogurte: ['cafe', 'lanche_manha', 'lanche_tarde', 'ceia'],
  cafe: ['cafe', 'lanche_manha', 'lanche_tarde'],
}

/** O alimento cabe nesse momento do dia? */
export function fitsSlot(foodId: string, slot: MealSlot): boolean {
  const allowed = FOOD_SLOTS[foodId]
  return !allowed || allowed.includes(slot)
}
