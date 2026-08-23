import type { AppState } from '@/core/types'
import type { StorageAdapter } from './types'
import { SyncError, type SyncErrorCode } from './types'

/**
 * Nuvem via runtime do Artifact.
 *
 * O app fica fixo em index.html e os dados moram em `data/estado.json`.
 * Gravar publica uma nova versao so desse arquivo: esta aba continua
 * rodando e as outras abas abertas recarregam com o dado novo. Abrir o
 * app em outro aparelho baixa a ultima versao publicada.
 */

const CAMINHO = 'data/estado.json'

interface ArtifactApi {
  publish(files: Record<string, string | null>): Promise<{ version: string }>
}

interface ClaudeGlobal {
  use?(name: string): Promise<unknown>
}

async function api(): Promise<ArtifactApi | null> {
  const claude = (globalThis as { claude?: ClaudeGlobal }).claude
  if (!claude?.use) return null
  try {
    const ns = (await claude.use('artifact')) as ArtifactApi | null
    return ns && typeof ns.publish === 'function' ? ns : null
  } catch {
    return null
  }
}

/** Traduz os codigos do runtime para o vocabulario do app. */
function traduzir(code: unknown): SyncErrorCode {
  switch (code) {
    case 'conflict':
      return 'conflito'
    case 'not_writer':
    case 'not_granted':
    case 'consent_required':
      return 'sem_permissao'
    case 'not_declared':
    case 'capability_disabled':
    case 'capability_removed':
      return 'indisponivel'
    case 'too_large':
      return 'muito_grande'
    case 'rate_limited':
      return 'excesso_de_escritas'
    default:
      return 'falha'
  }
}

export const cloudAdapter: StorageAdapter = {
  id: 'nuvem',
  label: 'Nuvem da sua conta',

  async available() {
    return (await api()) !== null
  },

  /**
   * Devolve null apenas quando o arquivo ainda NAO EXISTE (primeira
   * sincronizacao). Qualquer outra falha e lancada de proposito: tratar
   * erro de leitura como "nao ha nada la" faria este aparelho publicar por
   * cima do outro e apagar o que o outro tinha.
   */
  async read() {
    let res: Response
    try {
      // Caminho relativo: serve a versao que esta aba carregou.
      res = await fetch(CAMINHO, { cache: 'no-store' })
    } catch (err) {
      throw new SyncError('falha', `Nao consegui ler a nuvem: ${err}`)
    }
    if (res.status === 404) return null
    if (!res.ok) throw new SyncError('falha', `Leitura respondeu ${res.status}.`)
    try {
      const parsed = (await res.json()) as AppState
      return parsed?.profile ? parsed : null
    } catch (err) {
      throw new SyncError('falha', `Dados da nuvem ilegiveis: ${err}`)
    }
  },

  async write(state) {
    const ns = await api()
    if (!ns) throw new SyncError('indisponivel', 'Runtime de publicacao ausente.')
    try {
      await ns.publish({ [CAMINHO]: JSON.stringify(state) })
    } catch (err) {
      const code = traduzir((err as { code?: unknown })?.code)
      throw new SyncError(code, (err as Error)?.message ?? 'Falha ao publicar.')
    }
  },
}
