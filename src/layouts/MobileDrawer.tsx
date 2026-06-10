import { useState } from 'react'
import { X, Settings, Sun, Moon, User, SlidersHorizontal, LogOut } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { navItems } from './navConfig'
import Logo from '../components/common/Logo'
import { useTheme } from '../contexts/ThemeContext'

interface MobileDrawerProps {
  open: boolean
  onClose: () => void
}

export default function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      {/* Overlay */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`lg:hidden fixed top-0 right-0 h-full z-50 w-[240px] bg-ide-base shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Logo header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-ide-border flex-shrink-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-ide-subtle hover:text-ide-bright hover:bg-ide-hover transition-colors"
          >
            <X size={18} />
          </button>
          <Logo theme="dark" />
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <ul className="space-y-0.5 px-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors ${
                      isActive
                        ? 'bg-ide-active text-ide-bright'
                        : 'text-ide-subtle hover:bg-ide-hover hover:text-ide-text'
                    }`}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom: Settings */}
        <div className="border-t border-ide-border py-2 flex-shrink-0 px-2">
          <button
            onClick={() => setSettingsOpen((v) => !v)}
            className={`w-full flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors ${
              settingsOpen
                ? 'bg-ide-active text-ide-bright'
                : 'text-ide-subtle hover:bg-ide-hover hover:text-ide-text'
            }`}
          >
            <Settings size={18} className="flex-shrink-0" />
            <span className="text-sm font-medium">설정</span>
          </button>

          {settingsOpen && (
            <div className="mt-1 bg-ide-surface rounded-lg border border-ide-border py-1">
              <div className="px-3 pt-1.5 pb-1">
                <p className="text-[10px] font-semibold text-ide-muted uppercase tracking-widest mb-1.5">
                  테마
                </p>
                <button
                  onClick={() => theme !== 'light' && toggleTheme()}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                    theme === 'light'
                      ? 'bg-ide-active text-ide-bright font-medium'
                      : 'text-ide-subtle hover:bg-ide-active hover:text-ide-text'
                  }`}
                >
                  <Sun size={14} />
                  라이트 모드
                </button>
                <button
                  onClick={() => theme !== 'dark' && toggleTheme()}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                    theme === 'dark'
                      ? 'bg-ide-active text-ide-bright font-medium'
                      : 'text-ide-subtle hover:bg-ide-active hover:text-ide-text'
                  }`}
                >
                  <Moon size={14} />
                  다크 모드
                </button>
              </div>
              <div className="border-t border-ide-border my-1" />
              <div className="px-1">
                <button className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm text-ide-subtle hover:bg-ide-active hover:text-ide-text transition-colors">
                  <User size={14} />
                  프로필
                </button>
                <button className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm text-ide-subtle hover:bg-ide-active hover:text-ide-text transition-colors">
                  <SlidersHorizontal size={14} />
                  환경설정
                </button>
              </div>
              <div className="border-t border-ide-border my-1" />
              <div className="px-1">
                <button className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm text-red-400 hover:bg-red-950/40 transition-colors">
                  <LogOut size={14} />
                  로그아웃
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
