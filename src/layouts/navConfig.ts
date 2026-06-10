import {
  LayoutDashboard,
  Users,
  TrendingUp,
  FolderOpen,
  UserCircle,
  Archive,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  icon: LucideIcon
  label: string
  href: string
}

export const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: '대시보드', href: '/dashboard' },
  { icon: Users,           label: '연락처',    href: '/contacts' },
  { icon: TrendingUp,      label: 'CRM',       href: '/crm' },
  { icon: FolderOpen,      label: '프로젝트',  href: '/projects' },
  { icon: UserCircle,      label: '직원관리',  href: '/employees' },
  { icon: Archive,         label: '자산관리',  href: '/assets' },
]
