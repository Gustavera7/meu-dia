import type { Drill, ISODate, MotorCategory, MotorSession, Profile } from '@/core/types'
import { DRILLS } from './drills'
import { makeId, seededRandom } from '@/core/id'

/**
 * Monta a sessao motora do dia.
 *
 * Regras:
 * - sempre comeca por mobilidade (prepara o resto);
 * - o resto vem das categorias que a pessoa escolheu no onboarding;
 * - evita repetir o que ja apareceu nos ultimos dias;
 * - deterministico por data: abrir o app duas vezes mostra a mesma sessao.
 */
export function generateMotorSession(
  profile: Profile,
  date: ISODate,
  recentDrillIds: string[] = [],
): MotorSession {
  const totalMinutes = Math.min(12, Math.max(4, profile.motor.sessionMinutes))
  const slotsCount = Math.max(2, Math.round(totalMinutes / 2))
  const rand = seededRandom(`motor-${date}`)
  const recent = new Set(recentDrillIds)

  const focus: MotorCategory[] =
    profile.motor.focus.length > 0
      ? profile.motor.focus
      : ['mobilidade', 'equilibrio', 'coordenacao', 'reflexo']

  // ordem das categorias na sessao: mobilidade primeiro, depois rodizio do foco
  const order: MotorCategory[] = ['mobilidade']
  const rotation = focus.filter((c) => c !== 'mobilidade')
  let i = 0
  while (order.length < slotsCount) {
    order.push(rotation.length > 0 ? rotation[i % rotation.length] : 'mobilidade')
    i++
  }

  const used = new Set<string>()
  const chosen: Drill[] = []

  for (const category of order) {
    const fresh = DRILLS.filter(
      (d) => d.category === category && !used.has(d.id) && !recent.has(d.id),
    )
    const any = DRILLS.filter((d) => d.category === category && !used.has(d.id))
    const pool = fresh.length > 0 ? fresh : any
    if (pool.length === 0) continue
    const drill = pool[Math.floor(rand() * pool.length)]
    used.add(drill.id)
    chosen.push(drill)
  }

  return {
    id: makeId('motor'),
    date,
    totalMinutes: chosen.reduce((sum, d) => sum + d.minutes, 0),
    drills: chosen.map((d) => ({
      drillId: d.id,
      name: d.name,
      category: d.category,
      minutes: d.minutes,
      howTo: d.howTo,
    })),
  }
}

/** Versao curta para dias de energia baixa: so mobilidade e respiracao. */
export function restorativeSession(date: ISODate): MotorSession {
  const rand = seededRandom(`motor-leve-${date}`)
  const mobility = DRILLS.filter((d) => d.category === 'mobilidade')
  const picks = [...mobility].sort(() => rand() - 0.5).slice(0, 3)
  return {
    id: makeId('motor'),
    date,
    totalMinutes: picks.reduce((s, d) => s + d.minutes, 0),
    drills: picks.map((d) => ({
      drillId: d.id,
      name: d.name,
      category: d.category,
      minutes: d.minutes,
      howTo: d.howTo,
    })),
  }
}
