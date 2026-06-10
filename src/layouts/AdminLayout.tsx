import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import MobileDrawer from './MobileDrawer'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-ide-deep overflow-hidden">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          onMobileMenuToggle={() => setMobileMenuOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          onSidebarExpand={() => setSidebarCollapsed(false)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      <MobileDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </div>
  )
}
