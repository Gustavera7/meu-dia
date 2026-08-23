import { useContext } from 'react'
import { AppContext, type AppContextValue } from './context'

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp precisa estar dentro de AppProvider')
  return ctx
}

/** Atalho para o caso mais comum: estado, dispatch e o plano de hoje. */
export function useToday() {
  const { state, dispatch, today, planFor } = useApp()
  return { state, dispatch, today, plan: planFor(today) }
}
