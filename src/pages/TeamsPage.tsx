import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import {
  Users, Plus, Edit2, Trash2, ArrowRightLeft, X, Search,
  Crown, Check, MoreHorizontal
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Member {
  id: string
  name: string
  title: string
  email: string
  initial: string
  color: string
  isHead: boolean
}

interface Team {
  id: string
  name: string
  description: string
  indicator: string
  accent: string
  text: string
  members: Member[]
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INIT_TEAMS: Team[] = [
  {
    id: 'dev', name: '개발팀', description: '제품 및 서비스 개발 전담 팀',
    indicator: 'bg-blue-500', accent: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400',
    members: [
      { id: 'e101', name: '김철수', title: '개발팀장',        email: 'kim.cs@autofocus.co.kr', initial: '철', color: 'bg-blue-600',  isHead: true },
      { id: 'e102', name: '이서연', title: '시니어 개발자',   email: 'lee@autofocus.co.kr',    initial: '서', color: 'bg-blue-400',  isHead: false },
      { id: 'e103', name: '박준혁', title: '개발자',          email: 'park@autofocus.co.kr',   initial: '준', color: 'bg-cyan-500',  isHead: false },
      { id: 'e104', name: '한지우', title: '개발자',          email: 'han@autofocus.co.kr',    initial: '지', color: 'bg-sky-500',   isHead: false },
      { id: 'e105', name: '오민석', title: '주니어 개발자',   email: 'oh@autofocus.co.kr',     initial: '민', color: 'bg-blue-300',  isHead: false },
    ],
  },
  {
    id: 'ai', name: 'AI 사업부', description: 'AI 제품 연구 및 사업화 팀',
    indicator: 'bg-indigo-500', accent: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-700 dark:text-indigo-400',
    members: [
      { id: 'e201', name: '강동원', title: 'AI 사업부장', email: 'kang@autofocus.co.kr',  initial: '동', color: 'bg-indigo-600', isHead: true },
      { id: 'e202', name: '윤지호', title: 'AI 엔지니어', email: 'yoon@autofocus.co.kr', initial: '지', color: 'bg-indigo-400', isHead: false },
      { id: 'e203', name: '장하은', title: 'AI 엔지니어', email: 'jang@autofocus.co.kr', initial: '하', color: 'bg-violet-400', isHead: false },
    ],
  },
  {
    id: 'plan', name: '기획팀', description: '서비스 기획 및 전략 수립 팀',
    indicator: 'bg-violet-500', accent: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-700 dark:text-violet-400',
    members: [
      { id: 'e301', name: '서지민', title: '기획팀장',      email: 'seo@autofocus.co.kr',  initial: '지', color: 'bg-violet-600', isHead: true },
      { id: 'e302', name: '최유진', title: '시니어 기획자', email: 'choi@autofocus.co.kr', initial: '유', color: 'bg-violet-400', isHead: false },
      { id: 'e303', name: '임수빈', title: '기획자',        email: 'lim@autofocus.co.kr',  initial: '수', color: 'bg-purple-400', isHead: false },
    ],
  },
  {
    id: 'marketing', name: '마케팅팀', description: '브랜드 마케팅 및 콘텐츠 운영 팀',
    indicator: 'bg-rose-500', accent: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-700 dark:text-rose-400',
    members: [
      { id: 'e401', name: '김나연', title: '마케팅팀장',    email: 'kim.ny@autofocus.co.kr', initial: '나', color: 'bg-rose-600',  isHead: true },
      { id: 'e402', name: '정재원', title: '마케터',        email: 'jung@autofocus.co.kr',   initial: '재', color: 'bg-rose-400',  isHead: false },
      { id: 'e403', name: '백승현', title: '콘텐츠 마케터', email: 'baek@autofocus.co.kr',   initial: '승', color: 'bg-pink-400',  isHead: false },
      { id: 'e404', name: '홍민지', title: '마케터',        email: 'hong@autofocus.co.kr',   initial: '민', color: 'bg-red-400',   isHead: false },
    ],
  },
  {
    id: 'hr', name: '인사팀', description: '채용, 인사 운영 및 복지 관리 팀',
    indicator: 'bg-amber-500', accent: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400',
    members: [
      { id: 'e501', name: '조현수', title: '인사팀장',  email: 'jo@autofocus.co.kr',   initial: '현', color: 'bg-amber-600', isHead: true },
      { id: 'e502', name: '신예린', title: '인사 담당', email: 'shin@autofocus.co.kr', initial: '예', color: 'bg-amber-400', isHead: false },
      { id: 'e503', name: '문소희', title: '채용 담당', email: 'moon@autofocus.co.kr', initial: '소', color: 'bg-yellow-500', isHead: false },
    ],
  },
  {
    id: 'design', name: '디자인팀', description: 'UI/UX 디자인 및 브랜드 아이덴티티 팀',
    indicator: 'bg-emerald-500', accent: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400',
    members: [
      { id: 'e601', name: '류다현', title: '디자인팀장',      email: 'ryu@autofocus.co.kr',    initial: '다', color: 'bg-emerald-600', isHead: true },
      { id: 'e602', name: '김민준', title: '시니어 디자이너', email: 'kim.mj@autofocus.co.kr', initial: '민', color: 'bg-emerald-400', isHead: false },
      { id: 'e603', name: '이하늘', title: 'UI/UX 디자이너', email: 'lee.hn@autofocus.co.kr', initial: '하', color: 'bg-green-400',   isHead: false },
    ],
  },
]

const COLOR_OPTIONS = [
  { indicator: 'bg-blue-500',    accent: 'bg-blue-50 dark:bg-blue-500/10',       text: 'text-blue-700 dark:text-blue-400' },
  { indicator: 'bg-indigo-500',  accent: 'bg-indigo-50 dark:bg-indigo-500/10',   text: 'text-indigo-700 dark:text-indigo-400' },
  { indicator: 'bg-violet-500',  accent: 'bg-violet-50 dark:bg-violet-500/10',   text: 'text-violet-700 dark:text-violet-400' },
  { indicator: 'bg-rose-500',    accent: 'bg-rose-50 dark:bg-rose-500/10',       text: 'text-rose-700 dark:text-rose-400' },
  { indicator: 'bg-amber-500',   accent: 'bg-amber-50 dark:bg-amber-500/10',     text: 'text-amber-700 dark:text-amber-400' },
  { indicator: 'bg-emerald-500', accent: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400' },
  { indicator: 'bg-orange-500',  accent: 'bg-orange-50 dark:bg-orange-500/10',   text: 'text-orange-700 dark:text-orange-400' },
  { indicator: 'bg-teal-500',    accent: 'bg-teal-50 dark:bg-teal-500/10',       text: 'text-teal-700 dark:text-teal-400' },
]

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ initial, color, size = 'md' }: { initial: string; color: string; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs'
  return (
    <div className={`${cls} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initial}
    </div>
  )
}

// ─── Modal Base ───────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
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

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({ message, onConfirm, onCancel }: {
  message: string; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl shadow-xl w-full max-w-sm p-5 space-y-4">
        <p className="text-sm text-gray-700 dark:text-ide-text leading-relaxed">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-ide-border text-gray-600 dark:text-ide-subtle hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors">취소</button>
          <button onClick={onConfirm} className="px-3 py-1.5 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors">삭제</button>
        </div>
      </div>
    </div>
  )
}

// ─── Team Form Modal ──────────────────────────────────────────────────────────

function TeamFormModal({ initial, onSave, onClose }: {
  initial?: { name: string; description: string; indicator: string; accent: string; text: string }
  onSave: (data: { name: string; description: string; indicator: string; accent: string; text: string }) => void
  onClose: () => void
}) {
  const [name, setName]             = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [colorIdx, setColorIdx]     = useState(() => {
    if (!initial) return 0
    const i = COLOR_OPTIONS.findIndex(c => c.indicator === initial.indicator)
    return i >= 0 ? i : 0
  })

  function handleSave() {
    if (!name.trim()) return
    const c = COLOR_OPTIONS[colorIdx]
    onSave({ name: name.trim(), description: description.trim(), ...c })
  }

  const inputCls = 'w-full px-3 py-2 text-sm bg-gray-50 dark:bg-ide-surface border border-gray-200 dark:border-ide-border rounded-lg text-gray-800 dark:text-ide-text placeholder:text-gray-400 dark:placeholder:text-ide-muted focus:outline-none focus:border-slate-400 dark:focus:border-ide-active'

  return (
    <Modal title={initial ? '팀 정보 수정' : '새 팀 만들기'} onClose={onClose}>
      <div className="p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-ide-subtle mb-1.5">팀 이름 *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="팀 이름 입력" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-ide-subtle mb-1.5">팀 설명</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="팀 설명 (선택)" rows={2} className={inputCls + ' resize-none'} />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-ide-subtle mb-2">팀 색상</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c, i) => (
              <button key={i} onClick={() => setColorIdx(i)}
                className={`w-7 h-7 rounded-full ${c.indicator} flex items-center justify-center transition-all ${colorIdx === i ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-ide-active' : ''}`}>
                {colorIdx === i && <Check size={12} className="text-white" />}
              </button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-ide-border text-gray-600 dark:text-ide-subtle hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors">취소</button>
          <button onClick={handleSave} disabled={!name.trim()} className="px-4 py-1.5 text-xs rounded-lg bg-slate-700 dark:bg-ide-active text-white hover:bg-slate-800 disabled:opacity-40 transition-colors">
            {initial ? '저장' : '만들기'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Move Member Modal ────────────────────────────────────────────────────────

function MoveMemberModal({ member, fromTeamId, teams, onMove, onClose }: {
  member: Member; fromTeamId: string; teams: Team[]
  onMove: (toTeamId: string) => void; onClose: () => void
}) {
  const targets = teams.filter(t => t.id !== fromTeamId)
  return (
    <Modal title="팀원 이동" onClose={onClose}>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-ide-surface rounded-lg">
          <Avatar initial={member.initial} color={member.color} />
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-ide-text">{member.name}</p>
            <p className="text-xs text-gray-500 dark:text-ide-subtle">{member.title}</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600 dark:text-ide-subtle mb-2">이동할 팀 선택</p>
          <div className="space-y-1.5">
            {targets.map(t => (
              <button key={t.id} onClick={() => onMove(t.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-ide-border hover:border-slate-400 dark:hover:border-ide-active hover:bg-gray-50 dark:hover:bg-ide-hover transition-all text-left">
                <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${t.indicator}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-ide-text">{t.name}</span>
                <span className="ml-auto text-xs text-gray-400 dark:text-ide-muted">{t.members.length}명</span>
              </button>
            ))}
            {targets.length === 0 && (
              <p className="text-xs text-gray-400 dark:text-ide-muted text-center py-4">이동 가능한 팀이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ─── Team Detail Panel ────────────────────────────────────────────────────────

function TeamDetail({ team, teams, onClose, onEditTeam, onDeleteTeam, onMoveMember, onRemoveMember, onSetHead }: {
  team: Team; teams: Team[]; onClose: () => void; onEditTeam: () => void; onDeleteTeam: () => void
  onMoveMember: (member: Member) => void; onRemoveMember: (memberId: string) => void; onSetHead: (memberId: string) => void
}) {
  const [menuId, setMenuId]           = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  return (
    // overflow-visible so action dropdowns aren't clipped
    <div className="bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl flex flex-col">

      {/* Header */}
      <div className={`px-5 py-4 flex items-center justify-between ${team.accent} border-b border-gray-200 dark:border-ide-border rounded-t-xl flex-shrink-0`}>
        <div className="flex items-center gap-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${team.indicator}`} />
          <span className={`text-sm font-bold ${team.text}`}>{team.name}</span>
          <span className="text-xs text-gray-400 dark:text-ide-muted ml-1">{team.members.length}명</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onEditTeam} className="p-1.5 rounded-md text-gray-500 dark:text-ide-muted hover:bg-black/5 dark:hover:bg-ide-hover transition-colors" title="팀 수정">
            <Edit2 size={13} />
          </button>
          <button onClick={onDeleteTeam} className="p-1.5 rounded-md text-red-400 hover:bg-black/5 dark:hover:bg-ide-hover transition-colors" title="팀 삭제">
            <Trash2 size={13} />
          </button>
          <button onClick={onClose} className="p-1.5 rounded-md text-gray-400 hover:bg-black/5 dark:hover:bg-ide-hover transition-colors ml-1" title="닫기">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Description */}
      {team.description && (
        <div className="px-5 py-2.5 border-b border-gray-100 dark:border-ide-border flex-shrink-0">
          <p className="text-xs text-gray-500 dark:text-ide-subtle">{team.description}</p>
        </div>
      )}

      {/* Member List — scrollable, overflow-visible for dropdowns */}
      <div className="overflow-y-auto" style={{ maxHeight: '420px' }}>
        {team.members.map(m => (
          <div key={m.id} className="relative flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors group border-b border-gray-100 dark:border-ide-border last:border-0">
            <Avatar initial={m.initial} color={m.color} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-semibold text-gray-800 dark:text-ide-text">{m.name}</p>
                {m.isHead && <Crown size={11} className="text-amber-500 flex-shrink-0" />}
              </div>
              <p className="text-xs text-gray-500 dark:text-ide-subtle">{m.title}</p>
            </div>

            {/* Action menu */}
            <div className="relative flex-shrink-0">
              <button
                onClick={e => { e.stopPropagation(); setMenuId(menuId === m.id ? null : m.id) }}
                className="p-1.5 rounded-md text-gray-400 dark:text-ide-muted hover:text-gray-600 dark:hover:text-ide-text hover:bg-gray-100 dark:hover:bg-ide-surface opacity-0 group-hover:opacity-100 transition-all"
              >
                <MoreHorizontal size={14} />
              </button>

              {menuId === m.id && (
                <>
                  {/* backdrop to close on outside click */}
                  <div className="fixed inset-0 z-10" onClick={() => setMenuId(null)} />
                  <div className="absolute right-0 top-8 z-20 bg-white dark:bg-ide-surface border border-gray-200 dark:border-ide-border rounded-lg shadow-lg py-1 w-36 text-xs">
                    {!m.isHead && (
                      <button
                        onClick={() => { onSetHead(m.id); setMenuId(null) }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-ide-hover text-gray-700 dark:text-ide-text transition-colors"
                      >
                        <Crown size={12} className="text-amber-500" /> 팀장 지정
                      </button>
                    )}
                    <button
                      onClick={() => { onMoveMember(m); setMenuId(null) }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-ide-hover text-gray-700 dark:text-ide-text transition-colors"
                    >
                      <ArrowRightLeft size={12} /> 팀 이동
                    </button>
                    <button
                      onClick={() => { setConfirmRemove(m.id); setMenuId(null) }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-ide-hover text-red-500 transition-colors"
                    >
                      <Trash2 size={12} /> 팀에서 제거
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        {team.members.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <Users size={22} className="text-gray-300 dark:text-ide-border mb-2" />
            <p className="text-sm text-gray-500 dark:text-ide-subtle">팀원이 없습니다.</p>
          </div>
        )}
      </div>

      {confirmRemove && (
        <ConfirmDialog
          message="이 팀원을 팀에서 제거하시겠습니까? 직원 정보는 유지됩니다."
          onConfirm={() => { onRemoveMember(confirmRemove); setConfirmRemove(null) }}
          onCancel={() => setConfirmRemove(null)}
        />
      )}
    </div>
  )
}

// ─── Team Card ────────────────────────────────────────────────────────────────

function TeamCard({ team, selected, onClick }: { team: Team; selected: boolean; onClick: () => void }) {
  const head = team.members.find(m => m.isHead)
  return (
    <button
      onClick={onClick}
      className={`team-card w-full text-left bg-white dark:bg-ide-base border rounded-xl overflow-hidden transition-all hover:shadow-sm ${
        selected
          ? 'border-slate-400 dark:border-ide-active shadow-sm'
          : 'border-gray-200 dark:border-ide-border hover:border-gray-300 dark:hover:border-ide-active'
      }`}
    >
      <div className={`px-4 py-3 flex items-center justify-between ${team.accent}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${team.indicator}`} />
          <span className={`text-sm font-bold ${team.text}`}>{team.name}</span>
        </div>
        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-ide-subtle">
          <Users size={11} />{team.members.length}명
        </span>
      </div>
      <div className="px-4 py-3">
        <p className="text-xs text-gray-400 dark:text-ide-muted line-clamp-1 mb-3">{team.description || '—'}</p>
        {head ? (
          <div className="flex items-center gap-2">
            <Avatar initial={head.initial} color={head.color} size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-700 dark:text-ide-text truncate">{head.name}</p>
              <p className="text-[10px] text-gray-400 dark:text-ide-muted truncate">{head.title}</p>
            </div>
            <Crown size={10} className="text-amber-500 ml-auto flex-shrink-0" />
          </div>
        ) : (
          <p className="text-[11px] text-gray-400 dark:text-ide-muted">팀장 미지정</p>
        )}
      </div>
      <div className="px-4 pb-3 flex gap-1 flex-wrap">
        {team.members.slice(0, 6).map(m => (
          <Avatar key={m.id} initial={m.initial} color={m.color} size="sm" />
        ))}
        {team.members.length > 6 && (
          <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-ide-hover flex items-center justify-center">
            <span className="text-[9px] font-bold text-gray-500 dark:text-ide-subtle">+{team.members.length - 6}</span>
          </div>
        )}
      </div>
    </button>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function TeamsPage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [teams, setTeams]           = useState<Team[]>(INIT_TEAMS)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [query, setQuery]           = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editingTeam, setEditingTeam]     = useState<Team | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [movingMember, setMovingMember]   = useState<{ member: Member; fromTeamId: string } | null>(null)

  const selectedTeam  = teams.find(t => t.id === selectedId) ?? null
  const filteredTeams = query.trim()
    ? teams.filter(t =>
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.members.some(m => m.name.includes(query))
      )
    : teams

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.team-card',
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: 'power2.out' }
      )
    }, rootRef)
    return () => ctx.revert()
  }, [])

  function createTeam(data: { name: string; description: string; indicator: string; accent: string; text: string }) {
    setTeams(prev => [...prev, { id: `team_${Date.now()}`, members: [], ...data }])
    setShowCreate(false)
  }

  function saveEditTeam(data: { name: string; description: string; indicator: string; accent: string; text: string }) {
    if (!editingTeam) return
    setTeams(prev => prev.map(t => t.id === editingTeam.id ? { ...t, ...data } : t))
    setEditingTeam(null)
  }

  function deleteTeam(id: string) {
    setTeams(prev => prev.filter(t => t.id !== id))
    if (selectedId === id) setSelectedId(null)
    setConfirmDelete(null)
  }

  function moveMember(toTeamId: string) {
    if (!movingMember) return
    const { member, fromTeamId } = movingMember
    setTeams(prev => prev.map(t => {
      if (t.id === fromTeamId) return { ...t, members: t.members.filter(m => m.id !== member.id) }
      if (t.id === toTeamId)   return { ...t, members: [...t.members, { ...member, isHead: false }] }
      return t
    }))
    setMovingMember(null)
  }

  function removeMember(teamId: string, memberId: string) {
    setTeams(prev => prev.map(t =>
      t.id === teamId ? { ...t, members: t.members.filter(m => m.id !== memberId) } : t
    ))
  }

  function setHead(teamId: string, memberId: string) {
    setTeams(prev => prev.map(t =>
      t.id === teamId
        ? { ...t, members: t.members.map(m => ({ ...m, isHead: m.id === memberId })) }
        : t
    ))
  }

  const totalMembers = teams.reduce((sum, t) => sum + t.members.length, 0)

  return (
    <div ref={rootRef} className="space-y-5 pb-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-ide-bright">팀 관리</h1>
          <p className="text-sm text-gray-500 dark:text-ide-subtle mt-0.5">총 {teams.length}개 팀 · {totalMembers}명</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 dark:bg-ide-active text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus size={14} /> 팀 만들기
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-ide-muted pointer-events-none" />
        <input
          value={query} onChange={e => setQuery(e.target.value)}
          placeholder="팀명 또는 팀원 이름으로 검색..."
          className="w-full pl-9 pr-9 py-2 text-sm bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-lg text-gray-800 dark:text-ide-text placeholder:text-gray-400 dark:placeholder:text-ide-muted focus:outline-none focus:border-slate-400 dark:focus:border-ide-active transition-colors"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className={`grid gap-5 items-start ${selectedTeam ? 'grid-cols-1 lg:grid-cols-[1fr_320px]' : 'grid-cols-1'}`}>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTeams.map(t => (
            <TeamCard
              key={t.id}
              team={t}
              selected={selectedId === t.id}
              onClick={() => setSelectedId(selectedId === t.id ? null : t.id)}
            />
          ))}
          {filteredTeams.length === 0 && (
            <div className="col-span-full flex flex-col items-center py-16 text-center">
              <Search size={24} className="text-gray-300 dark:text-ide-border mb-2" />
              <p className="text-sm text-gray-500 dark:text-ide-subtle">검색 결과가 없습니다.</p>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedTeam && (
          <div className="lg:sticky lg:top-4">
            <TeamDetail
              team={selectedTeam}
              teams={teams}
              onClose={() => setSelectedId(null)}
              onEditTeam={() => setEditingTeam(selectedTeam)}
              onDeleteTeam={() => setConfirmDelete(selectedTeam.id)}
              onMoveMember={member => setMovingMember({ member, fromTeamId: selectedTeam.id })}
              onRemoveMember={memberId => removeMember(selectedTeam.id, memberId)}
              onSetHead={memberId => setHead(selectedTeam.id, memberId)}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && <TeamFormModal onSave={createTeam} onClose={() => setShowCreate(false)} />}
      {editingTeam && (
        <TeamFormModal initial={editingTeam} onSave={saveEditTeam} onClose={() => setEditingTeam(null)} />
      )}
      {confirmDelete && (
        <ConfirmDialog
          message={`'${teams.find(t => t.id === confirmDelete)?.name}' 팀을 삭제하시겠습니까? 팀원은 소속 없이 남습니다.`}
          onConfirm={() => deleteTeam(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
      {movingMember && (
        <MoveMemberModal
          member={movingMember.member}
          fromTeamId={movingMember.fromTeamId}
          teams={teams}
          onMove={moveMember}
          onClose={() => setMovingMember(null)}
        />
      )}
    </div>
  )
}
