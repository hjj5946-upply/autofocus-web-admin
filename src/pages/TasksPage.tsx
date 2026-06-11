import { useEffect, useRef, useState, useMemo } from 'react'
import gsap from 'gsap'
import {
  ClipboardList, Plus, LayoutGrid, List, Search,
  Calendar, MessageCircle, X, ChevronDown, Tag,
  CheckCircle2, Clock, Eye, AlertCircle, ArrowUp,
  Minus, ArrowDown, Trash2, User,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskStatus   = 'todo' | 'inprogress' | 'review' | 'done'
type TaskPriority = 'urgent' | 'high' | 'medium' | 'low'
type MemberRole   = 'admin' | 'lead' | 'member'
type ViewMode     = 'kanban' | 'list'

interface Member {
  id: string
  name: string
  dept: string
  initial: string
  color: string
  role: MemberRole
}

interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string
  creatorId: string
  tag: string
  dueDate: string
  createdAt: string
  comments: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRENT_USER_ID = 'user-001'

const MEMBERS: Member[] = [
  { id: 'user-001', name: '관리자', dept: '관리팀',   initial: '관', color: 'bg-slate-600',   role: 'admin' },
  { id: 'user-002', name: '김민준', dept: '디자인팀', initial: '민', color: 'bg-emerald-500', role: 'member' },
  { id: 'user-003', name: '이서연', dept: '개발팀',   initial: '서', color: 'bg-violet-500',  role: 'lead' },
  { id: 'user-004', name: '박준혁', dept: '개발팀',   initial: '준', color: 'bg-cyan-500',    role: 'member' },
  { id: 'user-005', name: '최유진', dept: '기획팀',   initial: '유', color: 'bg-rose-500',    role: 'lead' },
  { id: 'user-006', name: '한지우', dept: '개발팀',   initial: '지', color: 'bg-orange-500',  role: 'member' },
  { id: 'user-007', name: '정재원', dept: '마케팅팀', initial: '재', color: 'bg-blue-500',    role: 'member' },
]

const STATUS_CONFIG: Record<TaskStatus, {
  label: string; icon: React.ReactNode
  ring: string; bg: string; text: string; dot: string
}> = {
  todo:       { label: '대기중', icon: <Clock size={12} />,        ring: 'ring-gray-300 dark:ring-gray-600',    bg: 'bg-gray-50 dark:bg-gray-800/40',      text: 'text-gray-600 dark:text-gray-400',    dot: 'bg-gray-400' },
  inprogress: { label: '진행중', icon: <AlertCircle size={12} />,  ring: 'ring-blue-300 dark:ring-blue-600/60', bg: 'bg-blue-50/60 dark:bg-blue-500/10',   text: 'text-blue-600 dark:text-blue-400',    dot: 'bg-blue-500' },
  review:     { label: '검토중', icon: <Eye size={12} />,          ring: 'ring-amber-300 dark:ring-amber-600/60', bg: 'bg-amber-50/60 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400',  dot: 'bg-amber-500' },
  done:       { label: '완료',   icon: <CheckCircle2 size={12} />, ring: 'ring-emerald-300 dark:ring-emerald-600/60', bg: 'bg-emerald-50/60 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
}

const PRIORITY_CONFIG: Record<TaskPriority, {
  label: string; icon: React.ReactNode; badge: string; text: string
}> = {
  urgent: { label: '긴급', icon: <AlertCircle size={11} />, badge: 'bg-red-50 dark:bg-red-950/40',    text: 'text-red-600 dark:text-red-400' },
  high:   { label: '높음', icon: <ArrowUp size={11} />,     badge: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-600 dark:text-orange-400' },
  medium: { label: '보통', icon: <Minus size={11} />,        badge: 'bg-blue-50 dark:bg-blue-950/40',   text: 'text-blue-600 dark:text-blue-400' },
  low:    { label: '낮음', icon: <ArrowDown size={11} />,    badge: 'bg-gray-100 dark:bg-gray-800',     text: 'text-gray-500 dark:text-gray-400' },
}

const STATUS_ORDER: TaskStatus[] = ['todo', 'inprogress', 'review', 'done']

const TAGS = ['플랫폼 개발', '마케팅 캠페인', '디자인 시스템', '인프라', '기획', '운영', '고객지원']

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_TASKS: Task[] = [
  { id: 't1',  title: '결제 API 통합 구현',         description: 'PG사 결제 API를 백엔드에 연동하고 웹훅 처리 로직을 구현합니다. 테스트 환경과 운영 환경 분리 필요.',             status: 'todo',       priority: 'urgent', assigneeId: 'user-003', creatorId: 'user-001', tag: '플랫폼 개발',   dueDate: '2026-07-05', createdAt: '2026-06-09', comments: 3 },
  { id: 't2',  title: '신규 온보딩 플로우 UX 설계', description: '신규 사용자 온보딩 경험 개선을 위한 UX 플로우 설계. 와이어프레임 작성 후 개발팀과 리뷰 세션 진행.',             status: 'todo',       priority: 'high',   assigneeId: 'user-002', creatorId: 'user-005', tag: '디자인 시스템', dueDate: '2026-07-10', createdAt: '2026-06-10', comments: 1 },
  { id: 't3',  title: '서버 모니터링 대시보드 구축', description: 'Grafana 기반 서버 리소스 모니터링 대시보드 구축. CPU, 메모리, 디스크, 네트워크 지표 포함.',                   status: 'todo',       priority: 'medium', assigneeId: 'user-004', creatorId: 'user-001', tag: '인프라',        dueDate: '2026-07-15', createdAt: '2026-06-10', comments: 0 },
  { id: 't4',  title: '하반기 마케팅 전략 수립',    description: '2026년 하반기 디지털 마케팅 전략 수립. 채널별 예산 배분, KPI 설정, 월별 실행 계획 포함.',                       status: 'todo',       priority: 'medium', assigneeId: 'user-007', creatorId: 'user-005', tag: '마케팅 캠페인', dueDate: '2026-06-30', createdAt: '2026-06-08', comments: 2 },
  { id: 't5',  title: '관리자 포털 권한 시스템 개선', description: '역할 기반 접근 제어(RBAC) 시스템 개선. 세분화된 권한 관리 및 감사 로그 기능 추가.',                           status: 'inprogress', priority: 'urgent', assigneeId: 'user-003', creatorId: 'user-001', tag: '플랫폼 개발',   dueDate: '2026-06-20', createdAt: '2026-06-03', comments: 7 },
  { id: 't6',  title: 'CRM 고객 세그먼트 필터 UI',  description: '고객 관리 화면에 다중 조건 세그먼트 필터 기능 추가. 저장된 필터 프리셋 기능 포함.',                             status: 'inprogress', priority: 'high',   assigneeId: 'user-004', creatorId: 'user-001', tag: '플랫폼 개발',   dueDate: '2026-06-25', createdAt: '2026-06-05', comments: 4 },
  { id: 't7',  title: '컴포넌트 라이브러리 문서화',  description: '공통 UI 컴포넌트 스토리북 문서화. 각 컴포넌트의 Props, 사용 예시, 접근성 가이드 포함.',                          status: 'inprogress', priority: 'medium', assigneeId: 'user-002', creatorId: 'user-005', tag: '디자인 시스템', dueDate: '2026-07-01', createdAt: '2026-06-07', comments: 2 },
  { id: 't8',  title: '고객 지원 FAQ 페이지 기획',  description: '자주 묻는 질문 페이지 기획 및 콘텐츠 작성. 카테고리별 분류, 검색 기능 포함.',                                   status: 'inprogress', priority: 'low',    assigneeId: 'user-005', creatorId: 'user-001', tag: '고객지원',      dueDate: '2026-07-08', createdAt: '2026-06-06', comments: 1 },
  { id: 't9',  title: '로그인 보안 강화 (2FA)',      description: 'TOTP 기반 2단계 인증 구현. 앱 인증, SMS 인증 지원. 복구 코드 발급 기능 포함.',                                 status: 'review',     priority: 'urgent', assigneeId: 'user-006', creatorId: 'user-001', tag: '인프라',        dueDate: '2026-06-15', createdAt: '2026-05-28', comments: 9 },
  { id: 't10', title: '성과 평가 화면 설계',         description: '반기별 직무 역량 평가 화면 설계. 평가 항목 입력, 자기평가/상호평가 워크플로 포함.',                               status: 'review',     priority: 'high',   assigneeId: 'user-002', creatorId: 'user-005', tag: '기획',          dueDate: '2026-06-18', createdAt: '2026-06-01', comments: 5 },
  { id: 't11', title: '이메일 알림 템플릿 정비',     description: '전사 발송 이메일 템플릿 통일화. 브랜드 가이드 적용, 다크모드 지원, 모바일 최적화.',                              status: 'done',       priority: 'medium', assigneeId: 'user-002', creatorId: 'user-001', tag: '운영',          dueDate: '2026-06-10', createdAt: '2026-05-25', comments: 3 },
  { id: 't12', title: 'DB 인덱스 최적화',            description: '쿼리 분석을 통한 슬로우 쿼리 개선. 주요 테이블 인덱스 전략 재수립 및 적용.',                                     status: 'done',       priority: 'high',   assigneeId: 'user-006', creatorId: 'user-001', tag: '인프라',        dueDate: '2026-06-08', createdAt: '2026-05-22', comments: 6 },
  { id: 't13', title: '팀 온보딩 체크리스트 작성',   description: '신규 팀원 온보딩을 위한 체크리스트 문서 작성. 각 팀별 필수 세팅 및 업무 가이드 포함.',                           status: 'done',       priority: 'low',    assigneeId: 'user-005', creatorId: 'user-001', tag: '운영',          dueDate: '2026-06-05', createdAt: '2026-05-20', comments: 2 },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function memberById(id: string) {
  return MEMBERS.find(m => m.id === id) ?? MEMBERS[0]
}

function canManage(userId: string) {
  const m = memberById(userId)
  return m.role === 'admin' || m.role === 'lead'
}

function canChangeStatus(task: Task, userId: string) {
  const m = memberById(userId)
  return m.role === 'admin' || task.assigneeId === userId
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ member, size = 'sm' }: { member: Member; size?: 'xs' | 'sm' | 'md' }) {
  const sizes = { xs: 'w-5 h-5 text-[9px]', sm: 'w-6 h-6 text-[10px]', md: 'w-7 h-7 text-xs' }
  return (
    <div className={`${sizes[size]} rounded-full ${member.color} flex items-center justify-center flex-shrink-0`}>
      <span className="font-bold text-white">{member.initial}</span>
    </div>
  )
}

// ─── Priority Badge ───────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const cfg = PRIORITY_CONFIG[priority]
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold ${cfg.badge} ${cfg.text}`}>
      {cfg.icon}{cfg.label}
    </span>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: TaskStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ring-1 ${cfg.ring} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ─── Task Card (Kanban) ───────────────────────────────────────────────────────

function TaskCard({ task, onClick, onDragStart }: {
  task: Task
  onClick: () => void
  onDragStart: () => void
}) {
  const assignee = memberById(task.assigneeId)
  const isOverdue = task.status !== 'done' && new Date(task.dueDate) < new Date()

  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart() }}
      onClick={onClick}
      className="bg-white dark:bg-ide-surface border border-gray-200 dark:border-ide-border rounded-lg p-3
        hover:border-gray-300 dark:hover:border-ide-active hover:shadow-sm transition-all cursor-pointer
        active:opacity-70 select-none"
    >
      {/* Top: priority + tag */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <PriorityBadge priority={task.priority} />
        <span className="text-[10px] text-gray-400 dark:text-ide-muted bg-gray-50 dark:bg-ide-hover
          px-1.5 py-0.5 rounded truncate max-w-[80px]">
          {task.tag}
        </span>
      </div>

      {/* Title */}
      <p className="text-xs font-semibold text-gray-800 dark:text-ide-text leading-snug mb-1 line-clamp-2">
        {task.title}
      </p>

      {/* Description preview */}
      <p className="text-[11px] text-gray-400 dark:text-ide-muted line-clamp-1 mb-3 leading-relaxed">
        {task.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Avatar member={assignee} size="xs" />
          <span className="text-[11px] text-gray-500 dark:text-ide-subtle">{assignee.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {task.comments > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-gray-400 dark:text-ide-muted">
              <MessageCircle size={10} />{task.comments}
            </span>
          )}
          <span className={`flex items-center gap-0.5 text-[10px] ${isOverdue ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-ide-muted'}`}>
            <Calendar size={10} />
            {task.dueDate.slice(5).replace('-', '/')}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Task Detail / Edit Modal ─────────────────────────────────────────────────

function TaskDetailModal({ task, onClose, onStatusChange, onDelete }: {
  task: Task
  onClose: () => void
  onStatusChange: (id: string, status: TaskStatus) => void
  onDelete: (id: string) => void
}) {
  const assignee = memberById(task.assigneeId)
  const creator  = memberById(task.creatorId)
  const canEdit  = canManage(CURRENT_USER_ID)
  const canStat  = canChangeStatus(task, CURRENT_USER_ID)
  const isOverdue = task.status !== 'done' && new Date(task.dueDate) < new Date()

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-white dark:bg-ide-surface border border-gray-200 dark:border-ide-border
          rounded-xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-ide-border flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
            <span className="text-[11px] text-gray-400 dark:text-ide-muted bg-gray-50 dark:bg-ide-hover px-1.5 py-0.5 rounded">
              {task.tag}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-ide-hover transition-colors flex-shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-ide-bright leading-snug">{task.title}</h2>
          <p className="text-xs text-gray-600 dark:text-ide-subtle leading-relaxed whitespace-pre-wrap">{task.description}</p>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-3 border-t border-gray-100 dark:border-ide-border text-xs">
            {[
              ['담당자', <div key="a" className="flex items-center gap-1.5"><Avatar member={assignee} size="xs" /><span className="text-gray-700 dark:text-ide-text">{assignee.name}</span><span className="text-gray-400 dark:text-ide-muted">({assignee.dept})</span></div>],
              ['생성자', <div key="c" className="flex items-center gap-1.5"><Avatar member={creator} size="xs" /><span className="text-gray-700 dark:text-ide-text">{creator.name}</span></div>],
              ['마감일', <span key="d" className={isOverdue ? 'text-red-500 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-ide-text'}>{task.dueDate}</span>],
              ['등록일', <span key="e" className="text-gray-700 dark:text-ide-text">{task.createdAt}</span>],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex flex-col gap-1">
                <span className="text-[11px] text-gray-400 dark:text-ide-muted">{label}</span>
                <div>{value}</div>
              </div>
            ))}
          </div>

          {/* Status Change */}
          {canStat && (
            <div className="pt-3 border-t border-gray-100 dark:border-ide-border">
              <p className="text-[11px] font-medium text-gray-500 dark:text-ide-subtle mb-2">상태 변경</p>
              <div className="flex gap-2 flex-wrap">
                {STATUS_ORDER.map(s => {
                  const cfg = STATUS_CONFIG[s]
                  const active = task.status === s
                  return (
                    <button
                      key={s}
                      onClick={() => onStatusChange(task.id, s)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                        ring-1 ${cfg.ring}
                        ${active
                          ? `${cfg.bg} ${cfg.text} shadow-sm`
                          : 'text-gray-400 dark:text-ide-muted hover:bg-gray-50 dark:hover:bg-ide-hover ring-transparent hover:ring-gray-200 dark:hover:ring-ide-border'
                        }`}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {canEdit && (
          <div className="px-5 pb-5 flex justify-end border-t border-gray-100 dark:border-ide-border pt-4">
            <button
              onClick={() => { onDelete(task.id); onClose() }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg text-red-500
                hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <Trash2 size={13} />작업 삭제
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Task Create Modal ────────────────────────────────────────────────────────

function TaskCreateModal({ onClose, onSubmit }: {
  onClose: () => void
  onSubmit: (task: Task) => void
}) {
  const [title,      setTitle]      = useState('')
  const [desc,       setDesc]       = useState('')
  const [priority,   setPriority]   = useState<TaskPriority>('medium')
  const [assigneeId, setAssigneeId] = useState(MEMBERS[1].id)
  const [tag,        setTag]        = useState(TAGS[0])
  const [dueDate,    setDueDate]    = useState('')

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  function handleSubmit() {
    if (!title.trim() || !dueDate) return
    onSubmit({
      id: `t${Date.now()}`,
      title: title.trim(),
      description: desc.trim(),
      status: 'todo',
      priority,
      assigneeId,
      creatorId: CURRENT_USER_ID,
      tag,
      dueDate,
      createdAt: new Date().toISOString().split('T')[0],
      comments: 0,
    })
    onClose()
  }

  const canSubmit = title.trim() && dueDate

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-white dark:bg-ide-surface border border-gray-200 dark:border-ide-border
          rounded-xl shadow-2xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-ide-border">
          <div className="flex items-center gap-2">
            <Plus size={15} className="text-slate-600 dark:text-ide-text" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-ide-bright">작업 생성</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-ide-hover transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-ide-subtle mb-1">
              작업명 <span className="text-red-400">*</span>
            </label>
            <input
              type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="작업 제목을 입력하세요"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-ide-border
                bg-white dark:bg-ide-base text-gray-900 dark:text-ide-text placeholder-gray-400 dark:placeholder-ide-muted
                focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-ide-subtle mb-1">설명</label>
            <textarea
              rows={3} value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="작업 내용 및 요구사항을 입력하세요"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-ide-border
                bg-white dark:bg-ide-base text-gray-900 dark:text-ide-text placeholder-gray-400 dark:placeholder-ide-muted
                resize-none focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
            />
          </div>

          {/* Priority + Tag */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-ide-subtle mb-1">우선순위</label>
              <select
                value={priority} onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-ide-border
                  bg-white dark:bg-ide-base text-gray-900 dark:text-ide-text
                  focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
              >
                {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map(p => (
                  <option key={p} value={p}>{PRIORITY_CONFIG[p].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-ide-subtle mb-1">태그 / 프로젝트</label>
              <select
                value={tag} onChange={e => setTag(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-ide-border
                  bg-white dark:bg-ide-base text-gray-900 dark:text-ide-text
                  focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
              >
                {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Assignee + Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-ide-subtle mb-1">
                담당자 <span className="text-red-400">*</span>
              </label>
              <select
                value={assigneeId} onChange={e => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-ide-border
                  bg-white dark:bg-ide-base text-gray-900 dark:text-ide-text
                  focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
              >
                {MEMBERS.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.dept})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-ide-subtle mb-1">
                마감일 <span className="text-red-400">*</span>
              </label>
              <input
                type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-ide-border
                  bg-white dark:bg-ide-base text-gray-900 dark:text-ide-text
                  focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
              />
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-ide-border text-gray-600 dark:text-ide-text hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors">
            취소
          </button>
          <button
            onClick={handleSubmit} disabled={!canSubmit}
            className="px-4 py-2 text-sm rounded-lg bg-slate-800 dark:bg-ide-active text-white
              hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors flex items-center gap-1.5
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={14} />작업 생성
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

function KanbanColumn({ status, tasks, onCardClick, onDragStart, onDrop }: {
  status: TaskStatus
  tasks: Task[]
  onCardClick: (task: Task) => void
  onDragStart: (taskId: string) => void
  onDrop: (status: TaskStatus) => void
}) {
  const [dragOver, setDragOver] = useState(false)
  const cfg = STATUS_CONFIG[status]

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={() => { setDragOver(false); onDrop(status) }}
      className={`flex flex-col min-w-[260px] flex-1 rounded-xl transition-colors
        ${dragOver ? 'bg-slate-100 dark:bg-ide-hover' : 'bg-gray-50 dark:bg-ide-base/60'}`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          <span className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</span>
        </div>
        <span className="text-[11px] font-semibold text-gray-400 dark:text-ide-muted bg-white dark:bg-ide-surface
          px-1.5 py-0.5 rounded-md border border-gray-200 dark:border-ide-border tabular-nums">
          {tasks.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 px-3 pb-3 flex-1 min-h-[120px]">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onCardClick(task)}
            onDragStart={() => onDragStart(task.id)}
          />
        ))}
        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center min-h-[80px]">
            <p className="text-[11px] text-gray-300 dark:text-ide-border">작업 없음</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const pageRef = useRef<HTMLDivElement>(null)

  const [tasks,        setTasks]        = useState<Task[]>(INITIAL_TASKS)
  const [view,         setView]         = useState<ViewMode>('kanban')
  const [search,       setSearch]       = useState('')
  const [filterMember, setFilterMember] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterTag,    setFilterTag]    = useState('all')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showCreate,   setShowCreate]   = useState(false)
  const [draggingId,   setDraggingId]   = useState<string | null>(null)
  const [memberOpen,   setMemberOpen]   = useState(false)
  const [priorityOpen, setPriorityOpen] = useState(false)
  const [tagOpen,      setTagOpen]      = useState(false)

  const isAdmin = canManage(CURRENT_USER_ID)

  useEffect(() => {
    if (!pageRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(pageRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      )
    })
    return () => ctx.revert()
  }, [])

  const filtered = useMemo(() => {
    let list = tasks
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
    }
    if (filterMember  !== 'all') list = list.filter(t => t.assigneeId === filterMember)
    if (filterPriority !== 'all') list = list.filter(t => t.priority === filterPriority)
    if (filterTag     !== 'all') list = list.filter(t => t.tag === filterTag)
    return list
  }, [tasks, search, filterMember, filterPriority, filterTag])

  function tasksByStatus(s: TaskStatus) {
    return filtered.filter(t => t.status === s)
  }

  function handleDrop(targetStatus: TaskStatus) {
    if (!draggingId) return
    setTasks(prev => prev.map(t => t.id === draggingId ? { ...t, status: targetStatus } : t))
    setDraggingId(null)
  }

  function handleStatusChange(id: string, status: TaskStatus) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    if (selectedTask?.id === id) setSelectedTask(prev => prev ? { ...prev, status } : prev)
  }

  function handleDelete(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  function handleCreate(task: Task) {
    setTasks(prev => [task, ...prev])
  }

  const uniqueTags = useMemo(() => [...new Set(tasks.map(t => t.tag))], [tasks])

  // Close dropdowns on outside click
  useEffect(() => {
    const h = () => { setMemberOpen(false); setPriorityOpen(false); setTagOpen(false) }
    document.addEventListener('click', h)
    return () => document.removeEventListener('click', h)
  }, [])

  return (
    <div ref={pageRef} className="flex flex-col gap-5 pb-6">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 dark:bg-ide-active flex items-center justify-center">
            <ClipboardList size={16} className="text-white dark:text-ide-bright" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-ide-bright">작업 관리</h1>
            <p className="text-xs text-gray-400 dark:text-ide-muted mt-0.5">
              작업을 생성하고 팀원에게 할당하세요
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-ide-muted">
            총 <span className="font-semibold text-gray-600 dark:text-ide-text">{tasks.length}</span>개 작업
          </span>
          {isAdmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg
                bg-slate-800 dark:bg-ide-active text-white dark:text-ide-bright
                hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
            >
              <Plus size={13} />작업 생성
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* View Toggle */}
        <div className="flex items-center rounded-lg border border-gray-200 dark:border-ide-border overflow-hidden">
          <button
            onClick={() => setView('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              view === 'kanban'
                ? 'bg-slate-800 dark:bg-ide-active text-white'
                : 'text-gray-500 dark:text-ide-subtle hover:bg-gray-50 dark:hover:bg-ide-hover'
            }`}
          >
            <LayoutGrid size={13} />칸반
          </button>
          <button
            onClick={() => setView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
              view === 'list'
                ? 'bg-slate-800 dark:bg-ide-active text-white'
                : 'text-gray-500 dark:text-ide-subtle hover:bg-gray-50 dark:hover:bg-ide-hover'
            }`}
          >
            <List size={13} />목록
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-ide-muted pointer-events-none" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="작업 검색..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-ide-border
              bg-white dark:bg-ide-surface text-gray-900 dark:text-ide-text placeholder-gray-400 dark:placeholder-ide-muted
              focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
          />
        </div>

        {/* Assignee Filter */}
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => { setMemberOpen(v => !v); setPriorityOpen(false); setTagOpen(false) }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-ide-border
              text-gray-600 dark:text-ide-subtle hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors"
          >
            <User size={12} />
            {filterMember === 'all' ? '담당자' : memberById(filterMember).name}
            <ChevronDown size={11} className={`transition-transform ${memberOpen ? 'rotate-180' : ''}`} />
          </button>
          {memberOpen && (
            <div className="absolute top-full left-0 mt-1 w-44 bg-white dark:bg-ide-surface border border-gray-200 dark:border-ide-border rounded-lg shadow-lg z-20 overflow-hidden">
              {[{ id: 'all', name: '전체' }, ...MEMBERS].map(m => (
                <button key={m.id} onClick={() => { setFilterMember(m.id); setMemberOpen(false) }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors ${filterMember === m.id ? 'bg-slate-50 dark:bg-ide-active text-slate-700 dark:text-ide-bright font-medium' : 'text-gray-600 dark:text-ide-subtle hover:bg-gray-50 dark:hover:bg-ide-hover'}`}>
                  {m.name}{'dept' in m ? ` (${(m as Member).dept})` : ''}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Priority Filter */}
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => { setPriorityOpen(v => !v); setMemberOpen(false); setTagOpen(false) }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-ide-border
              text-gray-600 dark:text-ide-subtle hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors"
          >
            <AlertCircle size={12} />
            {filterPriority === 'all' ? '우선순위' : PRIORITY_CONFIG[filterPriority as TaskPriority].label}
            <ChevronDown size={11} className={`transition-transform ${priorityOpen ? 'rotate-180' : ''}`} />
          </button>
          {priorityOpen && (
            <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-ide-surface border border-gray-200 dark:border-ide-border rounded-lg shadow-lg z-20 overflow-hidden">
              {['all', ...Object.keys(PRIORITY_CONFIG)].map(p => (
                <button key={p} onClick={() => { setFilterPriority(p); setPriorityOpen(false) }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors ${filterPriority === p ? 'bg-slate-50 dark:bg-ide-active text-slate-700 dark:text-ide-bright font-medium' : 'text-gray-600 dark:text-ide-subtle hover:bg-gray-50 dark:hover:bg-ide-hover'}`}>
                  {p === 'all' ? '전체' : PRIORITY_CONFIG[p as TaskPriority].label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tag Filter */}
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => { setTagOpen(v => !v); setMemberOpen(false); setPriorityOpen(false) }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-ide-border
              text-gray-600 dark:text-ide-subtle hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors"
          >
            <Tag size={12} />
            {filterTag === 'all' ? '태그' : filterTag}
            <ChevronDown size={11} className={`transition-transform ${tagOpen ? 'rotate-180' : ''}`} />
          </button>
          {tagOpen && (
            <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-ide-surface border border-gray-200 dark:border-ide-border rounded-lg shadow-lg z-20 overflow-hidden">
              {['all', ...uniqueTags].map(t => (
                <button key={t} onClick={() => { setFilterTag(t); setTagOpen(false) }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors ${filterTag === t ? 'bg-slate-50 dark:bg-ide-active text-slate-700 dark:text-ide-bright font-medium' : 'text-gray-600 dark:text-ide-subtle hover:bg-gray-50 dark:hover:bg-ide-hover'}`}>
                  {t === 'all' ? '전체' : t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Kanban View ── */}
      {view === 'kanban' && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {STATUS_ORDER.map(s => (
            <KanbanColumn
              key={s}
              status={s}
              tasks={tasksByStatus(s)}
              onCardClick={setSelectedTask}
              onDragStart={setDraggingId}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}

      {/* ── List View ── */}
      {view === 'list' && (
        <div className="bg-white dark:bg-ide-surface border border-gray-200 dark:border-ide-border rounded-xl overflow-hidden">
          <div className="grid grid-cols-[minmax(0,1fr)_90px_80px_110px_100px_100px_80px]
            px-4 py-2.5 border-b border-gray-100 dark:border-ide-border
            bg-gray-50 dark:bg-ide-base text-[11px] font-semibold text-gray-400 dark:text-ide-muted uppercase tracking-wide">
            <div>작업명</div>
            <div>상태</div>
            <div>우선순위</div>
            <div>담당자</div>
            <div>태그</div>
            <div>마감일</div>
            <div className="text-right">액션</div>
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <ClipboardList size={28} className="text-gray-200 dark:text-ide-border mb-3" />
              <p className="text-sm text-gray-400 dark:text-ide-muted">검색 결과가 없습니다</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50 dark:divide-ide-border">
              {filtered.map(task => {
                const assignee = memberById(task.assigneeId)
                const isOverdue = task.status !== 'done' && new Date(task.dueDate) < new Date()
                return (
                  <li
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="grid grid-cols-[minmax(0,1fr)_90px_80px_110px_100px_100px_80px]
                      px-4 py-3 items-center hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors cursor-pointer group"
                  >
                    <div className="min-w-0 pr-4">
                      <p className="text-xs font-medium text-gray-800 dark:text-ide-text truncate group-hover:text-slate-900 dark:group-hover:text-ide-bright">
                        {task.title}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-ide-muted mt-0.5 truncate">{task.description}</p>
                    </div>
                    <div><StatusBadge status={task.status} /></div>
                    <div><PriorityBadge priority={task.priority} /></div>
                    <div className="flex items-center gap-1.5">
                      <Avatar member={assignee} size="xs" />
                      <span className="text-xs text-gray-600 dark:text-ide-subtle truncate">{assignee.name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 dark:text-ide-subtle bg-gray-100 dark:bg-ide-hover px-1.5 py-0.5 rounded truncate block max-w-[90px]">
                        {task.tag}
                      </span>
                    </div>
                    <div className={`text-xs tabular-nums ${isOverdue ? 'text-red-500 dark:text-red-400 font-medium' : 'text-gray-500 dark:text-ide-subtle'}`}>
                      {task.dueDate}
                    </div>
                    <div className="flex items-center justify-end" onClick={e => e.stopPropagation()}>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="p-1.5 rounded-md text-gray-300 dark:text-ide-muted hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}

          {filtered.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-50 dark:border-ide-border bg-gray-50 dark:bg-ide-base text-[11px] text-gray-400 dark:text-ide-muted">
              {filtered.length}개 작업
              {search && ` — "${search}" 검색 결과`}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showCreate && (
        <TaskCreateModal onClose={() => setShowCreate(false)} onSubmit={handleCreate} />
      )}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
