/**
 * Gera os PNG do icone a partir das mesmas medidas do SVG.
 *
 * Escrito a mao para nao depender de biblioteca de imagem: sao poucas
 * formas geometricas. A amostragem 4x4 por pixel e o que evita as bordas
 * serrilhadas que apareceriam num traco fino de 22px reduzido para 22 pixels.
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

const FUNDO = [11, 15, 20]
const TRACO = [34, 48, 63]
const ACENTO = [74, 222, 128]

/** Distancia de um ponto ao segmento AB. */
function distSegmento(px, py, ax, ay, bx, by) {
  const dx = bx - ax
  const dy = by - ay
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

function dentroDoPoligono(px, py, pontos) {
  let dentro = false
  for (let i = 0, j = pontos.length - 1; i < pontos.length; j = i++) {
    const [xi, yi] = pontos[i]
    const [xj, yj] = pontos[j]
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) dentro = !dentro
  }
  return dentro
}

/** Cor de um ponto no sistema de coordenadas do SVG (512x512). */
function corEm(x, y) {
  const bob = [
    [256, 256],
    [314, 332],
    [256, 440],
    [198, 332],
  ]
  if (dentroDoPoligono(x, y, bob)) return ACENTO
  if (distSegmento(x, y, 256, 72, 256, 256) <= 11) return ACENTO
  if (distSegmento(x, y, 160, 72, 352, 72) <= 13) return TRACO
  return FUNDO
}

function chunk(tipo, dados) {
  const tabela =
    chunk.tabela ??
    (chunk.tabela = (() => {
      const t = new Int32Array(256)
      for (let n = 0; n < 256; n++) {
        let c = n
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
        t[n] = c
      }
      return t
    })())
  const tam = Buffer.alloc(4)
  tam.writeUInt32BE(dados.length)
  const corpo = Buffer.concat([Buffer.from(tipo, 'ascii'), dados])
  let c = -1
  for (const b of corpo) c = tabela[(c ^ b) & 0xff] ^ (c >>> 8)
  const crc = Buffer.alloc(4)
  crc.writeInt32BE(c ^ -1)
  return Buffer.concat([tam, corpo, crc])
}

function png(tamanho) {
  const escala = 512 / tamanho
  const AMOSTRAS = 4
  const bruto = Buffer.alloc((tamanho * 4 + 1) * tamanho)
  let o = 0

  for (let y = 0; y < tamanho; y++) {
    bruto[o++] = 0
    for (let x = 0; x < tamanho; x++) {
      let r = 0
      let g = 0
      let b = 0
      for (let sy = 0; sy < AMOSTRAS; sy++) {
        for (let sx = 0; sx < AMOSTRAS; sx++) {
          const cor = corEm(
            (x + (sx + 0.5) / AMOSTRAS) * escala,
            (y + (sy + 0.5) / AMOSTRAS) * escala,
          )
          r += cor[0]
          g += cor[1]
          b += cor[2]
        }
      }
      const n = AMOSTRAS * AMOSTRAS
      bruto[o++] = Math.round(r / n)
      bruto[o++] = Math.round(g / n)
      bruto[o++] = Math.round(b / n)
      bruto[o++] = 255
    }
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(tamanho, 0)
  ihdr.writeUInt32BE(tamanho, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(bruto, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

for (const t of [180, 192, 512]) {
  writeFileSync(`public/icon-${t}.png`, png(t))
  console.log(`public/icon-${t}.png`)
}
