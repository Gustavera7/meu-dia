/**
 * Empacota o build do Vite num unico arquivo HTML autossuficiente.
 *
 * Serve para hospedar o app onde nao existe servidor de arquivos: tudo
 * (CSS, JS e icones) vai embutido. Rode depois de `vite build`.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const DIST = 'dist'
const assets = readdirSync(join(DIST, 'assets'))
const cssFile = assets.find((f) => f.endsWith('.css'))
const jsFile = assets.find((f) => f.endsWith('.js'))

if (!cssFile || !jsFile) throw new Error('Rode "vite build" antes de empacotar.')

const css = readFileSync(join(DIST, 'assets', cssFile), 'utf8')
const js = readFileSync(join(DIST, 'assets', jsFile), 'utf8')

const b64 = (file) => readFileSync(join('public', file)).toString('base64')
const icon192 = `data:image/png;base64,${b64('icon-192.png')}`
const icon512 = `data:image/png;base64,${b64('icon-512.png')}`

const manifest = {
  name: 'Meu Dia',
  short_name: 'Meu Dia',
  display: 'standalone',
  orientation: 'portrait',
  background_color: '#0B0F14',
  theme_color: '#0B0F14',
  icons: [
    { src: icon192, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
    { src: icon512, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ],
}

/**
 * O iOS le estas tags no momento em que a pessoa toca "Adicionar a tela de
 * inicio", nao no parse inicial. Injetar em document.head funciona mesmo
 * quando o host so aceita conteudo de body.
 */
const bootstrap = `
(function () {
  var head = document.head;
  var add = function (tag, attrs) {
    var el = document.createElement(tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    head.appendChild(el);
  };
  document.title = 'Meu Dia';
  add('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no' });
  add('meta', { name: 'apple-mobile-web-app-capable', content: 'yes' });
  add('meta', { name: 'mobile-web-app-capable', content: 'yes' });
  add('meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' });
  add('meta', { name: 'apple-mobile-web-app-title', content: 'Meu Dia' });
  add('meta', { name: 'theme-color', content: '#0B0F14' });
  add('meta', { name: 'color-scheme', content: 'dark' });
  add('link', { rel: 'apple-touch-icon', href: ${JSON.stringify(icon192)} });
  add('link', { rel: 'icon', type: 'image/png', href: ${JSON.stringify(icon192)} });
  add('link', { rel: 'manifest', href: 'data:application/manifest+json;base64,' + btoa(unescape(encodeURIComponent(${JSON.stringify(JSON.stringify(manifest))}))) });
})();
`

// "</script" dentro de uma string do bundle fecharia a tag antes da hora
const safe = (code) => code.replace(/<\/script/gi, '<\/script')

const html = `<title>Meu Dia</title>
<style>
${css}
/* O host pinta o proprio fundo atras da pagina: sem isto, o app herda o tema
   do site em volta em vez do proprio. */
html, body { background: #0B0F14; color: #E9EFF5; min-height: 100%; }
#root { min-height: 100dvh; }
</style>
<div id="root"></div>
<script>${safe(bootstrap)}</script>
<script type="module">${safe(js)}</script>
`

writeFileSync(join(DIST, 'meu-dia.html'), html)
console.log(`dist/meu-dia.html gerado (${(html.length / 1024).toFixed(0)} kB)`)
