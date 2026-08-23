/** Ids curtos e estaveis. Suficiente para uso local; troque por uuid ao ir para servidor. */
export function makeId(prefix = 'id'): string {
  const rand = Math.random().toString(36).slice(2, 8)
  const time = Date.now().toString(36).slice(-5)
  return `${prefix}_${time}${rand}`
}

/** Hash leve para o PIN local. Nao e seguranca de servidor, e so uma tranca de tela. */
export function lightHash(value: string): string {
  let h = 2166136261
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(36)
}

/** PRNG deterministico: mesma semente, mesma sequencia (plano do dia estavel). */
export function seededRandom(seed: string): () => number {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

export function pickN<T>(items: T[], n: number, rand: () => number): T[] {
  const pool = [...items]
  const out: T[] = []
  while (out.length < n && pool.length > 0) {
    const i = Math.floor(rand() * pool.length)
    out.push(pool.splice(i, 1)[0])
  }
  return out
}

/** Marca de tempo padrao dos registros sincronizaveis. */
export function stamp(): string {
  return new Date().toISOString()
}
