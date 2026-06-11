import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import AdminLayout from './layouts/AdminLayout'
import DashboardPage from './pages/DashboardPage'
import LoungePage from './pages/LoungePage'
import AttendancePage from './pages/AttendancePage'
import OrgChartPage from './pages/OrgChartPage'
import DocumentsPage from './pages/DocumentsPage'
import TeamsPage from './pages/TeamsPage'
import HRPage from './pages/HRPage'
import CustomersPage from './pages/CustomersPage'
import SettingsPage from './pages/SettingsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function withLayout(node: React.ReactNode) {
  return (
    <ProtectedRoute>
      <AdminLayout>{node}</AdminLayout>
    </ProtectedRoute>
  )
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      <Route path="/login"    element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

      <Route path="/dashboard"  element={withLayout(<DashboardPage />)} />
      <Route path="/lounge"     element={withLayout(<LoungePage />)} />
      <Route path="/attendance" element={withLayout(<AttendancePage />)} />
      <Route path="/org-chart"  element={withLayout(<OrgChartPage />)} />
      <Route path="/documents"  element={withLayout(<DocumentsPage />)} />
      <Route path="/teams"      element={withLayout(<TeamsPage />)} />
      <Route path="/hr"         element={withLayout(<HRPage />)} />
      <Route path="/customers"  element={withLayout(<CustomersPage />)} />
      <Route path="/settings"   element={withLayout(<SettingsPage />)} />

      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter basename="/autofocus-web-admin">
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
