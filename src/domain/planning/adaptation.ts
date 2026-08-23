import type { AppState, ISODate } from '@/core/types'
import { addDays, lastNDays } from '@/core/dates'
import { countdownLabel, goalPhase, goalProgress, primaryGoal, weeklyTrainingFor } from '@/domain/goals/goals'
import { faseAtual } from '@/domain/goals/events'

/**
 * Motor de adaptacao.
 *
 * Le o que aconteceu nos ultimos dias e devolve ajustes para o proximo dia.
 * Sao regras simples e explicaveis de proposito: cada ajuste carrega o motivo
 * que sera mostrado ao usuario. Quando entrar IA, ela substitui este arquivo
 * sem tocar em mais nada.
 */

export type AdjustmentCode =
  | 'treino_leve'
  | 'treino_descanso'
  | 'treino_recuperar'
  | 'motor_restaurativo'
  | 'leitura_reduzida'
  | 'refeicoes_simples'
  | 'dormir_cedo'
  | 'respiracao_extra'
  | 'meta_contagem'
  | 'meta_fase'
  | 'meta_poupanca'
  | 'meta_nutricao'
  | 'manter_ritmo'

export interface Adjustment {
  code: AdjustmentCode
  /** Frase curta mostrada no card "Seu amanha". */
  message: string
  /** Motivo, para o usuario entender de onde veio a mudanca. */
  reason: string
}

function lastCheckIn(state: AppState, before: ISODate) {
  for (let i = 1; i <= 3; i++) {
    const log = state.logs[addDays(before, -i)]
    if (log?.checkIn) return { date: addDays(before, -i), checkIn: log.checkIn }
  }
  return null
}

/** Quantos dos ultimos n dias tiveram leitura registrada. */
function readingDays(state: AppState, end: ISODate, n: number): number {
  return lastNDays(n, end).filter((d) => state.logs[d]?.done?.leitura).length
}

function trainingDays(state: AppState, end: ISODate, n: number): number {
  return lastNDays(n, end).filter((d) => state.logs[d]?.training?.done).length
}

/**
 * Quantos dias a pessoa ja usou o app.
 * Regras que olham para tras so fazem sentido depois de algum historico:
 * no primeiro dia elas soariam como cobranca sem base.
 */
function daysTracked(state: AppState): number {
  return Object.keys(state.logs).length
}

