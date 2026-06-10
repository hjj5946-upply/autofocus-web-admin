import { useState, useRef, useEffect } from 'react'
import { ChevronsLeft, Settings, Sun, Moon, User, SlidersHorizontal, LogOut } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { navItems } from './navConfig'
import Logo from '../components/common/Logo'
import { useTheme } from '../contexts/ThemeContext'

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토']

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false)
      }
    }
    if (settingsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [settingsOpen])

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const dayStr = DAY_NAMES[now.getDay()] + '요일'
  const timeStr = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })

  return (
    <aside
      className={`hidden lg:flex flex-col bg-ide-base flex-shrink-0 h-screen sticky top-0 transition-[width] duration-200 ease-in-out z-20 ${
        collapsed ? 'w-[72px]' : 'w-60'
      }`}
    >
      {/* Header: logo + collapse toggle */}
      <div
        className={`h-14 flex items-center border-b border-ide-border flex-shrink-0 ${
          collapsed ? 'justify-center px-2' : 'px-4 justify-between'
        }`}
      >
        <Logo collapsed={collapsed} theme="dark" />
        {!collapsed && (
          <button
            onClick={onToggle}
            title="메뉴 접기"
            className="p-1.5 rounded-md text-ide-subtle hover:text-ide-bright hover:bg-ide-hover transition-colors flex-shrink-0"
          >
            <ChevronsLeft size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-md px-2.5 py-2 transition-colors ${
                    collapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-ide-active text-ide-bright'
                      : 'text-ide-subtle hover:bg-ide-hover hover:text-ide-text'
                  }`}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom: Settings + Time */}
      <div className="border-t border-ide-border flex-shrink-0 py-2">
        <div ref={settingsRef} className="relative px-2">
          <div className={`flex items-center gap-1 ${collapsed ? 'justify-center' : ''}`}>
            <button
              onClick={() => setSettingsOpen((v) => !v)}
              title={collapsed ? '설정' : undefined}
              className={`flex items-center gap-2 rounded-md px-2 py-2 transition-colors flex-shrink-0 ${
                settingsOpen
                  ? 'bg-ide-active text-ide-bright'
                  : 'text-ide-subtle hover:bg-ide-hover hover:text-ide-text'
              }`}
            >
              <Settings size={18} className="flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">설정</span>}
            </button>

            {!collapsed && (
              <div className="flex-1 flex flex-col items-end pr-1 overflow-hidden">
                <span className="text-[10px] text-ide-muted leading-none">{dayStr}</span>
                <span className="text-[11px] text-ide-subtle leading-none mt-0.5 tabular-nums">{timeStr}</span>
              </div>
            )}
          </div>

          {/* Settings popover */}
          {settingsOpen && (
            <div
              className={`absolute z-50 bottom-full mb-2 bg-white dark:bg-ide-surface border border-gray-200 dark:border-ide-border rounded-lg shadow-xl py-1 min-w-[200px] ${
                collapsed ? 'left-full ml-2 bottom-0' : 'left-0 right-0'
              }`}
            >
              <div className="px-3 pt-2 pb-1">
                <p className="text-[10px] font-semibold text-gray-400 dark:text-ide-muted uppercase tracking-widest mb-1.5">
                  테마
                </p>
                <button
                  onClick={() => theme !== 'light' && toggleTheme()}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                    theme === 'light'
                      ? 'bg-gray-100 dark:bg-ide-active text-gray-900 dark:text-ide-bright font-medium'
                      : 'text-gray-500 dark:text-ide-subtle hover:bg-gray-100 dark:hover:bg-ide-active hover:text-gray-900 dark:hover:text-ide-text'
                  }`}
                >
                  <Sun size={14} />
                  라이트 모드
                </button>
                <button
                  onClick={() => theme !== 'dark' && toggleTheme()}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-100 dark:bg-ide-active text-gray-900 dark:text-ide-bright font-medium'
                      : 'text-gray-500 dark:text-ide-subtle hover:bg-gray-100 dark:hover:bg-ide-active hover:text-gray-900 dark:hover:text-ide-text'
                  }`}
                >
                  <Moon size={14} />
                  다크 모드
                </button>
              </div>

              <div className="border-t border-gray-100 dark:border-ide-border my-1" />

              <div className="px-1">
                <button className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm text-gray-600 dark:text-ide-text hover:bg-gray-100 dark:hover:bg-ide-active transition-colors">
                  <User size={14} />
                  프로필
                </button>
                <button className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm text-gray-600 dark:text-ide-text hover:bg-gray-100 dark:hover:bg-ide-active transition-colors">
                  <SlidersHorizontal size={14} />
                  환경설정
                </button>
              </div>

              <div className="border-t border-gray-100 dark:border-ide-border my-1" />

              <div className="px-1">
                <button className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors">
                  <LogOut size={14} />
                  로그아웃
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
