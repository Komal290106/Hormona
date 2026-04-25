import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import LogDataPage from './pages/LogDataPage'
import RiskSimulatorPage from './pages/RiskSimulatorPage'
import InsightsPage from './pages/InsightsPage'
import ProfilePage from './pages/ProfilePage'

// Simple auth guard — checks localStorage for a userId
function RequireAuth({ children }) {
  const userId = localStorage.getItem('hormonaUserId')
  if (!userId) return <Navigate to="/login" replace />
  return children
}

// Onboarding guard — needs a userId (from signup) but not full auth
// Demo users bypass onboarding and go straight to dashboard
function RequireUserId({ children }) {
  const userId = localStorage.getItem('hormonaUserId')
  if (!userId) return <Navigate to="/signup" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={
          <RequireUserId>
            <OnboardingPage />
          </RequireUserId>
        } />

        {/* Protected routes — need a userId in localStorage */}
        <Route element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/log" element={<LogDataPage />} />
          <Route path="/simulate" element={<RiskSimulatorPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
