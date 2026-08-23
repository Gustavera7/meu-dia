import type { Experience, Modality, PlannedSet, Workout } from '@/core/types'
import { makeId } from '@/core/id'

/**
 * Treinos de resistencia: corrida, ciclismo, natacao e caminhada.
 *
 * A logica aqui e diferente da musculacao. O que organiza a semana nao e
 * grupo muscular, e INTENSIDADE: a maior parte precisa ser leve o bastante
 * para conversar durante, e so uma ou duas sessoes por semana sao fortes.
 * Inverter isso e o erro mais comum de quem comeca a correr, e a razao de
 * o app nunca gerar duas sessoes puxadas seguidas.
 */

export type SessionKind = 'leve' | 'longo' | 'intervalado' | 'ritmo' | 'recuperacao'

export const SESSION_LABEL: Record<SessionKind, string> = {
  leve: 'Leve',
  longo: 'Longo',
  intervalado: 'Intervalado',
  ritmo: 'Ritmo',
  recuperacao: 'Regenerativo',
}

const ESFORCO: Record<SessionKind, string> = {
  leve: 'Da para conversar frases inteiras',
  longo: 'Confortavel do inicio ao fim, sem acelerar',
  intervalado: 'Forte nos tiros, respiracao curta',
  ritmo: 'Firme, so palavras soltas',
  recuperacao: 'Bem leve, quase passeio',
}

/** Minutos de base por nivel, para a sessao leve. */
const BASE: Record<Experience, number> = {
  iniciante: 25,
  intermediario: 40,
  avancado: 55,
}

function bloco(
  nome: string,
  sets: number,
  reps: string,
  rest: number,
  kind: PlannedSet['kind'],
  effort?: string,
  note?: string,
): PlannedSet {
  return { exerciseId: `end-${nome}-${reps}`, name: nome, sets, reps, restSeconds: rest, kind, effort, note }
}

function aquecimento(minutos: number, modality: Modality): PlannedSet {
  const nome = modality === 'natacao' ? 'Solto na piscina' : 'Aquecimento leve'
  return bloco(nome, 1, `${minutos} min`, 0, 'aquecimento', 'Bem tranquilo', 'Comece devagar de proposito')
}

function voltaCalma(minutos: number): PlannedSet {
  return bloco('Volta a calma', 1, `${minutos} min`, 0, 'volta_calma', 'Leve', 'Deixe o corpo baixar sozinho')
}

/**
 * Monta uma sessao de resistencia.
 * `volumeFactor` vem da preparacao para evento: 1 e a semana normal, e o
 * numero cresce ao longo do ciclo e cai forte na semana da prova.
 */
export function enduranceSession(
  kind: SessionKind,
  modality: Modality,
  level: Experience,
  volumeFactor = 1,
): Workout {
  const base = Math.round(BASE[level] * volumeFactor)
  const blocks: PlannedSet[] = []
  let minutos = base
  let nome = SESSION_LABEL[kind]

  switch (kind) {
    case 'leve':
      blocks.push(bloco(`${SESSION_LABEL[kind]} continuo`, 1, `${base} min`, 0, 'continuo', ESFORCO.leve))
      break

    case 'recuperacao':
      minutos = Math.max(15, Math.round(base * 0.6))
      blocks.push(bloco('Regenerativo', 1, `${minutos} min`, 0, 'continuo', ESFORCO.recuperacao,
        'Se estiver em duvida entre leve e forte, escolha leve'))
      break

    case 'longo':
      minutos = Math.round(base * 1.7)
      nome = 'Longo'
      blocks.push(aquecimento(8, modality))
      blocks.push(bloco('Longo continuo', 1, `${minutos} min`, 0, 'continuo', ESFORCO.longo,
        'O objetivo e terminar inteiro, nao rapido'))
      blocks.push(voltaCalma(5))
      minutos += 13
      break

    case 'ritmo': {
      const forte = Math.max(10, Math.round(base * 0.5))
      blocks.push(aquecimento(10, modality))
      blocks.push(bloco('Bloco em ritmo', 1, `${forte} min`, 0, 'continuo', ESFORCO.ritmo,
        'Ritmo que voce sustentaria por uma hora'))
      blocks.push(voltaCalma(8))
      minutos = 10 + forte + 8
      break
    }

    case 'intervalado': {
      const tiros = level === 'iniciante' ? 5 : level === 'intermediario' ? 7 : 9
      const duracao = modality === 'natacao' ? '50 m' : level === 'iniciante' ? '1 min' : '2 min'
      blocks.push(aquecimento(12, modality))
      blocks.push(bloco('Tiros', tiros, duracao, 90, 'intervalo', ESFORCO.intervalado,
        'Mesma intensidade do primeiro ao ultimo. Se cair muito, pare um antes'))
      blocks.push(voltaCalma(8))
      minutos = 12 + tiros * 3 + 8
      break
    }
  }

  return {
    id: makeId('wk'),
    name: nome,
    focus: ESFORCO[kind],
    estimatedMinutes: minutos,
    blocks,
    modality,
  }
}

/**
 * Distribuicao da semana por frequencia.
 * A regra que se repete: no maximo duas sessoes fortes na semana, nunca
 * coladas, e o longo sempre depois de um dia leve ou de folga.
 */
export function enduranceWeek(dias: number): SessionKind[] {
  switch (Math.min(6, Math.max(1, dias))) {
    case 1:
      return ['leve']
    case 2:
      return ['leve', 'longo']
    case 3:
      return ['leve', 'intervalado', 'longo']
    case 4:
      return ['leve', 'intervalado', 'leve', 'longo']
    case 5:
      return ['leve', 'intervalado', 'recuperacao', 'ritmo', 'longo']
    default:
      return ['leve', 'intervalado', 'recuperacao', 'ritmo', 'leve', 'longo']
  }
}
