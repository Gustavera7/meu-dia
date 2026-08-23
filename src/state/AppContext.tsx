import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import type { AppState, DayPlan, ISODate } from '@/core/types'
import { today as todayISO } from '@/core/dates'
import { load, save, saveNow } from '@/data/storage'
import { detectAdapter, onSyncChange, pull, push, syncSnapshot, type SyncSnapshot } from '@/data/sync'
import { authDisponivel, contaAtual, onContaChange, sair, type Conta } from '@/data/auth'
import { setContaSincronizada } from '@/data/adapters/supabase'
import { lastScope, setScope } from '@/data/scope'
import { buildDayPlan } from '@/domain/planning/dayPlan'
import { reducer } from './reducer'
import { AppContext, type AppContextValue } from './context'

export function AppProvider({ children }: { children: ReactNode }) {
  // A primeira carga ja usa o escopo da ultima conta: sem isso o app
  // pisca os dados de outra pessoa antes da sessao ser verificada.
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    setScope(lastScope())
    return load()
  })
  const [conta, setConta] = useState<Conta | null>(null)
  const [authPronto, setAuthPronto] = useState(!authDisponivel())
  const [today, setToday] = useState<ISODate>(todayISO)
  const [sync, setSync] = useState<SyncSnapshot>(syncSnapshot)
  const enviando = useRef(false)

  // Persistencia: qualquer mudanca de estado desce para o aparelho.
  useEffect(() => {
    save(state)
  }, [state])

  // Assinatura do estado da sincronizacao, para a interface mostrar.
  useEffect(() => onSyncChange(setSync), [])

  // Sessao: resolve a atual e acompanha entradas e saidas.
  useEffect(() => {
    if (!authDisponivel()) return
    void contaAtual().then((c) => {
      setConta(c)
      setAuthPronto(true)
    })
    return onContaChange((c) => {
      setConta(c)
      setAuthPronto(true)
    })
  }, [])

  /**
   * Cada conta tem o seu proprio espaco. Ao entrar ou sair trocamos o
   * escopo local, recarregamos dali e so entao conversamos com a nuvem.
   * Puxar ANTES de enviar e o que evita sobrescrever o outro aparelho.
   */
  useEffect(() => {
    if (!authPronto) return
    let vivo = true
    void (async () => {
      setScope(conta?.id ?? 'local')
      setContaSincronizada(conta?.id ?? null)

      const local = load()
      if (vivo) dispatch({ type: 'hydrate', state: local })

      await detectAdapter()
      const juntado = await pull(local)
      if (vivo) dispatch({ type: 'hydrate', state: juntado })
    })()
    return () => {
      vivo = false
    }
  }, [conta?.id, authPronto])

  const enviar = useCallback(async (atual: AppState) => {
    if (enviando.current) return
    enviando.current = true
    try {
      const enviado = await push(atual)
      if (enviado !== atual) dispatch({ type: 'hydrate', state: enviado })
    } finally {
      enviando.current = false
    }
  }, [])

  /**
   * Envio adiado: publicar custa uma versao inteira, entao juntamos varias
   * alteracoes seguidas numa so ida. Marcar cinco habitos e um envio.
   */
  useEffect(() => {
    if (!state.sync.dirtySince || !state.onboarded) return
    const id = window.setTimeout(() => void enviar(state), 5000)
    return () => window.clearTimeout(id)
  }, [state, enviar])

  // No celular o app costuma ser fechado de repente. Antes de ir para
  // segundo plano a gravacao pendente e forcada, sem esperar o debounce.
  useEffect(() => {
    const flush = () => {
      if (document.visibilityState !== 'hidden') return
      saveNow(state)
      // Sair do app e o melhor momento para fechar a conta com a nuvem.
      if (state.sync.dirtySince && state.onboarded) void enviar(state)
    }
    document.addEventListener('visibilitychange', flush)
    window.addEventListener('pagehide', flush)
    return () => {
      document.removeEventListener('visibilitychange', flush)
      window.removeEventListener('pagehide', flush)
    }
  }, [state, enviar])

  // Vira o dia sem precisar recarregar o app.
  useEffect(() => {
    const tick = () => setToday(todayISO())
    const interval = window.setInterval(tick, 60_000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [])

  // Garante que o dia atual sempre tenha plano.
  useEffect(() => {
    if (state.onboarded && !state.plans[today]) {
      dispatch({ type: 'ensure_plan', date: today })
    }
  }, [state.onboarded, state.plans, today])

  const planFor = useCallback(
    (date: ISODate): DayPlan => state.plans[date] ?? buildDayPlan(state, date),
    [state],
  )

  const syncNow = useCallback(() => void enviar(state), [state, enviar])

  const sairDaConta = useCallback(() => {
    // Envia o que estiver pendente antes de soltar a conta.
    void enviar(state).finally(() => void sair())
  }, [state, enviar])

  const value = useMemo<AppContextValue>(
    () => ({ state, dispatch, today, planFor, sync, syncNow, conta, authPronto, sairDaConta }),
    [state, today, planFor, sync, syncNow, conta, authPronto, sairDaConta],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
