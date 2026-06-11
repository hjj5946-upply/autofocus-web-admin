import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  TrendingUp, CheckSquare, FileText, Calendar,
  Pin, Bell, ChevronRight, ArrowUpRight,
  Plane, Home, Briefcase, Users, BarChart2,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskPriority     = 'high' | 'medium' | 'low'
type ApprovalStatus   = 'approved' | 'pending' | 'rejected'
type TeamMemberStatus = 'vacation' | 'business-trip' | 'remote'

interface Task         { id: number; title: string; status: 'todo' | 'in-progress' | 'done'; priority: TaskPriority; due: string }
interface Announcement { id: number; title: string; date: string; pinned: boolean; urgent: boolean }
interface Schedule     { id: number; date: string; day: string; title: string; color: string }
interface Approval     { id: number; title: string; status: ApprovalStatus; date: string }
interface TeamMember   { id: number; name: string; initial: string; status: TeamMemberStatus; statusLabel: string }

// ─── Mock Data ────────────────────────────────────────────────────────────────

const revenueData = [
  { month: '1월', revenue: 42, target: 40 },
  { month: '2월', revenue: 38, target: 40 },
  { month: '3월', revenue: 51, target: 45 },
  { month: '4월', revenue: 47, target: 45 },
  { month: '5월', revenue: 56, target: 50 },
  { month: '6월', revenue: 62, target: 55 },
]

const mockAnnouncements: Announcement[] = [
  { id: 1, title: '[필독] 2026년 하반기 보안 정책 업데이트 안내', date: '06.10', pinned: true, urgent: true },
  { id: 2, title: '[필독] 근태관리 시스템 전면 개편 공지', date: '06.08', pinned: true, urgent: false },
  { id: 3, title: '사내 카페테리아 운영 시간 변경 안내', date: '06.05', pinned: false, urgent: false },
  { id: 4, title: '2026년 하반기 전사 워크샵 일정 공지', date: '06.03', pinned: false, urgent: false },
  { id: 5, title: 'IT 인프라 점검 예정 (6/15 새벽 2~4시)', date: '06.01', pinned: false, urgent: false },
]

const mockSchedules: Schedule[] = [
  { id: 1, date: '11', day: '수', title: '전사 월간 리뷰', color: 'bg-blue-500' },
  { id: 2, date: '13', day: '금', title: '디자인팀 스프린트 데모', color: 'bg-violet-500' },
  { id: 3, date: '20', day: '금', title: '대체공휴일', color: 'bg-red-400' },
  { id: 4, date: '25', day: '수', title: '임원 전략 회의', color: 'bg-slate-400' },
  { id: 5, date: '30', day: '월', title: 'Q2 마감일', color: 'bg-orange-500' },
]

const mockTasks: Task[] = [
  { id: 1, title: '대시보드 UI 컴포넌트 개발', status: 'in-progress', priority: 'high', due: '오늘' },
  { id: 2, title: '디자인 시스템 토큰 정리', status: 'todo', priority: 'medium', due: '내일' },
  { id: 3, title: '주간 업무 보고서 작성', status: 'done', priority: 'low', due: '완료' },
  { id: 4, title: 'API 명세서 검토 및 피드백', status: 'todo', priority: 'high', due: '6/13' },
  { id: 5, title: '팀 주간 회의 자료 준비', status: 'in-progress', priority: 'medium', due: '오늘' },
]

const mockApprovals: Approval[] = [
  { id: 1, title: '연차 신청 (6/20)', status: 'approved', date: '06.09' },
  { id: 2, title: '법인카드 사용 신청', status: 'pending', date: '06.10' },
  { id: 3, title: '재택근무 신청 (6/13)', status: 'rejected', date: '06.08' },
]

const mockTeam: TeamMember[] = [
  { id: 1, name: '김민준', initial: '민', status: 'vacation', statusLabel: '연차' },
  { id: 2, name: '이서연', initial: '서', status: 'business-trip', statusLabel: '출장' },
  { id: 3, name: '박준혁', initial: '준', status: 'remote', statusLabel: '재택' },
  { id: 4, name: '최유진', initial: '유', status: 'remote', statusLabel: '재택' },
]

// ─── Config Maps ──────────────────────────────────────────────────────────────

const priorityConfig: Record<TaskPriority, { bg: string; text: string; label: string }> = {
  high:   { bg: 'bg-red-50 dark:bg-red-500/10',    text: 'text-red-600 dark:text-red-400',     label: '높음' },
  medium: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', label: '중간' },
  low:    { bg: 'bg-slate-100 dark:bg-ide-hover',   text: 'text-slate-500 dark:text-ide-subtle', label: '낮음' },
}

const approvalConfig: Record<ApprovalStatus, { bg: string; text: string; label: string }> = {
  approved: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', label: '승인' },
  pending:  { bg: 'bg-amber-50 dark:bg-amber-500/10',    text: 'text-amber-600 dark:text-amber-400',    label: '대기' },
  rejected: { bg: 'bg-red-50 dark:bg-red-500/10',        text: 'text-red-600 dark:text-red-400',        label: '반려' },
}

