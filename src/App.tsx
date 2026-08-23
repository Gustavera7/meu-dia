import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useApp } from '@/state/useApp'
import { TabBar } from '@/ui/components/Layout'
import { PrumoSplash } from '@/ui/components/Prumo'
import Onboarding from '@/ui/screens/Onboarding'
import Auth from '@/ui/screens/Auth'
import { authDisponivel } from '@/data/auth'
import Lock from '@/ui/screens/Lock'
import Dashboard from '@/ui/screens/Dashboard'
import Training from '@/ui/screens/Training'
import Nutrition from '@/ui/screens/Nutrition'
import Motor from '@/ui/screens/Motor'
import Habits from '@/ui/screens/Habits'
import Reading from '@/ui/screens/Reading'
import RoutineScreen from '@/ui/screens/RoutineScreen'
import CheckIn from '@/ui/screens/CheckIn'
import Tomorrow from '@/ui/screens/Tomorrow'
import Pillars from '@/ui/screens/Pillars'
import Profile from '@/ui/screens/Profile'
import More from '@/ui/screens/More'
import Goals from '@/ui/screens/Goals'
import Report from '@/ui/screens/Report'
import Prescriptions from '@/ui/screens/Prescriptions'

/** Rotas que mostram a barra inferior. */
const ROOT_ROUTES = ['/', '/treino', '/nutricao', '/motor', '/mais']

const SEM_CONTA = 'sistema-pessoal:sem-conta'

export default function App() {
  const { state, conta, authPronto } = useApp()
  const location = useLocation()
  const [unlocked, setUnlocked] = useState(!state.auth.lockEnabled)
  const [semConta, setSemConta] = useState(() => localStorage.getItem(SEM_CONTA) === '1')

  // Entrar numa conta desfaz a escolha de usar sem login: sair depois
  // devolve a tela de acesso em vez de cair num perfil vazio.
  useEffect(() => {
    if (!conta) return
    localStorage.removeItem(SEM_CONTA)
    setSemConta(false)
  }, [conta])

  // Esperar a sessao evita mostrar login para quem ja esta conectado.
  if (!authPronto) return <PrumoSplash />

  if (authDisponivel() && !conta && !semConta) {
    return (
      <Auth
        onSkip={() => {
          localStorage.setItem(SEM_CONTA, '1')
          setSemConta(true)
        }}
      />
    )
  }

  if (!state.onboarded) return <Onboarding />
  if (state.auth.lockEnabled && !unlocked) return <Lock onUnlock={() => setUnlocked(true)} />

  const showTabs = ROOT_ROUTES.includes(location.pathname)

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/treino" element={<Training />} />
        <Route path="/nutricao" element={<Nutrition />} />
        <Route path="/motor" element={<Motor />} />
        <Route path="/habitos" element={<Habits />} />
        <Route path="/leitura" element={<Reading />} />
        <Route path="/rotina/:kind" element={<RoutineScreen />} />
        <Route path="/checkin" element={<CheckIn />} />
        <Route path="/amanha" element={<Tomorrow />} />
        <Route path="/pilares" element={<Pillars />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/mais" element={<More />} />
        <Route path="/metas" element={<Goals />} />
        <Route path="/relatorio" element={<Report />} />
        <Route path="/planos/:kind" element={<Prescriptions />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {showTabs && <TabBar />}
    </>
  )
}
