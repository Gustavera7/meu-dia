import type { AppState, ISODate } from '@/core/types'
import { lastNDays } from '@/core/dates'
import {
  countdownLabel, goalPhase, goalProgress, primaryGoal, weeklyTrainingFor, weeksUntil,
} from '@/domain/goals/goals'
import { faseAtual, prazoCurto, templateDe } from '@/domain/goals/events'
import type { Report } from './report'

/**
 * Sugestoes: o que fazer a seguir.
 *
 * O relatorio conta o que aconteceu; isto diz o proximo passo. Cada
 * sugestao carrega o numero que a originou, porque conselho sem evidencia
 * vira palpite, e leva a uma tela onde da para agir.
 *
 * Regra de tom: quando algo nao esta saindo, a saida oferecida e SEMPRE
 * diminuir a meta, nunca aumentar a cobranca. Um plano que nao cabe na
 * vida nao e um problema de disciplina.
 */

export interface Suggestion {
  id: string
  title: string
  why: string
  to: string
  acao: string
  /** menor numero aparece primeiro */
  peso: number
}

function treinosNaSemana(state: AppState, end: ISODate): number {
  return lastNDays(7, end).filter((d) => state.logs[d]?.training?.done).length
}

function checkInsNaSemana(state: AppState, end: ISODate): number {
  return lastNDays(7, end).filter((d) => state.logs[d]?.checkIn).length
}

