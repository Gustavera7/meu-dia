import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Equipment, GoalId, MotorCategory } from '@/core/types'
import {
  DIET_OPTIONS, EQUIPMENT_OPTIONS, EXPERIENCE_OPTIONS, GOALS, MODULE_LABELS,
  MOTOR_OPTIONS, NUTRITION_GOAL_OPTIONS, RESTRICTION_LABELS, RESTRICTION_OPTIONS,
} from '@/core/labels'
import { lightHash } from '@/core/id'
import { ALL_MODULES } from '@/data/defaults'
import { exportJSON, importJSON } from '@/data/storage'
import { useApp } from '@/state/useApp'
import { activePrescription } from '@/state/selectors'
import { authDisponivel } from '@/data/auth'
import { Screen } from '@/ui/components/Layout'
import {
  Button, Card, Chip, Field, Input, Note, Section, Sheet, Stepper, Tag, TextArea, cx,
} from '@/ui/components/primitives'

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={cx('h-7 w-12 shrink-0 rounded-full p-1 transition', on ? 'bg-accent' : 'bg-surface-2')}
    >
      <span
        className={cx(
          'block size-5 rounded-full bg-white transition-transform',
          on ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  )
}

export default function Profile() {
  const { state, dispatch, sync, syncNow, today, conta, sairDaConta } = useApp()
  const navigate = useNavigate()
  const p = state.profile
  const dieta = activePrescription(state, 'nutricao', today)
  const ficha = activePrescription(state, 'treino', today)

  const [pinSheet, setPinSheet] = useState(false)
  const [pin, setPin] = useState('')
  const [dataSheet, setDataSheet] = useState(false)
  const [backupSheet, setBackupSheet] = useState(false)
  const [copied, setCopied] = useState(false)
  const [importText, setImportText] = useState('')
  const [dislikes, setDislikes] = useState(p.nutrition.dislikes.join(', '))

  const patchTraining = (patch: Partial<typeof p.training>) =>
    dispatch({ type: 'update_profile', patch: { training: { ...p.training, ...patch } } })
  const patchNutrition = (patch: Partial<typeof p.nutrition>) =>
    dispatch({ type: 'update_profile', patch: { nutrition: { ...p.nutrition, ...patch } } })
  const patchRoutine = (patch: Partial<typeof p.routine>) =>
    dispatch({ type: 'update_profile', patch: { routine: { ...p.routine, ...patch } } })

  /**
   * Backup por area de transferencia em vez de download de arquivo.
   * No celular salvar um .json e desconfortavel, e em pagina hospedada
   * o download costuma ser bloqueado. Copiar funciona em todo lugar.
   */
  async function copyBackup() {
    const text = exportJSON(state)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Sem permissao de clipboard: o texto fica na tela para selecao manual.
      setCopied(false)
    }
  }

  function runImport() {
    const next = importJSON(importText)
    if (!next) {
      alert('Arquivo invalido.')
      return
    }
    dispatch({ type: 'hydrate', state: next })
    setDataSheet(false)
    setImportText('')
  }

  return (
    <Screen title="Perfil" back subtitle="Tudo aqui pode ser mudado quando voce quiser">
      <Section title="Voce">
        <Card>
          <Field label="Nome">
            <Input value={p.name} onChange={(e) => dispatch({ type: 'update_profile', patch: { name: e.target.value } })} />
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Idade">
              <Input type="number" inputMode="numeric" value={p.basics.age ?? ''}
                onChange={(e) => dispatch({ type: 'update_profile', patch: { basics: { ...p.basics, age: Number(e.target.value) || null } } })} />
            </Field>
            <Field label="Altura">
              <Input type="number" inputMode="numeric" value={p.basics.heightCm ?? ''}
                onChange={(e) => dispatch({ type: 'update_profile', patch: { basics: { ...p.basics, heightCm: Number(e.target.value) || null } } })} />
            </Field>
            <Field label="Peso">
              <Input type="number" inputMode="decimal" value={p.basics.weightKg ?? ''}
                onChange={(e) => dispatch({ type: 'update_profile', patch: { basics: { ...p.basics, weightKg: Number(e.target.value) || null } } })} />
            </Field>
          </div>
        </Card>
      </Section>

      <Section title="Objetivos" hint="Mudam a prescricao do treino e as sugestoes">
        <div className="grid grid-cols-2 gap-2">
          {GOALS.map((g) => (
            <Chip key={g.id} label={g.label} selected={p.goals.includes(g.id)}
              onClick={() => dispatch({ type: 'update_profile', patch: { goals: toggle<GoalId>(p.goals, g.id) } })} />
          ))}
        </div>
      </Section>

      <Section title="Treino" action={
        <button type="button" className="text-xs text-accent"
          onClick={() => { if (confirm('Regerar a rotina de treino com as configuracoes atuais?')) dispatch({ type: 'regenerate_training' }) }}>
          regerar
        </button>
      }>
        <Card>
          <Field label="Experiencia">
            <div className="grid grid-cols-3 gap-2">
              {EXPERIENCE_OPTIONS.map((o) => (
                <Chip key={o.id} label={o.label} selected={p.training.experience === o.id}
                  onClick={() => patchTraining({ experience: o.id })} />
              ))}
            </div>
          </Field>
          <Field label="Treinos por semana">
            <Stepper value={p.training.daysPerWeek} min={1} max={6} suffix="x"
              onChange={(v) => patchTraining({ daysPerWeek: v })} />
          </Field>
          <Field label="Minutos por treino">
            <Stepper value={p.training.sessionMinutes} min={15} max={120} suffix="min"
              onChange={(v) => patchTraining({ sessionMinutes: v })} />
          </Field>
          <Field label="Equipamentos">
            <div className="grid grid-cols-2 gap-2">
              {EQUIPMENT_OPTIONS.map((o) => (
                <Chip key={o.id} label={o.label} selected={p.training.equipment.includes(o.id)}
                  onClick={() => patchTraining({ equipment: toggle<Equipment>(p.training.equipment, o.id) })} />
              ))}
            </div>
          </Field>
          <Note>Alterou algo? Toque em regerar para a rotina refletir as mudancas.</Note>
        </Card>
      </Section>

      <Section title="Alimentacao">
        <Card>
          <Field label="Estilo">
            <div className="grid grid-cols-2 gap-2">
              {DIET_OPTIONS.map((o) => (
                <Chip key={o.id} label={o.label} selected={p.nutrition.dietStyle === o.id}
                  onClick={() => patchNutrition({ dietStyle: o.id })} />
              ))}
            </div>
          </Field>
          <Field label="Objetivo alimentar">
            <div className="grid grid-cols-2 gap-2">
              {NUTRITION_GOAL_OPTIONS.map((o) => (
                <Chip key={o.id} label={o.label} selected={p.nutrition.goal === o.id}
                  onClick={() => patchNutrition({ goal: o.id })} />
              ))}
            </div>
          </Field>
          <Field label="Restricoes">
            <div className="grid grid-cols-2 gap-2">
              {RESTRICTION_OPTIONS.map((r) => (
                <Chip key={r} label={RESTRICTION_LABELS[r]} selected={p.nutrition.restrictions.includes(r)}
                  onClick={() => patchNutrition({ restrictions: toggle(p.nutrition.restrictions, r) })} />
              ))}
            </div>
          </Field>
          <Field label="Nao gosto de" hint="Separe por virgula">
            <TextArea rows={2} value={dislikes}
              onChange={(e) => setDislikes(e.target.value)}
              onBlur={() => patchNutrition({ dislikes: dislikes.split(',').map((s) => s.trim()).filter(Boolean) })} />
          </Field>
        </Card>
      </Section>

      <Section title="Rotina e horarios">
        <Card>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Acordo as">
              <Input type="time" value={p.routine.wakeTime} onChange={(e) => patchRoutine({ wakeTime: e.target.value })} />
            </Field>
            <Field label="Durmo as">
              <Input type="time" value={p.routine.sleepTime} onChange={(e) => patchRoutine({ sleepTime: e.target.value })} />
            </Field>
          </div>
          <div className="flex gap-2">
            <Button variant="subtle" full onClick={() => navigate('/rotina/manha')}>Editar manha</Button>
            <Button variant="subtle" full onClick={() => navigate('/rotina/noite')}>Editar noite</Button>
          </div>
        </Card>
      </Section>

      <Section title="Motor">
        <Card>
          <Field label="Foco">
            <div className="grid grid-cols-2 gap-2">
              {MOTOR_OPTIONS.map((o) => (
                <Chip key={o.id} label={o.label} selected={p.motor.focus.includes(o.id)}
                  onClick={() => dispatch({ type: 'update_profile', patch: { motor: { ...p.motor, focus: toggle<MotorCategory>(p.motor.focus, o.id) } } })} />
              ))}
            </div>
          </Field>
          <Field label="Minutos por sessao">
            <Stepper value={p.motor.sessionMinutes} min={4} max={12} suffix="min"
              onChange={(v) => dispatch({ type: 'update_profile', patch: { motor: { ...p.motor, sessionMinutes: v } } })} />
          </Field>
        </Card>
      </Section>

      <Section title="Areas do app" hint="Desligue o que nao faz sentido para voce agora">
        <Card>
          {ALL_MODULES.map((mod) => (
            <div key={mod} className="flex items-center justify-between border-b border-line/60 py-3 last:border-0">
              <span className="text-[15px]">{MODULE_LABELS[mod]}</span>
              <Switch on={p.modules[mod]} onChange={(v) => dispatch({ type: 'set_module', module: mod, enabled: v })} />
            </div>
          ))}
        </Card>
      </Section>

      <Section title="Planos de profissionais" hint="Quando ativos, mandam no seu dia">
        <div className="space-y-2">
          <Card onClick={() => navigate('/planos/nutricao')}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[15px] font-medium">Plano do nutricionista</p>
                <p className="mt-0.5 text-[11px] text-faint">
                  {dieta ? `Ativo: ${dieta.title}` : 'Nenhum plano ativo'}
                </p>
              </div>
              {dieta && <Tag tone="accent">ativo</Tag>}
            </div>
          </Card>
          <Card onClick={() => navigate('/planos/treino')}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[15px] font-medium">Plano do personal</p>
                <p className="mt-0.5 text-[11px] text-faint">
                  {ficha ? `Ativo: ${ficha.title}` : 'Nenhum plano ativo'}
                </p>
              </div>
              {ficha && <Tag tone="accent">ativo</Tag>}
            </div>
          </Card>
        </div>
      </Section>

      <Section title="Conta" hint="Para abrir o mesmo perfil no celular e no computador">
        <Card>
          {conta ? (
            <>
              <p className="text-[11px] uppercase tracking-wide text-faint">Conectado como</p>
              <p className="mt-0.5 truncate text-[15px] font-medium">{conta.email}</p>
              <div className="mt-3">
                <Button variant="subtle" full onClick={sairDaConta}>
                  Sair da conta
                </Button>
              </div>
              <p className="mt-2 text-[11px] leading-snug text-faint">
                Sair envia o que estiver pendente antes de desconectar. Os dados
                desta conta continuam guardados na nuvem.
              </p>
            </>
          ) : authDisponivel() ? (
            <>
              <p className="text-[15px] font-medium">Usando sem conta</p>
              <p className="mt-0.5 text-[12px] leading-snug text-muted">
                Os dados ficam so neste aparelho. Com uma conta, o mesmo perfil
                abre no computador e no celular.
              </p>
              <div className="mt-3">
                <Button
                  full
                  onClick={() => {
                    localStorage.removeItem('sistema-pessoal:sem-conta')
                    window.location.reload()
                  }}
                >
                  Entrar ou criar conta
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-[15px] font-medium">Contas ainda nao ligadas</p>
              <p className="mt-0.5 text-[12px] leading-snug text-muted">
                Tudo funciona normalmente, guardado neste aparelho. Para abrir o
                mesmo perfil no celular e no computador, falta configurar o
                servidor deste app.
              </p>
            </>
          )}
        </Card>
      </Section>

      <Section title="Sincronizacao">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[15px] font-medium">{sync.destino}</p>
              <p className="mt-0.5 text-[12px] leading-snug text-muted">{sync.message}</p>
              {sync.lastSyncedAt && (
                <p className="mt-1 text-[11px] text-faint">
                  Ultimo envio as {new Date(sync.lastSyncedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
            <Tag tone={sync.status === 'sincronizado' ? 'accent' : sync.status === 'erro' ? 'warn' : 'default'}>
              {sync.status}
            </Tag>
          </div>
          <div className="mt-3">
            <Button variant="subtle" full onClick={syncNow} disabled={sync.status === 'enviando'}>
              Sincronizar agora
            </Button>
          </div>
          {sync.destino === 'Este aparelho' && (
            <Note>
              Sem conta conectada, nada sai deste aparelho. Faca backup de vez em
              quando ou entre numa conta para sincronizar.
            </Note>
          )}
        </Card>
      </Section>

      <Section title="Seus dados">
        <div className="space-y-2">
          <Button variant="subtle" full onClick={() => setPinSheet(true)}>
            {state.auth.lockEnabled ? 'Alterar ou remover PIN' : 'Proteger com PIN'}
          </Button>
          <Button variant="subtle" full onClick={() => setBackupSheet(true)}>
            Fazer backup
          </Button>
          <Button variant="subtle" full onClick={() => setDataSheet(true)}>
            Restaurar backup
          </Button>
          <Button
            variant="danger"
            full
            onClick={() => {
              if (confirm('Apagar tudo e recomecar do zero? Nao da para desfazer.')) {
                dispatch({ type: 'reset_all' })
              }
            }}
          >
            Apagar tudo
          </Button>
        </div>
      </Section>

      <p className="pb-4 text-center text-[11px] text-faint">
        Membro desde {new Date(p.createdAt).toLocaleDateString('pt-BR')}
      </p>

      <Sheet open={pinSheet} onClose={() => setPinSheet(false)} title="PIN de acesso">
        <Field label="Quatro digitos" hint="Tranca simples de tela, para uso pessoal.">
          <Input
            type="tel"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="0000"
          />
        </Field>
        <div className="flex gap-3">
          {state.auth.lockEnabled && (
            <Button
              variant="subtle"
              onClick={() => {
                dispatch({ type: 'set_pin', pinHash: null })
                setPinSheet(false)
              }}
            >
              Remover
            </Button>
          )}
          <Button
            full
            disabled={pin.length !== 4}
            onClick={() => {
              dispatch({ type: 'set_pin', pinHash: lightHash(pin) })
              setPin('')
              setPinSheet(false)
            }}
          >
            Salvar PIN
          </Button>
        </div>
      </Sheet>

      <Sheet open={backupSheet} onClose={() => setBackupSheet(false)} title="Backup dos seus dados">
        <Note>
          Copie este texto e guarde onde quiser: notas, e-mail para voce mesmo, o que
          for. Para restaurar, cole em "Restaurar backup".
        </Note>
        <div className="h-3" />
        <TextArea
          readOnly
          rows={6}
          value={exportJSON(state)}
          onFocus={(e) => e.currentTarget.select()}
          className="font-mono text-[11px]"
        />
        <div className="h-3" />
        <Button full onClick={copyBackup}>
          {copied ? 'Copiado' : 'Copiar tudo'}
        </Button>
      </Sheet>

      <Sheet open={dataSheet} onClose={() => setDataSheet(false)} title="Restaurar backup">
        <Field label="Cole aqui o texto do seu backup">
          <TextArea rows={6} value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="{ ... }" />
        </Field>
        <Button full onClick={runImport} disabled={!importText.trim()}>
          Substituir meus dados
        </Button>
      </Sheet>
    </Screen>
  )
}
