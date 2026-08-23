import type { Exercise, Experience } from '@/core/types'

const ALL: Experience[] = ['iniciante', 'intermediario', 'avancado']
const MID: Experience[] = ['intermediario', 'avancado']

/**
 * Catalogo base de exercicios.
 * Cresce sem tocar no gerador: ele so consulta padrao, equipamento e nivel.
 */
export const EXERCISES: Exercise[] = [
  // ---- Empurrar horizontal ----
  { id: 'supino_reto', name: 'Supino reto', pattern: 'empurrar_horizontal', primary: 'peito', equipment: ['academia', 'barra'], tier: 1, level: ALL },
  { id: 'supino_halter', name: 'Supino com halteres', pattern: 'empurrar_horizontal', primary: 'peito', equipment: ['academia', 'halteres'], tier: 1, level: ALL },
  { id: 'supino_inclinado', name: 'Supino inclinado', pattern: 'empurrar_horizontal', primary: 'peito', equipment: ['academia', 'halteres', 'barra'], tier: 1, level: ALL },
  { id: 'crucifixo', name: 'Crucifixo', pattern: 'isolado', primary: 'peito', equipment: ['academia', 'halteres'], tier: 3, level: ALL },
  { id: 'flexao', name: 'Flexao de braco', pattern: 'empurrar_horizontal', primary: 'peito', equipment: ['peso_corpo'], tier: 1, level: ALL, note: 'Corpo em linha, desca controlado' },
  { id: 'flexao_inclinada', name: 'Flexao com maos elevadas', pattern: 'empurrar_horizontal', primary: 'peito', equipment: ['peso_corpo'], tier: 2, level: ['iniciante'] },
  { id: 'flexao_diamante', name: 'Flexao diamante', pattern: 'empurrar_horizontal', primary: 'triceps', equipment: ['peso_corpo'], tier: 2, level: MID },
  { id: 'crossover_elastico', name: 'Crossover com elastico', pattern: 'isolado', primary: 'peito', equipment: ['elastico'], tier: 3, level: ALL },

  // ---- Empurrar vertical ----
  { id: 'desenvolvimento', name: 'Desenvolvimento militar', pattern: 'empurrar_vertical', primary: 'ombro', equipment: ['academia', 'barra'], tier: 1, level: ALL },
  { id: 'desenvolvimento_halter', name: 'Desenvolvimento com halteres', pattern: 'empurrar_vertical', primary: 'ombro', equipment: ['academia', 'halteres'], tier: 1, level: ALL },
  { id: 'elevacao_lateral', name: 'Elevacao lateral', pattern: 'isolado', primary: 'ombro', equipment: ['academia', 'halteres', 'elastico'], tier: 3, level: ALL },
  { id: 'pike_pushup', name: 'Flexao pike', pattern: 'empurrar_vertical', primary: 'ombro', equipment: ['peso_corpo'], tier: 2, level: MID },
  { id: 'desenvolvimento_kb', name: 'Desenvolvimento com kettlebell', pattern: 'empurrar_vertical', primary: 'ombro', equipment: ['kettlebell'], tier: 1, level: ALL },

  // ---- Puxar vertical ----
  { id: 'barra_fixa', name: 'Barra fixa', pattern: 'puxar_vertical', primary: 'costas', equipment: ['barra_fixa', 'academia'], tier: 1, level: MID },
  { id: 'barra_assistida', name: 'Barra fixa assistida', pattern: 'puxar_vertical', primary: 'costas', equipment: ['barra_fixa', 'academia', 'elastico'], tier: 1, level: ['iniciante', 'intermediario'] },
  { id: 'puxada_frente', name: 'Puxada frontal', pattern: 'puxar_vertical', primary: 'costas', equipment: ['academia'], tier: 1, level: ALL },
  { id: 'puxada_elastico', name: 'Puxada alta com elastico', pattern: 'puxar_vertical', primary: 'costas', equipment: ['elastico'], tier: 2, level: ALL },

  // ---- Puxar horizontal ----
  { id: 'remada_curvada', name: 'Remada curvada', pattern: 'puxar_horizontal', primary: 'costas', equipment: ['academia', 'barra', 'halteres'], tier: 1, level: ALL },
  { id: 'remada_unilateral', name: 'Remada unilateral', pattern: 'puxar_horizontal', primary: 'costas', equipment: ['academia', 'halteres', 'kettlebell'], tier: 2, level: ALL },
  { id: 'remada_baixa', name: 'Remada baixa', pattern: 'puxar_horizontal', primary: 'costas', equipment: ['academia'], tier: 1, level: ALL },
  { id: 'remada_invertida', name: 'Remada invertida', pattern: 'puxar_horizontal', primary: 'costas', equipment: ['peso_corpo', 'barra_fixa'], tier: 1, level: ALL },
  { id: 'remada_elastico', name: 'Remada com elastico', pattern: 'puxar_horizontal', primary: 'costas', equipment: ['elastico'], tier: 2, level: ALL },
  { id: 'face_pull', name: 'Face pull', pattern: 'isolado', primary: 'ombro', equipment: ['academia', 'elastico'], tier: 3, level: ALL, note: 'Bom para postura' },

  // ---- Agachar ----
  { id: 'agachamento_livre', name: 'Agachamento livre', pattern: 'agachar', primary: 'quadriceps', equipment: ['academia', 'barra'], tier: 1, level: ALL },
  { id: 'agachamento_goblet', name: 'Agachamento goblet', pattern: 'agachar', primary: 'quadriceps', equipment: ['halteres', 'kettlebell', 'academia'], tier: 1, level: ALL },
  { id: 'agachamento_pc', name: 'Agachamento peso do corpo', pattern: 'agachar', primary: 'quadriceps', equipment: ['peso_corpo'], tier: 1, level: ALL },
  { id: 'leg_press', name: 'Leg press', pattern: 'agachar', primary: 'quadriceps', equipment: ['academia'], tier: 2, level: ALL },
  { id: 'cadeira_extensora', name: 'Cadeira extensora', pattern: 'isolado', primary: 'quadriceps', equipment: ['academia'], tier: 3, level: ALL },
  { id: 'agachamento_bulgaro', name: 'Agachamento bulgaro', pattern: 'unilateral', primary: 'quadriceps', equipment: ['peso_corpo', 'halteres', 'academia'], tier: 2, level: MID },

  // ---- Dobradica de quadril ----
  { id: 'levantamento_terra', name: 'Levantamento terra', pattern: 'dobradica', primary: 'posterior', equipment: ['academia', 'barra'], tier: 1, level: MID },
  { id: 'terra_romeno', name: 'Terra romeno', pattern: 'dobradica', primary: 'posterior', equipment: ['academia', 'barra', 'halteres'], tier: 1, level: ALL },
  { id: 'swing_kb', name: 'Swing com kettlebell', pattern: 'dobradica', primary: 'posterior', equipment: ['kettlebell'], tier: 1, level: ALL },
  { id: 'elevacao_pelvica', name: 'Elevacao pelvica', pattern: 'dobradica', primary: 'gluteo', equipment: ['peso_corpo', 'halteres', 'academia'], tier: 2, level: ALL },
  { id: 'mesa_flexora', name: 'Mesa flexora', pattern: 'isolado', primary: 'posterior', equipment: ['academia'], tier: 3, level: ALL },
  { id: 'good_morning', name: 'Good morning', pattern: 'dobradica', primary: 'posterior', equipment: ['barra', 'elastico'], tier: 2, level: MID },

  // ---- Unilateral e panturrilha ----
  { id: 'afundo', name: 'Afundo', pattern: 'unilateral', primary: 'quadriceps', equipment: ['peso_corpo', 'halteres', 'academia'], tier: 2, level: ALL },
  { id: 'passada', name: 'Passada caminhando', pattern: 'unilateral', primary: 'quadriceps', equipment: ['peso_corpo', 'halteres'], tier: 2, level: ALL },
  { id: 'step_up', name: 'Step up no banco', pattern: 'unilateral', primary: 'gluteo', equipment: ['peso_corpo', 'halteres'], tier: 2, level: ALL },
  { id: 'panturrilha', name: 'Panturrilha em pe', pattern: 'isolado', primary: 'panturrilha', equipment: ['peso_corpo', 'academia', 'halteres'], tier: 3, level: ALL },

  // ---- Bracos ----
  { id: 'rosca_direta', name: 'Rosca direta', pattern: 'isolado', primary: 'biceps', equipment: ['academia', 'halteres', 'barra', 'elastico'], tier: 3, level: ALL },
  { id: 'rosca_martelo', name: 'Rosca martelo', pattern: 'isolado', primary: 'biceps', equipment: ['academia', 'halteres'], tier: 3, level: ALL },
  { id: 'triceps_corda', name: 'Triceps na corda', pattern: 'isolado', primary: 'triceps', equipment: ['academia', 'elastico'], tier: 3, level: ALL },
  { id: 'triceps_testa', name: 'Triceps testa', pattern: 'isolado', primary: 'triceps', equipment: ['academia', 'halteres', 'barra'], tier: 3, level: ALL },
  { id: 'mergulho_banco', name: 'Mergulho no banco', pattern: 'isolado', primary: 'triceps', equipment: ['peso_corpo'], tier: 3, level: ALL },

  // ---- Core ----
  { id: 'prancha', name: 'Prancha', pattern: 'core', primary: 'core', equipment: ['peso_corpo'], tier: 2, level: ALL },
  { id: 'prancha_lateral', name: 'Prancha lateral', pattern: 'core', primary: 'core', equipment: ['peso_corpo'], tier: 2, level: ALL },
  { id: 'dead_bug', name: 'Dead bug', pattern: 'core', primary: 'core', equipment: ['peso_corpo'], tier: 2, level: ALL, note: 'Lombar colada no chao' },
  { id: 'hollow_hold', name: 'Hollow hold', pattern: 'core', primary: 'core', equipment: ['peso_corpo'], tier: 2, level: MID },
  { id: 'elevacao_pernas', name: 'Elevacao de pernas', pattern: 'core', primary: 'core', equipment: ['peso_corpo', 'barra_fixa'], tier: 3, level: ALL },
  { id: 'pallof', name: 'Pallof press', pattern: 'core', primary: 'core', equipment: ['elastico', 'academia'], tier: 2, level: ALL },

  // ---- Condicionamento ----
  { id: 'burpee', name: 'Burpee', pattern: 'condicionamento', primary: 'corpo_todo', equipment: ['peso_corpo'], tier: 2, level: ALL },
  { id: 'escalador', name: 'Escalador', pattern: 'condicionamento', primary: 'corpo_todo', equipment: ['peso_corpo'], tier: 2, level: ALL },
  { id: 'polichinelo', name: 'Polichinelo', pattern: 'condicionamento', primary: 'corpo_todo', equipment: ['peso_corpo'], tier: 3, level: ALL },
  { id: 'corda_naval', name: 'Corda naval', pattern: 'condicionamento', primary: 'corpo_todo', equipment: ['academia'], tier: 2, level: ALL },
  { id: 'bike_intervalada', name: 'Bike intervalada', pattern: 'condicionamento', primary: 'corpo_todo', equipment: ['academia'], tier: 2, level: ALL },
  { id: 'caminhada_inclinada', name: 'Caminhada inclinada', pattern: 'condicionamento', primary: 'corpo_todo', equipment: ['academia', 'peso_corpo'], tier: 3, level: ALL },
]

export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(
  EXERCISES.map((e) => [e.id, e]),
)
