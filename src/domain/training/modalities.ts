import type { Modality } from '@/core/types'

/**
 * Modalidades de treino.
 *
 * `resistencia` decide o formato do treino gerado: modalidade de
 * resistencia rende blocos de tempo e distancia, o resto rende serie
 * e repeticao.
 */
export interface ModalityInfo {
  id: Modality
  label: string
  hint: string
  resistencia: boolean
  /** unidade natural para descrever o volume da sessao */
  unidade: 'min' | 'km'
}

export const MODALITIES: ModalityInfo[] = [
  { id: 'musculacao', label: 'Musculacao', hint: 'Serie e repeticao, com carga', resistencia: false, unidade: 'min' },
  { id: 'corrida', label: 'Corrida', hint: 'Rua, esteira ou trilha', resistencia: true, unidade: 'km' },
  { id: 'ciclismo', label: 'Ciclismo', hint: 'Rua, mountain bike ou rolo', resistencia: true, unidade: 'km' },
  { id: 'natacao', label: 'Natacao', hint: 'Series de piscina', resistencia: true, unidade: 'min' },
  { id: 'caminhada', label: 'Caminhada', hint: 'Ritmo leve, base aerobica', resistencia: true, unidade: 'min' },
  { id: 'funcional', label: 'Funcional', hint: 'Movimentos integrados e circuito', resistencia: false, unidade: 'min' },
  { id: 'calistenia', label: 'Calistenia', hint: 'Peso do corpo', resistencia: false, unidade: 'min' },
  { id: 'yoga', label: 'Yoga e mobilidade', hint: 'Amplitude, respiracao e calma', resistencia: false, unidade: 'min' },
  { id: 'esporte', label: 'Esporte', hint: 'Futebol, tenis, luta, escalada', resistencia: false, unidade: 'min' },
]

export const MODALITY_BY_ID: Record<Modality, ModalityInfo> = Object.fromEntries(
  MODALITIES.map((m) => [m.id, m]),
) as Record<Modality, ModalityInfo>

export function isEndurance(m: Modality): boolean {
  return MODALITY_BY_ID[m]?.resistencia ?? false
}

export function modalityLabel(m: Modality | undefined): string {
  return m ? (MODALITY_BY_ID[m]?.label ?? m) : 'Treino'
}
