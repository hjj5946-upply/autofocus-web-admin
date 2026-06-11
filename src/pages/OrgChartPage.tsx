import { useEffect, useRef, useState, useMemo } from 'react'
import gsap from 'gsap'
import { Search, Mail, Users, ChevronDown, ChevronUp, X } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Employee {
  id: string
  name: string
  title: string
  dept: string
  email: string
  initial: string
  color: string
}

interface Department {
  id: string
  name: string
  indicator: string   // dot color
  accent: string      // card header bg
  text: string        // accent text color
  head: Employee
  members: Employee[]
}

interface ExecData {
  id: string
  name: string
  title: string
  initial: string
  color: string
  deptIds: string[]
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CEO = { name: '이준호', title: '대표이사', badge: 'CEO', initial: '이', color: 'bg-slate-700' }

const EXECUTIVES: ExecData[] = [
  { id: 'cto', name: '정민아', title: '기술본부장', initial: '정', color: 'bg-blue-700',    deptIds: ['dev', 'ai'] },
  { id: 'coo', name: '박재현', title: '운영본부장', initial: '박', color: 'bg-violet-700',  deptIds: ['plan', 'marketing'] },
  { id: 'cpo', name: '최수진', title: '인사본부장', initial: '최', color: 'bg-emerald-700', deptIds: ['hr', 'design'] },
]

const DEPARTMENTS: Department[] = [
  {
    id: 'dev', name: '개발팀',
    indicator: 'bg-blue-500', accent: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-700 dark:text-blue-400',
    head:    { id: 'e101', name: '김철수', title: '개발팀장',        dept: '개발팀', email: 'kim.cs@autofocus.co.kr', initial: '철', color: 'bg-blue-600' },
    members: [
      { id: 'e102', name: '이서연', title: '시니어 개발자',  dept: '개발팀', email: 'lee@autofocus.co.kr',  initial: '서', color: 'bg-blue-400' },
      { id: 'e103', name: '박준혁', title: '개발자',        dept: '개발팀', email: 'park@autofocus.co.kr', initial: '준', color: 'bg-cyan-500' },
      { id: 'e104', name: '한지우', title: '개발자',        dept: '개발팀', email: 'han@autofocus.co.kr',  initial: '지', color: 'bg-sky-500' },
      { id: 'e105', name: '오민석', title: '주니어 개발자', dept: '개발팀', email: 'oh@autofocus.co.kr',   initial: '민', color: 'bg-blue-300' },
    ],
  },
  {
    id: 'ai', name: 'AI 사업부',
    indicator: 'bg-indigo-500', accent: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-700 dark:text-indigo-400',
    head:    { id: 'e201', name: '강동원', title: 'AI 사업부장', dept: 'AI 사업부', email: 'kang@autofocus.co.kr',  initial: '동', color: 'bg-indigo-600' },
    members: [
      { id: 'e202', name: '윤지호', title: 'AI 엔지니어', dept: 'AI 사업부', email: 'yoon@autofocus.co.kr', initial: '지', color: 'bg-indigo-400' },
      { id: 'e203', name: '장하은', title: 'AI 엔지니어', dept: 'AI 사업부', email: 'jang@autofocus.co.kr', initial: '하', color: 'bg-violet-400' },
    ],
  },
  {
    id: 'plan', name: '기획팀',
    indicator: 'bg-violet-500', accent: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-700 dark:text-violet-400',
    head:    { id: 'e301', name: '서지민', title: '기획팀장',     dept: '기획팀', email: 'seo@autofocus.co.kr',  initial: '지', color: 'bg-violet-600' },
    members: [
      { id: 'e302', name: '최유진', title: '시니어 기획자', dept: '기획팀', email: 'choi@autofocus.co.kr', initial: '유', color: 'bg-violet-400' },
      { id: 'e303', name: '임수빈', title: '기획자',       dept: '기획팀', email: 'lim@autofocus.co.kr',  initial: '수', color: 'bg-purple-400' },
    ],
  },
  {
    id: 'marketing', name: '마케팅팀',
    indicator: 'bg-rose-500', accent: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-700 dark:text-rose-400',
    head:    { id: 'e401', name: '김나연', title: '마케팅팀장',   dept: '마케팅팀', email: 'kim.ny@autofocus.co.kr', initial: '나', color: 'bg-rose-600' },
    members: [
      { id: 'e402', name: '정재원', title: '마케터',        dept: '마케팅팀', email: 'jung@autofocus.co.kr',  initial: '재', color: 'bg-rose-400' },
      { id: 'e403', name: '백승현', title: '콘텐츠 마케터', dept: '마케팅팀', email: 'baek@autofocus.co.kr', initial: '승', color: 'bg-pink-400' },
      { id: 'e404', name: '홍민지', title: '마케터',        dept: '마케팅팀', email: 'hong@autofocus.co.kr', initial: '민', color: 'bg-red-400' },
    ],
  },
  {
    id: 'hr', name: '인사팀',
    indicator: 'bg-amber-500', accent: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400',
    head:    { id: 'e501', name: '조현수', title: '인사팀장',  dept: '인사팀', email: 'jo@autofocus.co.kr',   initial: '현', color: 'bg-amber-600' },
    members: [
      { id: 'e502', name: '신예린', title: '인사 담당', dept: '인사팀', email: 'shin@autofocus.co.kr', initial: '예', color: 'bg-amber-400' },
      { id: 'e503', name: '문소희', title: '채용 담당', dept: '인사팀', email: 'moon@autofocus.co.kr', initial: '소', color: 'bg-yellow-500' },
    ],
  },
  {
    id: 'design', name: '디자인팀',
    indicator: 'bg-emerald-500', accent: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400',
    head:    { id: 'e601', name: '류다현', title: '디자인팀장',      dept: '디자인팀', email: 'ryu@autofocus.co.kr',    initial: '다', color: 'bg-emerald-600' },
    members: [
      { id: 'e602', name: '김민준', title: '시니어 디자이너',  dept: '디자인팀', email: 'kim.mj@autofocus.co.kr', initial: '민', color: 'bg-emerald-400' },
      { id: 'e603', name: '이하늘', title: 'UI/UX 디자이너', dept: '디자인팀', email: 'lee.hn@autofocus.co.kr', initial: '하', color: 'bg-green-400' },
    ],
  },
]

// ─── Shared Avatar ────────────────────────────────────────────────────────────

function Avatar({ initial, color, size = 'md' }: { initial: string; color: string; size?: 'sm' | 'md' | 'lg' }) {
  const cls = { sm: 'w-7 h-7 text-[10px]', md: 'w-9 h-9 text-xs', lg: 'w-14 h-14 text-base' }[size]
  return (
    <div className={`${cls} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initial}
    </div>
  )
}

// ─── Org Tree Card ────────────────────────────────────────────────────────────

function OrgCard({ name, title, badge, initial, color, subDepts, size }: {
  name: string; title: string; badge?: string; initial: string; color: string
  subDepts?: Department[]; size: 'lg' | 'md'
}) {
  return (
    <div className={`bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl p-4 flex flex-col items-center text-center shadow-sm ${size === 'lg' ? 'w-56' : 'w-44'}`}>
      <Avatar initial={initial} color={color} size={size === 'lg' ? 'lg' : 'md'} />
      <p className={`mt-2.5 font-bold text-gray-900 dark:text-ide-bright ${size === 'lg' ? 'text-base' : 'text-sm'}`}>
        {name}
      </p>
      <p className="text-xs text-gray-500 dark:text-ide-subtle mt-0.5">{title}</p>
      {badge && (
        <span className="mt-2 text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-ide-hover text-slate-600 dark:text-ide-subtle font-semibold">
          {badge}
        </span>
      )}
      {subDepts && subDepts.length > 0 && (
        <div className="mt-2.5 flex flex-wrap justify-center gap-1">
          {subDepts.map(d => (
            <span key={d.id} className={`text-[10px] px-2 py-0.5 rounded font-medium ${d.accent} ${d.text}`}>
              {d.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Department Card ──────────────────────────────────────────────────────────

function DeptCard({ dept }: { dept: Department }) {
  const [expanded, setExpanded] = useState(false)
  const total = 1 + dept.members.length

  return (
    <div className="org-dept bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl overflow-hidden hover:shadow-sm hover:border-gray-300 dark:hover:border-ide-active transition-all">
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between ${dept.accent}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dept.indicator}`} />
          <span className={`text-sm font-bold ${dept.text}`}>{dept.name}</span>
        </div>
        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-ide-subtle">
          <Users size={11} />{total}명
        </span>
      </div>

      {/* Department head */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-ide-border flex items-center gap-3">
        <Avatar initial={dept.head.initial} color={dept.head.color} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800 dark:text-ide-text">{dept.head.name}</p>
          <p className="text-[10px] text-gray-400 dark:text-ide-muted">{dept.head.title}</p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-gray-100 dark:bg-ide-hover text-gray-500 dark:text-ide-subtle font-medium flex-shrink-0">
          팀장
        </span>
      </div>

      {/* Member avatar row */}
      <div className="px-4 py-3 flex items-center gap-1.5 flex-wrap">
        {dept.members.slice(0, 6).map(m => (
          <div key={m.id} title={`${m.name} · ${m.title}`}>
            <Avatar initial={m.initial} color={m.color} size="sm" />
          </div>
        ))}
        {dept.members.length > 6 && (
          <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-ide-hover flex items-center justify-center">
            <span className="text-[9px] font-bold text-gray-500 dark:text-ide-subtle">+{dept.members.length - 6}</span>
          </div>
        )}
        {dept.members.length === 0 && (
          <p className="text-[11px] text-gray-400 dark:text-ide-muted">팀원 없음</p>
        )}
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full px-4 py-2 flex items-center justify-center gap-1.5 text-[11px] font-medium text-gray-400 dark:text-ide-muted hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors border-t border-gray-100 dark:border-ide-border"
      >
        {expanded
          ? <><ChevronUp size={11} />접기</>
          : <><ChevronDown size={11} />팀원 전체 보기</>}
      </button>

      {/* Expanded member list */}
      {expanded && (
        <div className="border-t border-gray-100 dark:border-ide-border">
          {dept.members.map(m => (
            <div key={m.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors border-b border-gray-100 dark:border-ide-border last:border-0">
              <Avatar initial={m.initial} color={m.color} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 dark:text-ide-text">{m.name}</p>
                <p className="text-[10px] text-gray-400 dark:text-ide-muted">{m.title}</p>
              </div>
              <a
                href={`mailto:${m.email}`}
                className="p-1.5 rounded-md text-gray-400 dark:text-ide-muted hover:text-gray-600 dark:hover:text-ide-text hover:bg-gray-100 dark:hover:bg-ide-hover transition-colors flex-shrink-0"
              >
                <Mail size={12} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OrgChartPage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')

  const allEmployees = useMemo<Employee[]>(() =>
    DEPARTMENTS.flatMap(d => [d.head, ...d.members]),
    []
  )

  const totalCount = 1 + EXECUTIVES.length + allEmployees.length

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return allEmployees.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.title.toLowerCase().includes(q) ||
      e.dept.toLowerCase().includes(q)
    )
  }, [query, allEmployees])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.org-ceo',
        { opacity: 0, y: -14 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
      )
      gsap.fromTo('.org-exec',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.1, ease: 'power2.out', delay: 0.3 }
      )
      gsap.fromTo('.org-dept',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out', delay: 0.55 }
      )
    }, rootRef)
    return () => ctx.revert()
  }, [])

  const isSearching = query.trim().length > 0

  return (
    <div ref={rootRef} className="space-y-6 pb-6">

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-ide-bright">조직도</h1>
          <p className="text-sm text-gray-500 dark:text-ide-subtle mt-0.5">
            전체 {totalCount}명 · 6개 부서
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-ide-muted pointer-events-none" />
        <input
          type="text"
          placeholder="이름, 직책, 부서로 검색..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-9 pr-9 py-2 text-sm bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-lg text-gray-800 dark:text-ide-text placeholder:text-gray-400 dark:placeholder:text-ide-muted focus:outline-none focus:border-slate-400 dark:focus:border-ide-active transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-ide-muted hover:text-gray-600 transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Search Results ── */}
      {isSearching && (
        <div className="bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 dark:border-ide-border bg-gray-50/50 dark:bg-ide-surface/20">
            <p className="text-xs text-gray-500 dark:text-ide-subtle">
              {searchResults.length > 0 ? `검색 결과 ${searchResults.length}명` : '검색 결과 없음'}
            </p>
          </div>
          {searchResults.length > 0
            ? searchResults.map(emp => {
                const dept = DEPARTMENTS.find(d => d.name === emp.dept)
                return (
                  <div key={emp.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors border-b border-gray-100 dark:border-ide-border last:border-0">
                    <Avatar initial={emp.initial} color={emp.color} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-ide-text">{emp.name}</p>
                      <p className="text-xs text-gray-500 dark:text-ide-subtle mt-0.5">{emp.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {dept && (
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${dept.accent} ${dept.text}`}>
                          {dept.name}
                        </span>
                      )}
                      <a
                        href={`mailto:${emp.email}`}
                        className="p-1.5 rounded-md text-gray-400 dark:text-ide-muted hover:text-gray-600 dark:hover:text-ide-text hover:bg-gray-100 dark:hover:bg-ide-hover transition-colors"
                      >
                        <Mail size={13} />
                      </a>
                    </div>
                  </div>
                )
              })
            : (
              <div className="flex flex-col items-center py-12 text-center">
                <Search size={24} className="text-gray-300 dark:text-ide-border mb-2" />
                <p className="text-sm text-gray-500 dark:text-ide-subtle">일치하는 구성원이 없습니다.</p>
              </div>
            )
          }
        </div>
      )}

      {/* ── Org Tree + Dept Grid (hidden during search) ── */}
      {!isSearching && (
        <>
          {/* Executive Tree */}
          <div className="bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl p-6">
            <p className="text-[11px] font-bold text-gray-400 dark:text-ide-muted uppercase tracking-widest mb-6 text-center">
              Leadership
            </p>

            <div className="overflow-x-auto pb-1">
              <div className="min-w-[600px] flex flex-col items-center">

                {/* CEO */}
                <div className="org-ceo">
                  <OrgCard {...CEO} size="lg" />
                </div>

                {/* CEO → connector */}
                <div className="w-px h-8 bg-gray-200 dark:bg-ide-border" />

                {/* Exec row */}
                <div className="relative w-full flex justify-around items-start">
                  {/* Horizontal line: left/right offset = ~1/6 of width (center of first/last card) */}
                  <div className="absolute top-0 left-[16.7%] right-[16.7%] h-px bg-gray-200 dark:bg-ide-border" />

                  {EXECUTIVES.map(exec => {
                    const depts = DEPARTMENTS.filter(d => exec.deptIds.includes(d.id))
                    return (
                      <div key={exec.id} className="org-exec flex flex-col items-center">
                        <div className="w-px h-8 bg-gray-200 dark:bg-ide-border" />
                        <OrgCard
                          name={exec.name}
                          title={exec.title}
                          initial={exec.initial}
                          color={exec.color}
                          size="md"
                          subDepts={depts}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Department Grid */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 dark:text-ide-muted uppercase tracking-widest mb-3">
              Departments
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEPARTMENTS.map(dept => (
                <DeptCard key={dept.id} dept={dept} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