export function buildSuggestions(state: AppState, rel: Report, hoje: ISODate): Suggestion[] {
  const out: Suggestion[] = []
  const meta = primaryGoal(state.goals ?? [], hoje)

  /* ---- o que a meta pede contra o que esta acontecendo ---- */
  if (meta) {
    const alvo = weeklyTrainingFor(meta, state.profile.training.daysPerWeek)
    const feitos = treinosNaSemana(state, hoje)
    const modelo = templateDe(meta.eventTemplate)
    const fase = faseAtual(meta.eventTemplate, goalProgress(meta, hoje))

    if (feitos < alvo - 1) {
      out.push({
        id: 'meta-frequencia',
        title: `Faltam treinos para o ritmo de ${meta.name}`,
        why: `A preparacao pede ${alvo} por semana e sairam ${feitos} nos ultimos 7 dias. Se ${alvo} nao cabe na sua semana, baixe o alvo em vez de acumular falta.`,
        to: '/metas',
        acao: 'Ajustar a meta',
        peso: 1,
      })
    }

    if (modelo && prazoCurto(meta.eventTemplate, weeksUntil(meta, hoje) + 1)) {
      out.push({
        id: 'meta-prazo',
        title: `Prazo apertado para ${modelo.label.toLowerCase()}`,
        why: `Uma preparacao tranquila pede cerca de ${modelo.semanasIdeais} semanas e ${countdownLabel(meta, hoje)}. Da para seguir, mas com menos margem para imprevisto.`,
        to: '/metas',
        acao: 'Rever a data',
        peso: 2,
      })
    }

    if (fase && goalPhase(meta, hoje) === 'poupanca') {
      out.push({
        id: 'meta-taper',
        title: 'Hora de poupar, nao de compensar',
        why: 'Treino extra nos ultimos dias nao acrescenta condicionamento e ainda chega cansado. O ganho agora vem do sono.',
        to: '/treino',
        acao: 'Ver o treino de hoje',
        peso: 1,
      })
    }

    if (modelo && modelo.checklist.length > 0 && weeksUntil(meta, hoje) <= 3) {
      out.push({
        id: 'meta-checklist',
        title: 'Repasse a lista antes do dia',
        why: `Faltam poucas semanas e ha ${modelo.checklist.length} itens que costumam ser esquecidos, como testar equipamento e alimentacao.`,
        to: '/metas',
        acao: 'Abrir a lista',
        peso: 2,
      })
    }
  }

  /* ---- o que o historico mostra ---- */
  const checkIns = checkInsNaSemana(state, hoje)
  if (state.profile.modules.checkin && checkIns <= 2) {
    out.push({
      id: 'checkin-baixo',
      title: 'O check-in e o que faz o app te conhecer',
      why: `Sairam ${checkIns} nos ultimos 7 dias. Sem ele, o plano de amanha nao tem como reagir ao seu sono e a sua energia. Sao seis toques.`,
      to: '/checkin',
      acao: 'Fazer agora',
      peso: 1,
    })
  }

  const fraca = rel.scores.filter((s) => s.total >= 4 && s.ratio < 0.5).sort((a, b) => a.ratio - b.ratio)[0]
  if (fraca) {
    out.push({
      id: `area-${fraca.area}`,
      title: `${fraca.label} esta grande demais para a sua rotina`,
      why: `Saiu ${fraca.done} de ${fraca.total} vezes. Meta que se cumpre metade das vezes costuma estar mal dimensionada, nao mal executada. Corte pela metade e volte a crescer depois.`,
      to: fraca.area === 'leitura' ? '/leitura' : fraca.area === 'habitos' ? '/habitos' : '/perfil',
      acao: 'Reduzir a meta',
      peso: 1,
    })
  }

  const diaFraco = rel.improvements.find((i) => i.id === 'dia-fraco')
  if (diaFraco) {
    out.push({
      id: 'dia-fraco',
      title: diaFraco.title,
      why: 'Dia que falha sempre nao e falta de vontade, e conflito de agenda. Trocar por uma sessao curta costuma resolver melhor que insistir.',
      to: '/treino',
      acao: 'Ver a semana',
      peso: 2,
    })
  }

  const habitoFraco = rel.improvements.find((i) => i.id === 'habito-fraco')
  if (habitoFraco) {
    out.push({
      id: 'habito-fraco',
      title: habitoFraco.title,
      why: 'Diminua ate ficar quase ridiculo de facil. Um habito minusculo que acontece vale mais que um bom que nao sai.',
      to: '/habitos',
      acao: 'Editar habito',
      peso: 2,
    })
  }

  const sono = rel.trends.find((t) => t.label === 'Sono' && t.direction === 'pior')
  if (sono) {
    out.push({
      id: 'sono-caindo',
      title: 'Seu sono vem piorando',
      why: `Media foi de ${sono.before} para ${sono.after}. Antecipar o inicio da rotina da noite costuma render mais que qualquer ajuste de treino.`,
      to: '/rotina/noite',
      acao: 'Ajustar a noite',
      peso: 1,
    })
  }

  const estresse = rel.trends.find((t) => t.label === 'Estresse' && t.direction === 'pior')
  if (estresse && !sono) {
    out.push({
      id: 'estresse-subindo',
      title: 'Estresse em alta no periodo',
      why: `Media subiu de ${estresse.before} para ${estresse.after}. Vale aliviar em algum lugar de proposito, antes que alivie sozinho no lugar errado.`,
      to: '/perfil',
      acao: 'Rever a carga',
      peso: 1,
    })
  }

  if (!meta && rel.daysWithData >= 14) {
    out.push({
      id: 'sem-meta',
      title: 'Voce nao tem nenhuma meta com data',
      why: 'Prazo muda o comportamento de um jeito que objetivo permanente nao muda. Uma corrida, uma trilha, uma viagem: qualquer coisa com dia marcado.',
      to: '/metas',
      acao: 'Criar meta',
      peso: 3,
    })
  }

  if (out.length === 0) {
    out.push({
      id: 'tudo-certo',
      title: 'Nada pedindo mudanca agora',
      why: rel.enough
        ? 'As areas estao dentro do esperado e as tendencias estao estaveis. Manter e o trabalho.'
        : 'Ainda faltam dias registrados para o app enxergar padroes. Siga alguns dias e volte aqui.',
      to: '/',
      acao: 'Voltar para hoje',
      peso: 9,
    })
  }

  return out.sort((a, b) => a.peso - b.peso).slice(0, 5)
}
