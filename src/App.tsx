import { Routes, Route } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { JoinPage } from './pages/JoinPage'
import { CreateRacePage } from './pages/CreateRacePage'
import { LobbyPage } from './pages/LobbyPage'
import { OrganizerLobbyPage } from './pages/OrganizerLobbyPage'
import { OrganizerDashboardPage } from './pages/OrganizerDashboardPage'
import { OrganizerListPage } from './pages/OrganizerListPage'
import { TeamGameView } from './pages/TeamGameView'
import { NotFoundPage } from './pages/NotFoundPage'

import { ProtectedRoute } from './components/auth/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="join" element={<JoinPage />} />
        <Route path="join/:id" element={<JoinPage />} />
        <Route path="race/:id" element={<TeamGameView />} />
        <Route path="lobby/:id" element={<LobbyPage />} />

        {/* Protected Organizer Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="organizer" element={<OrganizerListPage />} />
          <Route path="organizer/new" element={<CreateRacePage />} />
          <Route path="organizer/lobby/:id" element={<OrganizerLobbyPage />} />
          <Route path="organizer/dashboard/:id" element={<OrganizerDashboardPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App
