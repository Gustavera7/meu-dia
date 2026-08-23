import type {
  DietStyle, Equipment, Experience, FoodQuality, GoalId, MealSlot,
  MotorCategory, NutritionGoal, ReadingFrequency, Sex, TrainingStyle, ModuleId,
} from './types'

export const GOALS: { id: GoalId; label: string; hint: string }[] = [
  { id: 'ganhar_massa', label: 'Ganhar massa', hint: 'Volume e progressao de carga' },
  { id: 'perder_gordura', label: 'Perder gordura', hint: 'Deficit com preservacao muscular' },
  { id: 'condicionamento', label: 'Condicionamento', hint: 'Folego e capacidade de trabalho' },
  { id: 'forca', label: 'Forca', hint: 'Cargas maiores, menos repeticoes' },
  { id: 'mobilidade', label: 'Mobilidade', hint: 'Amplitude e qualidade de movimento' },
  { id: 'qualidade_vida', label: 'Qualidade de vida', hint: 'Constancia sem exagero' },
  { id: 'energia', label: 'Mais energia', hint: 'Sono, rotina e alimentacao' },
  { id: 'disciplina', label: 'Disciplina', hint: 'Habitos que se sustentam' },
]

export const SEX_OPTIONS: { id: Sex; label: string }[] = [
  { id: 'masculino', label: 'Masculino' },
  { id: 'feminino', label: 'Feminino' },
  { id: 'outro', label: 'Prefiro nao dizer' },
]

export const EXPERIENCE_OPTIONS: { id: Experience; label: string; hint: string }[] = [
  { id: 'iniciante', label: 'Iniciante', hint: 'Menos de 1 ano' },
  { id: 'intermediario', label: 'Intermediario', hint: '1 a 3 anos' },
  { id: 'avancado', label: 'Avancado', hint: 'Mais de 3 anos' },
]

export const EQUIPMENT_OPTIONS: { id: Equipment; label: string }[] = [
  { id: 'academia', label: 'Academia completa' },
  { id: 'halteres', label: 'Halteres' },
  { id: 'barra', label: 'Barra e anilhas' },
  { id: 'kettlebell', label: 'Kettlebell' },
  { id: 'elastico', label: 'Elasticos' },
  { id: 'barra_fixa', label: 'Barra fixa' },
  { id: 'peso_corpo', label: 'Peso do corpo' },
]

export const STYLE_OPTIONS: { id: TrainingStyle; label: string; hint: string }[] = [
  { id: 'musculacao', label: 'Musculacao', hint: 'Serie e repeticao classico' },
  { id: 'funcional', label: 'Funcional', hint: 'Movimentos integrados' },
  { id: 'calistenia', label: 'Calistenia', hint: 'Peso do corpo' },
  { id: 'hibrido', label: 'Hibrido', hint: 'Forca + condicionamento' },
]

export const DIET_OPTIONS: { id: DietStyle; label: string }[] = [
  { id: 'onivora', label: 'Como de tudo' },
  { id: 'flexivel', label: 'Flexivel' },
  { id: 'vegetariana', label: 'Vegetariana' },
  { id: 'vegana', label: 'Vegana' },
  { id: 'low_carb', label: 'Low carb' },
]

export const NUTRITION_GOAL_OPTIONS: { id: NutritionGoal; label: string }[] = [
  { id: 'ganhar_massa', label: 'Comer para ganhar massa' },
  { id: 'perder_gordura', label: 'Comer para perder gordura' },
  { id: 'manter', label: 'Manter o peso' },
  { id: 'mais_saude', label: 'Comer melhor no geral' },
]

export const RESTRICTION_OPTIONS = [
  'sem_lactose', 'sem_gluten', 'sem_carne_vermelha', 'sem_porco',
  'sem_frutos_do_mar', 'sem_ovo', 'sem_amendoim',
]

