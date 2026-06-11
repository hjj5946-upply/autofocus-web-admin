import { useEffect, useRef, useState, useMemo } from 'react'
import gsap from 'gsap'
import {
  Search, Edit2, Trash2, X, Mail, Phone, Calendar,
  ChevronDown, Filter, Users, UserCheck, UserX, Briefcase,
  ShieldCheck, Clock, CheckCircle2, XCircle, AlertTriangle
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Status       = '재직' | '휴직' | '퇴직'
type ContractType = '정규직' | '계약직' | '인턴'
type Role         = '관리자' | '운영자' | '일반직원'

interface PendingEmployee {
  id: string
  name: string
  email: string
  phone: string
  appliedDate: string   // 가입 신청일
  initial: string
}

interface Employee {
  id: string
  name: string
  title: string
  dept: string
  email: string
  phone: string
  joinDate: string
  status: Status
  contractType: ContractType
  role: Role
  initial: string
  color: string
  note?: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INIT_PENDING: PendingEmployee[] = [
  { id: 'p001', name: '송유나',  email: 'yuna.song@autofocus.co.kr',   phone: '010-1111-2222', appliedDate: '2026-06-10', initial: '유' },
  { id: 'p002', name: '권태양',  email: 'taeyang.k@autofocus.co.kr',   phone: '010-3333-4444', appliedDate: '2026-06-09', initial: '태' },
  { id: 'p003', name: '민지수',  email: 'jisoo.min@autofocus.co.kr',   phone: '010-5555-6666', appliedDate: '2026-06-08', initial: '지' },
]

const INIT_EMPLOYEES: Employee[] = [
  { id: 'e101', name: '김철수', title: '개발팀장',        dept: '개발팀',    email: 'kim.cs@autofocus.co.kr', phone: '010-1234-5678', joinDate: '2020-03-02', status: '재직', contractType: '정규직', role: '관리자',   initial: '철', color: 'bg-blue-600' },
  { id: 'e102', name: '이서연', title: '시니어 개발자',   dept: '개발팀',    email: 'lee@autofocus.co.kr',    phone: '010-2345-6789', joinDate: '2021-01-11', status: '재직', contractType: '정규직', role: '일반직원', initial: '서', color: 'bg-blue-400' },
  { id: 'e103', name: '박준혁', title: '개발자',          dept: '개발팀',    email: 'park@autofocus.co.kr',   phone: '010-3456-7890', joinDate: '2022-06-01', status: '재직', contractType: '정규직', role: '일반직원', initial: '준', color: 'bg-cyan-500' },
  { id: 'e104', name: '한지우', title: '개발자',          dept: '개발팀',    email: 'han@autofocus.co.kr',    phone: '010-4567-8901', joinDate: '2022-09-05', status: '재직', contractType: '정규직', role: '일반직원', initial: '지', color: 'bg-sky-500' },
  { id: 'e105', name: '오민석', title: '주니어 개발자',   dept: '개발팀',    email: 'oh@autofocus.co.kr',     phone: '010-5678-9012', joinDate: '2024-02-19', status: '재직', contractType: '계약직', role: '일반직원', initial: '민', color: 'bg-blue-300' },
  { id: 'e201', name: '강동원', title: 'AI 사업부장',     dept: 'AI 사업부', email: 'kang@autofocus.co.kr',   phone: '010-6789-0123', joinDate: '2021-04-05', status: '재직', contractType: '정규직', role: '관리자',   initial: '동', color: 'bg-indigo-600' },
  { id: 'e202', name: '윤지호', title: 'AI 엔지니어',     dept: 'AI 사업부', email: 'yoon@autofocus.co.kr',   phone: '010-7890-1234', joinDate: '2022-11-14', status: '재직', contractType: '정규직', role: '일반직원', initial: '지', color: 'bg-indigo-400' },
  { id: 'e203', name: '장하은', title: 'AI 엔지니어',     dept: 'AI 사업부', email: 'jang@autofocus.co.kr',   phone: '010-8901-2345', joinDate: '2023-03-20', status: '재직', contractType: '정규직', role: '일반직원', initial: '하', color: 'bg-violet-400' },
  { id: 'e301', name: '서지민', title: '기획팀장',        dept: '기획팀',    email: 'seo@autofocus.co.kr',    phone: '010-9012-3456', joinDate: '2020-08-17', status: '재직', contractType: '정규직', role: '운영자',   initial: '지', color: 'bg-violet-600' },
  { id: 'e302', name: '최유진', title: '시니어 기획자',   dept: '기획팀',    email: 'choi@autofocus.co.kr',   phone: '010-0123-4567', joinDate: '2021-07-26', status: '재직', contractType: '정규직', role: '일반직원', initial: '유', color: 'bg-violet-400' },
  { id: 'e303', name: '임수빈', title: '기획자',          dept: '기획팀',    email: 'lim@autofocus.co.kr',    phone: '010-1234-0987', joinDate: '2023-10-02', status: '재직', contractType: '계약직', role: '일반직원', initial: '수', color: 'bg-purple-400' },
  { id: 'e401', name: '김나연', title: '마케팅팀장',      dept: '마케팅팀',  email: 'kim.ny@autofocus.co.kr', phone: '010-2345-1098', joinDate: '2020-05-11', status: '재직', contractType: '정규직', role: '운영자',   initial: '나', color: 'bg-rose-600' },
  { id: 'e402', name: '정재원', title: '마케터',          dept: '마케팅팀',  email: 'jung@autofocus.co.kr',   phone: '010-3456-2109', joinDate: '2022-02-28', status: '재직', contractType: '정규직', role: '일반직원', initial: '재', color: 'bg-rose-400' },
  { id: 'e403', name: '백승현', title: '콘텐츠 마케터',   dept: '마케팅팀',  email: 'baek@autofocus.co.kr',   phone: '010-4567-3210', joinDate: '2023-07-03', status: '재직', contractType: '계약직', role: '일반직원', initial: '승', color: 'bg-pink-400' },
  { id: 'e404', name: '홍민지', title: '마케터',          dept: '마케팅팀',  email: 'hong@autofocus.co.kr',   phone: '010-5678-4321', joinDate: '2024-01-08', status: '재직', contractType: '인턴',   role: '일반직원', initial: '민', color: 'bg-red-400' },
  { id: 'e501', name: '조현수', title: '인사팀장',        dept: '인사팀',    email: 'jo@autofocus.co.kr',     phone: '010-6789-5432', joinDate: '2019-11-25', status: '재직', contractType: '정규직', role: '관리자',   initial: '현', color: 'bg-amber-600' },
  { id: 'e502', name: '신예린', title: '인사 담당',       dept: '인사팀',    email: 'shin@autofocus.co.kr',   phone: '010-7890-6543', joinDate: '2021-09-13', status: '재직', contractType: '정규직', role: '운영자',   initial: '예', color: 'bg-amber-400' },
  { id: 'e503', name: '문소희', title: '채용 담당',       dept: '인사팀',    email: 'moon@autofocus.co.kr',   phone: '010-8901-7654', joinDate: '2022-12-05', status: '휴직', contractType: '정규직', role: '일반직원', initial: '소', color: 'bg-yellow-500', note: '육아휴직 중 (복직 예정 2025-03)' },
  { id: 'e601', name: '류다현', title: '디자인팀장',      dept: '디자인팀',  email: 'ryu@autofocus.co.kr',    phone: '010-9012-8765', joinDate: '2020-10-19', status: '재직', contractType: '정규직', role: '운영자',   initial: '다', color: 'bg-emerald-600' },
  { id: 'e602', name: '김민준', title: '시니어 디자이너', dept: '디자인팀',  email: 'kim.mj@autofocus.co.kr', phone: '010-0123-9876', joinDate: '2021-06-07', status: '재직', contractType: '정규직', role: '일반직원', initial: '민', color: 'bg-emerald-400' },
  { id: 'e603', name: '이하늘', title: 'UI/UX 디자이너', dept: '디자인팀',  email: 'lee.hn@autofocus.co.kr', phone: '010-1234-8765', joinDate: '2023-04-24', status: '퇴직', contractType: '정규직', role: '일반직원', initial: '하', color: 'bg-green-400', note: '2024-12-31 퇴직' },
]

const DEPTS: string[]         = ['전체', '개발팀', 'AI 사업부', '기획팀', '마케팅팀', '인사팀', '디자인팀']
const STATUSES: Status[]      = ['재직', '휴직', '퇴직']
const CONTRACT_TYPES: ContractType[] = ['정규직', '계약직', '인턴']
const ROLES: Role[]           = ['관리자', '운영자', '일반직원']

const AVATAR_COLORS = [
  'bg-blue-600', 'bg-indigo-600', 'bg-violet-600', 'bg-rose-600',
  'bg-amber-600', 'bg-emerald-600', 'bg-orange-600', 'bg-teal-600',
  'bg-cyan-600', 'bg-sky-600', 'bg-pink-600', 'bg-purple-600',
]

const STATUS_STYLE: Record<Status, string> = {
  '재직': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  '휴직': 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  '퇴직': 'bg-gray-100 text-gray-500 dark:bg-ide-hover dark:text-ide-muted',
}

const CONTRACT_STYLE: Record<ContractType, string> = {
  '정규직': 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  '계약직': 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
  '인턴':   'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400',
}

const ROLE_STYLE: Record<Role, string> = {
  '관리자':   'bg-slate-100 text-slate-700 dark:bg-ide-surface dark:text-ide-text',
  '운영자':   'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
  '일반직원': 'bg-gray-100 text-gray-500 dark:bg-ide-hover dark:text-ide-muted',
}

function calcTenure(joinDate: string) {
  const d = new Date(joinDate)
  const now = new Date()
  const months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
  const years = Math.floor(months / 12)
  const rem   = months % 12
  if (years === 0) return `${rem}개월`
  return rem === 0 ? `${years}년` : `${years}년 ${rem}개월`
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Avatar({ initial, color, size = 'md' }: { initial: string; color: string; size?: 'sm' | 'md' | 'lg' }) {
  const cls = { sm: 'w-7 h-7 text-[10px]', md: 'w-9 h-9 text-xs', lg: 'w-12 h-12 text-sm' }[size]
  return (
    <div className={`${cls} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initial}
    </div>
  )
}

function PendingAvatar({ initial }: { initial: string }) {
  return (
    <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-ide-hover flex items-center justify-center text-gray-500 dark:text-ide-subtle font-bold text-xs flex-shrink-0">
      {initial}
    </div>
  )
}

const inputCls  = 'w-full px-3 py-2 text-sm bg-gray-50 dark:bg-ide-surface border border-gray-200 dark:border-ide-border rounded-lg text-gray-800 dark:text-ide-text placeholder:text-gray-400 dark:placeholder:text-ide-muted focus:outline-none focus:border-slate-400 dark:focus:border-ide-active transition-colors'
const selectCls = inputCls + ' cursor-pointer'

// ─── Modal Base ───────────────────────────────────────────────────────────────

function Modal({ title, onClose, children, wide }: {
  title: string; onClose: () => void; children: React.ReactNode; wide?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className={`bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl shadow-xl w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-ide-border flex-shrink-0">
          <h2 className="text-sm font-bold text-gray-800 dark:text-ide-bright">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-ide-text hover:bg-gray-100 dark:hover:bg-ide-hover transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

function ConfirmDialog({ message, confirmLabel = '확인', danger = false, onConfirm, onCancel }: {
  message: string; confirmLabel?: string; danger?: boolean
  onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl shadow-xl w-full max-w-sm p-5 space-y-4">
        <p className="text-sm text-gray-700 dark:text-ide-text leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-ide-border text-gray-600 dark:text-ide-subtle hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors">취소</button>
          <button onClick={onConfirm} className={`px-3 py-1.5 text-xs rounded-lg text-white transition-colors ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 dark:bg-ide-active hover:bg-slate-800'}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Approval Modal ───────────────────────────────────────────────────────────

function ApprovalModal({ pending, onApprove, onClose }: {
  pending: PendingEmployee
  onApprove: (data: Omit<Employee, 'id'>) => void
  onClose: () => void
}) {
  const [title, setTitle]             = useState('')
  const [dept, setDept]               = useState('개발팀')
  const [contractType, setContractType] = useState<ContractType>('정규직')
  const [role, setRole]               = useState<Role>('일반직원')
  const [joinDate, setJoinDate]       = useState(new Date().toISOString().slice(0, 10))
  const [colorIdx, setColorIdx]       = useState(0)

  const labelCls = 'block text-xs font-semibold text-gray-600 dark:text-ide-subtle mb-1'

  function handleApprove() {
    if (!title.trim() || !joinDate) return
    onApprove({
      name: pending.name,
      title: title.trim(),
      dept,
      email: pending.email,
      phone: pending.phone,
      joinDate,
      status: '재직',
      contractType,
      role,
      initial: pending.initial,
      color: AVATAR_COLORS[colorIdx],
    })
  }

  return (
    <Modal title="신규 직원 승인" onClose={onClose} wide>
      <div className="p-5 space-y-5">

        {/* 가입자 정보 (read-only) */}
        <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
          <PendingAvatar initial={pending.initial} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 dark:text-ide-bright">{pending.name}</p>
            <p className="text-xs text-gray-500 dark:text-ide-subtle mt-0.5">{pending.email}</p>
            <p className="text-xs text-gray-500 dark:text-ide-subtle">{pending.phone}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] text-gray-400 dark:text-ide-muted">가입 신청일</p>
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">{pending.appliedDate}</p>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-ide-border pt-4">
          <p className="text-xs font-bold text-gray-500 dark:text-ide-muted uppercase tracking-widest mb-4">직무 및 권한 설정</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>직책 *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="예: 개발자, 디자이너" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>소속 팀</label>
              <select value={dept} onChange={e => setDept(e.target.value)} className={selectCls}>
                {DEPTS.slice(1).map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>고용 형태</label>
              <select value={contractType} onChange={e => setContractType(e.target.value as ContractType)} className={selectCls}>
                {CONTRACT_TYPES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>시스템 권한</label>
              <select value={role} onChange={e => setRole(e.target.value as Role)} className={selectCls}>
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>입사일 *</label>
              <input type="date" value={joinDate} onChange={e => setJoinDate(e.target.value)} className={inputCls} />
            </div>
          </div>

          <div className="mt-4">
            <label className={labelCls}>아바타 색상</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {AVATAR_COLORS.map((c, i) => (
                <button key={i} onClick={() => setColorIdx(i)}
                  className={`w-7 h-7 ${c} rounded-full flex items-center justify-center text-white text-[10px] font-bold transition-all ${colorIdx === i ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-ide-active' : ''}`}>
                  {colorIdx === i ? pending.initial : ''}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1 border-t border-gray-100 dark:border-ide-border">
          <button onClick={onClose} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-ide-border text-gray-600 dark:text-ide-subtle hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors">취소</button>
          <button onClick={handleApprove} disabled={!title.trim() || !joinDate}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors">
            <CheckCircle2 size={13} /> 승인 완료
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Employee Edit Form ───────────────────────────────────────────────────────

function EmployeeEditForm({ emp, onSave, onClose }: {
  emp: Employee
  onSave: (data: Omit<Employee, 'id'>) => void
  onClose: () => void
}) {
  const [title, setTitle]           = useState(emp.title)
  const [dept, setDept]             = useState(emp.dept)
  const [phone, setPhone]           = useState(emp.phone)
  const [joinDate, setJoinDate]     = useState(emp.joinDate)
  const [status, setStatus]         = useState<Status>(emp.status)
  const [contractType, setContractType] = useState<ContractType>(emp.contractType)
  const [role, setRole]             = useState<Role>(emp.role)
  const [note, setNote]             = useState(emp.note ?? '')
  const [colorIdx, setColorIdx]     = useState(() => {
    const i = AVATAR_COLORS.indexOf(emp.color)
    return i >= 0 ? i : 0
  })

  const labelCls = 'block text-xs font-semibold text-gray-600 dark:text-ide-subtle mb-1'

  function handleSave() {
    if (!title.trim() || !joinDate) return
    onSave({ ...emp, title: title.trim(), dept, phone: phone.trim(), joinDate, status, contractType, role, color: AVATAR_COLORS[colorIdx], note: note.trim() || undefined })
  }

  return (
    <Modal title="직원 정보 수정" onClose={onClose} wide>
      <div className="p-5 space-y-4">
        {/* Name + email (read-only) */}
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-ide-surface rounded-lg border border-gray-200 dark:border-ide-border">
          <Avatar initial={emp.initial} color={AVATAR_COLORS[colorIdx]} />
          <div>
            <p className="text-sm font-bold text-gray-800 dark:text-ide-bright">{emp.name}</p>
            <p className="text-xs text-gray-500 dark:text-ide-subtle">{emp.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>직책 *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>소속 팀</label>
            <select value={dept} onChange={e => setDept(e.target.value)} className={selectCls}>
              {DEPTS.slice(1).map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>고용 형태</label>
            <select value={contractType} onChange={e => setContractType(e.target.value as ContractType)} className={selectCls}>
              {CONTRACT_TYPES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>시스템 권한</label>
            <select value={role} onChange={e => setRole(e.target.value as Role)} className={selectCls}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>연락처</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-0000-0000" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>재직 상태</label>
            <select value={status} onChange={e => setStatus(e.target.value as Status)} className={selectCls}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>입사일</label>
            <input type="date" value={joinDate} onChange={e => setJoinDate(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div>
          <label className={labelCls}>아바타 색상</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {AVATAR_COLORS.map((c, i) => (
              <button key={i} onClick={() => setColorIdx(i)}
                className={`w-7 h-7 ${c} rounded-full flex items-center justify-center text-white text-[10px] font-bold transition-all ${colorIdx === i ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-ide-active' : ''}`}>
                {colorIdx === i ? emp.initial : ''}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>비고</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder="휴직 사유, 특이사항 등" className={inputCls + ' resize-none'} />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-ide-border text-gray-600 dark:text-ide-subtle hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors">취소</button>
          <button onClick={handleSave} disabled={!title.trim()}
            className="px-4 py-1.5 text-xs rounded-lg bg-slate-700 dark:bg-ide-active text-white hover:bg-slate-800 disabled:opacity-40 transition-colors">
            저장
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Employee Detail ──────────────────────────────────────────────────────────

function EmployeeDetail({ emp, onClose, onEdit, onDelete }: {
  emp: Employee; onClose: () => void; onEdit: () => void; onDelete: () => void
}) {
  return (
    <Modal title="직원 상세" onClose={onClose}>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-ide-border">
          <Avatar initial={emp.initial} color={emp.color} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-gray-900 dark:text-ide-bright">{emp.name}</p>
            <p className="text-sm text-gray-500 dark:text-ide-subtle">{emp.title}</p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLE[emp.status]}`}>{emp.status}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${CONTRACT_STYLE[emp.contractType]}`}>{emp.contractType}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${ROLE_STYLE[emp.role]}`}>{emp.role}</span>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {[
            { icon: <Briefcase size={13} />, label: '소속 팀',  value: emp.dept },
            { icon: <Mail size={13} />,      label: '이메일',   value: emp.email || '—' },
            { icon: <Phone size={13} />,     label: '연락처',   value: emp.phone || '—' },
            { icon: <Calendar size={13} />,  label: '입사일',   value: `${emp.joinDate} (${calcTenure(emp.joinDate)})` },
            { icon: <ShieldCheck size={13} />, label: '시스템 권한', value: emp.role },
          ].map(row => (
            <div key={row.label} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-ide-surface flex items-center justify-center text-gray-400 dark:text-ide-muted flex-shrink-0">
                {row.icon}
              </div>
              <div>
                <p className="text-[11px] text-gray-400 dark:text-ide-muted">{row.label}</p>
                <p className="text-sm text-gray-700 dark:text-ide-text">{row.value}</p>
              </div>
            </div>
          ))}
          {emp.note && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
              <p className="text-xs text-amber-700 dark:text-amber-400">{emp.note}</p>
            </div>
          )}
        </div>
        <div className="flex justify-between pt-2">
          <button onClick={onDelete} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
            <Trash2 size={12} /> 삭제
          </button>
          <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-slate-700 dark:bg-ide-active text-white hover:bg-slate-800 transition-colors">
            <Edit2 size={12} /> 정보 수정
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function HRPage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [pending, setPending]   = useState<PendingEmployee[]>(INIT_PENDING)
  const [employees, setEmployees] = useState<Employee[]>(INIT_EMPLOYEES)
  const [query, setQuery]         = useState('')
  const [deptFilter, setDeptFilter]     = useState('전체')
  const [statusFilter, setStatusFilter] = useState<Status | '전체'>('전체')
  const [viewingEmp, setViewingEmp]     = useState<Employee | null>(null)
  const [editingEmp, setEditingEmp]     = useState<Employee | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [approvingPending, setApprovingPending] = useState<PendingEmployee | null>(null)
  const [rejectingPending, setRejectingPending] = useState<PendingEmployee | null>(null)
  const [deptOpen, setDeptOpen]     = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hr-pending-card',
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.08, ease: 'power2.out' }
      )
      gsap.fromTo('.hr-row',
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.025, ease: 'power2.out', delay: 0.2 }
      )
    }, rootRef)
    return () => ctx.revert()
  }, [])

  const filtered = useMemo(() => employees.filter(e => {
    const q = query.trim().toLowerCase()
    const matchQ = !q || e.name.includes(query) || e.title.toLowerCase().includes(q) || e.dept.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)
    return matchQ && (deptFilter === '전체' || e.dept === deptFilter) && (statusFilter === '전체' || e.status === statusFilter)
  }), [employees, query, deptFilter, statusFilter])

  const stats = useMemo(() => ({
    total:    employees.length,
    active:   employees.filter(e => e.status === '재직').length,
    leave:    employees.filter(e => e.status === '휴직').length,
    resigned: employees.filter(e => e.status === '퇴직').length,
  }), [employees])

  function approveEmployee(data: Omit<Employee, 'id'>) {
    setEmployees(prev => [...prev, { id: `emp_${Date.now()}`, ...data }])
    setPending(prev => prev.filter(p => p.id !== approvingPending!.id))
    setApprovingPending(null)
  }

  function rejectPending(id: string) {
    setPending(prev => prev.filter(p => p.id !== id))
    setRejectingPending(null)
  }

  function editEmployee(data: Omit<Employee, 'id'>) {
    if (!editingEmp) return
    setEmployees(prev => prev.map(e => e.id === editingEmp.id ? { ...e, ...data } : e))
    setEditingEmp(null)
    setViewingEmp(null)
  }

  function deleteEmployee(id: string) {
    setEmployees(prev => prev.filter(e => e.id !== id))
    setViewingEmp(null)
    setConfirmDelete(null)
  }

  return (
    <div ref={rootRef} className="space-y-5 pb-6">

      {/* ── 페이지 헤더 ── */}
      <div>
        <h1 className="text-lg font-bold text-gray-900 dark:text-ide-bright">인사 관리</h1>
        <p className="text-sm text-gray-500 dark:text-ide-subtle mt-0.5">재직 {stats.active}명 · 전체 {stats.total}명</p>
      </div>

      {/* ── 승인 대기 섹션 ── */}
      {pending.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl overflow-hidden">
          {/* 섹션 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-amber-200 dark:border-amber-500/30">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-bold text-amber-800 dark:text-amber-300">승인 대기</span>
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                {pending.length}
              </span>
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              신규 가입 직원입니다. 승인 전까지 로그인할 수 없습니다.
            </p>
          </div>

          {/* 대기 카드 목록 */}
          <div className="divide-y divide-amber-200 dark:divide-amber-500/20">
            {pending.map(p => (
              <div key={p.id} className="hr-pending-card flex items-center gap-4 px-4 py-3 hover:bg-amber-100/50 dark:hover:bg-amber-500/10 transition-colors">
                <PendingAvatar initial={p.initial} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-ide-bright">{p.name}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-ide-subtle">
                      <Mail size={11} />{p.email}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-ide-subtle">
                      <Phone size={11} />{p.phone}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 mr-2">{p.appliedDate} 신청</span>
                  <button
                    onClick={() => setRejectingPending(p)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-ide-border text-gray-500 dark:text-ide-subtle hover:border-red-300 dark:hover:border-red-500/50 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <XCircle size={12} /> 거부
                  </button>
                  <button
                    onClick={() => setApprovingPending(p)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    <CheckCircle2 size={12} /> 승인
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 대기자 없을 때 안내 (선택적 표시) */}
      {pending.length === 0 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-ide-surface border border-gray-200 dark:border-ide-border rounded-xl">
          <AlertTriangle size={14} className="text-gray-400 dark:text-ide-muted flex-shrink-0" />
          <p className="text-xs text-gray-500 dark:text-ide-subtle">현재 승인 대기 중인 직원이 없습니다.</p>
        </div>
      )}

      {/* ── 통계 카드 ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '전체 임직원', value: stats.total,    icon: <Users size={16} />,    color: 'text-slate-600 dark:text-ide-subtle',           bg: 'bg-slate-50 dark:bg-ide-surface' },
          { label: '재직 중',    value: stats.active,   icon: <UserCheck size={16} />, color: 'text-emerald-600 dark:text-emerald-400',        bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { label: '휴직 중',   value: stats.leave,    icon: <Calendar size={16} />,  color: 'text-amber-600 dark:text-amber-400',            bg: 'bg-amber-50 dark:bg-amber-500/10' },
          { label: '퇴직',      value: stats.resigned, icon: <UserX size={16} />,     color: 'text-gray-500 dark:text-ide-muted',             bg: 'bg-gray-50 dark:bg-ide-hover' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-gray-100 dark:border-ide-border`}>
            <div className={`${s.color} mb-1`}>{s.icon}</div>
            <p className="text-xl font-bold text-gray-900 dark:text-ide-bright">{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-ide-subtle mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── 검색 & 필터 ── */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-ide-muted pointer-events-none" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="이름, 직책, 부서, 이메일 검색..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-lg text-gray-800 dark:text-ide-text placeholder:text-gray-400 dark:placeholder:text-ide-muted focus:outline-none focus:border-slate-400 dark:focus:border-ide-active transition-colors" />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="relative">
          <button onClick={() => { setDeptOpen(v => !v); setStatusOpen(false) }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-lg text-gray-700 dark:text-ide-text hover:border-gray-300 dark:hover:border-ide-active transition-colors">
            <Filter size={12} className="text-gray-400 dark:text-ide-muted" />{deptFilter}
            <ChevronDown size={12} className="text-gray-400 dark:text-ide-muted" />
          </button>
          {deptOpen && (
            <div className="absolute right-0 top-9 z-20 bg-white dark:bg-ide-surface border border-gray-200 dark:border-ide-border rounded-lg shadow-lg py-1 w-36">
              {DEPTS.map(d => (
                <button key={d} onClick={() => { setDeptFilter(d); setDeptOpen(false) }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors ${deptFilter === d ? 'text-slate-700 dark:text-ide-active font-semibold' : 'text-gray-700 dark:text-ide-text'}`}>
                  {d}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => { setStatusOpen(v => !v); setDeptOpen(false) }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-lg text-gray-700 dark:text-ide-text hover:border-gray-300 dark:hover:border-ide-active transition-colors">
            {statusFilter}<ChevronDown size={12} className="text-gray-400 dark:text-ide-muted" />
          </button>
          {statusOpen && (
            <div className="absolute right-0 top-9 z-20 bg-white dark:bg-ide-surface border border-gray-200 dark:border-ide-border rounded-lg shadow-lg py-1 w-28">
              {(['전체', ...STATUSES] as const).map(s => (
                <button key={s} onClick={() => { setStatusFilter(s); setStatusOpen(false) }}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors ${statusFilter === s ? 'text-slate-700 dark:text-ide-active font-semibold' : 'text-gray-700 dark:text-ide-text'}`}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 직원 테이블 ── */}
      <div className="bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[2fr_1.5fr_1.2fr_1fr_1fr_1fr_auto] gap-2 px-4 py-2.5 bg-gray-50 dark:bg-ide-surface border-b border-gray-200 dark:border-ide-border text-[11px] font-semibold text-gray-500 dark:text-ide-muted uppercase tracking-wide">
          <span>이름 / 직책</span>
          <span className="hidden sm:block">부서</span>
          <span className="hidden md:block">입사일</span>
          <span className="hidden lg:block">고용형태</span>
          <span className="hidden lg:block">권한</span>
          <span>상태</span>
          <span />
        </div>

        {filtered.map(emp => (
          <div key={emp.id}
            className="hr-row grid grid-cols-[2fr_1.5fr_1.2fr_1fr_1fr_1fr_auto] gap-2 items-center px-4 py-3 border-b border-gray-100 dark:border-ide-border last:border-0 hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors group cursor-pointer"
            onClick={() => setViewingEmp(emp)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar initial={emp.initial} color={emp.color} size="sm" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-ide-text truncate">{emp.name}</p>
                <p className="text-[11px] text-gray-400 dark:text-ide-muted truncate">{emp.title}</p>
              </div>
            </div>
            <span className="hidden sm:block text-sm text-gray-600 dark:text-ide-subtle truncate">{emp.dept}</span>
            <span className="hidden md:block text-sm text-gray-600 dark:text-ide-subtle">{emp.joinDate}</span>
            <span className="hidden lg:block">
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${CONTRACT_STYLE[emp.contractType]}`}>{emp.contractType}</span>
            </span>
            <span className="hidden lg:block">
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${ROLE_STYLE[emp.role]}`}>{emp.role}</span>
            </span>
            <span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLE[emp.status]}`}>{emp.status}</span>
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
              <button onClick={() => setEditingEmp(emp)} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-ide-text hover:bg-gray-100 dark:hover:bg-ide-surface transition-colors">
                <Edit2 size={13} />
              </button>
              <button onClick={() => setConfirmDelete(emp.id)} className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-ide-surface transition-colors">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <Search size={24} className="text-gray-300 dark:text-ide-border mb-2" />
            <p className="text-sm text-gray-500 dark:text-ide-subtle">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>

      {(query || deptFilter !== '전체' || statusFilter !== '전체') && (
        <p className="text-xs text-gray-400 dark:text-ide-muted text-right">
          {filtered.length}명 표시 중 (전체 {employees.length}명)
        </p>
      )}

      {/* ── 모달 ── */}
      {approvingPending && (
        <ApprovalModal pending={approvingPending} onApprove={approveEmployee} onClose={() => setApprovingPending(null)} />
      )}
      {rejectingPending && (
        <ConfirmDialog
          message={`'${rejectingPending.name}'의 가입 신청을 거부하시겠습니까? 해당 계정은 삭제됩니다.`}
          confirmLabel="거부" danger
          onConfirm={() => rejectPending(rejectingPending.id)}
          onCancel={() => setRejectingPending(null)}
        />
      )}
      {editingEmp && (
        <EmployeeEditForm emp={editingEmp} onSave={editEmployee} onClose={() => setEditingEmp(null)} />
      )}
      {viewingEmp && (
        <EmployeeDetail
          emp={viewingEmp}
          onClose={() => setViewingEmp(null)}
          onEdit={() => { setEditingEmp(viewingEmp); setViewingEmp(null) }}
          onDelete={() => setConfirmDelete(viewingEmp.id)}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          message={`'${employees.find(e => e.id === confirmDelete)?.name}' 직원 정보를 삭제하시겠습니까?`}
          confirmLabel="삭제" danger
          onConfirm={() => deleteEmployee(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {(deptOpen || statusOpen) && (
        <div className="fixed inset-0 z-10" onClick={() => { setDeptOpen(false); setStatusOpen(false) }} />
      )}
    </div>
  )
}
