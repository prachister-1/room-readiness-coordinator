import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { StoreProvider } from './state/Store'
import { AppShell } from './components/layout/AppShell'
import { ArrivalReadiness } from './pages/ArrivalReadiness'
import { Housekeeping } from './pages/Housekeeping'
import { Rooms } from './pages/Rooms'
import { GuestMessages } from './pages/GuestMessages'
import { Analytics } from './pages/Analytics'
import { Settings } from './pages/Settings'
import { AgentOrchestration } from './pages/AgentOrchestration'
import { Playbooks } from './pages/Playbooks'
import { Policies } from './pages/Policies'
import { DecisionInbox } from './pages/DecisionInbox'
import { ShiftHandover } from './pages/ShiftHandover'

export default function App() {
  return (
    <StoreProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<ArrivalReadiness />} />
            <Route path="/inbox" element={<DecisionInbox />} />
            <Route path="/orchestration" element={<AgentOrchestration />} />
            <Route path="/playbooks" element={<Playbooks />} />
            <Route path="/handover" element={<ShiftHandover />} />
            <Route path="/policies" element={<Policies />} />
            <Route path="/housekeeping" element={<Housekeeping />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/messages" element={<GuestMessages />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </StoreProvider>
  )
}
