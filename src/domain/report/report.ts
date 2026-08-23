import type { AppState, ISODate, PillarId } from '@/core/types'
import { lastNDays, weekdayName } from '@/core/dates'
import { pillarConsistency, streak } from '@/domain/planning/progress'

/**
 * Relatorio de acompanhamento.
 *
 * Le o historico e devolve leitura em linguagem comum: o que esta indo
 * bem e o que pede atencao. Nada aqui e diagnostico nem avaliacao clinica:
 * sao contagens do que voce mesmo registrou.
 */

export type ReportArea =
  | 'treino' | 'nutricao' | 'motor' | 'habitos'
  | 'leitura' | 'rotina' | 'sono' | 'energia' | 'humor' | 'estresse' | 'constancia'

export interface Insight {
  id: string
  area: ReportArea
  title: string
  detail: string
  metric: string
}

export interface AreaScore {
  area: ReportArea
  label: string
  ratio: number
  done: number
  total: number
}

export interface Trend {
  label: string
  before: number
  after: number
  /** subiu, caiu ou ficou igual, ja considerando se subir e bom */
  direction: 'melhor' | 'pior' | 'estavel'
}

export interface Report {
  from: ISODate
  to: ISODate
  days: number
  daysWithData: number
  enough: boolean
  headline: string
  strengths: Insight[]
  improvements: Insight[]
  scores: AreaScore[]
  trends: Trend[]
  pillars: Record<PillarId, number>
  streakDays: number
}

