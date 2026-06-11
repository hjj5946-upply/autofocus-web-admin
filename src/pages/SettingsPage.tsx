import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import {
  User, Shield, Bell, Monitor, Building2, Users,
  ChevronRight, Check, Eye, EyeOff, Save, AlertCircle,
  Sun, Moon, LogOut, Trash2, X
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionId = 'profile' | 'security' | 'notifications' | 'display' | 'company' | 'permissions'

interface NavItem { id: SectionId; label: string; icon: React.ReactNode; desc: string }

interface NotifSetting { id: string; label: string; desc: string; email: boolean; push: boolean }

interface AdminUser { id: string; name: string; email: string; role: string; initial: string; color: string }

// ─── Nav Config ───────────────────────────────────────────────────────────────

const NAV: NavItem[] = [
  { id: 'profile',       label: '내 프로필',   icon: <User size={15} />,      desc: '이름, 연락처, 소속 정보 관리' },
  { id: 'security',      label: '계정 보안',   icon: <Shield size={15} />,    desc: '비밀번호 변경 및 세션 관리' },
  { id: 'notifications', label: '알림 설정',   icon: <Bell size={15} />,      desc: '이메일 및 푸시 알림 설정' },
  { id: 'display',       label: '화면/테마',   icon: <Monitor size={15} />,   desc: '테마, 언어, 화면 옵션' },
  { id: 'company',       label: '회사 정보',   icon: <Building2 size={15} />, desc: '사업자 정보 및 기본 설정' },
  { id: 'permissions',   label: '접근 권한',   icon: <Users size={15} />,     desc: '관리자 계정 및 역할 관리' },
]

const ROLES = ['슈퍼 관리자', '관리자', '운영자', '열람자']

const INIT_ADMINS: AdminUser[] = [
  { id: 'a1', name: '관리자',  email: 'admin@autofocus.co.kr',  role: '슈퍼 관리자', initial: '관', color: 'bg-slate-700' },
  { id: 'a2', name: '조현수',  email: 'jo@autofocus.co.kr',     role: '관리자',      initial: '현', color: 'bg-amber-600' },
  { id: 'a3', name: '서지민',  email: 'seo@autofocus.co.kr',    role: '운영자',      initial: '지', color: 'bg-violet-600' },
  { id: 'a4', name: '김철수',  email: 'kim.cs@autofocus.co.kr', role: '열람자',      initial: '철', color: 'bg-blue-600' },
]

const INIT_NOTIFS: NotifSetting[] = [
  { id: 'n1', label: '근태/휴가 알림',  desc: '휴가 신청, 승인 결과 알림',        email: true,  push: true },
  { id: 'n2', label: '결재/서명 알림',  desc: '결재 요청, 완료 알림',             email: true,  push: true },
  { id: 'n3', label: '공지사항 알림',   desc: '새 공지사항 등록 알림',            email: true,  push: false },
  { id: 'n4', label: '일정 알림',       desc: '회사 일정 및 이벤트 알림',         email: false, push: true },
  { id: 'n5', label: '라운지 알림',     desc: '게시글 댓글, 반응 알림',           email: false, push: false },
  { id: 'n6', label: '시스템 알림',     desc: '점검, 업데이트, 보안 공지 알림',   email: true,  push: true },
]

const SESSIONS = [
  { id: 's1', device: 'Chrome / Windows 11', location: '서울, 한국', time: '현재 접속 중', current: true },
  { id: 's2', device: 'Safari / iPhone 15',  location: '서울, 한국', time: '2시간 전',     current: false },
  { id: 's3', device: 'Chrome / MacBook',    location: '서울, 한국', time: '어제 오후 3시', current: false },
]

// ─── Shared UI ────────────────────────────────────────────────────────────────

function SectionCard({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 dark:border-ide-border">
        <h3 className="text-sm font-bold text-gray-800 dark:text-ide-bright">{title}</h3>
        {desc && <p className="text-xs text-gray-500 dark:text-ide-subtle mt-0.5">{desc}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function FieldRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-1.5 sm:gap-4 sm:items-center">
      <label className="text-xs font-semibold text-gray-600 dark:text-ide-subtle">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 text-sm bg-gray-50 dark:bg-ide-surface border border-gray-200 dark:border-ide-border rounded-lg text-gray-800 dark:text-ide-text placeholder:text-gray-400 dark:placeholder:text-ide-muted focus:outline-none focus:border-slate-400 dark:focus:border-ide-active transition-colors'

function SaveBar({ onSave, saved }: { onSave: () => void; saved: boolean }) {
  return (
    <div className="flex justify-end">
      <button
        onClick={onSave}
        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-700 dark:bg-ide-active text-white hover:bg-slate-800 transition-colors"
      >
        {saved ? <><Check size={13} /> 저장됨</> : <><Save size={13} /> 저장</>}
      </button>
    </div>
  )
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${on ? 'bg-slate-700 dark:bg-ide-active' : 'bg-gray-200 dark:bg-ide-hover'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${on ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  )
}

function Avatar({ initial, color, size = 'md' }: { initial: string; color: string; size?: 'sm' | 'md' | 'lg' }) {
  const cls = { sm: 'w-7 h-7 text-[10px]', md: 'w-9 h-9 text-xs', lg: 'w-14 h-14 text-base' }[size]
  return (
    <div className={`${cls} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>{initial}</div>
  )
}

// ─── Sections ─────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-slate-700', 'bg-blue-600', 'bg-indigo-600', 'bg-violet-600',
  'bg-rose-600',  'bg-amber-600', 'bg-emerald-600', 'bg-teal-600',
]

function ProfileSection() {
  const [name, setName]       = useState('관리자')
  const [email, setEmail]     = useState('admin@autofocus.co.kr')
  const [phone, setPhone]     = useState('010-0000-0000')
  const [dept, setDept]       = useState('시스템관리')
  const [title, setTitle]     = useState('시스템 관리자')
  const [bio, setBio]         = useState('')
  const [colorIdx, setColorIdx] = useState(0)
  const [saved, setSaved]     = useState(false)

  function save() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="space-y-4">
      <SectionCard title="기본 프로필" desc="시스템에서 표시되는 내 정보입니다.">
        <div className="space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-5 pb-4 border-b border-gray-100 dark:border-ide-border">
            <Avatar initial={name?.[0] ?? '관'} color={AVATAR_COLORS[colorIdx]} size="lg" />
            <div>
              <p className="text-xs font-semibold text-gray-700 dark:text-ide-text mb-2">아바타 색상</p>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_COLORS.map((c, i) => (
                  <button key={i} onClick={() => setColorIdx(i)}
                    className={`w-6 h-6 ${c} rounded-full transition-all ${colorIdx === i ? 'ring-2 ring-offset-1 ring-slate-400 dark:ring-ide-active' : ''}`} />
                ))}
              </div>
            </div>
          </div>

          <FieldRow label="이름" required>
            <input value={name} onChange={e => setName(e.target.value)} className={inputCls} />
          </FieldRow>
          <FieldRow label="이메일" required>
            <input value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
          </FieldRow>
          <FieldRow label="연락처">
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="010-0000-0000" className={inputCls} />
          </FieldRow>
          <FieldRow label="부서">
            <input value={dept} onChange={e => setDept(e.target.value)} className={inputCls} />
          </FieldRow>
          <FieldRow label="직책">
            <input value={title} onChange={e => setTitle(e.target.value)} className={inputCls} />
          </FieldRow>
          <FieldRow label="소개">
            <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2} placeholder="자기소개를 입력하세요 (선택)" className={inputCls + ' resize-none'} />
          </FieldRow>
          <SaveBar onSave={save} saved={saved} />
        </div>
      </SectionCard>
    </div>
  )
}

function SecuritySection() {
  const [current, setCurrent]   = useState('')
  const [next, setNext]         = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState('')
  const [sessions, setSessions] = useState(SESSIONS)

  function savePw() {
    if (!current || !next || !confirm) { setError('모든 항목을 입력해주세요.'); return }
    if (next !== confirm)              { setError('새 비밀번호가 일치하지 않습니다.'); return }
    if (next.length < 8)               { setError('비밀번호는 8자 이상이어야 합니다.'); return }
    setError('')
    setSaved(true)
    setCurrent(''); setNext(''); setConfirm('')
    setTimeout(() => setSaved(false), 2500)
  }

  function revokeSession(id: string) {
    setSessions(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div className="space-y-4">
      <SectionCard title="비밀번호 변경">
        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
              <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          {saved && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
              <Check size={14} className="text-emerald-500 flex-shrink-0" />
              <p className="text-xs text-emerald-600 dark:text-emerald-400">비밀번호가 변경되었습니다.</p>
            </div>
          )}
          <FieldRow label="현재 비밀번호" required>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={current} onChange={e => setCurrent(e.target.value)} className={inputCls + ' pr-9'} placeholder="현재 비밀번호 입력" />
              <button onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </FieldRow>
          <FieldRow label="새 비밀번호" required>
            <input type={showPw ? 'text' : 'password'} value={next} onChange={e => setNext(e.target.value)} className={inputCls} placeholder="8자 이상" />
          </FieldRow>
          <FieldRow label="비밀번호 확인" required>
            <input type={showPw ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} className={inputCls} placeholder="새 비밀번호 재입력" />
          </FieldRow>
          <SaveBar onSave={savePw} saved={saved} />
        </div>
      </SectionCard>

      <SectionCard title="활성 세션" desc="현재 로그인된 기기 목록입니다.">
        <div className="space-y-2">
          {sessions.map(s => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-ide-border hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors">
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-ide-surface flex items-center justify-center flex-shrink-0">
                <Monitor size={14} className="text-gray-500 dark:text-ide-subtle" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-ide-text truncate">{s.device}</p>
                <p className="text-xs text-gray-400 dark:text-ide-muted">{s.location} · {s.time}</p>
              </div>
              {s.current ? (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold flex-shrink-0">현재</span>
              ) : (
                <button onClick={() => revokeSession(s.id)} className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-ide-surface transition-colors flex-shrink-0">
                  <X size={13} />
                </button>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function NotificationsSection() {
  const [notifs, setNotifs] = useState<NotifSetting[]>(INIT_NOTIFS)
  const [saved, setSaved]   = useState(false)

  function toggle(id: string, key: 'email' | 'push') {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, [key]: !n[key] } : n))
  }

  function save() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <SectionCard title="알림 설정" desc="수신할 알림 유형을 선택합니다.">
      <div className="space-y-1">
        {/* Header */}
        <div className="grid grid-cols-[1fr_72px_72px] gap-2 pb-2 border-b border-gray-100 dark:border-ide-border mb-2">
          <span />
          <span className="text-[11px] font-semibold text-gray-400 dark:text-ide-muted text-center">이메일</span>
          <span className="text-[11px] font-semibold text-gray-400 dark:text-ide-muted text-center">푸시</span>
        </div>

        {notifs.map(n => (
          <div key={n.id} className="grid grid-cols-[1fr_72px_72px] gap-2 items-center py-3 border-b border-gray-50 dark:border-ide-border last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-ide-text">{n.label}</p>
              <p className="text-xs text-gray-400 dark:text-ide-muted mt-0.5">{n.desc}</p>
            </div>
            <div className="flex justify-center">
              <Toggle on={n.email} onChange={() => toggle(n.id, 'email')} />
            </div>
            <div className="flex justify-center">
              <Toggle on={n.push} onChange={() => toggle(n.id, 'push')} />
            </div>
          </div>
        ))}

        <div className="pt-3">
          <SaveBar onSave={save} saved={saved} />
        </div>
      </div>
    </SectionCard>
  )
}

function DisplaySection() {
  const { theme, toggleTheme } = useTheme()
  const [sidebarDefault, setSidebarDefault] = useState<'expanded' | 'collapsed'>('expanded')
  const [density, setDensity] = useState<'compact' | 'normal' | 'comfortable'>('normal')
  const [saved, setSaved] = useState(false)

  function save() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="space-y-4">
      <SectionCard title="테마">
        <div className="flex items-center gap-4">
          {[
            { val: 'light', icon: <Sun size={18} />, label: '라이트 모드' },
            { val: 'dark',  icon: <Moon size={18} />, label: '다크 모드' },
          ].map(opt => (
            <button
              key={opt.val}
              onClick={() => { if (theme !== opt.val) toggleTheme() }}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                theme === opt.val
                  ? 'border-slate-700 dark:border-ide-active bg-slate-50 dark:bg-ide-surface'
                  : 'border-gray-200 dark:border-ide-border hover:border-gray-300 dark:hover:border-ide-active'
              }`}
            >
              <div className={theme === opt.val ? 'text-slate-700 dark:text-ide-active' : 'text-gray-400 dark:text-ide-muted'}>
                {opt.icon}
              </div>
              <span className={`text-xs font-semibold ${theme === opt.val ? 'text-slate-700 dark:text-ide-active' : 'text-gray-400 dark:text-ide-muted'}`}>
                {opt.label}
              </span>
              {theme === opt.val && (
                <span className="w-4 h-4 rounded-full bg-slate-700 dark:bg-ide-active flex items-center justify-center">
                  <Check size={10} className="text-white" />
                </span>
              )}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="화면 옵션">
        <div className="space-y-5">
          <FieldRow label="사이드바 기본 상태">
            <div className="flex gap-2">
              {[['expanded', '펼침'], ['collapsed', '접힘']].map(([val, label]) => (
                <button key={val} onClick={() => setSidebarDefault(val as 'expanded' | 'collapsed')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border transition-all ${
                    sidebarDefault === val
                      ? 'border-slate-700 dark:border-ide-active bg-slate-50 dark:bg-ide-surface text-slate-700 dark:text-ide-active font-semibold'
                      : 'border-gray-200 dark:border-ide-border text-gray-500 dark:text-ide-subtle hover:border-gray-300 dark:hover:border-ide-active'
                  }`}
                >
                  {sidebarDefault === val && <Check size={11} />} {label}
                </button>
              ))}
            </div>
          </FieldRow>

          <FieldRow label="정보 밀도">
            <div className="flex gap-2">
              {[['compact', '좁게'], ['normal', '보통'], ['comfortable', '넓게']].map(([val, label]) => (
                <button key={val} onClick={() => setDensity(val as 'compact' | 'normal' | 'comfortable')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border transition-all ${
                    density === val
                      ? 'border-slate-700 dark:border-ide-active bg-slate-50 dark:bg-ide-surface text-slate-700 dark:text-ide-active font-semibold'
                      : 'border-gray-200 dark:border-ide-border text-gray-500 dark:text-ide-subtle hover:border-gray-300 dark:hover:border-ide-active'
                  }`}
                >
                  {density === val && <Check size={11} />} {label}
                </button>
              ))}
            </div>
          </FieldRow>

          <SaveBar onSave={save} saved={saved} />
        </div>
      </SectionCard>
    </div>
  )
}

function CompanySection() {
  const [companyName, setCompanyName] = useState('주식회사 오토포커스')
  const [ceoName, setCeoName]         = useState('이준호')
  const [bizNo, setBizNo]             = useState('123-45-67890')
  const [address, setAddress]         = useState('서울특별시 강남구 테헤란로 123')
  const [tel, setTel]                 = useState('02-0000-0000')
  const [website, setWebsite]         = useState('https://autofocus.co.kr')
  const [founded, setFounded]         = useState('2018-03-15')
  const [saved, setSaved]             = useState(false)

  function save() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <SectionCard title="회사 정보" desc="사업자 등록 정보 및 기본 연락처입니다.">
      <div className="space-y-4">
        <FieldRow label="회사명" required>
          <input value={companyName} onChange={e => setCompanyName(e.target.value)} className={inputCls} />
        </FieldRow>
        <FieldRow label="대표이사">
          <input value={ceoName} onChange={e => setCeoName(e.target.value)} className={inputCls} />
        </FieldRow>
        <FieldRow label="사업자 등록번호">
          <input value={bizNo} onChange={e => setBizNo(e.target.value)} placeholder="000-00-00000" className={inputCls} />
        </FieldRow>
        <FieldRow label="본사 주소">
          <input value={address} onChange={e => setAddress(e.target.value)} className={inputCls} />
        </FieldRow>
        <FieldRow label="대표 전화">
          <input value={tel} onChange={e => setTel(e.target.value)} placeholder="02-0000-0000" className={inputCls} />
        </FieldRow>
        <FieldRow label="웹사이트">
          <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://" className={inputCls} />
        </FieldRow>
        <FieldRow label="설립일">
          <input type="date" value={founded} onChange={e => setFounded(e.target.value)} className={inputCls} />
        </FieldRow>
        <SaveBar onSave={save} saved={saved} />
      </div>
    </SectionCard>
  )
}

function PermissionsSection() {
  const [admins, setAdmins]   = useState<AdminUser[]>(INIT_ADMINS)
  const [editId, setEditId]   = useState<string | null>(null)
  const [editRole, setEditRole] = useState('')
  const [confirmDel, setConfirmDel] = useState<string | null>(null)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole]   = useState('열람자')
  const [inviteSent, setInviteSent]   = useState(false)

  const ROLE_STYLE: Record<string, string> = {
    '슈퍼 관리자': 'bg-slate-100 dark:bg-ide-surface text-slate-700 dark:text-ide-text',
    '관리자':      'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
    '운영자':      'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400',
    '열람자':      'bg-gray-100 dark:bg-ide-hover text-gray-500 dark:text-ide-muted',
  }

  function saveRole() {
    setAdmins(prev => prev.map(a => a.id === editId ? { ...a, role: editRole } : a))
    setEditId(null)
  }

  function deleteAdmin(id: string) {
    setAdmins(prev => prev.filter(a => a.id !== id))
    setConfirmDel(null)
  }

  function sendInvite() {
    if (!inviteEmail.trim()) return
    setInviteSent(true)
    setTimeout(() => { setInviteSent(false); setShowInvite(false); setInviteEmail('') }, 2000)
  }

  return (
    <div className="space-y-4">
      <SectionCard title="관리자 목록" desc="시스템 접근 권한이 있는 계정 목록입니다.">
        <div className="space-y-2">
          {admins.map(a => (
            <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-ide-border hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors">
              <Avatar initial={a.initial} color={a.color} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-ide-text">{a.name}</p>
                <p className="text-xs text-gray-400 dark:text-ide-muted truncate">{a.email}</p>
              </div>

              {editId === a.id ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select value={editRole} onChange={e => setEditRole(e.target.value)}
                    className="text-xs px-2 py-1 bg-gray-50 dark:bg-ide-surface border border-gray-200 dark:border-ide-border rounded-lg text-gray-700 dark:text-ide-text focus:outline-none">
                    {ROLES.map(r => <option key={r}>{r}</option>)}
                  </select>
                  <button onClick={saveRole} className="p-1.5 rounded-md bg-slate-700 dark:bg-ide-active text-white hover:bg-slate-800 transition-colors">
                    <Check size={12} />
                  </button>
                  <button onClick={() => setEditId(null)} className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-ide-surface transition-colors">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${ROLE_STYLE[a.role] ?? ''}`}>{a.role}</span>
                  {a.role !== '슈퍼 관리자' && (
                    <>
                      <button onClick={() => { setEditId(a.id); setEditRole(a.role) }}
                        className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-ide-text hover:bg-gray-100 dark:hover:bg-ide-surface transition-colors">
                        <ChevronRight size={13} />
                      </button>
                      <button onClick={() => setConfirmDel(a.id)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-ide-surface transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-ide-border">
          {showInvite ? (
            <div className="flex gap-2">
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="이메일 입력" className={inputCls + ' flex-1'} />
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                className="text-xs px-2 py-2 bg-gray-50 dark:bg-ide-surface border border-gray-200 dark:border-ide-border rounded-lg text-gray-700 dark:text-ide-text focus:outline-none">
                {ROLES.slice(1).map(r => <option key={r}>{r}</option>)}
              </select>
              <button onClick={sendInvite} className="px-3 py-2 text-xs rounded-lg bg-slate-700 dark:bg-ide-active text-white hover:bg-slate-800 transition-colors whitespace-nowrap">
                {inviteSent ? <Check size={13} /> : '초대'}
              </button>
              <button onClick={() => setShowInvite(false)} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-ide-hover transition-colors">
                <X size={13} />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowInvite(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-ide-subtle hover:text-slate-800 dark:hover:text-ide-text transition-colors">
              <span className="w-5 h-5 rounded-md bg-gray-100 dark:bg-ide-hover flex items-center justify-center text-gray-500 dark:text-ide-muted">+</span>
              관리자 초대
            </button>
          )}
        </div>
      </SectionCard>

      <SectionCard title="역할 설명">
        <div className="space-y-2">
          {[
            { role: '슈퍼 관리자', desc: '모든 기능 접근, 권한 관리, 시스템 설정 변경 가능' },
            { role: '관리자',      desc: '인사/팀/문서 관리 가능, 권한 설정 제외' },
            { role: '운영자',      desc: '콘텐츠 등록, 근태 관리 가능, 민감 정보 열람 불가' },
            { role: '열람자',      desc: '데이터 조회만 가능, 수정 및 삭제 불가' },
          ].map(item => (
            <div key={item.role} className="flex items-start gap-3 py-2 border-b border-gray-50 dark:border-ide-border last:border-0">
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 mt-0.5 ${
                item.role === '슈퍼 관리자' ? 'bg-slate-100 dark:bg-ide-surface text-slate-700 dark:text-ide-text' :
                item.role === '관리자'      ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' :
                item.role === '운영자'      ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400' :
                'bg-gray-100 dark:bg-ide-hover text-gray-500 dark:text-ide-muted'
              }`}>{item.role}</span>
              <p className="text-xs text-gray-500 dark:text-ide-subtle leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Confirm delete */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl shadow-xl w-full max-w-sm p-5 space-y-4">
            <p className="text-sm text-gray-700 dark:text-ide-text">
              '{admins.find(a => a.id === confirmDel)?.name}' 계정의 관리자 권한을 제거하시겠습니까?
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmDel(null)} className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-ide-border text-gray-600 dark:text-ide-subtle hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors">취소</button>
              <button onClick={() => deleteAdmin(confirmDel)} className="px-3 py-1.5 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors">제거</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const { logout } = useAuth()
  const [active, setActive] = useState<SectionId>('profile')
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.settings-nav-item',
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
      )
    }, rootRef)
    return () => ctx.revert()
  }, [])

  const current = NAV.find(n => n.id === active)!

  const SECTION_MAP: Record<SectionId, React.ReactNode> = {
    profile:       <ProfileSection />,
    security:      <SecuritySection />,
    notifications: <NotificationsSection />,
    display:       <DisplaySection />,
    company:       <CompanySection />,
    permissions:   <PermissionsSection />,
  }

  return (
    <div ref={rootRef} className="space-y-4 pb-6">
      {/* Page header */}
      <div>
        <h1 className="text-lg font-bold text-gray-900 dark:text-ide-bright">시스템 설정</h1>
        <p className="text-sm text-gray-500 dark:text-ide-subtle mt-0.5">계정, 알림, 시스템 전반 설정 관리</p>
      </div>

      {/* Mobile nav selector */}
      <div className="lg:hidden relative">
        <button
          onClick={() => setMobileOpen(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl text-sm font-semibold text-gray-700 dark:text-ide-text"
        >
          <span className="flex items-center gap-2">
            {current.icon}
            {current.label}
          </span>
          <ChevronRight size={14} className={`text-gray-400 transition-transform ${mobileOpen ? 'rotate-90' : ''}`} />
        </button>
        {mobileOpen && (
          <div className="absolute top-14 left-0 right-0 z-30 bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl shadow-lg py-1 overflow-hidden">
            {NAV.map(n => (
              <button key={n.id} onClick={() => { setActive(n.id); setMobileOpen(false) }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${active === n.id ? 'bg-gray-50 dark:bg-ide-surface text-slate-700 dark:text-ide-active font-semibold' : 'text-gray-600 dark:text-ide-text hover:bg-gray-50 dark:hover:bg-ide-hover'}`}>
                {n.icon} {n.label}
              </button>
            ))}
          </div>
        )}
        {mobileOpen && <div className="fixed inset-0 z-20" onClick={() => setMobileOpen(false)} />}
      </div>

      {/* Layout */}
      <div className="flex gap-6">

        {/* Left Nav (desktop) */}
        <nav className="hidden lg:flex flex-col w-52 flex-shrink-0 space-y-0.5 self-start sticky top-4">
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => setActive(n.id)}
              className={`settings-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                active === n.id
                  ? 'bg-gray-100 dark:bg-ide-surface text-slate-800 dark:text-ide-bright font-semibold'
                  : 'text-gray-600 dark:text-ide-subtle hover:bg-gray-50 dark:hover:bg-ide-hover hover:text-gray-800 dark:hover:text-ide-text'
              }`}
            >
              <span className={active === n.id ? 'text-slate-700 dark:text-ide-active' : 'text-gray-400 dark:text-ide-muted'}>
                {n.icon}
              </span>
              <span className="text-sm">{n.label}</span>
            </button>
          ))}

          {/* Logout */}
          <div className="pt-3 mt-1 border-t border-gray-100 dark:border-ide-border">
            <button
              onClick={logout}
              className="settings-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={15} />
              <span className="text-sm">로그아웃</span>
            </button>
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {SECTION_MAP[active]}
        </div>
      </div>
    </div>
  )
}
