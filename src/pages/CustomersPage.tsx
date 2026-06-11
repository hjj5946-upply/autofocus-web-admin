import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import {
  Search, X, Filter, Edit2, Trash2, ChevronDown, ChevronUp,
  Users, UserCheck, UserMinus, Ban, Phone, Mail, Calendar, Clock,
  MoreHorizontal
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type MemberStatus = '활성' | '비활성' | '탈퇴'

interface Member {
  id: string
  name: string
  email: string
  phone: string
  joinDate: string
  lastLogin: string
  status: MemberStatus
  initial: string
  color: string
  memo?: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INIT_MEMBERS: Member[] = [
  { id: 'm001', name: '이준호', email: 'junho.lee@email.com',    phone: '010-4421-3388', joinDate: '2024-01-15', lastLogin: '2025-06-10', status: '활성',  initial: '준', color: 'bg-blue-500',    memo: '' },
  { id: 'm002', name: '박수연', email: 'suyeon.park@email.com',  phone: '010-7732-5541', joinDate: '2024-02-03', lastLogin: '2025-06-08', status: '활성',  initial: '수', color: 'bg-violet-500',  memo: '' },
  { id: 'm003', name: '김태영', email: 'ty.kim@email.com',       phone: '010-5512-8872', joinDate: '2024-03-22', lastLogin: '2025-05-29', status: '활성',  initial: '태', color: 'bg-emerald-500', memo: '' },
  { id: 'm004', name: '최지은', email: 'jieun.choi@email.com',   phone: '010-8841-1124', joinDate: '2024-04-11', lastLogin: '2025-04-15', status: '비활성', initial: '지', color: 'bg-amber-500',   memo: '장기 미접속' },
  { id: 'm005', name: '윤민석', email: 'ms.yoon@email.com',      phone: '010-3318-6659', joinDate: '2024-05-30', lastLogin: '2025-06-11', status: '활성',  initial: '민', color: 'bg-rose-500',    memo: '' },
  { id: 'm006', name: '강예린', email: 'yerin.kang@email.com',   phone: '010-2247-9903', joinDate: '2024-06-09', lastLogin: '2025-06-01', status: '활성',  initial: '예', color: 'bg-indigo-500',  memo: '' },
  { id: 'm007', name: '임도현', email: 'dohyun.lim@email.com',   phone: '010-6683-4417', joinDate: '2024-07-17', lastLogin: '2025-02-20', status: '비활성', initial: '도', color: 'bg-teal-500',    memo: '' },
  { id: 'm008', name: '신하영', email: 'hayoung.shin@email.com', phone: '010-9954-7721', joinDate: '2024-08-25', lastLogin: '2024-12-01', status: '탈퇴',  initial: '하', color: 'bg-gray-400',    memo: '본인 요청 탈퇴' },
  { id: 'm009', name: '정우진', email: 'wj.jung@email.com',      phone: '010-1132-5548', joinDate: '2024-09-04', lastLogin: '2025-06-09', status: '활성',  initial: '우', color: 'bg-cyan-500',    memo: '' },
  { id: 'm010', name: '오서희', email: 'seo.oh@email.com',       phone: '010-7765-2293', joinDate: '2024-10-13', lastLogin: '2025-05-14', status: '활성',  initial: '서', color: 'bg-pink-500',    memo: '' },
  { id: 'm011', name: '한동훈', email: 'dh.han@email.com',       phone: '010-4429-8861', joinDate: '2024-11-05', lastLogin: '2025-06-07', status: '활성',  initial: '동', color: 'bg-orange-500',  memo: '' },
  { id: 'm012', name: '류지수', email: 'jisu.ryu@email.com',     phone: '010-8832-3374', joinDate: '2024-12-20', lastLogin: '2025-01-30', status: '탈퇴',  initial: '지', color: 'bg-gray-400',    memo: '' },
]

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<MemberStatus, { badge: string; dot: string }> = {
  활성:  { badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400', dot: 'bg-emerald-500' },
  비활성: { badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',        dot: 'bg-amber-400' },
  탈퇴:  { badge: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',                dot: 'bg-red-400' },
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ member, onSave, onClose }: {
  member: Member; onSave: (updated: Member) => void; onClose: () => void
}) {
  const [form, setForm] = useState({ ...member })

  const inputCls = 'w-full px-3 py-2 text-sm bg-gray-50 dark:bg-ide-surface border border-gray-200 dark:border-ide-border rounded-lg text-gray-800 dark:text-ide-text placeholder:text-gray-400 dark:placeholder:text-ide-muted focus:outline-none focus:border-slate-400 dark:focus:border-ide-active transition-colors'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-ide-border flex-shrink-0">
          <h2 className="text-sm font-bold text-gray-800 dark:text-ide-bright">회원 정보 수정</h2>
          <button onClick={onClose} className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-ide-text hover:bg-gray-100 dark:hover:bg-ide-hover transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-ide-subtle mb-1.5">이름</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-ide-subtle mb-1.5">이메일</label>
            <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-ide-subtle mb-1.5">연락처</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-ide-subtle mb-1.5">상태</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as MemberStatus }))} className={inputCls}>
              <option value="활성">활성</option>
              <option value="비활성">비활성</option>
              <option value="탈퇴">탈퇴</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-ide-subtle mb-1.5">메모</label>
            <textarea value={form.memo ?? ''} onChange={e => setForm(f => ({ ...f, memo: e.target.value }))} rows={2} className={inputCls + ' resize-none'} placeholder="내부 메모 (선택)" />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-ide-border flex-shrink-0">
          <button onClick={onClose} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-ide-border text-gray-600 dark:text-ide-subtle hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors">취소</button>
          <button onClick={() => onSave(form)} className="px-4 py-1.5 text-xs rounded-lg bg-slate-700 dark:bg-ide-active text-white hover:bg-slate-800 transition-colors">저장</button>
        </div>
      </div>
    </div>
  )
}