export const RESTRICTION_LABELS: Record<string, string> = {
  sem_lactose: 'Sem lactose',
  sem_gluten: 'Sem gluten',
  sem_carne_vermelha: 'Sem carne vermelha',
  sem_porco: 'Sem porco',
  sem_frutos_do_mar: 'Sem frutos do mar',
  sem_ovo: 'Sem ovo',
  sem_amendoim: 'Sem amendoim',
}

export const MOTOR_OPTIONS: { id: MotorCategory; label: string; hint: string }[] = [
  { id: 'mobilidade', label: 'Mobilidade', hint: 'Quadril, torax, ombro, tornozelo' },
  { id: 'equilibrio', label: 'Equilibrio', hint: 'Apoio unilateral e estabilidade' },
  { id: 'coordenacao', label: 'Coordenacao', hint: 'Ritmo e sequencias' },
  { id: 'reflexo', label: 'Reflexo', hint: 'Resposta rapida' },
  { id: 'reacao', label: 'Reacao', hint: 'Tempo de resposta a estimulo' },
  { id: 'propriocepcao', label: 'Propriocepcao', hint: 'Nocao do corpo no espaco' },
  { id: 'controle_corporal', label: 'Controle corporal', hint: 'Forca em amplitude' },
  { id: 'olho_mao', label: 'Olho-mao', hint: 'Precisao visual e manual' },
  { id: 'cognitivo_motor', label: 'Cognitivo-motor', hint: 'Pensar e mover junto' },
]

export const READING_FREQ_OPTIONS: { id: ReadingFrequency; label: string; minutes: number }[] = [
  { id: 'nunca', label: 'Nao leio hoje em dia', minutes: 10 },
  { id: 'raramente', label: 'Raramente', minutes: 10 },
  { id: 'as_vezes', label: 'As vezes', minutes: 15 },
  { id: 'quase_sempre', label: 'Quase todo dia', minutes: 20 },
  { id: 'todo_dia', label: 'Todo dia', minutes: 30 },
]

export const INTEREST_OPTIONS = [
  'Negocios', 'Psicologia', 'Saude', 'Filosofia', 'Historia',
  'Ficcao', 'Tecnologia', 'Financas', 'Biografias', 'Espiritualidade',
]

export const MEAL_SLOTS: { id: MealSlot; label: string; time: string }[] = [
  { id: 'cafe', label: 'Cafe da manha', time: '07:00' },
  { id: 'lanche_manha', label: 'Lanche da manha', time: '10:00' },
  { id: 'almoco', label: 'Almoco', time: '12:30' },
  { id: 'lanche_tarde', label: 'Lanche da tarde', time: '16:00' },
  { id: 'jantar', label: 'Jantar', time: '19:30' },
  { id: 'ceia', label: 'Ceia', time: '22:00' },
]

export const FOOD_QUALITY_OPTIONS: { id: FoodQuality; label: string }[] = [
  { id: 'boa', label: 'Boa' },
  { id: 'media', label: 'Media' },
  { id: 'ruim', label: 'Ruim' },
]

export const MODULE_LABELS: Record<ModuleId, string> = {
  treino: 'Treino',
  nutricao: 'Nutricao',
  motor: 'Motor',
  habitos: 'Habitos',
  leitura: 'Leitura',
  rotina_manha: 'Rotina da manha',
  rotina_noite: 'Rotina da noite',
  checkin: 'Check-in diario',
}

export const SCALE_LABELS: Record<string, string[]> = {
  sono: ['Pessimo', 'Ruim', 'Ok', 'Bom', 'Otimo'],
  energia: ['Zerada', 'Baixa', 'Media', 'Boa', 'Alta'],
  humor: ['Ruim', 'Baixo', 'Neutro', 'Bom', 'Otimo'],
  estresse: ['Nenhum', 'Pouco', 'Medio', 'Alto', 'Muito alto'],
  dificuldade: ['Muito facil', 'Facil', 'Na medida', 'Dificil', 'Muito dificil'],
}
