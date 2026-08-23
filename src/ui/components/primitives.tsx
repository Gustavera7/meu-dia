import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

/* ------------------------------ Card ------------------------------ */

export function Card({
  children, className, onClick, accent,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  accent?: boolean
}) {
  const base = cx(
    'rounded-2xl border bg-surface p-4',
    accent ? 'border-accent/40' : 'border-line',
    onClick && 'active:scale-[0.99] transition-transform text-left w-full',
    className,
  )
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={base}>
        {children}
      </button>
    )
  }
  return <div className={base}>{children}</div>
}

/* ---------------------------- Section ----------------------------- */

export function Section({
  title, action, children, hint,
}: {
  title: string
  hint?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="mb-6">
      <div className="mb-2 flex items-baseline justify-between gap-3 px-1">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
          {hint && <p className="mt-0.5 text-xs text-faint">{hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

/* ----------------------------- Button ----------------------------- */

type Variant = 'primary' | 'subtle' | 'ghost' | 'danger'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-ink font-semibold',
  subtle: 'bg-surface-2 text-fg border border-line',
  ghost: 'text-muted',
  danger: 'bg-red-500/10 text-red-300 border border-red-500/30',
}

export function Button({
  children, variant = 'primary', full, className, ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  full?: boolean
}) {
  return (
    <button
      {...rest}
      className={cx(
        'rounded-xl px-4 py-3 text-[15px] transition active:scale-[0.98] disabled:opacity-40',
        VARIANTS[variant],
        full && 'w-full',
        className,
      )}
    >
      {children}
    </button>
  )
}

/* ------------------------------ Chip ------------------------------ */

export function Chip({
  label, selected, onClick, hint,
}: {
  label: string
  selected?: boolean
  hint?: string
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'rounded-xl border px-3 py-2.5 text-left text-sm transition active:scale-[0.98]',
        selected
          ? 'border-accent/60 bg-accent-soft text-fg'
          : 'border-line bg-surface text-muted',
      )}
    >
      <span className={cx('block', selected && 'font-medium text-fg')}>{label}</span>
      {hint && <span className="mt-0.5 block text-[11px] leading-tight text-faint">{hint}</span>}
    </button>
  )
}

/* ---------------------------- CheckRow ---------------------------- */

export function CheckRow({
  label, done, onToggle, meta, sub, onOpen,
}: {
  label: string
  done: boolean
  onToggle: () => void
  meta?: string
  sub?: string
  onOpen?: () => void
}) {
  return (
    <div className="flex items-center gap-3 border-b border-line/60 py-3 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        aria-label={done ? `Desmarcar ${label}` : `Concluir ${label}`}
        className={cx(
          'grid size-6 shrink-0 place-items-center rounded-lg border transition',
          done ? 'border-accent bg-accent text-ink' : 'border-line bg-surface-2',
        )}
      >
        {done && (
          <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M4 10.5l4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <button
        type="button"
        onClick={onOpen ?? onToggle}
        className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
      >
        <span className="min-w-0">
          <span className={cx('block truncate text-[15px]', done && 'text-faint line-through')}>
            {label}
          </span>
          {sub && <span className="block truncate text-xs text-faint">{sub}</span>}
        </span>
        {meta && <span className="shrink-0 text-xs text-faint">{meta}</span>}
      </button>
    </div>
  )
}

/* --------------------------- Progresso ---------------------------- */

export function ProgressBar({ ratio, className }: { ratio: number; className?: string }) {
  return (
    <div className={cx('h-1.5 w-full overflow-hidden rounded-full bg-surface-2', className)}>
      <div
        className="h-full rounded-full bg-accent transition-[width] duration-500"
        style={{ width: `${Math.round(Math.min(1, Math.max(0, ratio)) * 100)}%` }}
      />
    </div>
  )
}

export function ProgressRing({
  ratio, size = 64, label, sublabel,
}: {
  ratio: number
  size?: number
  label?: string
  sublabel?: string
}) {
  const stroke = 6
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.min(1, Math.max(0, ratio))
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-surface-2)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="var(--color-accent)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - clamped)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute text-center leading-none">
        {label && <div className="text-sm font-semibold">{label}</div>}
        {sublabel && <div className="mt-0.5 text-[10px] text-faint">{sublabel}</div>}
      </div>
    </div>
  )
}

/* --------------------------- Formulario --------------------------- */

export function Field({
  label, hint, children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="mb-4 block">
      <span className="mb-1.5 block text-[13px] font-medium text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-faint">{hint}</span>}
    </label>
  )
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        'w-full rounded-xl border border-line bg-surface px-3.5 py-3 outline-none',
        'placeholder:text-faint focus:border-accent/60',
        props.className,
      )}
    />
  )
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cx(
        'w-full resize-none rounded-xl border border-line bg-surface px-3.5 py-3 outline-none',
        'placeholder:text-faint focus:border-accent/60',
        props.className,
      )}
    />
  )
}

export function Stepper({
  value, onChange, min = 0, max = 99, suffix,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  suffix?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="grid size-9 place-items-center rounded-lg bg-surface-2 text-lg"
        aria-label="Diminuir"
      >
        -
      </button>
      <span className="flex-1 text-center text-[15px] font-medium tabular-nums">
        {value}
        {suffix && <span className="ml-1 text-xs text-faint">{suffix}</span>}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="grid size-9 place-items-center rounded-lg bg-surface-2 text-lg"
        aria-label="Aumentar"
      >
        +
      </button>
    </div>
  )
}

/** Escala de 1 a 5 usada no check-in e no registro de treino. */
export function Scale({
  value, onChange, labels,
}: {
  value: number | null
  onChange: (v: 1 | 2 | 3 | 4 | 5) => void
  labels?: string[]
}) {
  return (
    <div>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n as 1 | 2 | 3 | 4 | 5)}
            className={cx(
              'rounded-xl border py-3 text-[15px] font-medium transition active:scale-95',
              value === n
                ? 'border-accent bg-accent text-ink'
                : 'border-line bg-surface text-muted',
            )}
          >
            {n}
          </button>
        ))}
      </div>
      {labels && value && (
        <p className="mt-1.5 text-center text-xs text-faint">{labels[value - 1]}</p>
      )}
    </div>
  )
}

/* ----------------------------- Sheet ------------------------------ */

export function Sheet({
  open, onClose, title, children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <div className="animate-rise relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl border-t border-line bg-surface p-5 pb-8">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">{title}</h3>
          <button type="button" onClick={onClose} className="text-sm text-muted">
            Fechar
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* --------------------------- Vazio / info -------------------------- */

export function EmptyState({
  title, description, action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-4 py-8 text-center">
      <p className="text-[15px] font-medium">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-[28ch] text-sm text-faint">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Note({ children, tone = 'muted' }: { children: ReactNode; tone?: 'muted' | 'accent' }) {
  return (
    <p
      className={cx(
        'rounded-xl px-3 py-2.5 text-[13px] leading-snug',
        tone === 'accent' ? 'bg-accent-soft text-accent' : 'bg-surface-2 text-muted',
      )}
    >
      {children}
    </p>
  )
}

export function Tag({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'accent' | 'warn' }) {
  const tones = {
    default: 'bg-surface-2 text-muted',
    accent: 'bg-accent-soft text-accent',
    warn: 'bg-warn/10 text-warn',
  }
  return (
    <span className={cx('rounded-md px-2 py-0.5 text-[11px] font-medium', tones[tone])}>
      {children}
    </span>
  )
}
