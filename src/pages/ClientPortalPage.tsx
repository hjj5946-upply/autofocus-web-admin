import { useEffect, useRef, useState, useMemo } from 'react'
import gsap from 'gsap'
import {
  Headphones, Search, MessageSquare, FileText, Info,
  CheckCircle2, Clock, Send,
  Phone, Mail, Building2, Calendar, UserCheck,
  ChevronDown, ChevronUp, Circle, MoreHorizontal,
  User, Tag,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type ClientStatus    = 'active' | 'pending' | 'inactive'
type TicketStatus    = 'open' | 'inprogress' | 'resolved' | 'closed'
type TicketCategory  = 'urgent' | 'maintenance' | 'defect' | 'inquiry' | 'feature'
type MessageSender   = 'client' | 'manager'
type DetailTab       = 'tickets' | 'chat' | 'info'

interface Client {
  id: string
  companyName: string
  initial: string
  color: string
  contactName: string
  contactEmail: string
  phone: string
  status: ClientStatus
  assignedManagerId: string
  contractType: string
  joinedAt: string
  lastActivity: string
  unreadTickets: number
  unreadChats: number
}

interface TicketReply {
  id: string
  content: string
  sender: MessageSender
  senderName: string
  createdAt: string
}

interface Ticket {
  id: string
  clientId: string
  title: string
  content: string
  category: TicketCategory
  status: TicketStatus
  createdAt: string
  replies: TicketReply[]
}

interface ChatMessage {
  id: string
  clientId: string
  content: string
  sender: MessageSender
  senderName: string
  createdAt: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MANAGERS = [
  { id: 'user-001', name: '관리자',  initial: '관', color: 'bg-slate-600' },
  { id: 'user-003', name: '이서연',  initial: '서', color: 'bg-violet-500' },
  { id: 'user-005', name: '최유진',  initial: '유', color: 'bg-rose-500' },
]

const CLIENT_STATUS_CONFIG: Record<ClientStatus, { label: string; dot: string; text: string; bg: string }> = {
  active:   { label: '활성',  dot: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  pending:  { label: '대기',  dot: 'bg-amber-500',   text: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-950/30' },
  inactive: { label: '종료',  dot: 'bg-gray-400',    text: 'text-gray-500 dark:text-gray-400',       bg: 'bg-gray-100 dark:bg-gray-800' },
}

const TICKET_STATUS_CONFIG: Record<TicketStatus, { label: string; icon: React.ReactNode; text: string; bg: string; ring: string }> = {
  open:       { label: '접수됨',   icon: <Circle size={11} />,       text: 'text-gray-600 dark:text-gray-400',     bg: 'bg-gray-50 dark:bg-gray-800/60',      ring: 'ring-gray-300 dark:ring-gray-600' },
  inprogress: { label: '처리중',   icon: <Clock size={11} />,        text: 'text-blue-600 dark:text-blue-400',     bg: 'bg-blue-50 dark:bg-blue-500/10',      ring: 'ring-blue-300 dark:ring-blue-600/60' },
  resolved:   { label: '해결됨',   icon: <CheckCircle2 size={11} />, text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', ring: 'ring-emerald-300 dark:ring-emerald-600/60' },
  closed:     { label: '완료',     icon: <CheckCircle2 size={11} />, text: 'text-gray-500 dark:text-gray-400',     bg: 'bg-gray-100 dark:bg-gray-800',        ring: 'ring-gray-200 dark:ring-gray-700' },
}

const TICKET_CATEGORY_CONFIG: Record<TicketCategory, { label: string; text: string; bg: string }> = {
  urgent:      { label: '긴급',     text: 'text-red-600 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-950/40' },
  maintenance: { label: '유지보수', text: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-950/40' },
  defect:      { label: '하자관리', text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/40' },
  inquiry:     { label: '일반문의', text: 'text-slate-600 dark:text-slate-400',  bg: 'bg-slate-100 dark:bg-slate-800' },
  feature:     { label: '기능요청', text: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/40' },
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_CLIENTS: Client[] = [
  { id: 'c1', companyName: 'KT 엔터프라이즈', initial: 'KT', color: 'bg-red-500',     contactName: '이태양', contactEmail: 'lee@kt-ent.com',       phone: '02-1234-5678', status: 'active',   assignedManagerId: 'user-003', contractType: '유지보수 + 하자관리', joinedAt: '2025-03-15', lastActivity: '30분 전',  unreadTickets: 2, unreadChats: 1 },
  { id: 'c2', companyName: '삼성 리서치',      initial: 'SR', color: 'bg-blue-600',    contactName: '박하늘', contactEmail: 'park@sr.samsung.com',  phone: '02-2345-6789', status: 'active',   assignedManagerId: 'user-005', contractType: '유지보수 계약',      joinedAt: '2025-05-01', lastActivity: '2시간 전', unreadTickets: 1, unreadChats: 0 },
  { id: 'c3', companyName: '현대 모터스',      initial: 'HM', color: 'bg-slate-600',   contactName: '김도윤', contactEmail: 'kim@hyundai-m.com',    phone: '02-3456-7890', status: 'active',   assignedManagerId: 'user-003', contractType: '하자관리 전용',      joinedAt: '2025-07-20', lastActivity: '1일 전',   unreadTickets: 0, unreadChats: 0 },
  { id: 'c4', companyName: 'LG 소프트웨어',    initial: 'LG', color: 'bg-violet-600',  contactName: '최지수', contactEmail: 'choi@lgsw.com',        phone: '02-4567-8901', status: 'active',   assignedManagerId: 'user-001', contractType: '풀서비스 계약',      joinedAt: '2025-09-10', lastActivity: '10분 전',  unreadTickets: 3, unreadChats: 2 },
  { id: 'c5', companyName: '롯데 이노베이션',  initial: 'LI', color: 'bg-emerald-600', contactName: '정수민', contactEmail: 'jung@lotte-in.com',    phone: '02-5678-9012', status: 'pending',  assignedManagerId: 'user-001', contractType: '계약 협의 중',       joinedAt: '2026-06-01', lastActivity: '3일 전',   unreadTickets: 0, unreadChats: 1 },
  { id: 'c6', companyName: '네이버 파트너스',  initial: 'NP', color: 'bg-green-600',   contactName: '오지훈', contactEmail: 'oh@naver-p.com',       phone: '02-6789-0123', status: 'inactive', assignedManagerId: 'user-003', contractType: '계약 종료',          joinedAt: '2024-01-10', lastActivity: '2주 전',   unreadTickets: 0, unreadChats: 0 },
]

const INITIAL_TICKETS: Ticket[] = [
  // KT 엔터프라이즈
  { id: 'tk1', clientId: 'c1', title: '메인 서버 간헐적 오류 발생', content: '안녕하세요. 오늘 오전부터 메인 서버에서 간헐적으로 500 에러가 발생하고 있습니다. 에러 로그 첨부드립니다. 긴급 확인 부탁드립니다.', category: 'urgent', status: 'open', createdAt: '2026-06-11 09:23',
    replies: [] },
  { id: 'tk2', clientId: 'c1', title: '로그인 화면 UI 깨짐 현상', content: '모바일 Chrome 환경에서 로그인 페이지 레이아웃이 깨지는 현상이 발생합니다. iOS 17.4 Safari에서는 정상입니다.', category: 'defect', status: 'inprogress', createdAt: '2026-06-10 14:05',
    replies: [
      { id: 'r1', content: '안녕하세요. 확인해보겠습니다. 어떤 기기와 Chrome 버전인지 알 수 있을까요?', sender: 'manager', senderName: '이서연', createdAt: '2026-06-10 15:00' },
      { id: 'r2', content: 'Samsung Galaxy S24, Chrome 124 입니다. 스크린샷 추가로 보내드릴게요.', sender: 'client', senderName: '이태양', createdAt: '2026-06-10 15:30' },
    ] },
  { id: 'tk3', clientId: 'c1', title: '정기 점검 일정 문의', content: '이번 달 정기 점검 일정을 알고 싶습니다. 가능하면 업무 영향이 최소화되는 시간대로 잡아주세요.', category: 'maintenance', status: 'resolved', createdAt: '2026-06-05 10:00',
    replies: [
      { id: 'r3', content: '6월 15일 일요일 새벽 2시~4시로 예정되어 있습니다. 괜찮으시면 확인 부탁드립니다.', sender: 'manager', senderName: '이서연', createdAt: '2026-06-05 11:00' },
      { id: 'r4', content: '네, 확인했습니다. 그 시간으로 진행해 주세요.', sender: 'client', senderName: '이태양', createdAt: '2026-06-05 11:30' },
    ] },
  // 삼성 리서치
  { id: 'tk4', clientId: 'c2', title: '데이터 내보내기 기능 오류', content: '엑셀 내보내기 시 한글 데이터가 깨져서 출력됩니다. CSV는 정상이나 XLSX만 문제가 있습니다.', category: 'defect', status: 'open', createdAt: '2026-06-11 11:00',
    replies: [] },
  { id: 'tk5', clientId: 'c2', title: '신규 사용자 계정 추가 요청', content: '마케팅팀 신입 2명에 대한 계정 추가 요청드립니다. 권한은 조회 전용으로 부탁드립니다.', category: 'inquiry', status: 'closed', createdAt: '2026-06-08 09:30',
    replies: [
      { id: 'r5', content: '요청하신 계정 2개 생성 완료했습니다. 임시 비밀번호는 별도로 전달드렸습니다.', sender: 'manager', senderName: '최유진', createdAt: '2026-06-08 10:00' },
    ] },
  // LG 소프트웨어
  { id: 'tk6', clientId: 'c4', title: '대시보드 로딩 속도 저하', content: '어제부터 대시보드 초기 로딩 시간이 평소보다 3배 이상 길어졌습니다. 약 15초 정도 소요됩니다.', category: 'urgent', status: 'open', createdAt: '2026-06-11 08:45',
    replies: [] },
  { id: 'tk7', clientId: 'c4', title: '보고서 자동 발송 기능 요청', content: '매주 월요일 오전 9시에 주간 통계 보고서를 담당자 이메일로 자동 발송하는 기능을 추가해 주실 수 있을까요?', category: 'feature', status: 'inprogress', createdAt: '2026-06-09 14:20',
    replies: [
      { id: 'r6', content: '요청 검토 완료했습니다. 개발 일정은 약 2주 예상됩니다. 진행해도 될까요?', sender: 'manager', senderName: '관리자', createdAt: '2026-06-09 16:00' },
    ] },
  { id: 'tk8', clientId: 'c4', title: '하자 처리 현황 열람 권한 오류', content: '팀장 계정으로 로그인 시 하자 처리 현황 메뉴 접근 불가 오류가 발생합니다.', category: 'defect', status: 'open', createdAt: '2026-06-11 10:10',
    replies: [] },
  // 현대 모터스
  { id: 'tk9', clientId: 'c3', title: '하자 처리 완료 보고서 요청', content: '지난 분기 하자 처리 완료 건에 대한 종합 보고서를 PDF로 받고 싶습니다.', category: 'maintenance', status: 'resolved', createdAt: '2026-06-01 09:00',
    replies: [
      { id: 'r7', content: '보고서 작성 완료했습니다. 이메일로 전달드렸으니 확인 부탁드립니다.', sender: 'manager', senderName: '이서연', createdAt: '2026-06-02 10:00' },
      { id: 'r8', content: '잘 받았습니다. 감사합니다.', sender: 'client', senderName: '김도윤', createdAt: '2026-06-02 11:00' },
    ] },
]

const INITIAL_MESSAGES: ChatMessage[] = [
  // KT
  { id: 'm1',  clientId: 'c1', content: '안녕하세요, 담당자님. 오늘 오전에 서버 오류 티켓 올렸는데 언제쯤 확인 가능하실까요?', sender: 'client',  senderName: '이태양', createdAt: '09:28' },
  { id: 'm2',  clientId: 'c1', content: '안녕하세요 이태양 님! 방금 확인했습니다. 서버 로그 분석 중이며 30분 내로 1차 답변 드리겠습니다.', sender: 'manager', senderName: '이서연', createdAt: '09:35' },
  { id: 'm3',  clientId: 'c1', content: '감사합니다. 기다리겠습니다!', sender: 'client', senderName: '이태양', createdAt: '09:36' },
  // 삼성
  { id: 'm4',  clientId: 'c2', content: '담당자님, 안녕하세요. 이번 달 정기 점검 일정 조율 관련해서 연락드렸습니다.', sender: 'client',  senderName: '박하늘', createdAt: '10:00' },
  { id: 'm5',  clientId: 'c2', content: '네, 안녕하세요! 6월 22일 일요일 새벽 1시~3시는 어떠신가요?', sender: 'manager', senderName: '최유진', createdAt: '10:05' },
  // LG
  { id: 'm6',  clientId: 'c4', content: '안녕하세요. 오늘 대시보드가 너무 느려서 업무가 안될 정도입니다. 빠른 처리 부탁드립니다.', sender: 'client',  senderName: '최지수', createdAt: '08:50' },
  { id: 'm7',  clientId: 'c4', content: '불편을 드려 죄송합니다. 지금 바로 확인 중입니다.', sender: 'manager', senderName: '관리자', createdAt: '08:55' },
  { id: 'm8',  clientId: 'c4', content: '인프라팀에서 원인 파악 완료했습니다. DB 쿼리 최적화 이슈로 약 1시간 내로 조치 완료될 예정입니다.', sender: 'manager', senderName: '관리자', createdAt: '09:30' },
  { id: 'm9',  clientId: 'c4', content: '알겠습니다. 계속 기다리겠습니다.', sender: 'client',  senderName: '최지수', createdAt: '09:32' },
  // 롯데
  { id: 'm10', clientId: 'c5', content: '안녕하세요. 계약 관련 추가 문의가 있어서요. 통화 가능하신 시간이 있으신가요?', sender: 'client',  senderName: '정수민', createdAt: '2일 전' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function managerById(id: string) {
  return MANAGERS.find(m => m.id === id) ?? MANAGERS[0]
}

// ─── Small Components ─────────────────────────────────────────────────────────

function ClientAvatar({ client, size = 'md' }: { client: Client; size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: 'w-7 h-7 text-[10px]', md: 'w-9 h-9 text-xs', lg: 'w-11 h-11 text-sm' }
  return (
    <div className={`${s[size]} rounded-lg ${client.color} flex items-center justify-center flex-shrink-0`}>
      <span className="font-bold text-white">{client.initial}</span>
    </div>
  )
}

function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const cfg = TICKET_STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ring-1 ${cfg.ring} ${cfg.bg} ${cfg.text}`}>
      {cfg.icon}{cfg.label}
    </span>
  )
}

function CategoryBadge({ category }: { category: TicketCategory }) {
  const cfg = TICKET_CATEGORY_CONFIG[category]
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  )
}

// ─── Ticket Item ──────────────────────────────────────────────────────────────

function TicketItem({ ticket, onStatusChange, managerName }: {
  ticket: Ticket
  onStatusChange: (id: string, status: TicketStatus) => void
  managerName: string
}) {
  const [expanded, setExpanded]   = useState(ticket.status === 'open')
  const [replyText, setReplyText] = useState('')
  const [replies,   setReplies]   = useState(ticket.replies)
  const [status,    setStatus]    = useState(ticket.status)
  const [statusOpen, setStatusOpen] = useState(false)

  function sendReply() {
    if (!replyText.trim()) return
    const newReply: TicketReply = {
      id: `r${Date.now()}`, content: replyText.trim(),
      sender: 'manager', senderName: managerName,
      createdAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    }
    setReplies(prev => [...prev, newReply])
    if (status === 'open') {
      setStatus('inprogress')
      onStatusChange(ticket.id, 'inprogress')
    }
    setReplyText('')
  }

  function changeStatus(s: TicketStatus) {
    setStatus(s)
    onStatusChange(ticket.id, s)
    setStatusOpen(false)
  }

  return (
    <div className="border border-gray-200 dark:border-ide-border rounded-xl overflow-hidden">
      {/* Ticket Header */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <CategoryBadge category={ticket.category} />
            <TicketStatusBadge status={status} />
          </div>
          <p className="text-xs font-semibold text-gray-800 dark:text-ide-text truncate">{ticket.title}</p>
          <p className="text-[11px] text-gray-400 dark:text-ide-muted mt-0.5">{ticket.createdAt}</p>
        </div>
        <div className="flex-shrink-0 text-gray-400 dark:text-ide-muted">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-ide-border">
          {/* Original message */}
          <div className="px-4 py-3 bg-gray-50 dark:bg-ide-base/60">
            <p className="text-xs text-gray-700 dark:text-ide-text leading-relaxed whitespace-pre-wrap">
              {ticket.content}
            </p>
          </div>

          {/* Reply thread */}
          {replies.length > 0 && (
            <div className="px-4 py-2 space-y-2 border-t border-gray-100 dark:border-ide-border">
              {replies.map(reply => (
                <div
                  key={reply.id}
                  className={`flex gap-2.5 ${reply.sender === 'manager' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-white
                    ${reply.sender === 'manager' ? 'bg-slate-600' : 'bg-gray-400'}`}>
                    {reply.senderName[0]}
                  </div>
                  <div className={`max-w-[80%] ${reply.sender === 'manager' ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                    <span className="text-[10px] text-gray-400 dark:text-ide-muted">{reply.senderName} · {reply.createdAt}</span>
                    <div className={`px-3 py-2 rounded-lg text-xs leading-relaxed
                      ${reply.sender === 'manager'
                        ? 'bg-slate-800 dark:bg-ide-active text-white'
                        : 'bg-white dark:bg-ide-surface border border-gray-200 dark:border-ide-border text-gray-700 dark:text-ide-text'
                      }`}>
                      {reply.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply Input */}
          {status !== 'closed' && (
            <div className="px-4 py-3 border-t border-gray-100 dark:border-ide-border">
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) sendReply() }}
                  placeholder="답변을 입력하세요... (Ctrl+Enter로 전송)"
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-gray-200 dark:border-ide-border
                    bg-white dark:bg-ide-base text-gray-900 dark:text-ide-text
                    placeholder-gray-400 dark:placeholder-ide-muted resize-none
                    focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
                />
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={sendReply}
                    disabled={!replyText.trim()}
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-800 dark:bg-ide-active text-white
                      hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send size={13} />
                  </button>
                  {/* Status Change */}
                  <div className="relative">
                    <button
                      onClick={e => { e.stopPropagation(); setStatusOpen(v => !v) }}
                      className="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-ide-border
                        text-gray-400 dark:text-ide-muted hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors"
                      title="상태 변경"
                    >
                      <MoreHorizontal size={13} />
                    </button>
                    {statusOpen && (
                      <div
                        className="absolute bottom-full right-0 mb-1 w-32 bg-white dark:bg-ide-surface border border-gray-200 dark:border-ide-border rounded-lg shadow-xl z-30 overflow-hidden"
                        onClick={e => e.stopPropagation()}
                      >
                        {(Object.keys(TICKET_STATUS_CONFIG) as TicketStatus[]).map(s => (
                          <button
                            key={s}
                            onClick={() => changeStatus(s)}
                            className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                              status === s
                                ? 'bg-slate-50 dark:bg-ide-active font-semibold text-gray-800 dark:text-ide-bright'
                                : 'text-gray-600 dark:text-ide-subtle hover:bg-gray-50 dark:hover:bg-ide-hover'
                            }`}
                          >
                            {TICKET_STATUS_CONFIG[s].label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Chat Panel ───────────────────────────────────────────────────────────────

function ChatPanel({ clientId, messages, managerName, onSend }: {
  clientId: string
  messages: ChatMessage[]
  managerName: string
  onSend: (msg: ChatMessage) => void
}) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const clientMessages = messages.filter(m => m.clientId === clientId)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [clientMessages.length])

  function send() {
    if (!input.trim()) return
    onSend({
      id: `msg${Date.now()}`, clientId,
      content: input.trim(), sender: 'manager', senderName: managerName,
      createdAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    })
    setInput('')
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {clientMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <MessageSquare size={28} className="text-gray-200 dark:text-ide-border mb-2" />
            <p className="text-sm text-gray-400 dark:text-ide-muted">아직 대화가 없습니다</p>
          </div>
        ) : (
          clientMessages.map(msg => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.sender === 'manager' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white self-end
                ${msg.sender === 'manager' ? 'bg-slate-600' : 'bg-gray-400'}`}>
                {msg.senderName[0]}
              </div>
              <div className={`flex flex-col gap-0.5 max-w-[75%] ${msg.sender === 'manager' ? 'items-end' : 'items-start'}`}>
                <span className="text-[10px] text-gray-400 dark:text-ide-muted px-1">{msg.senderName} · {msg.createdAt}</span>
                <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed
                  ${msg.sender === 'manager'
                    ? 'bg-slate-800 dark:bg-ide-active text-white rounded-tr-sm'
                    : 'bg-white dark:bg-ide-surface border border-gray-200 dark:border-ide-border text-gray-700 dark:text-ide-text rounded-tl-sm'
                  }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-gray-100 dark:border-ide-border p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send() }}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-ide-border
              bg-white dark:bg-ide-base text-gray-900 dark:text-ide-text
              placeholder-gray-400 dark:placeholder-ide-muted
              focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="px-3 py-2 rounded-lg bg-slate-800 dark:bg-ide-active text-white
              hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Info Panel ───────────────────────────────────────────────────────────────

function InfoPanel({ client, onManagerChange }: {
  client: Client
  onManagerChange: (clientId: string, managerId: string) => void
}) {
  const [managerOpen, setManagerOpen] = useState(false)
  const assignedManager = managerById(client.assignedManagerId)
  const statusCfg = CLIENT_STATUS_CONFIG[client.status]

  return (
    <div className="p-5 space-y-5">
      {/* Company Info */}
      <div>
        <p className="text-[11px] font-semibold text-gray-400 dark:text-ide-muted uppercase tracking-wider mb-3">회사 정보</p>
        <div className="space-y-2.5">
          {[
            [<Building2 size={13} />, '회사명', client.companyName],
            [<User size={13} />, '담당 연락처', client.contactName],
            [<Mail size={13} />, '이메일', client.contactEmail],
            [<Phone size={13} />, '전화번호', client.phone],
            [<Tag size={13} />, '계약 유형', client.contractType],
            [<Calendar size={13} />, '가입일', client.joinedAt],
          ].map(([icon, label, value]) => (
            <div key={String(label)} className="flex items-center gap-3">
              <span className="text-gray-400 dark:text-ide-muted flex-shrink-0">{icon}</span>
              <span className="text-[11px] text-gray-400 dark:text-ide-muted w-24 flex-shrink-0">{label}</span>
              <span className="text-xs text-gray-700 dark:text-ide-text font-medium">{value as string}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="pt-4 border-t border-gray-100 dark:border-ide-border">
        <p className="text-[11px] font-semibold text-gray-400 dark:text-ide-muted uppercase tracking-wider mb-3">상태</p>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.bg} ${statusCfg.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
          {statusCfg.label}
        </span>
      </div>

      {/* Manager Assignment */}
      <div className="pt-4 border-t border-gray-100 dark:border-ide-border">
        <p className="text-[11px] font-semibold text-gray-400 dark:text-ide-muted uppercase tracking-wider mb-3">담당자 배정</p>
        <div className="relative inline-block" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setManagerOpen(v => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-ide-border
              hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors text-sm"
          >
            <div className={`w-6 h-6 rounded-full ${assignedManager.color} flex items-center justify-center`}>
              <span className="text-[9px] font-bold text-white">{assignedManager.initial}</span>
            </div>
            <span className="text-xs text-gray-700 dark:text-ide-text font-medium">{assignedManager.name}</span>
            <ChevronDown size={12} className={`text-gray-400 transition-transform ${managerOpen ? 'rotate-180' : ''}`} />
          </button>
          {managerOpen && (
            <div className="absolute top-full left-0 mt-1 w-44 bg-white dark:bg-ide-surface border border-gray-200 dark:border-ide-border rounded-lg shadow-xl z-20 overflow-hidden">
              {MANAGERS.map(m => (
                <button
                  key={m.id}
                  onClick={() => { onManagerChange(client.id, m.id); setManagerOpen(false) }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors
                    ${client.assignedManagerId === m.id
                      ? 'bg-slate-50 dark:bg-ide-active text-slate-700 dark:text-ide-bright font-semibold'
                      : 'text-gray-600 dark:text-ide-subtle hover:bg-gray-50 dark:hover:bg-ide-hover'
                    }`}
                >
                  <div className={`w-5 h-5 rounded-full ${m.color} flex items-center justify-center`}>
                    <span className="text-[8px] font-bold text-white">{m.initial}</span>
                  </div>
                  {m.name}
                  {client.assignedManagerId === m.id && <UserCheck size={11} className="ml-auto" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Client Detail Panel ──────────────────────────────────────────────────────

function ClientDetailPanel({ client, tickets, messages, onStatusChange, onManagerChange, onSendChat }: {
  client: Client
  tickets: Ticket[]
  messages: ChatMessage[]
  onStatusChange: (ticketId: string, status: TicketStatus) => void
  onManagerChange: (clientId: string, managerId: string) => void
  onSendChat: (msg: ChatMessage) => void
}) {
  const [tab, setTab] = useState<DetailTab>('tickets')
  const clientTickets = tickets.filter(t => t.clientId === client.id)
  const manager = managerById(client.assignedManagerId)
  const statusCfg = CLIENT_STATUS_CONFIG[client.status]

  const tabs: { key: DetailTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'tickets', label: '문의/게시판', icon: <FileText size={13} />, count: clientTickets.filter(t => t.status === 'open').length || undefined },
    { key: 'chat',    label: '채팅',        icon: <MessageSquare size={13} />, count: client.unreadChats || undefined },
    { key: 'info',    label: '정보',        icon: <Info size={13} /> },
  ]

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Client Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-ide-border flex-shrink-0">
        <ClientAvatar client={client} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-900 dark:text-ide-bright">{client.companyName}</h2>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusCfg.bg} ${statusCfg.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
              {statusCfg.label}
            </span>
          </div>
          <p className="text-xs text-gray-400 dark:text-ide-muted mt-0.5">
            {client.contactName} · 담당: {manager.name} · 최근 활동 {client.lastActivity}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-gray-100 dark:border-ide-border flex-shrink-0 px-4">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap -mb-px ${
              tab === t.key
                ? 'border-slate-800 dark:border-ide-active text-gray-900 dark:text-ide-bright'
                : 'border-transparent text-gray-500 dark:text-ide-subtle hover:text-gray-700 dark:hover:text-ide-text'
            }`}
          >
            {t.icon}
            {t.label}
            {t.count !== undefined && (
              <span className="bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[14px] text-center leading-none">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {tab === 'tickets' && (
          <div className="p-4 space-y-3">
            {clientTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <FileText size={28} className="text-gray-200 dark:text-ide-border mb-2" />
                <p className="text-sm text-gray-400 dark:text-ide-muted">문의 내역이 없습니다</p>
              </div>
            ) : (
              clientTickets.map(ticket => (
                <TicketItem
                  key={ticket.id}
                  ticket={ticket}
                  onStatusChange={onStatusChange}
                  managerName={manager.name}
                />
              ))
            )}
          </div>
        )}

        {tab === 'chat' && (
          <ChatPanel
            clientId={client.id}
            messages={messages}
            managerName={manager.name}
            onSend={onSendChat}
          />
        )}

        {tab === 'info' && (
          <InfoPanel client={client} onManagerChange={onManagerChange} />
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ClientPortalPage() {
  const pageRef = useRef<HTMLDivElement>(null)

  const [clients,        setClients]       = useState<Client[]>(INITIAL_CLIENTS)
  const [tickets,        setTickets]       = useState<Ticket[]>(INITIAL_TICKETS)
  const [messages,       setMessages]      = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [selectedId,     setSelectedId]    = useState<string>(INITIAL_CLIENTS[0].id)
  const [search,         setSearch]        = useState('')
  const [statusFilter,   setStatusFilter]  = useState<ClientStatus | 'all'>('all')

  useEffect(() => {
    if (!pageRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(pageRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out',
          onComplete: () => gsap.set(pageRef.current, { clearProps: 'transform' }) }
      )
    })
    return () => ctx.revert()
  }, [])

  const filteredClients = useMemo(() => {
    let list = clients
    if (statusFilter !== 'all') list = list.filter(c => c.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c => c.companyName.toLowerCase().includes(q) || c.contactName.toLowerCase().includes(q))
    }
    return [...list].sort((a, b) => (b.unreadTickets + b.unreadChats) - (a.unreadTickets + a.unreadChats))
  }, [clients, search, statusFilter])

  const selectedClient = useMemo(() => clients.find(c => c.id === selectedId) ?? clients[0], [clients, selectedId])

  const stats = useMemo(() => ({
    total:      clients.length,
    active:     clients.filter(c => c.status === 'active').length,
    openTickets: tickets.filter(t => t.status === 'open').length,
    unreadChat: clients.reduce((s, c) => s + c.unreadChats, 0),
  }), [clients, tickets])

  function handleTicketStatusChange(ticketId: string, status: TicketStatus) {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t))
  }

  function handleManagerChange(clientId: string, managerId: string) {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, assignedManagerId: managerId } : c))
  }

  function handleSendChat(msg: ChatMessage) {
    setMessages(prev => [...prev, msg])
    setClients(prev => prev.map(c => c.id === msg.clientId ? { ...c, unreadChats: 0 } : c))
  }

  function selectClient(id: string) {
    setSelectedId(id)
    setClients(prev => prev.map(c => c.id === id ? { ...c, unreadTickets: 0, unreadChats: 0 } : c))
  }

  // Close dropdowns
  useEffect(() => {
    const h = () => {}
    document.addEventListener('click', h)
    return () => document.removeEventListener('click', h)
  }, [])

  return (
    <div ref={pageRef} className="flex flex-col gap-4 pb-6 h-full">

      {/* Page Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 dark:bg-ide-active flex items-center justify-center">
            <Headphones size={16} className="text-white dark:text-ide-bright" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-ide-bright">고객 포털 관리</h1>
            <p className="text-xs text-gray-400 dark:text-ide-muted mt-0.5">
              고객사 문의 및 1:1 채팅을 관리하세요
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
        {[
          { label: '전체 고객사',  value: stats.total,      sub: '등록됨',     color: 'text-gray-900 dark:text-ide-bright' },
          { label: '활성 계약',    value: stats.active,     sub: '서비스 중',  color: 'text-emerald-600 dark:text-emerald-400' },
          { label: '미처리 문의',  value: stats.openTickets, sub: '답변 대기',  color: 'text-red-500 dark:text-red-400' },
          { label: '읽지 않은 채팅', value: stats.unreadChat, sub: '새 메시지',  color: 'text-blue-600 dark:text-blue-400' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 dark:text-ide-subtle mb-1">{s.label}</p>
            <p className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-gray-400 dark:text-ide-muted mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Content: Two-panel layout */}
      <div className="flex gap-3 flex-1 min-h-0" style={{ minHeight: '520px' }}>

        {/* ── Left: Client List ── */}
        <div className="w-64 flex-shrink-0 flex flex-col bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl overflow-hidden">
          {/* Search + Filter */}
          <div className="p-3 border-b border-gray-100 dark:border-ide-border space-y-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-ide-muted pointer-events-none" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="고객사 검색..."
                className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-ide-border
                  bg-white dark:bg-ide-surface text-gray-900 dark:text-ide-text placeholder-gray-400 dark:placeholder-ide-muted
                  focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
              />
            </div>
            {/* Status filter pills */}
            <div className="flex gap-1 flex-wrap">
              {(['all', 'active', 'pending', 'inactive'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                    statusFilter === s
                      ? 'bg-slate-800 dark:bg-ide-active text-white'
                      : 'bg-gray-100 dark:bg-ide-hover text-gray-500 dark:text-ide-muted hover:bg-gray-200 dark:hover:bg-ide-border'
                  }`}
                >
                  {s === 'all' ? '전체' : CLIENT_STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Client list */}
          <ul className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-ide-border">
            {filteredClients.length === 0 ? (
              <li className="flex items-center justify-center py-10 text-xs text-gray-400 dark:text-ide-muted">
                검색 결과 없음
              </li>
            ) : (
              filteredClients.map(client => {
                const unread = client.unreadTickets + client.unreadChats
                const active = selectedId === client.id
                return (
                  <li key={client.id}>
                    <button
                      onClick={() => selectClient(client.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-3 text-left transition-colors ${
                        active
                          ? 'bg-slate-50 dark:bg-ide-active/40 border-r-2 border-slate-800 dark:border-ide-active'
                          : 'hover:bg-gray-50 dark:hover:bg-ide-hover'
                      }`}
                    >
                      <ClientAvatar client={client} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-xs font-semibold truncate ${active ? 'text-gray-900 dark:text-ide-bright' : 'text-gray-700 dark:text-ide-text'}`}>
                            {client.companyName}
                          </p>
                          {unread > 0 && (
                            <span className="flex-shrink-0 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                              {unread}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 dark:text-ide-muted truncate mt-0.5">
                          {client.contactName} · {client.lastActivity}
                        </p>
                      </div>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>

        {/* ── Right: Detail Panel ── */}
        <div className="flex-1 min-w-0 bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl overflow-hidden flex flex-col">
          {selectedClient ? (
            <ClientDetailPanel
              client={selectedClient}
              tickets={tickets}
              messages={messages}
              onStatusChange={handleTicketStatusChange}
              onManagerChange={handleManagerChange}
              onSendChat={handleSendChat}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Headphones size={32} className="text-gray-200 dark:text-ide-border mb-3" />
              <p className="text-sm text-gray-400 dark:text-ide-muted">고객사를 선택하세요</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
