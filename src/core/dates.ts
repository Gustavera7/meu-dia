import type { ISODate } from './types'

/** Data local em ISO curto, sem fuso (evita o bug classico do toISOString). */
export function toISO(d: Date): ISODate {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromISO(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function today(): ISODate {
  return toISO(new Date())
}

export function addDays(iso: ISODate, days: number): ISODate {
  const d = fromISO(iso)
  d.setDate(d.getDate() + days)
  return toISO(d)
}

export function tomorrow(from: ISODate = today()): ISODate {
  return addDays(from, 1)
}

/** 0 = domingo ... 6 = sabado */
export function weekdayIndex(iso: ISODate): number {
  return fromISO(iso).getDay()
}

const WEEKDAYS = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado']
const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
const MONTHS = [
  'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

export function weekdayName(iso: ISODate): string {
  return WEEKDAYS[weekdayIndex(iso)]
}

export function weekdayShort(iso: ISODate): string {
  return WEEKDAYS_SHORT[weekdayIndex(iso)]
}

/** "Sabado, 23 de agosto" */
export function longDate(iso: ISODate): string {
  const d = fromISO(iso)
  return `${weekdayName(iso)}, ${d.getDate()} de ${MONTHS[d.getMonth()]}`
}

/** "23/08" */
export function shortDate(iso: ISODate): string {
  const d = fromISO(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Os ultimos n dias terminando em `end`, do mais antigo para o mais novo. */
export function lastNDays(n: number, end: ISODate = today()): ISODate[] {
  return Array.from({ length: n }, (_, i) => addDays(end, -(n - 1 - i)))
}

export function daysBetween(a: ISODate, b: ISODate): number {
  return Math.round((fromISO(b).getTime() - fromISO(a).getTime()) / 86_400_000)
}

/** "06:30" -> 390 minutos */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + (m || 0)
}

export function minutesToTime(total: number): string {
  const wrapped = ((total % 1440) + 1440) % 1440
  const h = Math.floor(wrapped / 60)
  const m = wrapped % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Saudacao usada no topo do dashboard. */
export function greeting(now: Date = new Date()): string {
  const h = now.getHours()
  if (h < 5) return 'Boa madrugada'
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}