const teamStatusConfig: Record<TeamMemberStatus, { bg: string; text: string; ring: string; icon: LucideIcon }> = {
  vacation:        { bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', ring: 'ring-orange-200 dark:ring-orange-500/30', icon: Plane    },
  'business-trip': { bg: 'bg-blue-50 dark:bg-blue-500/10',    text: 'text-blue-600 dark:text-blue-400',    ring: 'ring-blue-200 dark:ring-blue-500/30',    icon: Briefcase },
  remote:          { bg: 'bg-green-50 dark:bg-green-500/10',  text: 'text-green-600 dark:text-green-400',  ring: 'ring-green-200 dark:ring-green-500/30',  icon: Home      },
}

// ─── Summary Cards Data ───────────────────────────────────────────────────────

const summaryCards = [
  { label: '실시간 전사 매출',   value: '50억', sub: '전월 대비 +10.7% ↑', icon: TrendingUp,  iconBg: 'bg-blue-50 dark:bg-blue-500/10',    iconColor: 'text-blue-600 dark:text-blue-400',     subColor: 'text-emerald-600 dark:text-emerald-400' },
  { label: '진행 중인 내 TASK', value: '8',    sub: '오늘 마감 2건 포함',  icon: CheckSquare, iconBg: 'bg-violet-50 dark:bg-violet-500/10', iconColor: 'text-violet-600 dark:text-violet-400', subColor: 'text-orange-500 dark:text-orange-400' },
  { label: '결재 대기 문서',     value: '3',    sub: '최근 업데이트 1시간 전', icon: FileText, iconBg: 'bg-amber-50 dark:bg-amber-500/10',   iconColor: 'text-amber-600 dark:text-amber-400',   subColor: undefined },
  { label: '남은 연차 일수',     value: '12일', sub: '총 15일 중 · 3일 사용', icon: Calendar, iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',iconColor: 'text-emerald-600 dark:text-emerald-400',subColor: undefined },
]

// ─── Sub Components ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-ide-surface border border-gray-200 dark:border-ide-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs font-semibold text-gray-700 dark:text-ide-text mb-1.5">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.dataKey} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="text-[11px] text-gray-500 dark:text-ide-subtle w-8">
            {entry.dataKey === 'revenue' ? '실적' : '목표'}
          </span>
          <span className="text-[11px] font-semibold text-gray-800 dark:text-ide-bright">{entry.value}억</span>
        </div>
      ))}
    </div>
  )
}

function SummaryCard({ label, value, sub, icon: Icon, iconBg, iconColor, subColor }: {
  label: string; value: string; sub: string; icon: LucideIcon
  iconBg: string; iconColor: string; subColor?: string
}) {
  return (
    <div className="gsap-card bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 dark:text-ide-subtle">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon size={15} className={iconColor} />
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-ide-bright leading-none">{value}</p>
      <p className={`text-xs mt-1.5 ${subColor ?? 'text-gray-400 dark:text-ide-muted'}`}>{sub}</p>
    </div>
  )
}

