import type { Pillar, PillarId } from '@/core/types'

/**
 * Pilares sao uma leitura de CONSISTENCIA, nunca um diagnostico.
 * O texto exibido no app fala sobre habito e presenca, nao sobre saude clinica.
 */
export const PILLARS: Pillar[] = [
  {
    id: 'corpo',
    name: 'Corpo',
    description: 'Treino, nutricao e sono',
    accent: 'emerald',
    subItems: ['Treino', 'Nutricao', 'Sono'],
  },
  {
    id: 'movimento',
    name: 'Movimento',
    description: 'Mobilidade, coordenacao e equilibrio',
    accent: 'sky',
    subItems: ['Mobilidade', 'Coordenacao', 'Reflexo', 'Equilibrio'],
  },
  {
    id: 'mente',
    name: 'Mente',
    description: 'Leitura, aprendizado e foco',
    accent: 'violet',
    subItems: ['Leitura', 'Aprendizado', 'Foco'],
  },
  {
    id: 'bem_estar',
    name: 'Bem-estar',
    description: 'Humor, descanso e relacoes',
    accent: 'amber',
    subItems: ['Humor', 'Estresse', 'Descanso', 'Relacionamentos'],
  },
]

export const PILLAR_BY_ID: Record<PillarId, Pillar> = Object.fromEntries(
  PILLARS.map((p) => [p.id, p]),
) as Record<PillarId, Pillar>
