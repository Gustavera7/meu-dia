/**
 * Separacao de dados por conta no mesmo aparelho.
 *
 * Sem isto, entrar como uma pessoa, sair e entrar como outra faria a
 * segunda carregar os dados da primeira e envia-los para a conta dela.
 * Cada conta tem a sua propria chave no armazenamento local.
 */

const PREFIXO = 'sistema-pessoal:v1'
const LEGADO = 'sistema-pessoal:v1'
const ULTIMA_CONTA = 'sistema-pessoal:ultima-conta'

/** Escopo atual: id da conta, ou "local" para uso sem login. */
let escopo = 'local'

export function storageKey(qual: string = escopo): string {
  return `${PREFIXO}:${qual}`
}

export function currentScope(): string {
  return escopo
}

export function setScope(novo: string): void {
  escopo = novo || 'local'
  try {
    if (escopo === 'local') localStorage.removeItem(ULTIMA_CONTA)
    else localStorage.setItem(ULTIMA_CONTA, escopo)
  } catch {
    /* sem localStorage: seguimos so em memoria */
  }
}

/** Ultimo escopo usado, para a primeira tela ja abrir com os dados certos. */
export function lastScope(): string {
  try {
    return localStorage.getItem(ULTIMA_CONTA) || 'local'
  } catch {
    return 'local'
  }
}

/**
 * Move os dados da versao sem contas para o escopo local.
 * Roda uma vez so: quem ja usava o app nao perde nada ao atualizar.
 */
export function migrarLegado(): void {
  try {
    const antigo = localStorage.getItem(LEGADO)
    if (!antigo) return
    if (!localStorage.getItem(storageKey('local'))) {
      localStorage.setItem(storageKey('local'), antigo)
    }
    localStorage.removeItem(LEGADO)
  } catch {
    /* nada a fazer: o app segue com estado vazio */
  }
}