const AREA_LABEL: Record<ReportArea, string> = {
  treino: 'Treino', nutricao: 'Alimentacao', motor: 'Motor', habitos: 'Habitos',
  leitura: 'Leitura', rotina: 'Rotinas', sono: 'Sono', energia: 'Energia',
  humor: 'Humor', estresse: 'Estresse', constancia: 'Constancia',
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`
}

function media(valores: number[]): number {
  return valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : 0
}

/** Aderencia por area: quantas vezes o que foi planejado aconteceu. */
function marcarAreas(state: AppState, janela: ISODate[]): AreaScore[] {
  const conta: Record<string, { done: number; total: number }> = {}
  const somar = (area: ReportArea, feito: boolean) => {
    conta[area] ??= { done: 0, total: 0 }
    conta[area].total++
    if (feito) conta[area].done++
  }

  for (const data of janela) {
    const log = state.logs[data]
    const plan = state.plans[data]
    if (!plan) continue

    if (plan.workoutId) somar('treino', !!log?.done.treino)
    for (const id of plan.mealIds) somar('nutricao', !!log?.done[`refeicao:${id}`])
    if (plan.motorSession) somar('motor', !!log?.done.motor)
    for (const id of plan.habitIds) somar('habitos', !!log?.done[`habito:${id}`])
    if (plan.readingMinutes > 0) somar('leitura', !!log?.done.leitura)

    const passos = [...state.routines.manha.steps, ...state.routines.noite.steps]
    for (const passo of state.routines.manha.steps) {
      somar('rotina', !!log?.done[`manha:${passo.id}`])
    }
    for (const passo of state.routines.noite.steps) {
      somar('rotina', !!log?.done[`noite:${passo.id}`])
    }
    void passos
  }

  return (Object.keys(conta) as ReportArea[])
    .map((area) => ({
      area,
      label: AREA_LABEL[area],
      done: conta[area].done,
      total: conta[area].total,
      ratio: conta[area].total ? conta[area].done / conta[area].total : 0,
    }))
    .sort((a, b) => b.ratio - a.ratio)
}

/** Compara a primeira metade do periodo com a segunda. */
function calcularTendencias(state: AppState, janela: ISODate[]): Trend[] {
  const meio = Math.floor(janela.length / 2)
  const antes = janela.slice(0, meio)
  const depois = janela.slice(meio)

  const checkIns = (datas: ISODate[]) =>
    datas.map((d) => state.logs[d]?.checkIn).filter(Boolean)

  const campos: { campo: 'sleep' | 'energy' | 'mood' | 'stress'; label: string; subirEBom: boolean }[] = [
    { campo: 'sleep', label: 'Sono', subirEBom: true },
    { campo: 'energy', label: 'Energia', subirEBom: true },
    { campo: 'mood', label: 'Humor', subirEBom: true },
    { campo: 'stress', label: 'Estresse', subirEBom: false },
  ]

  const out: Trend[] = []
  for (const { campo, label, subirEBom } of campos) {
    const a = checkIns(antes).map((c) => c![campo])
    const b = checkIns(depois).map((c) => c![campo])
    if (a.length < 2 || b.length < 2) continue
    const mediaA = media(a)
    const mediaB = media(b)
    const delta = mediaB - mediaA
    const relevante = Math.abs(delta) >= 0.4
    out.push({
      label,
      before: Number(mediaA.toFixed(1)),
      after: Number(mediaB.toFixed(1)),
      direction: !relevante ? 'estavel' : (delta > 0) === subirEBom ? 'melhor' : 'pior',
    })
  }
  return out
}

/** O habito mais e o menos cumpridos, quando ha diferenca real entre eles. */
function extremosDeHabito(state: AppState, janela: ISODate[]) {
  const vivos = state.habits.filter((h) => h.active && !h.deletedAt)
  const marcados = vivos
    .map((h) => {
      const dias = janela.filter((d) => state.plans[d]?.habitIds.includes(h.id))
      const feitos = dias.filter((d) => state.logs[d]?.done[`habito:${h.id}`]).length
      return { habit: h, ratio: dias.length ? feitos / dias.length : 0, dias: dias.length }
    })
    .filter((x) => x.dias >= 3)
    .sort((a, b) => b.ratio - a.ratio)
  return { melhor: marcados[0] ?? null, pior: marcados.at(-1) ?? null }
}

/** Em que dia da semana o treino costuma cair. */
function diaFraco(state: AppState, janela: ISODate[]): string | null {
  const porDia = new Map<string, { done: number; total: number }>()
  for (const data of janela) {
    if (!state.plans[data]?.workoutId) continue
    const nome = weekdayName(data)
    const atual = porDia.get(nome) ?? { done: 0, total: 0 }
    atual.total++
    if (state.logs[data]?.done.treino) atual.done++
    porDia.set(nome, atual)
  }
  const candidatos = [...porDia.entries()]
    .filter(([, v]) => v.total >= 2)
    .map(([nome, v]) => ({ nome, ratio: v.done / v.total }))
    .sort((a, b) => a.ratio - b.ratio)
  const pior = candidatos[0]
  return pior && pior.ratio < 0.5 ? pior.nome : null
}

export function buildReport(state: AppState, days = 30, end?: ISODate): Report {
  const janela = lastNDays(days, end)
  const comDados = janela.filter((d) => state.logs[d] || state.plans[d]).length
  const scores = marcarAreas(state, janela)
  const trends = calcularTendencias(state, janela)
  const { melhor, pior } = extremosDeHabito(state, janela)
  const fraco = diaFraco(state, janela)
  const pillars = pillarConsistency(state, days, end)

  const strengths: Insight[] = []
  const improvements: Insight[] = []

  for (const s of scores) {
    if (s.total < 3) continue
    if (s.ratio >= 0.8) {
      strengths.push({
        id: `area-${s.area}`,
        area: s.area,
        title: `${s.label} em dia`,
        detail: `Voce cumpriu ${s.done} de ${s.total} vezes no periodo.`,
        metric: pct(s.ratio),
      })
    } else if (s.ratio < 0.5) {
      improvements.push({
        id: `area-${s.area}`,
        area: s.area,
        title: `${s.label} ficando para tras`,
        detail: `Saiu ${s.done} de ${s.total} vezes. Vale reduzir a meta em vez de abandonar.`,
        metric: pct(s.ratio),
      })
    }
  }

  for (const t of trends) {
    if (t.direction === 'melhor') {
      strengths.push({
        id: `tend-${t.label}`,
        area: t.label.toLowerCase() as ReportArea,
        title: `${t.label} melhorando`,
        detail: `Media passou de ${t.before} para ${t.after} na segunda metade do periodo.`,
        metric: `${t.after}/5`,
      })
    } else if (t.direction === 'pior') {
      improvements.push({
        id: `tend-${t.label}`,
        area: t.label.toLowerCase() as ReportArea,
        title: `${t.label} piorando`,
        detail: `Media foi de ${t.before} para ${t.after}. Pode ser hora de aliviar em algum lugar.`,
        metric: `${t.after}/5`,
      })
    }
  }

  if (melhor && melhor.ratio >= 0.8) {
    strengths.push({
      id: 'habito-forte',
      area: 'habitos',
      title: `"${melhor.habit.name}" virou automatico`,
      detail: `Cumprido em ${Math.round(melhor.ratio * 100)}% dos dias em que apareceu.`,
      metric: pct(melhor.ratio),
    })
  }
  if (pior && pior.ratio < 0.4 && pior.habit.id !== melhor?.habit.id) {
    improvements.push({
      id: 'habito-fraco',
      area: 'habitos',
      title: `"${pior.habit.name}" nao esta pegando`,
      detail: 'Habito que quase nunca sai costuma estar grande demais. Diminua o tamanho dele.',
      metric: pct(pior.ratio),
    })
  }
  if (fraco) {
    improvements.push({
      id: 'dia-fraco',
      area: 'treino',
      title: `${fraco} e o dia que mais escapa`,
      detail: 'Mudar o treino desse dia de horario, ou trocar por um mais curto, costuma resolver.',
      metric: fraco,
    })
  }

  const dias = streak(state, end)
  if (dias >= 3) {
    strengths.push({
      id: 'sequencia',
      area: 'constancia',
      title: `${dias} dias seguidos de rotina`,
      detail: 'Sequencia e o melhor sinal de que o plano cabe na sua vida.',
      metric: `${dias}d`,
    })
  }

  const geral = media(scores.map((s) => s.ratio))
  const headline =
    comDados < 5
      ? 'Ainda faltam dias registrados para um retrato confiavel.'
      : geral >= 0.75
        ? 'Periodo consistente. O plano esta sendo cumprido na maior parte dos dias.'
        : geral >= 0.5
          ? 'Periodo irregular: boa parte acontece, mas algumas areas escapam com frequencia.'
          : 'Periodo abaixo do combinado. Talvez o plano esteja maior do que a rotina comporta.'

  return {
    from: janela[0],
    to: janela.at(-1)!,
    days,
    daysWithData: comDados,
    enough: comDados >= 5,
    headline,
    strengths: strengths.slice(0, 6),
    improvements: improvements.slice(0, 6),
    scores,
    trends,
    pillars,
    streakDays: dias,
  }
}
