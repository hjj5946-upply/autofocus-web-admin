import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import gsap from 'gsap'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import koLocale from '@fullcalendar/core/locales/ko'
import type { DateSelectArg, EventDropArg, EventContentArg, EventInput } from '@fullcalendar/core'
import { CalendarDays, ChevronDown, X } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type LeaveType = 'annual' | 'half-am' | 'half-pm'

interface LeaveEvent {
  id: string
  userId: string
  userName: string
  department: string
  type: LeaveType
  startDate: string  // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD (inclusive)
}

interface ModalState {
  isOpen: boolean
  startDate: string
  endDate: string
  type: LeaveType
  reason: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRENT_USER_ID   = 'user-001'
const CURRENT_USER_NAME = '관리자'
const CURRENT_USER_DEPT = '관리팀'

const MY_STATS = { total: 15, used: 3 }

const TYPE_CONFIG: Record<LeaveType, { label: string; color: string }> = {
  'annual':  { label: '연차',    color: '#3b82f6' },
  'half-am': { label: '오전반차', color: '#10b981' },
  'half-pm': { label: '오후반차', color: '#f59e0b' },
}

const DEPARTMENTS = ['전체', '개발팀', '기획팀', '디자인팀', '마케팅팀', '인사팀', '관리팀']

// ─── Mock Data ────────────────────────────────────────────────────────────────

const initialLeaveEvents: LeaveEvent[] = [
  { id: '1', userId: 'user-001', userName: '관리자',  department: '관리팀',   type: 'annual',  startDate: '2026-06-05', endDate: '2026-06-05' },
  { id: '2', userId: 'user-001', userName: '관리자',  department: '관리팀',   type: 'half-am', startDate: '2026-06-18', endDate: '2026-06-18' },
  { id: '3', userId: 'user-002', userName: '김민준',  department: '디자인팀', type: 'annual',  startDate: '2026-06-12', endDate: '2026-06-13' },
  { id: '4', userId: 'user-003', userName: '이서연',  department: '개발팀',   type: 'half-pm', startDate: '2026-06-11', endDate: '2026-06-11' },
  { id: '5', userId: 'user-004', userName: '박준혁',  department: '개발팀',   type: 'annual',  startDate: '2026-06-16', endDate: '2026-06-17' },
  { id: '6', userId: 'user-005', userName: '최유진',  department: '기획팀',   type: 'annual',  startDate: '2026-06-20', endDate: '2026-06-20' },
  { id: '7', userId: 'user-006', userName: '한지우',  department: '개발팀',   type: 'half-am', startDate: '2026-06-23', endDate: '2026-06-23' },
  { id: '8', userId: 'user-007', userName: '정재원',  department: '마케팅팀', type: 'annual',  startDate: '2026-06-24', endDate: '2026-06-26' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (date: Date): string => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const formatDateKo = (dateStr: string): string => {
  const [, m, d] = dateStr.split('-')
  return `${Number(m)}월 ${Number(d)}일`
}

// FullCalendar uses exclusive end dates for all-day events
const leaveToFCEvent = (event: LeaveEvent): EventInput => {
  const excEnd = new Date(event.endDate)
  excEnd.setDate(excEnd.getDate() + 1)
  return {
    id: event.id,
    title: event.userName,
    start: event.startDate,
    end: formatDate(excEnd),
    allDay: true,
    backgroundColor: TYPE_CONFIG[event.type].color,
    borderColor: TYPE_CONFIG[event.type].color,
    editable: event.userId === CURRENT_USER_ID, // only own events are draggable
    extendedProps: { userId: event.userId, userName: event.userName, department: event.department, type: event.type },
  }
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function DonutChart({ used, total }: { used: number; total: number }) {
  const r             = 26
  const sw            = 7
  const circumference = 2 * Math.PI * r
  const remaining     = total - used
  const targetOffset  = circumference * (used / total) // offset = how much is "used" arc
  const circleRef     = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (!circleRef.current) return
    gsap.fromTo(
      circleRef.current,
      { strokeDashoffset: circumference },
      { strokeDashoffset: targetOffset, duration: 1.3, ease: 'power3.out', delay: 0.7 }
    )
  }, [circumference, targetOffset])

  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      <svg width="64" height="64" viewBox="0 0 64 64" className="absolute inset-0">
        {/* Track */}
        <circle cx="32" cy="32" r={r} fill="none" stroke="#bfdbfe" strokeWidth={sw} />
        {/* Progress (remaining) */}
        <circle
          ref={circleRef}
          cx="32" cy="32" r={r}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={sw}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 tabular-nums">{remaining}일</span>
      </div>
    </div>
  )
}

// ─── Leave Modal ──────────────────────────────────────────────────────────────

function LeaveModal({ state, onClose, onSubmit }: {
  state: ModalState
  onClose: () => void
  onSubmit: (type: LeaveType, reason: string) => void
}) {
  const [type,   setType]   = useState<LeaveType>(state.type)
  const [reason, setReason] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)
  const panelRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 })
    gsap.fromTo(panelRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' })
  }, [])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div ref={panelRef} className="bg-white dark:bg-ide-base rounded-2xl border border-gray-200 dark:border-ide-border shadow-2xl w-full max-w-md mx-4">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-ide-border">
          <div className="flex items-center gap-2">
            <CalendarDays size={14} className="text-blue-500" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-ide-bright">휴가 신청</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-ide-hover text-gray-400 transition-colors">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Date Range (read-only) */}
          <div className="grid grid-cols-2 gap-3">
            {([['시작일', state.startDate], ['종료일', state.endDate]] as const).map(([label, val]) => (
              <div key={label}>
                <p className="text-xs font-medium text-gray-500 dark:text-ide-subtle mb-1">{label}</p>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-ide-hover rounded-lg border border-gray-200 dark:border-ide-border">
                  <CalendarDays size={12} className="text-gray-400 dark:text-ide-muted flex-shrink-0" />
                  <span className="text-xs text-gray-700 dark:text-ide-text">{formatDateKo(val)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Type Selector */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-ide-subtle mb-1.5">휴가 종류</p>
            <div className="flex gap-2">
              {(Object.keys(TYPE_CONFIG) as LeaveType[]).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    type === t
                      ? 'border-blue-500 bg-blue-500 text-white shadow-sm'
                      : 'border-gray-200 dark:border-ide-border text-gray-500 dark:text-ide-subtle hover:border-gray-300 dark:hover:border-ide-active'
                  }`}
                >
                  {TYPE_CONFIG[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-ide-subtle mb-1.5">
              휴가 사유 <span className="text-red-400">*</span>
            </p>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="휴가 사유를 입력해 주세요."
              rows={3}
              className="w-full px-3 py-2.5 text-sm bg-white dark:bg-ide-hover border border-gray-200 dark:border-ide-border rounded-lg text-gray-800 dark:text-ide-text placeholder:text-gray-400 dark:placeholder:text-ide-muted focus:outline-none focus:border-blue-400 resize-none transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-ide-border text-gray-600 dark:text-ide-subtle hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => reason.trim() && onSubmit(type, reason)}
            disabled={!reason.trim()}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            신청
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AttendancePage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [leaveEvents, setLeaveEvents] = useState<LeaveEvent[]>(initialLeaveEvents)
  const [selectedDept, setSelectedDept] = useState('전체')
  const [deptOpen, setDeptOpen] = useState(false)
  const [modal, setModal] = useState<ModalState>({
    isOpen: false, startDate: '', endDate: '', type: 'annual', reason: '',
  })

  const remaining = MY_STATS.total - MY_STATS.used
  const usedPct   = Math.round((MY_STATS.used / MY_STATS.total) * 100)

  const calendarEvents = useMemo<EventInput[]>(() =>
    leaveEvents
      .filter(e => selectedDept === '전체' || e.department === selectedDept)
      .map(leaveToFCEvent),
    [leaveEvents, selectedDept]
  )

  // Mount animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.attend-stat',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      )
      gsap.fromTo('.attend-calendar',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.4 }
      )
    }, rootRef)
    return () => ctx.revert()
  }, [])

  const handleDateSelect = useCallback((info: DateSelectArg) => {
    // FullCalendar's end is exclusive — subtract 1 day for inclusive end
    const incEnd = new Date(info.end.getTime() - 86400000)
    setModal({ isOpen: true, startDate: formatDate(info.start), endDate: formatDate(incEnd), type: 'annual', reason: '' })
    info.view.calendar.unselect()
  }, [])

  const handleEventDrop = useCallback((info: EventDropArg) => {
    const { event } = info
    const incEnd = event.end
      ? new Date(event.end.getTime() - 86400000)
      : event.start!
    setLeaveEvents(prev => {
      const existing = prev.find(e => e.id === event.id)
      if (!existing) return prev
      const updated: LeaveEvent = { ...existing, startDate: formatDate(event.start!), endDate: formatDate(incEnd) }
      // TODO: 백엔드 API 호출 예정 - updatedEventData
      console.log('// TODO: 백엔드 API 호출 예정 - updatedEventData', updated)
      return prev.map(e => e.id === updated.id ? updated : e)
    })
  }, [])

  const handleModalSubmit = useCallback((type: LeaveType, reason: string) => {
    const newEvent: LeaveEvent = {
      id: `evt-${Date.now()}`,
      userId: CURRENT_USER_ID,
      userName: CURRENT_USER_NAME,
      department: CURRENT_USER_DEPT,
      type,
      startDate: modal.startDate,
      endDate: modal.endDate,
    }
    setLeaveEvents(prev => [...prev, newEvent])
    // TODO: 백엔드 API 호출 예정 - updatedEventData
    console.log('// TODO: 백엔드 API 호출 예정 - updatedEventData', { ...newEvent, reason })
    setModal(prev => ({ ...prev, isOpen: false }))
  }, [modal.startDate, modal.endDate])

  const renderEventContent = useCallback((info: EventContentArg) => {
    const { type, userName } = info.event.extendedProps
    return (
      <div className="flex items-center gap-0.5 px-1 py-0.5 w-full overflow-hidden">
        <span className="text-[10px] font-semibold text-white truncate">{userName}</span>
        <span className="text-[9px] text-white/80 flex-shrink-0 hidden sm:inline">
          &nbsp;·&nbsp;{TYPE_CONFIG[type as LeaveType]?.label}
        </span>
      </div>
    )
  }, [])

  return (
    <>
      <div ref={rootRef} className="space-y-5 pb-6">

        {/* Page Header */}
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-ide-bright">근태 / 휴가</h1>
          <p className="text-sm text-gray-500 dark:text-ide-subtle mt-0.5">
            전사 휴가 현황을 조회하고, 달력 드래그로 휴가를 신청하세요.
          </p>
        </div>

        {/* ── My Leave Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          {/* 총 연차 */}
          <div className="attend-stat bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl p-5">
            <p className="text-xs font-medium text-gray-500 dark:text-ide-subtle mb-3">총 연차</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-ide-bright leading-none">
              {MY_STATS.total}
              <span className="text-base font-semibold ml-1 text-gray-500 dark:text-ide-subtle">일</span>
            </p>
            <p className="text-xs text-gray-400 dark:text-ide-muted mt-2">2026년 기준 부여 연차</p>
          </div>

          {/* 사용 연차 */}
          <div className="attend-stat bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl p-5">
            <p className="text-xs font-medium text-gray-500 dark:text-ide-subtle mb-3">사용 연차</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-ide-bright leading-none">
              {MY_STATS.used}
              <span className="text-base font-semibold ml-1 text-gray-500 dark:text-ide-subtle">일</span>
            </p>
            <div className="mt-3 h-1.5 bg-gray-100 dark:bg-ide-hover rounded-full overflow-hidden">
              <div
                className="h-full bg-slate-400 dark:bg-slate-500 rounded-full"
                style={{ width: `${usedPct}%`, transition: 'width 1.2s ease-out' }}
              />
            </div>
            <p className="text-[11px] text-gray-400 dark:text-ide-muted mt-1.5">전체의 {usedPct}% 사용</p>
          </div>

          {/* 잔여 연차 (highlighted) */}
          <div className="attend-stat bg-blue-50 dark:bg-ide-base border border-blue-100 dark:border-blue-500/20 rounded-xl p-5">
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-3">잔여 연차</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 leading-none">
                  {remaining}
                  <span className="text-base font-semibold ml-1">일</span>
                </p>
                <p className="text-[11px] text-blue-400 dark:text-blue-400/60 mt-2">신청 가능한 잔여 일수</p>
              </div>
              <DonutChart used={MY_STATS.used} total={MY_STATS.total} />
            </div>
          </div>
        </div>

        {/* ── Calendar Section ── */}
        <div className="attend-calendar bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl overflow-hidden">

          {/* Calendar Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-ide-border">
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-gray-400 dark:text-ide-subtle" />
              <h2 className="text-sm font-semibold text-gray-800 dark:text-ide-text">전사 휴가 캘린더</h2>
              <span className="hidden sm:inline text-xs text-gray-400 dark:text-ide-muted">
                · 날짜 드래그: 신청&nbsp;&nbsp;내 일정 드래그: 수정
              </span>
            </div>

            {/* Dept Filter */}
            <div className="relative">
              <button
                onClick={() => setDeptOpen(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-ide-subtle border border-gray-200 dark:border-ide-border rounded-lg hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors"
              >
                {selectedDept}
                <ChevronDown size={12} className={`transition-transform duration-200 ${deptOpen ? 'rotate-180' : ''}`} />
              </button>
              {deptOpen && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-ide-surface border border-gray-200 dark:border-ide-border rounded-lg shadow-lg z-30 overflow-hidden">
                  {DEPARTMENTS.map(dept => (
                    <button
                      key={dept}
                      onClick={() => { setSelectedDept(dept); setDeptOpen(false) }}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                        selectedDept === dept
                          ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold'
                          : 'text-gray-600 dark:text-ide-subtle hover:bg-gray-50 dark:hover:bg-ide-hover'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5 px-4 py-2 border-b border-gray-100 dark:border-ide-border bg-gray-50/50 dark:bg-ide-surface/20">
            {(Object.entries(TYPE_CONFIG) as [LeaveType, { label: string; color: string }][]).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: cfg.color }} />
                <span className="text-xs text-gray-500 dark:text-ide-subtle">{cfg.label}</span>
              </div>
            ))}
          </div>

          {/* FullCalendar */}
          <div className="p-4">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={koLocale}
              initialDate="2026-06-01"
              selectable={true}
              selectMirror={true}
              editable={true}
              dayMaxEvents={4}
              events={calendarEvents}
              select={handleDateSelect}
              eventDrop={handleEventDrop}
              eventContent={renderEventContent}
              headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
              height="auto"
            />
          </div>
        </div>
      </div>

      {/* Leave Request Modal */}
      {modal.isOpen && (
        <LeaveModal
          state={modal}
          onClose={() => setModal(prev => ({ ...prev, isOpen: false }))}
          onSubmit={handleModalSubmit}
        />
      )}
    </>
  )
}
