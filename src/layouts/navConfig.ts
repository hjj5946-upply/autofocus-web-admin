import {
  LayoutDashboard,
  Coffee,
  CalendarClock,
  Network,
  FolderOpen,
  UsersRound,
  UserCog,
  Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  icon: LucideIcon
  label: string
  href: string
}

export const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: '대시보드',    href: '/dashboard' },
  { icon: Coffee,          label: '사내 라운지', href: '/lounge' },
  { icon: CalendarClock,   label: '근태/휴가',   href: '/attendance' },
  { icon: Network,         label: '조직도',      href: '/org-chart' },
  { icon: FolderOpen,      label: '문서 자료실', href: '/documents' },
  { icon: UsersRound,      label: '팀 관리',     href: '/teams' },
  { icon: UserCog,         label: '인사 관리',   href: '/hr' },
  { icon: Settings,        label: '시스템 설정', href: '/settings' },
]
