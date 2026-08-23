/**
 * Service worker do Prumo.
 *
 * Objetivo: o app abrir sem conexao. A estrategia muda conforme o arquivo:
 * - assets com hash no nome nunca mudam de conteudo, entao vale cache primeiro;
 * - a pagina em si e buscada na rede primeiro, para uma versao nova chegar
 *   sozinha, com o cache servindo de rede de seguranca quando estiver offline.
 */
const CACHE = 'prumo-v1'
const ESSENCIAIS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png']

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ESSENCIAIS)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (evento) => {
  const req = evento.request
  if (req.method !== 'GET') return

  const url = new URL(req.url)
  // Chamadas ao Supabase nunca entram em cache: dado velho seria pior que erro.
  if (url.origin !== self.location.origin) return

  const ehAsset = url.pathname.includes('/assets/')

  if (ehAsset) {
    evento.respondWith(
      caches.match(req).then(
        (guardado) =>
          guardado ||
          fetch(req).then((res) => {
            const copia = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copia))
            return res
          }),
      ),
    )
    return
  }

  // `no-cache` obriga a revalidar no servidor. Sem isso o navegador serve
  // uma pagina antiga do proprio cache HTTP e uma versao nova do app pode
  // demorar horas para chegar.
  evento.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then((res) => {
        const copia = res.clone()
        caches.open(CACHE).then((c) => c.put(req, copia))
        return res
      })
      .catch(() => caches.match(req).then((g) => g || caches.match('./index.html'))),
  )
})
