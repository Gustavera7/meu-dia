import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { AppProvider } from '@/state/AppContext'
import App from './App'
import './index.css'

/**
 * Service worker so em producao: em desenvolvimento ele serviria versoes
 * antigas do bundle e esconderia as alteracoes recem-feitas.
 */
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Resolve a partir do DOCUMENTO, nao do modulo: com base relativa o
    // bundle mora em assets/, e o sw.js ficaria procurado na pasta errada.
    const base = new URL('./', document.baseURI)
    void navigator.serviceWorker
      .register(new URL('sw.js', base).href, { scope: base.href })
      .catch((err) => console.warn('Service worker nao registrado:', err))

    // Quando uma versao nova assume, a pagina ainda esta rodando a antiga.
    // Uma recarga (uma so) entrega o app atualizado sem o usuario precisar
    // saber que existe cache.
    let recarregando = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (recarregando) return
      recarregando = true
      window.location.reload()
    })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </HashRouter>
  </StrictMode>,
)
