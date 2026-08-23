import { useState } from 'react'
import { criarConta, entrar, recuperarSenha } from '@/data/auth'
import { Button, Field, Input, Note, cx } from '@/ui/components/primitives'
import { Prumo } from '@/ui/components/Prumo'

type Modo = 'entrar' | 'criar' | 'recuperar'

const TEXTOS: Record<Modo, { titulo: string; acao: string; alternar: string }> = {
  entrar: { titulo: 'Entrar', acao: 'Entrar', alternar: 'Criar uma conta' },
  criar: { titulo: 'Criar conta', acao: 'Criar conta', alternar: 'Ja tenho conta' },
  recuperar: { titulo: 'Recuperar senha', acao: 'Enviar link', alternar: 'Voltar' },
}

/**
 * Porta de entrada.
 *
 * Existe para separar os dados de cada pessoa e para o mesmo perfil abrir
 * no celular e no computador. Quem preferir seguir sem conta pode: os dados
 * ficam so no aparelho, e o botao de entrar continua no Perfil.
 */
export default function Auth({ onSkip }: { onSkip: () => void }) {
  const [modo, setModo] = useState<Modo>('entrar')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState(false)

  const t = TEXTOS[modo]
  const valido =
    modo === 'recuperar' ? email.includes('@') : email.includes('@') && senha.length >= 6

  async function enviar() {
    if (!valido || ocupado) return
    setOcupado(true)
    setErro('')
    setAviso('')

    const resultado =
      modo === 'entrar'
        ? await entrar(email, senha)
        : modo === 'criar'
          ? await criarConta(email, senha)
          : await recuperarSenha(email)

    setOcupado(false)

    if (!resultado) {
      if (modo === 'recuperar') {
        setAviso('Se existir conta com esse e-mail, o link acabou de sair.')
        setModo('entrar')
      }
      return
    }
    // Mensagens de confirmacao nao sao falha: orientam o proximo passo.
    if (resultado.startsWith('Conta criada')) {
      setAviso(resultado)
      setModo('entrar')
    } else {
      setErro(resultado)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 grid size-20 place-items-center rounded-2xl bg-surface">
          <Prumo size={52} swing />
        </div>
        <h1 className="text-[26px] font-semibold tracking-[0.16em]">PRUMO</h1>
        <p className="mx-auto mt-2 max-w-[30ch] text-[13px] leading-snug text-muted">
          Saude, performance e desenvolvimento. Um dia de cada vez, no seu prumo.
        </p>
      </div>

      <div className="mb-1 flex gap-2">
        {(['entrar', 'criar'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setModo(m); setErro(''); setAviso('') }}
            className={cx(
              'flex-1 rounded-xl border py-2.5 text-sm transition',
              modo === m ? 'border-accent bg-accent-soft text-fg' : 'border-line bg-surface text-muted',
            )}
          >
            {TEXTOS[m].titulo}
          </button>
        ))}
      </div>

      <form
        className="mt-5"
        onSubmit={(e) => { e.preventDefault(); void enviar() }}
      >
        <Field label="E-mail">
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@email.com"
          />
        </Field>

        {modo !== 'recuperar' && (
          <Field label="Senha" hint={modo === 'criar' ? 'Pelo menos 6 caracteres' : undefined}>
            <Input
              type="password"
              autoComplete={modo === 'criar' ? 'new-password' : 'current-password'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="******"
            />
          </Field>
        )}

        {erro && <p className="mb-3 text-[13px] leading-snug text-red-300">{erro}</p>}
        {aviso && <div className="mb-3"><Note tone="accent">{aviso}</Note></div>}

        <Button type="submit" full disabled={!valido || ocupado}>
          {ocupado ? 'Um momento' : t.acao}
        </Button>
      </form>

      <div className="mt-4 flex flex-col items-center gap-3">
        {modo === 'entrar' && (
          <button
            type="button"
            className="text-[12px] text-muted"
            onClick={() => { setModo('recuperar'); setErro('') }}
          >
            Esqueci a senha
          </button>
        )}
        {modo === 'recuperar' && (
          <button type="button" className="text-[12px] text-muted" onClick={() => setModo('entrar')}>
            Voltar
          </button>
        )}
        <button type="button" className="text-[12px] text-faint" onClick={onSkip}>
          Usar sem conta neste aparelho
        </button>
      </div>

      <p className="mt-8 text-center text-[11px] leading-snug text-faint">
        Sem conta, os dados ficam apenas neste aparelho e nao acompanham voce
        para o computador.
      </p>
    </div>
  )
}
