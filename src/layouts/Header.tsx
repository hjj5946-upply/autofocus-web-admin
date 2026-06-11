import { Menu, ChevronsRight } from 'lucide-react'

interface HeaderProps {
  onMobileMenuToggle: () => void
  sidebarCollapsed?: boolean
  onSidebarExpand?: () => void
}

export default function Header({ onMobileMenuToggle, sidebarCollapsed, onSidebarExpand }: HeaderProps) {
  return (
    <header className="h-14 border-b border-gray-200 dark:border-ide-border bg-white dark:bg-ide-base flex items-center justify-between px-4 flex-shrink-0 z-10">
      {/* Left: expand button (collapsed only) + system name */}
      <div className="flex items-center gap-2">
        {sidebarCollapsed && (
          <button
            onClick={onSidebarExpand}
            title="메뉴 펼치기"
            className="hidden lg:flex p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:text-ide-subtle dark:hover:text-ide-text dark:hover:bg-ide-hover transition-colors flex-shrink-0"
          >
            <ChevronsRight size={16} />
          </button>
        )}
        <h1 className="text-md font-semibold text-gray-900 dark:text-ide-bright leading-none">
          AutoFocus Lounge
        </h1>
      </div>

      {/* Right: user info + mobile toggle */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-slate-800 dark:bg-ide-active flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
          관
        </div>
        <div className="hidden sm:block leading-tight">
          <p className="text-sm font-medium text-gray-900 dark:text-ide-text">관리자</p>
          <p className="text-xs text-gray-500 dark:text-ide-subtle">admin@autofocus.co.kr</p>
        </div>
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-ide-subtle dark:hover:text-ide-text dark:hover:bg-ide-hover transition-colors ml-1"
        >
          <Menu size={20} />
        </button>
      </div>
    </header>
  )
}