// ─── Confirm Delete ───────────────────────────────────────────────────────────

function ConfirmDialog({ name, onConfirm, onCancel }: {
  name: string; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl shadow-xl w-full max-w-sm p-5 space-y-4">
        <p className="text-sm text-gray-700 dark:text-ide-text leading-relaxed">
          <span className="font-semibold">{name}</span> 회원을 삭제하시겠습니까?<br />
          <span className="text-gray-500 dark:text-ide-subtle text-xs">이 작업은 되돌릴 수 없습니다.</span>
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-ide-border text-gray-600 dark:text-ide-subtle hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors">취소</button>
          <button onClick={onConfirm} className="px-3 py-1.5 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors">삭제</button>
        </div>
      </div>
    </div>
  )
}

// ─── Row Component ────────────────────────────────────────────────────────────

function MemberRow({ member, expanded, onToggle, onEdit, onDelete }: {
  member: Member; expanded: boolean; onToggle: () => void
  onEdit: () => void; onDelete: () => void
}) {
  const cfg = STATUS_CONFIG[member.status]
  return (
    <>
      <tr
        className={`customer-row border-b border-gray-100 dark:border-ide-border transition-colors cursor-pointer select-none
          ${expanded ? 'bg-slate-50 dark:bg-ide-hover' : 'hover:bg-gray-50 dark:hover:bg-ide-hover'}`}
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full ${member.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {member.initial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-ide-text">{member.name}</p>
              <p className="text-xs text-gray-400 dark:text-ide-muted truncate">{member.email}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600 dark:text-ide-subtle hidden sm:table-cell">{member.phone}</td>
        <td className="px-4 py-3 text-xs text-gray-500 dark:text-ide-subtle hidden md:table-cell">{member.joinDate}</td>
        <td className="px-4 py-3 text-xs text-gray-500 dark:text-ide-subtle hidden lg:table-cell">{member.lastLogin}</td>
        <td className="px-4 py-3">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {member.status}
          </span>
        </td>
        <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-end gap-1">
            <button onClick={onEdit} className="p-1.5 rounded-md text-gray-400 hover:text-slate-600 dark:hover:text-ide-text hover:bg-gray-100 dark:hover:bg-ide-surface transition-colors" title="수정">
              <Edit2 size={13} />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" title="삭제">
              <Trash2 size={13} />
            </button>
            <span className="p-1.5 text-gray-300 dark:text-ide-muted">
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </span>
          </div>
        </td>
      </tr>

      {/* Expanded detail */}
      {expanded && (
        <tr className="bg-slate-50 dark:bg-ide-hover border-b border-gray-200 dark:border-ide-border">
          <td colSpan={6} className="px-4 pb-3 pt-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-ide-subtle sm:hidden">
                <Phone size={11} className="flex-shrink-0" />
                <span>{member.phone}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-ide-subtle">
                <Mail size={11} className="flex-shrink-0" />
                <span className="truncate">{member.email}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-ide-subtle md:hidden">
                <Calendar size={11} className="flex-shrink-0" />
                <span>가입: {member.joinDate}</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-ide-subtle lg:hidden">
                <Clock size={11} className="flex-shrink-0" />
                <span>최근: {member.lastLogin}</span>
              </div>
            </div>
            {member.memo && (
              <p className="mt-2 text-xs text-gray-400 dark:text-ide-muted bg-white dark:bg-ide-surface border border-gray-100 dark:border-ide-border rounded px-2 py-1.5">
                메모: {member.memo}
              </p>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type SortKey = 'name' | 'joinDate' | 'lastLogin'
type SortDir = 'asc' | 'desc'

export default function CustomersPage() {
  const rootRef                       = useRef<HTMLDivElement>(null)
  const [members, setMembers]         = useState<Member[]>(INIT_MEMBERS)
  const [query, setQuery]             = useState('')
  const [filterStatus, setFilterStatus] = useState<MemberStatus | '전체'>('전체')
  const [sortKey, setSortKey]         = useState<SortKey>('joinDate')
  const [sortDir, setSortDir]         = useState<SortDir>('desc')
  const [expandedId, setExpandedId]   = useState<string | null>(null)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [confirmId, setConfirmId]     = useState<string | null>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.customer-row',
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.04, ease: 'power2.out' }
      )
    }, rootRef)
    return () => ctx.revert()
  }, [])

  const stats = {
    total:    members.length,
    active:   members.filter(m => m.status === '활성').length,
    inactive: members.filter(m => m.status === '비활성').length,
    left:     members.filter(m => m.status === '탈퇴').length,
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const displayed = members
    .filter(m => {
      const q = query.trim().toLowerCase()
      if (filterStatus !== '전체' && m.status !== filterStatus) return false
      if (!q) return true
      return m.name.includes(q) || m.email.toLowerCase().includes(q) || m.phone.includes(q)
    })
    .sort((a, b) => {
      const cmp = a[sortKey] < b[sortKey] ? -1 : a[sortKey] > b[sortKey] ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })

  function saveMember(updated: Member) {
    setMembers(prev => prev.map(m => m.id === updated.id ? updated : m))
    setEditingMember(null)
  }

  function deleteMember(id: string) {
    setMembers(prev => prev.filter(m => m.id !== id))
    setConfirmId(null)
    if (expandedId === id) setExpandedId(null)
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <MoreHorizontal size={11} className="text-gray-300 dark:text-ide-muted" />
    return sortDir === 'asc'
      ? <ChevronUp size={11} className="text-slate-500 dark:text-ide-text" />
      : <ChevronDown size={11} className="text-slate-500 dark:text-ide-text" />
  }

  const STATUS_FILTERS: Array<MemberStatus | '전체'> = ['전체', '활성', '비활성', '탈퇴']

  return (
    <div ref={rootRef} className="space-y-5 pb-6">

      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-gray-900 dark:text-ide-bright">고객 관리</h1>
        <p className="text-sm text-gray-500 dark:text-ide-subtle mt-0.5">가입 회원을 조회하고 관리합니다.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '전체 회원',  value: stats.total,    icon: Users,     color: 'text-slate-600 dark:text-ide-text',      bg: 'bg-slate-50 dark:bg-ide-surface' },
          { label: '활성',       value: stats.active,   icon: UserCheck, color: 'text-emerald-600 dark:text-emerald-400',  bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { label: '비활성',     value: stats.inactive, icon: UserMinus, color: 'text-amber-600 dark:text-amber-400',      bg: 'bg-amber-50 dark:bg-amber-500/10' },
          { label: '탈퇴',       value: stats.left,     icon: Ban,       color: 'text-red-500 dark:text-red-400',          bg: 'bg-red-50 dark:bg-red-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`${bg} border border-gray-200 dark:border-ide-border rounded-xl px-4 py-3 flex items-center gap-3`}>
            <Icon size={18} className={color} />
            <div>
              <p className="text-xs text-gray-500 dark:text-ide-subtle">{label}</p>
              <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-ide-muted pointer-events-none" />
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="이름, 이메일, 연락처 검색..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-lg text-gray-800 dark:text-ide-text placeholder:text-gray-400 dark:placeholder:text-ide-muted focus:outline-none focus:border-slate-400 dark:focus:border-ide-active transition-colors"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={13} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-lg px-2 py-1.5 flex-shrink-0">
          <Filter size={13} className="text-gray-400 dark:text-ide-muted mr-1" />
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-slate-700 dark:bg-ide-active text-white'
                  : 'text-gray-500 dark:text-ide-subtle hover:bg-gray-100 dark:hover:bg-ide-hover'
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-ide-border bg-gray-50/60 dark:bg-ide-surface">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-ide-subtle">회원</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-ide-subtle hidden sm:table-cell">연락처</th>
                <th
                  className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-ide-subtle hidden md:table-cell cursor-pointer select-none hover:text-gray-700 dark:hover:text-ide-text"
                  onClick={() => toggleSort('joinDate')}
                >
                  <span className="flex items-center gap-1">가입일 <SortIcon k="joinDate" /></span>
                </th>
                <th
                  className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-ide-subtle hidden lg:table-cell cursor-pointer select-none hover:text-gray-700 dark:hover:text-ide-text"
                  onClick={() => toggleSort('lastLogin')}
                >
                  <span className="flex items-center gap-1">최근 접속 <SortIcon k="lastLogin" /></span>
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-ide-subtle">상태</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-ide-subtle text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map(m => (
                <MemberRow
                  key={m.id}
                  member={m}
                  expanded={expandedId === m.id}
                  onToggle={() => setExpandedId(expandedId === m.id ? null : m.id)}
                  onEdit={() => setEditingMember(m)}
                  onDelete={() => setConfirmId(m.id)}
                />
              ))}
            </tbody>
          </table>
        </div>

        {displayed.length === 0 && (
          <div className="flex flex-col items-center py-16">
            <Search size={24} className="text-gray-300 dark:text-ide-border mb-2" />
            <p className="text-sm text-gray-500 dark:text-ide-subtle">검색 결과가 없습니다.</p>
          </div>
        )}

        {displayed.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-100 dark:border-ide-border text-xs text-gray-400 dark:text-ide-muted">
            {displayed.length}명 표시 / 전체 {members.length}명
          </div>
        )}
      </div>

      {/* Modals */}
      {editingMember && (
        <EditModal member={editingMember} onSave={saveMember} onClose={() => setEditingMember(null)} />
      )}
      {confirmId && (
        <ConfirmDialog
          name={members.find(m => m.id === confirmId)?.name ?? ''}
          onConfirm={() => deleteMember(confirmId)}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  )
}
