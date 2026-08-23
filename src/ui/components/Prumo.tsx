import { cx } from './primitives'

/**
 * A marca.
 *
 * Um fio de prumo: barra fixa em cima, fio e peso pendurados. O peso
 * oscila e assenta sozinho na vertical, que e exatamente o que o app faz
 * com a rotina depois de um dia torto. A oscilacao so acontece quando a
 * pessoa nao pediu menos movimento no sistema.
 */
export function Prumo({
  size = 48,
  swing = false,
  className,
}: {
  size?: number
  swing?: boolean
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      className={className}
      role="img"
      aria-label="Prumo"
    >
      <path
        d="M30 18 H66"
        stroke="var(--color-line)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <g className={cx(swing && 'prumo-assenta')} style={{ transformBox: 'view-box', transformOrigin: '48px 18px' }}>
        <path
          d="M48 18 V52"
          stroke="var(--color-accent)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path d="M48 52 L58 66 L48 84 L38 66 Z" fill="var(--color-accent)" />
      </g>
    </svg>
  )
}

/**
 * Tela de abertura, usada enquanto a sessao e verificada.
 * Sem ela o app piscaria um vazio antes de decidir entre login e dashboard.
 */
export function PrumoSplash() {
  return (
    <div className="grid min-h-dvh place-items-center bg-ink">
      <div className="flex flex-col items-center gap-5">
        <Prumo size={88} swing />
        <span className="text-[15px] font-semibold tracking-[0.22em] text-muted">PRUMO</span>
      </div>
    </div>
  )
}
