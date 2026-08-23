import type { GoalFocus, Modality } from '@/core/types'

/**
 * Receitas de preparacao para eventos com data marcada.
 *
 * Cada modelo diz como a rotina muda ao longo do tempo, em fases. A ideia
 * que atravessa todos: o volume sobe devagar, tem um pico bem antes da
 * data, e CAI de proposito na reta final. Chegar cansado no dia desfaz
 * meses de trabalho, e e o erro mais comum de quem se prepara sozinho.
 *
 * As orientacoes de alimentacao aqui sao gerais e servem para organizar a
 * rotina, nao substituem acompanhamento de nutricionista. Quando existir um
 * plano profissional cadastrado no app, ele tem precedencia sobre isto.
 */

export interface EventPhase {
  /** ate que ponto da preparacao esta fase vale, de 0 a 1 */
  ate: number
  nome: string
  treino: string
  nutricao: string
  /** volume relativo do treino nesta fase */
  volume: number
}

export interface EventTemplate {
  id: string
  label: string
  hint: string
  sport: Modality | null
  semanasIdeais: number
  diasPorSemana: number
  focus: GoalFocus[]
  fases: EventPhase[]
  /** lembretes diarios enquanto a preparacao corre */
  diarios: string[]
  /** o que checar antes do dia, em ordem */
  checklist: string[]
}

const RETA_FINAL: EventPhase = {
  ate: 0.94,
  nome: 'Poupanca',
  treino: 'Volume cai bastante. Mantenha a frequencia, corte a duracao.',
  nutricao: 'Coma o de sempre. Nao e hora de testar nada novo.',
  volume: 0.6,
}

const SEMANA_DO_EVENTO: EventPhase = {
  ate: 1,
  nome: 'Semana do evento',
  treino: 'Poucos estimulos curtos so para o corpo lembrar do ritmo.',
  nutricao: 'Priorize carboidrato e agua nos ultimos dias. Nada de comida desconhecida.',
  volume: 0.35,
}

function fasesDeResistencia(): EventPhase[] {
  return [
    {
      ate: 0.35,
      nome: 'Base',
      treino: 'Volume leve e constante. Quase tudo em ritmo de conversa.',
      nutricao: 'Regularidade nas refeicoes e agua ao longo do dia.',
      volume: 0.85,
    },
    {
      ate: 0.7,
      nome: 'Construcao',
      treino: 'O longo cresce e entra uma sessao forte por semana.',
      nutricao: 'Carboidrato antes dos treinos longos e comida de verdade depois.',
      volume: 1,
    },
    {
      ate: 0.88,
      nome: 'Pico',
      treino: 'Maior volume da preparacao. Durma como se fosse parte do treino.',
      nutricao: 'Teste no treino longo o que voce vai comer e beber no dia do evento.',
      volume: 1.25,
    },
    RETA_FINAL,
    SEMANA_DO_EVENTO,
  ]
}