export function computeAdjustments(state: AppState, targetDate: ISODate): Adjustment[] {
  const out: Adjustment[] = []
  // Com plano prescrito, os recados de treino viram conselho, nao alteracao.
  const treinoPrescrito = state.trainingPlan?.source === 'prescrito'
  const previous = addDays(targetDate, -1)
  const recent = lastCheckIn(state, targetDate)
  const checkIn = state.logs[previous]?.checkIn ?? recent?.checkIn ?? null

  if (checkIn) {
    const drained = checkIn.energy <= 2 || checkIn.sleep <= 2

    if (checkIn.energy === 1 && checkIn.sleep <= 2) {
      out.push({
        code: 'treino_descanso',
        message: treinoPrescrito
          ? 'Sono e energia no fundo. Considere adiar o treino prescrito de amanha.'
          : 'Amanha sem treino pesado: so mobilidade e caminhada.',
        reason: 'Energia e sono no fundo do poco no ultimo check-in.',
      })
      out.push({
        code: 'motor_restaurativo',
        message: 'Sessao motora restaurativa, so mobilidade.',
        reason: 'Dia de recuperar, nao de estimular.',
      })
      out.push({
        code: 'dormir_cedo',
        message: 'Antecipe o inicio da rotina da noite em 30 minutos.',
        reason: 'Sono baixo dois indicadores seguidos.',
      })
    } else if (drained) {
      out.push({
        code: 'treino_leve',
        message: treinoPrescrito
          ? 'Energia baixa. Se puder, pegue leve no treino de hoje e avise seu personal.'
          : 'Treino em versao leve: menos series, mesmos exercicios.',
        reason: `Energia ${checkIn.energy}/5 e sono ${checkIn.sleep}/5 no ultimo check-in.`,
      })
    }

    if (checkIn.stress >= 4) {
      out.push({
        code: 'respiracao_extra',
        message: 'Dois minutos a mais de respiracao na rotina da noite.',
        reason: `Estresse em ${checkIn.stress}/5.`,
      })
    }

    if (checkIn.foodQuality === 'ruim') {
      out.push({
        code: 'refeicoes_simples',
        message: 'Refeicoes mais simples e rapidas amanha.',
        reason: 'A alimentacao de ontem saiu do plano. Simplificar ajuda a voltar.',
      })
    }
  }

  /* ---- metas com prazo mandam antes de qualquer outra regra ---- */
  const meta = primaryGoal(state.goals ?? [], targetDate)
  if (meta) {
    const etapa = goalPhase(meta, targetDate)
    if (etapa === 'poupanca') {
      out.push({
        code: 'meta_poupanca',
        message: `${meta.name} esta chegando. Treino leve ate la.`,
        reason: 'Chegar descansado vale mais que um treino a mais nos ultimos dias.',
      })
    } else if (meta.intensity > 0 && meta.focus.includes('treino')) {
      const alvo = weeklyTrainingFor(meta, state.profile.training.daysPerWeek)
      out.push({
        code: 'meta_contagem',
        message: `${meta.name}: ${countdownLabel(meta, targetDate)}. Alvo de ${alvo} treinos na semana.`,
        reason: `Fase de preparacao com foco em ${meta.focus.join(' e ')}.`,
      })
    } else {
      out.push({
        code: 'meta_contagem',
        message: `${meta.name}: ${countdownLabel(meta, targetDate)}.`,
        reason: 'Meta com data marcada em andamento.',
      })
    }

    // Preparacao com receita conhecida fala por fase: o que muda no treino
    // e o que muda na mesa sao coisas diferentes em cada momento do ciclo.
    const fase = faseAtual(meta.eventTemplate, goalProgress(meta, targetDate))
    if (fase && etapa !== 'poupanca') {
      out.push({
        code: 'meta_fase',
        message: `${fase.nome}: ${fase.treino}`,
        reason: `${meta.name} em ${countdownLabel(meta, targetDate)}.`,
      })
    }
    if (fase && meta.focus.includes('nutricao')) {
      out.push({
        code: 'meta_nutricao',
        message: fase.nutricao,
        reason: 'Orientacao geral da fase. Um plano de nutricionista, se houver, vem antes disto.',
      })
    } else if (!fase && meta.focus.includes('nutricao') && meta.intensity === 2) {
      out.push({
        code: 'meta_nutricao',
        message: 'Alimentacao no plano hoje, sem improviso.',
        reason: `${meta.name} pede disciplina alimentar na preparacao.`,
      })
    }
  }

  const history = daysTracked(state)

  if (history >= 3 && readingDays(state, targetDate, 3) === 0 && state.profile.modules.leitura) {
    out.push({
      code: 'leitura_reduzida',
      message: 'Meta de leitura em 10 minutos amanha.',
      reason: 'Tres dias sem leitura. Reduzir o alvo costuma destravar.',
    })
  }

  const planned = state.profile.training.daysPerWeek
  if (history >= 5 && state.profile.modules.treino && trainingDays(state, targetDate, 7) < planned - 1) {
    out.push({
      code: 'treino_recuperar',
      message: 'Semana abaixo do combinado. Amanha e um bom dia para treinar.',
      reason: `${trainingDays(state, targetDate, 7)} de ${planned} treinos nos ultimos 7 dias.`,
    })
  }

  if (out.length === 0) {
    out.push(
      history === 0
        ? {
            code: 'manter_ritmo',
            message: 'Primeiro plano montado a partir do seu perfil.',
            reason: 'A partir do primeiro check-in ele passa a se ajustar a voce.',
          }
        : {
            code: 'manter_ritmo',
            message: 'Plano mantido. O ritmo esta funcionando.',
            reason: 'Nenhum sinal pedindo ajuste nos ultimos dias.',
          },
    )
  }

  return out
}

export function hasCode(adjustments: Adjustment[], code: AdjustmentCode): boolean {
  return adjustments.some((a) => a.code === code)
}