function Card({ title, icon: Icon, children, action }: {
  title: string; icon: LucideIcon; children: ReactNode; action?: ReactNode
}) {
  return (
    <div className="gsap-section bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-ide-border">
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-gray-400 dark:text-ide-subtle" />
          <h2 className="text-sm font-semibold text-gray-800 dark:text-ide-text">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [checkedTasks, setCheckedTasks] = useState<Set<number>>(
    new Set(mockTasks.filter(t => t.status === 'done').map(t => t.id))
  )

  const toggleTask = (id: number) =>
    setCheckedTasks(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.gsap-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
      )
      gsap.fromTo('.gsap-section',
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: 'power2.out', delay: 0.3 }
      )
    }, rootRef)
    return () => ctx.revert()
  }, [])

  const doneCount = checkedTasks.size

  return (
    <div ref={rootRef} className="space-y-5 pb-6">

      {/* Page Header */}
      <div>
        <h1 className="text-lg font-bold text-gray-900 dark:text-ide-bright">대시보드</h1>
        <p className="text-sm text-gray-500 dark:text-ide-subtle mt-0.5">
          2026년 6월 11일 수요일 · AutoFocus Lounge
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map(card => (
          <SummaryCard key={card.label} {...card} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-4">

        {/* ── Left col-span-8 ── */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">

          {/* KPI Chart */}
          <Card
            title="전사 핵심 성과 지표"
            icon={BarChart2}
            action={<span className="text-xs text-gray-400 dark:text-ide-muted">6개월 추이 (억원)</span>}
          >
            <div className="p-4 pt-5">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gTarget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#888" strokeOpacity={0.12} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[30, 70]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="target" stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="5 3" fill="url(#gTarget)" dot={false} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#gRevenue)" dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-5 mt-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 bg-indigo-500 inline-block rounded" />
                  <span className="text-xs text-gray-500 dark:text-ide-subtle">실적</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 inline-block border-t border-dashed border-slate-400" />
                  <span className="text-xs text-gray-500 dark:text-ide-subtle">목표</span>
                </div>
                <div className="ml-auto flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight size={13} />
                  <span className="text-xs font-semibold">전월 대비 +10.7%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Announcements */}
          <Card
            title="공지사항"
            icon={Bell}
            action={
              <button className="flex items-center gap-0.5 text-xs text-gray-400 dark:text-ide-subtle hover:text-gray-600 dark:hover:text-ide-text transition-colors">
                전체 보기 <ChevronRight size={12} />
              </button>
            }
          >
            <ul>
              {mockAnnouncements.map((item, i) => (
                <li
                  key={item.id}
                  className={`flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-ide-hover transition-colors cursor-pointer ${i < mockAnnouncements.length - 1 ? 'border-b border-gray-100 dark:border-ide-border' : ''}`}
                >
                  <div className="w-4 flex items-center justify-center flex-shrink-0">
                    {item.pinned
                      ? <Pin size={12} className={item.urgent ? 'text-red-500 dark:text-red-400' : 'text-amber-500 dark:text-amber-400'} />
                      : <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-ide-border inline-block" />
                    }
                  </div>
                  <span className={`flex-1 text-xs truncate ${item.pinned ? 'font-semibold text-gray-800 dark:text-ide-text' : 'text-gray-600 dark:text-ide-subtle'}`}>
                    {item.title}
                  </span>
                  <span className="text-[11px] text-gray-400 dark:text-ide-muted flex-shrink-0 tabular-nums">{item.date}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Schedule */}
          <Card
            title="전사 주요 일정"
            icon={Calendar}
            action={<span className="text-xs text-gray-400 dark:text-ide-muted">2026년 6월</span>}
          >
            <ul className="p-4 space-y-3">
              {mockSchedules.map(item => (
                <li key={item.id} className="flex items-center gap-3">
                  <div className="w-10 flex-shrink-0 text-center">
                    <span className="text-sm font-bold text-gray-800 dark:text-ide-bright tabular-nums">{item.date}</span>
                    <p className="text-[10px] text-gray-400 dark:text-ide-muted">{item.day}</p>
                  </div>
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${item.color}`} />
                  <span className="text-xs text-gray-700 dark:text-ide-text">{item.title}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* ── Right col-span-4 ── */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">

          {/* My Tasks */}
          <Card
            title="내 작업 목록"
            icon={CheckSquare}
            action={
              <button className="flex items-center gap-0.5 text-xs text-gray-400 dark:text-ide-subtle hover:text-gray-600 dark:hover:text-ide-text transition-colors">
                전체 <ChevronRight size={12} />
              </button>
            }
          >
            <div className="px-4 pt-3 pb-2">
              <div className="flex justify-between text-[11px] text-gray-400 dark:text-ide-muted mb-1.5">
                <span>완료율</span>
                <span>{doneCount} / {mockTasks.length}</span>
              </div>
              <div className="h-1.5 bg-gray-100 dark:bg-ide-hover rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${(doneCount / mockTasks.length) * 100}%` }}
                />
              </div>
            </div>
            <ul className="px-4 pb-4 space-y-2">
              {mockTasks.map(task => {
                const done = checkedTasks.has(task.id)
                const pCfg = priorityConfig[task.priority]
                return (
                  <li
                    key={task.id}
                    className="flex items-start gap-2.5 py-1 cursor-pointer group"
                    onClick={() => toggleTask(task.id)}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-all ${done ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300 dark:border-ide-border group-hover:border-indigo-400'}`}>
                      {done && (
                        <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 text-white" fill="none">
                          <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-snug ${done ? 'line-through text-gray-400 dark:text-ide-muted' : 'text-gray-700 dark:text-ide-text'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${pCfg.bg} ${pCfg.text}`}>
                          {pCfg.label}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-ide-muted">{task.due}</span>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>

          {/* Approvals */}
          <Card title="결재 / 승인 현황" icon={FileText}>
            <ul className="p-4 space-y-2.5">
              {mockApprovals.map(item => {
                const cfg = approvalConfig[item.status]
                return (
                  <li key={item.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 dark:text-ide-text truncate">{item.title}</p>
                      <p className="text-[10px] text-gray-400 dark:text-ide-muted mt-0.5">{item.date}</p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-md flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
                      {cfg.label}
                    </span>
                  </li>
                )
              })}
            </ul>
          </Card>

          {/* Team Status */}
          <Card
            title="우리 팀 현황"
            icon={Users}
            action={<span className="text-[11px] text-gray-400 dark:text-ide-muted">{mockTeam.length}명 부재중</span>}
          >
            <ul className="p-4 space-y-3">
              {mockTeam.map(member => {
                const cfg = teamStatusConfig[member.status]
                const StatusIcon = cfg.icon
                return (
                  <li key={member.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ring-2 ${cfg.ring} flex items-center justify-center flex-shrink-0 bg-gray-100 dark:bg-ide-hover`}>
                      <span className={`text-xs font-semibold ${cfg.text}`}>{member.initial}</span>
                    </div>
                    <span className="flex-1 text-xs font-medium text-gray-800 dark:text-ide-text">{member.name}</span>
                    <div className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md ${cfg.bg} ${cfg.text}`}>
                      <StatusIcon size={10} />
                      <span>{member.statusLabel}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>

        </div>
      </div>
    </div>
  )
}