const CHECK_CORRIDA = [
  'Testar o tenis da prova num treino longo, nunca estreiar no dia',
  'Definir e treinar o que vai comer e beber durante',
  'Conferir horario de largada, retirada de kit e trajeto',
  'Separar a roupa na noite anterior',
]

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    id: 'maratona',
    label: 'Maratona',
    hint: '42 km. Precisa de tempo: quatro meses e o minimo confortavel.',
    sport: 'corrida',
    semanasIdeais: 18,
    diasPorSemana: 4,
    focus: ['treino', 'nutricao'],
    fases: fasesDeResistencia(),
    diarios: [
      'Beba agua ao longo do dia, nao so no treino',
      'Sono e a parte da preparacao que mais gente ignora',
    ],
    checklist: CHECK_CORRIDA,
  },
  {
    id: 'meia_maratona',
    label: 'Meia maratona',
    hint: '21 km. Tres meses dao uma preparacao tranquila.',
    sport: 'corrida',
    semanasIdeais: 12,
    diasPorSemana: 4,
    focus: ['treino', 'nutricao'],
    fases: fasesDeResistencia(),
    diarios: ['Beba agua ao longo do dia', 'O longo da semana e o treino que mais importa'],
    checklist: CHECK_CORRIDA,
  },
  {
    id: 'corrida_10k',
    label: 'Corrida de 10 km',
    hint: 'Dois meses bastam para chegar bem.',
    sport: 'corrida',
    semanasIdeais: 8,
    diasPorSemana: 3,
    focus: ['treino'],
    fases: fasesDeResistencia(),
    diarios: ['Uma sessao forte por semana ja e suficiente'],
    checklist: CHECK_CORRIDA,
  },
  {
    id: 'trilha',
    label: 'Trilha ou travessia',
    hint: 'Muitas horas em pe, com mochila e desnivel.',
    sport: 'caminhada',
    semanasIdeais: 10,
    diasPorSemana: 3,
    focus: ['treino', 'nutricao'],
    fases: fasesDeResistencia(),
    diarios: ['Treine com a mochila que voce vai levar', 'Cuide dos pes: eles decidem a travessia'],
    checklist: [
      'Fazer pelo menos uma saida longa com o peso real da mochila',
      'Testar a bota em terreno parecido, nunca nova no dia',
      'Planejar agua e comida por hora de caminhada',
      'Conferir previsao e avisar alguem do trajeto',
    ],
  },
  {
    id: 'ciclismo_longo',
    label: 'Prova longa de bike',
    hint: 'Granfondo, cicloturismo ou desafio de estrada.',
    sport: 'ciclismo',
    semanasIdeais: 12,
    diasPorSemana: 4,
    focus: ['treino', 'nutricao'],
    fases: fasesDeResistencia(),
    diarios: ['Coma durante o pedal longo, antes de sentir fome'],
    checklist: [
      'Revisar a bike com antecedencia, nao na vespera',
      'Testar a alimentacao de estrada num pedal longo',
      'Levar camara e ferramenta, e saber usar',
    ],
  },
  {
    id: 'forca',
    label: 'Prova de forca',
    hint: 'Bater uma marca no agachamento, supino ou terra.',
    sport: 'musculacao',
    semanasIdeais: 12,
    diasPorSemana: 4,
    focus: ['treino'],
    fases: [
      {
        ate: 0.4,
        nome: 'Acumulo',
        treino: 'Mais volume com carga moderada. Tecnica acima de peso.',
        nutricao: 'Coma o suficiente para treinar bem. Deficit atrapalha forca.',
        volume: 1.1,
      },
      {
        ate: 0.75,
        nome: 'Intensificacao',
        treino: 'Menos repeticoes, mais carga, descansos mais longos.',
        nutricao: 'Proteina distribuida no dia e refeicao solida antes do treino.',
        volume: 1,
      },
      {
        ate: 0.92,
        nome: 'Pico',
        treino: 'Aproximacoes da marca alvo, com margem. Nunca falhe repeticao.',
        nutricao: 'Regularidade e sono. Nada de mudar a dieta agora.',
        volume: 0.8,
      },
      RETA_FINAL,
      SEMANA_DO_EVENTO,
    ],
    diarios: ['Aquecimento completo antes das cargas altas'],
    checklist: [
      'Definir as tentativas com antecedencia, comecando conservador',
      'Testar cinto, sapatilha e faixas nos treinos pesados',
      'Ensaiar o aquecimento que voce vai fazer no dia',
    ],
  },
  {
    id: 'esporte',
    label: 'Competicao esportiva',
    hint: 'Campeonato, torneio ou graduacao.',
    sport: 'esporte',
    semanasIdeais: 10,
    diasPorSemana: 4,
    focus: ['treino', 'motor'],
    fases: fasesDeResistencia(),
    diarios: ['Mobilidade e prevencao contam tanto quanto o treino tecnico'],
    checklist: ['Revisar equipamento', 'Confirmar horarios e local', 'Dormir bem nas duas noites anteriores'],
  },
  {
    id: 'data_marcada',
    label: 'Data marcada',
    hint: 'Casamento, viagem, ensaio. Chegar bem numa data.',
    sport: null,
    semanasIdeais: 12,
    diasPorSemana: 4,
    focus: ['treino', 'nutricao'],
    fases: [
      {
        ate: 0.5,
        nome: 'Constancia',
        treino: 'O que importa aqui e nao faltar. Frequencia acima de intensidade.',
        nutricao: 'Refeicoes previsiveis e simples. Menos decisao, mais aderencia.',
        volume: 1,
      },
      {
        ate: 0.85,
        nome: 'Ajuste',
        treino: 'Mantenha a frequencia e suba um pouco a exigencia.',
        nutricao: 'Cuide do que se repete todo dia, nao do que acontece uma vez.',
        volume: 1.1,
      },
      RETA_FINAL,
      SEMANA_DO_EVENTO,
    ],
    diarios: ['Constancia vence intensidade quando ha prazo'],
    checklist: ['Marcar as provas de roupa com folga', 'Nao testar nada novo na ultima semana'],
  },
  {
    id: 'personalizada',
    label: 'Personalizada',
    hint: 'Voce define o esporte, os dias e o que deve apertar.',
    sport: null,
    semanasIdeais: 8,
    diasPorSemana: 3,
    focus: ['treino'],
    fases: fasesDeResistencia(),
    diarios: [],
    checklist: [],
  },
]

export const TEMPLATE_BY_ID: Record<string, EventTemplate> = Object.fromEntries(
  EVENT_TEMPLATES.map((t) => [t.id, t]),
)

/* ---------------- ligacao com o dia a dia ---------------- */

/**
 * Em que fase a preparacao esta, medida pela fracao de tempo decorrida.
 * Usa fracao e nao semanas fixas porque quem marca uma maratona para daqui
 * a seis semanas tambem merece um plano coerente, so que comprimido.
 */
export function faseAtual(templateId: string | null | undefined, progresso: number): EventPhase | null {
  const t = templateId ? TEMPLATE_BY_ID[templateId] : null
  if (!t) return null
  const p = Math.min(1, Math.max(0, progresso))
  return t.fases.find((f) => p <= f.ate) ?? t.fases.at(-1) ?? null
}

/** Volume relativo do treino no momento atual da preparacao. */
export function volumeDaFase(templateId: string | null | undefined, progresso: number): number {
  return faseAtual(templateId, progresso)?.volume ?? 1
}

export function templateDe(id: string | null | undefined): EventTemplate | null {
  return id ? (TEMPLATE_BY_ID[id] ?? null) : null
}

/** Semanas recomendadas, para avisar quando a data escolhida e curta demais. */
export function prazoCurto(templateId: string | null | undefined, semanas: number): boolean {
  const t = templateDe(templateId)
  return !!t && semanas < t.semanasIdeais * 0.55
}
