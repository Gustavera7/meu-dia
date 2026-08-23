import type { AppState } from '@/core/types'
import type { StorageAdapter } from './types'
import { SyncError } from './types'
import { storageKey } from '../scope'

/** Destino sempre presente: o proprio aparelho. Nunca falha por rede. */
export const localAdapter: StorageAdapter = {
  id: 'local',
  label: 'Este aparelho',

  async available() {
    try {
      localStorage.setItem('__probe', '1')
      localStorage.removeItem('__probe')
      return true
    } catch {
      return false
    }
  },

  async read() {
    try {
      const raw = localStorage.getItem(storageKey())
      return raw ? (JSON.parse(raw) as AppState) : null
    } catch {
      return null
    }
  },

  async write(state) {
    try {
      localStorage.setItem(storageKey(), JSON.stringify(state))
    } catch (err) {
      throw new SyncError('falha', `Nao foi possivel gravar localmente: ${err}`)
    }
  },
}
