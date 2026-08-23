import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { FoodQuality, Scale5 } from '@/core/types'
import { FOOD_QUALITY_OPTIONS, SCALE_LABELS } from '@/core/labels'
import { useToday } from '@/state/useApp'
import { Screen } from '@/ui/components/Layout'
import { Button, Card, Field, Scale, TextArea, cx } from '@/ui/components/primitives'

function YesNo({
  value, onChange, yes = 'Sim', no = 'Nao',
}: {
  value: boolean | null
  onChange: (v: boolean) => void
  yes?: string
  no?: string
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {[true, false].map((v) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          className={cx(
            'rounded-xl border py-3 text-[15px] transition active:scale-[0.98]',
            value === v ? 'border-accent bg-accent text-ink font-medium' : 'border-line bg-surface text-muted',
          )}
        >
          {v ? yes : no}
        </button>
      ))}
    </div>
  )
}

export default function CheckIn() {
  const { state, dispatch, today } = useToday()
  const navigate = useNavigate()
  const log = state.logs[today]
  const existing = log?.checkIn

  const [sleep, setSleep] = useState<Scale5 | null>(existing?.sleep ?? null)
  const [energy, setEnergy] = useState<Scale5 | null>(existing?.energy ?? null)
  const [mood, setMood] = useState<Scale5 | null>(existing?.mood ?? null)
  const [stress, setStress] = useState<Scale5 | null>(existing?.stress ?? null)
  const [trainingDone, setTrainingDone] = useState<boolean | null>(
    existing?.trainingDone ?? (log?.done.treino ?? null),
  )
  const [foodQuality, setFoodQuality] = useState<FoodQuality | null>(existing?.foodQuality ?? null)
  const [readingDone, setReadingDone] = useState<boolean | null>(
    existing?.readingDone ?? (log?.done.leitura ?? null),
  )
  const [notes, setNotes] = useState(existing?.notes ?? '')

  const ready = sleep && energy && mood && stress && foodQuality !== null

  function save() {
    if (!sleep || !energy || !mood || !stress || !foodQuality) return
    dispatch({
      type: 'save_checkin',
      date: today,
      checkIn: {
        sleep, energy, mood, stress,
        trainingDone: !!trainingDone,
        foodQuality,
        readingDone: !!readingDone,
        notes,
        createdAt: new Date().toISOString(),
      },
    })
    navigate('/amanha')
  }

  return (
    <Screen title="Meu dia" back subtitle="Seis respostas rapidas">
      <div className="space-y-3">
        <Card>
          <Field label="Sono">
            <Scale value={sleep} onChange={setSleep} labels={SCALE_LABELS.sono} />
          </Field>
          <Field label="Energia">
            <Scale value={energy} onChange={setEnergy} labels={SCALE_LABELS.energia} />
          </Field>
          <Field label="Humor">
            <Scale value={mood} onChange={setMood} labels={SCALE_LABELS.humor} />
          </Field>
          <Field label="Estresse">
            <Scale value={stress} onChange={setStress} labels={SCALE_LABELS.estresse} />
          </Field>
        </Card>

        <Card>
          <Field label="Treinei hoje">
            <YesNo value={trainingDone} onChange={setTrainingDone} yes="Treinei" no="Nao treinei" />
          </Field>
          <Field label="Alimentacao">
            <div className="grid grid-cols-3 gap-2">
              {FOOD_QUALITY_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setFoodQuality(o.id)}
                  className={cx(
                    'rounded-xl border py-3 text-[15px] transition active:scale-[0.98]',
                    foodQuality === o.id
                      ? 'border-accent bg-accent text-ink font-medium'
                      : 'border-line bg-surface text-muted',
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Leitura">
            <YesNo value={readingDone} onChange={setReadingDone} yes="Li" no="Nao li" />
          </Field>
        </Card>

        <Card>
          <Field label="Observacoes" hint="Opcional. Uma linha ja ajuda.">
            <TextArea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Como foi o dia?" />
          </Field>
        </Card>
      </div>

      <div className="sticky bottom-24 mt-5">
        <Button full disabled={!ready} onClick={save}>
          Fechar o dia e preparar amanha
        </Button>
      </div>
    </Screen>
  )
}
