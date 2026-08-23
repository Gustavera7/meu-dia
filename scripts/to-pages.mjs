/**
 * Copia o build para `docs/`, que e a pasta que o GitHub Pages publica.
 *
 * Usar `docs/` em vez de uma branch separada mantem codigo e versao no ar
 * no mesmo commit: da para saber exatamente o que esta publicado.
 */
import { cpSync, rmSync, existsSync, writeFileSync } from 'node:fs'

if (!existsSync('dist')) throw new Error('Rode "npm run build" antes.')

rmSync('docs', { recursive: true, force: true })
cpSync('dist', 'docs', { recursive: true })

// Impede o Jekyll do GitHub Pages de ignorar pastas iniciadas por underscore.
writeFileSync('docs/.nojekyll', '')

console.log('docs/ pronto para o GitHub Pages')
