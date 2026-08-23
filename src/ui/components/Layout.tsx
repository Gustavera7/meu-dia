import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { cx } from './primitives'

/* ------------------------------ Icones ----------------------------- */

const ICONS: Record<string, ReactNode> = {
  hoje: <path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  treino: <path d="M4 9v6M8 7v10M16 7v10M20 9v6M8 12h8" />,
  nutricao: <path d="M12 21c-4 0-7-3.2-7-7.5S8 4 12 4s7 5.2 7 9.5S16 21 12 21ZM12 4V2" />,
  motor: <path d="M12 5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM8 22l2.5-6.5L8 12l1-4 3 2 3 1M9 8 6 9M12 15.5 16 22" />,
  perfil: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />,
  mais: <path d="M4 7h16M4 12h16M4 17h10" />,
}

function Icon({ name, active }: { name: string; active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2 : 1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-[22px]"
    >
      {ICONS[name]}
    </svg>
  )
}

/* ----------------------------- Tab bar ----------------------------- */

const TABS = [
  { to: '/', icon: 'hoje', label: 'Hoje' },
  { to: '/treino', icon: 'treino', label: 'Treino' },
  { to: '/nutricao', icon: 'nutricao', label: 'Comida' },
  { to: '/motor', icon: 'motor', label: 'Motor' },
  { to: '/mais', icon: 'mais', label: 'Mais' },
]

export function TabBar() {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-md justify-around px-2 pt-2">
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              cx(
                'flex w-16 flex-col items-center gap-1 rounded-xl py-1.5 text-[10px] transition',
                isActive ? 'text-accent' : 'text-faint',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={tab.icon} active={isActive} />
                <span className={cx(isActive && 'font-medium')}>{tab.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

/* ------------------------------ Shell ------------------------------ */

export function Screen({
  children, title, subtitle, back, action, wide,
}: {
  children: ReactNode
  title?: string
  subtitle?: string
  back?: boolean
  action?: ReactNode
  wide?: boolean
}) {
  const navigate = useNavigate()
  return (
    <div className={cx('mx-auto min-h-dvh w-full px-4 pb-28', wide ? 'max-w-2xl' : 'max-w-md')}>
      {(title || back) && (
        <header className="safe-top sticky top-0 z-30 -mx-4 mb-4 bg-ink/90 px-4 pb-3 backdrop-blur">
          <div className="flex items-center gap-3 pt-2">
            {back && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Voltar"
                className="-ml-1 grid size-9 place-items-center rounded-xl bg-surface-2"
              >
                <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className="min-w-0 flex-1">
              {title && <h1 className="truncate text-[22px] font-semibold tracking-tight">{title}</h1>}
              {subtitle && <p className="truncate text-[13px] text-faint">{subtitle}</p>}
            </div>
            {action}
          </div>
        </header>
      )}
      <div className={cx(!title && !back && 'safe-top pt-4')}>{children}</div>
    </div>
  )
}
