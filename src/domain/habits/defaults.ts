import type { Habit, PillarId } from '@/core/types'
import { makeId, stamp } from '@/core/id'

export interface HabitSeed {
  key: string
  name: string
  icon: string
  pillar: PillarId
  target?: number
  unit?: string
}

/** Sugestoes oferecidas no onboarding. O usuario tambem cria os proprios. */
export const HABIT_SEEDS: HabitSeed[] = [
  { key: 'agua', name: 'Beber agua', icon: 'A', pillar: 'corpo', target: 8, unit: 'copos' },
  { key: 'comer_bem', name: 'Comer bem', icon: 'N', pillar: 'corpo' },
  { key: 'treinar', name: 'Treinar', icon: 'T', pillar: 'corpo' },
  { key: 'dormir_horario', name: 'Dormir no horario', icon: 'S', pillar: 'bem_estar' },
  { key: 'leitura', name: 'Ler', icon: 'L', pillar: 'mente', target: 15, unit: 'min' },
  { key: 'mobilidade', name: 'Mobilidade', icon: 'M', pillar: 'movimento' },
  { key: 'celular', name: 'Menos celular', icon: 'C', pillar: 'mente' },
  { key: 'meditacao', name: 'Meditar', icon: 'R', pillar: 'bem_estar', target: 10, unit: 'min' },
  { key: 'sol', name: 'Pegar sol', icon: 'V', pillar: 'bem_estar' },
  { key: 'caminhada', name: 'Caminhar', icon: 'P', pillar: 'movimento' },
  { key: 'gratidao', name: 'Anotar 1 gratidao', icon: 'G', pillar: 'mente' },
  { key: 'pessoas', name: 'Tempo de qualidade', icon: 'Q', pillar: 'bem_estar' },
]

export function habitFromSeed(seed: HabitSeed): Habit {
  return {
    id: makeId('hab'),
    name: seed.name,
    icon: seed.icon,
    cadence: 'diario',
    target: seed.target,
    unit: seed.unit,
    pillar: seed.pillar,
    active: true,
    createdAt: stamp(),
    updatedAt: stamp(),
    deletedAt: null,
  }
}

export function createHabit(input: {
  name: string
  icon?: string
  pillar?: PillarId
  cadence?: Habit['cadence']
  target?: number
  unit?: string
}): Habit {
  return {
    id: makeId('hab'),
    name: input.name.trim(),
    icon: (input.icon || input.name.trim().charAt(0) || 'H').toUpperCase().slice(0, 1),
    cadence: input.cadence ?? 'diario',
    target: input.target,
    unit: input.unit,
    pillar: input.pillar ?? 'bem_estar',
    active: true,
    createdAt: stamp(),
    updatedAt: stamp(),
    deletedAt: null,
  }
}
