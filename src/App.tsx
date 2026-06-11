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
import { Clock } from 'lucide-react'

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-ide-hover flex items-center justify-center mb-4">
        <Clock size={20} className="text-gray-400 dark:text-ide-muted" />
      </div>
      <p className="text-base font-semibold text-gray-600 dark:text-ide-text">{title}</p>
      <p className="text-sm text-gray-400 dark:text-ide-muted mt-1">페이지 개발 중입니다.</p>
    </div>
  )
}

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
      <Route path="/teams"      element={withLayout(<ComingSoon title="팀 관리" />)} />
      <Route path="/hr"         element={withLayout(<ComingSoon title="인사 관리" />)} />
      <Route path="/settings"   element={withLayout(<ComingSoon title="시스템 설정" />)} />

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
