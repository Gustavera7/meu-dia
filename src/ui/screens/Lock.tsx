import { useState } from 'react'
import { useApp } from '@/state/useApp'
import { lightHash } from '@/core/id'
import { Button } from '@/ui/components/primitives'

/** Tranca simples de tela. Nao substitui autenticacao de servidor. */
export default function Lock({ onUnlock }: { onUnlock: () => void }) {
  const { state } = useApp()
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  function press(digit: string) {
    if (pin.length >= 4) return
    const next = pin + digit
    setPin(next)
    setError(false)
    if (next.length === 4) {
      if (lightHash(next) === state.auth.pinHash) onUnlock()
      else {
        setError(true)
        setTimeout(() => setPin(''), 350)
      }
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-xs flex-col items-center justify-center px-6">
      <p className="mb-1 text-sm text-faint">Ola, {state.profile.name || 'de novo'}</p>
      <h1 className="mb-8 text-xl font-semibold">Digite seu PIN</h1>

      <div className="mb-10 flex gap-3">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`size-3 rounded-full transition ${
              error ? 'bg-red-400' : i < pin.length ? 'bg-accent' : 'bg-surface-2'
            }`}
          />
        ))}
      </div>

      <div className="grid w-full grid-cols-3 gap-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => press(d)}
            className="rounded-2xl bg-surface py-4 text-xl active:scale-95"
          >
            {d}
          </button>
        ))}
        <span />
        <button type="button" onClick={() => press('0')} className="rounded-2xl bg-surface py-4 text-xl active:scale-95">
          0
        </button>
        <button
          type="button"
          onClick={() => setPin(pin.slice(0, -1))}
          className="rounded-2xl bg-surface py-4 text-sm text-muted active:scale-95"
        >
          apagar
        </button>
      </div>

      {error && <p className="mt-6 text-sm text-red-300">PIN incorreto</p>}

      <Button variant="ghost" className="mt-8 text-xs" onClick={onUnlock}>
        Esqueci o PIN, entrar mesmo assim
      </Button>
    </div>
  )
}
