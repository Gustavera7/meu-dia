import { useState } from 'react'
import type { Book } from '@/core/types'
import { lastNDays } from '@/core/dates'
import { makeId, stamp } from '@/core/id'
import { useToday } from '@/state/useApp'
import { visibleBooks } from '@/state/selectors'
import { Screen } from '@/ui/components/Layout'
import {
  Button, Card, EmptyState, Field, Input, Note, ProgressBar, Section, Sheet, Stepper, Tag, cx,
} from '@/ui/components/primitives'

export default function Reading() {
  const { state, dispatch, today, plan } = useToday()
  const log = state.logs[today]

  const [adding, setAdding] = useState(false)
  const [session, setSession] = useState(false)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [minutes, setMinutes] = useState(plan.readingMinutes)
  const [pages, setPages] = useState(0)

  const livros = visibleBooks(state)
  const current = livros.find((b) => b.status === 'lendo') ?? null
  const week = lastNDays(7, today)
  const weekMinutes = week.reduce((sum, d) => sum + (state.logs[d]?.reading?.minutes ?? 0), 0)

  function addBook() {
    if (!title.trim()) return
    const book: Book = {
      id: makeId('book'),
      title: title.trim(),
      author: author.trim(),
      area: state.profile.personal.interests[0] ?? 'Geral',
      totalPages: null,
      currentPage: 0,
      status: 'lendo',
      startedAt: stamp(),
      updatedAt: stamp(),
      deletedAt: null,
    }
    dispatch({ type: 'add_book', book })
    setTitle('')
    setAuthor('')
    setAdding(false)
  }

  function saveSession() {
    dispatch({
      type: 'log_reading',
      date: today,
      log: { bookId: current?.id ?? null, minutes, pages },
    })
    if (current && pages > 0) {
      dispatch({
        type: 'update_book',
        id: current.id,
        patch: { currentPage: current.currentPage + pages },
      })
    }
    setSession(false)
  }

  return (
    <Screen title="Leitura" back subtitle={`Meta de hoje: ${plan.readingMinutes} min`}>
      <Card className="mb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-faint">Esta semana</p>
            <p className="text-[22px] font-semibold tabular-nums">
              {weekMinutes} <span className="text-sm font-normal text-faint">min</span>
            </p>
          </div>
          {log?.done.leitura && <Tag tone="accent">lido hoje</Tag>}
        </div>
        <div className="mt-3 flex justify-between gap-1">
          {week.map((d) => {
            const min = state.logs[d]?.reading?.minutes ?? 0
            const ratio = Math.min(1, min / Math.max(1, plan.readingMinutes))
            return (
              <div key={d} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-12 w-full items-end rounded-md bg-surface-2">
                  <div
                    className={cx('w-full rounded-md bg-accent transition-all')}
                    style={{ height: `${Math.max(ratio * 100, min > 0 ? 12 : 0)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Button full onClick={() => setSession(true)}>
        Registrar leitura
      </Button>

      <div className="h-6" />

      <Section title="Meus livros" action={<button type="button" onClick={() => setAdding(true)} className="text-xs text-accent">adicionar</button>}>
        {livros.length === 0 ? (
          <EmptyState title="Nenhum livro" description="Adicione o que voce esta lendo agora." />
        ) : (
          <div className="space-y-2">
            {livros.map((b) => (
              <Card key={b.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium">{b.title}</p>
                    <p className="truncate text-[12px] text-faint">{b.author || b.area}</p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 text-[11px] text-muted"
                    onClick={() =>
                      dispatch({
                        type: 'update_book',
                        id: b.id,
                        patch: { status: b.status === 'lendo' ? 'concluido' : 'lendo' },
                      })
                    }
                  >
                    {b.status === 'lendo' ? 'marcar lido' : 'voltar a ler'}
                  </button>
                </div>
                {b.totalPages && (
                  <div className="mt-2">
                    <ProgressBar ratio={b.currentPage / b.totalPages} />
                  </div>
                )}
                <p className="mt-2 text-[11px] text-faint">Pagina {b.currentPage}</p>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {plan.readingMinutes <= 10 && (
        <Note>Meta reduzida para 10 minutos. Voltar com pouco e melhor que nao voltar.</Note>
      )}

      <Sheet open={adding} onClose={() => setAdding(false)} title="Novo livro">
        <Field label="Titulo">
          <Input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Autor">
          <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
        </Field>
        <Button full onClick={addBook} disabled={!title.trim()}>
          Adicionar
        </Button>
      </Sheet>

      <Sheet open={session} onClose={() => setSession(false)} title="Registrar leitura">
        <Field label="Minutos">
          <Stepper value={minutes} min={0} max={240} onChange={setMinutes} suffix="min" />
        </Field>
        <Field label="Paginas">
          <Stepper value={pages} min={0} max={300} onChange={setPages} />
        </Field>
        <Button full onClick={saveSession}>
          Salvar
        </Button>
      </Sheet>
    </Screen>
  )
}
