import { useEffect, useRef, useState, useMemo } from 'react'
import gsap from 'gsap'
import {
  Search, Download, Eye, FileText, FileSpreadsheet, FileImage,
  File, FolderOpen, X, ChevronDown, CheckCircle2,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type DocCategory = 'all' | 'regulation' | 'form' | 'hr' | 'general' | 'it' | 'education'
type FileType    = 'pdf' | 'xlsx' | 'docx' | 'hwp' | 'pptx' | 'jpg' | 'png' | 'zip'

interface DocItem {
  id: number
  title: string
  category: Exclude<DocCategory, 'all'>
  categoryLabel: string
  fileType: FileType
  size: string
  uploadedAt: string
  uploader: string
  uploaderDept: string
  description: string
  version: string
  downloads: number
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockDocs: DocItem[] = [
  {
    id: 1, title: '취업규칙 (전문)', category: 'regulation', categoryLabel: '사규/규정',
    fileType: 'pdf', size: '1.2 MB', uploadedAt: '2026-01-15', uploader: '인사팀', uploaderDept: '인사팀',
    description: '회사 취업규칙 전문입니다. 근로시간, 휴가, 복리후생 등 전반적인 근무 조건을 규정합니다.',
    version: 'v3.2', downloads: 412,
  },
  {
    id: 2, title: '개인정보 보호 규정', category: 'regulation', categoryLabel: '사규/규정',
    fileType: 'pdf', size: '856 KB', uploadedAt: '2026-02-01', uploader: '정보보안팀', uploaderDept: '정보보안팀',
    description: '개인정보 처리 방침 및 보호 규정입니다. 임직원 필수 숙지 문서입니다.',
    version: 'v2.1', downloads: 287,
  },
  {
    id: 3, title: '보안 정책 가이드라인', category: 'regulation', categoryLabel: '사규/규정',
    fileType: 'pdf', size: '2.1 MB', uploadedAt: '2026-03-10', uploader: '정보보안팀', uploaderDept: '정보보안팀',
    description: '사내 정보보안 정책 전반에 관한 가이드라인입니다. 비밀번호 정책, VPN 사용, 외부 기기 반입 등을 다룹니다.',
    version: 'v1.5', downloads: 198,
  },
  {
    id: 4, title: '지출결의서 양식', category: 'form', categoryLabel: '공통 양식',
    fileType: 'xlsx', size: '48 KB', uploadedAt: '2026-01-03', uploader: '경영지원팀', uploaderDept: '경영지원팀',
    description: '법인카드 및 개인 지출 정산을 위한 공통 결의서 양식입니다.',
    version: 'v2.0', downloads: 1034,
  },
  {
    id: 5, title: '품의서 양식 (일반)', category: 'form', categoryLabel: '공통 양식',
    fileType: 'docx', size: '32 KB', uploadedAt: '2026-01-03', uploader: '경영지원팀', uploaderDept: '경영지원팀',
    description: '업무 진행 전 결재를 요청하는 일반 품의서 양식입니다.',
    version: 'v1.3', downloads: 876,
  },
  {
    id: 6, title: '주간 업무보고 양식', category: 'form', categoryLabel: '공통 양식',
    fileType: 'xlsx', size: '28 KB', uploadedAt: '2025-12-20', uploader: '기획팀', uploaderDept: '기획팀',
    description: '매주 월요일 제출하는 주간 업무보고서 공통 양식입니다.',
    version: 'v1.0', downloads: 2154,
  },
  {
    id: 7, title: '회의록 양식', category: 'form', categoryLabel: '공통 양식',
    fileType: 'docx', size: '24 KB', uploadedAt: '2025-11-15', uploader: '경영지원팀', uploaderDept: '경영지원팀',
    description: '팀 회의 및 프로젝트 회의에서 사용하는 공통 회의록 양식입니다.',
    version: 'v1.1', downloads: 1782,
  },
  {
    id: 8, title: '휴가 신청서', category: 'hr', categoryLabel: '인사',
    fileType: 'hwp', size: '36 KB', uploadedAt: '2026-01-03', uploader: '인사팀', uploaderDept: '인사팀',
    description: '연차, 반차, 특별휴가 신청 양식입니다. (시스템 신청 불가 시 사용)',
    version: 'v2.3', downloads: 654,
  },
  {
    id: 9, title: '경력증명서 발급 신청서', category: 'hr', categoryLabel: '인사',
    fileType: 'pdf', size: '124 KB', uploadedAt: '2025-10-05', uploader: '인사팀', uploaderDept: '인사팀',
    description: '재직/경력 증명서 발급을 요청하는 신청 양식입니다.',
    version: 'v1.0', downloads: 341,
  },
  {
    id: 10, title: '재직증명서 양식', category: 'hr', categoryLabel: '인사',
    fileType: 'hwp', size: '28 KB', uploadedAt: '2025-09-01', uploader: '인사팀', uploaderDept: '인사팀',
    description: '재직 사실 확인용 증명서 양식입니다.',
    version: 'v1.2', downloads: 428,
  },
  {
    id: 11, title: '법인차량 운행일지', category: 'general', categoryLabel: '총무',
    fileType: 'xlsx', size: '56 KB', uploadedAt: '2026-01-10', uploader: '총무팀', uploaderDept: '총무팀',
    description: '법인차량 사용 시 작성해야 하는 월별 운행일지 양식입니다.',
    version: 'v1.0', downloads: 203,
  },
  {
    id: 12, title: '비품 신청서', category: 'general', categoryLabel: '총무',
    fileType: 'xlsx', size: '42 KB', uploadedAt: '2025-12-01', uploader: '총무팀', uploaderDept: '총무팀',
    description: '사무용 비품 및 소모품 구매 요청 양식입니다.',
    version: 'v1.0', downloads: 517,
  },
  {
    id: 13, title: '사내 IT 장비 대여 신청서', category: 'it', categoryLabel: 'IT',
    fileType: 'docx', size: '30 KB', uploadedAt: '2026-02-15', uploader: 'IT팀', uploaderDept: 'IT팀',
    description: '노트북, 모니터, 주변기기 등 IT 장비 대여 신청 양식입니다.',
    version: 'v1.1', downloads: 389,
  },
  {
    id: 14, title: '개발환경 셋업 가이드', category: 'it', categoryLabel: 'IT',
    fileType: 'pdf', size: '3.4 MB', uploadedAt: '2026-03-01', uploader: 'IT팀', uploaderDept: 'IT팀',
    description: '신입 개발자 온보딩을 위한 개발 환경 구성 가이드입니다.',
    version: 'v4.0', downloads: 312,
  },
  {
    id: 15, title: '신입사원 입문 교육 자료', category: 'education', categoryLabel: '교육',
    fileType: 'pptx', size: '8.7 MB', uploadedAt: '2026-04-01', uploader: '인사팀', uploaderDept: '인사팀',
    description: '입사 첫 주에 진행되는 신입사원 오리엔테이션 교육 자료입니다.',
    version: 'v5.0', downloads: 187,
  },
  {
    id: 16, title: '직무 역량 평가 기준서', category: 'education', categoryLabel: '교육',
    fileType: 'pdf', size: '1.8 MB', uploadedAt: '2026-01-20', uploader: '인사팀', uploaderDept: '인사팀',
    description: '반기별 직무 역량 평가 항목 및 기준을 설명하는 문서입니다.',
    version: 'v2.0', downloads: 256,
  },
]

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: { value: DocCategory; label: string; count?: number }[] = [
  { value: 'all',        label: '전체' },
  { value: 'regulation', label: '사규/규정' },
  { value: 'form',       label: '공통 양식' },
  { value: 'hr',         label: '인사' },
  { value: 'general',    label: '총무' },
  { value: 'it',         label: 'IT' },
  { value: 'education',  label: '교육' },
]

const FILE_TYPE_CONFIG: Record<FileType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  pdf:  { label: 'PDF',  color: 'text-red-600 dark:text-red-400',    bg: 'bg-red-50 dark:bg-red-950/40',     icon: <FileText size={14} /> },
  xlsx: { label: 'XLSX', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/40', icon: <FileSpreadsheet size={14} /> },
  docx: { label: 'DOCX', color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-950/40',   icon: <FileText size={14} /> },
  hwp:  { label: 'HWP',  color: 'text-sky-600 dark:text-sky-400',     bg: 'bg-sky-50 dark:bg-sky-950/40',     icon: <FileText size={14} /> },
  pptx: { label: 'PPTX', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/40', icon: <FileText size={14} /> },
  jpg:  { label: 'JPG',  color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40', icon: <FileImage size={14} /> },
  png:  { label: 'PNG',  color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/40', icon: <FileImage size={14} /> },
  zip:  { label: 'ZIP',  color: 'text-gray-600 dark:text-gray-400',    bg: 'bg-gray-100 dark:bg-gray-800',     icon: <File size={14} /> },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FileBadge({ type }: { type: FileType }) {
  const cfg = FILE_TYPE_CONFIG[type]
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold ${cfg.color} ${cfg.bg}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  )
}

function CategoryBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium
      bg-slate-100 text-slate-600 dark:bg-ide-hover dark:text-ide-subtle">
      {label}
    </span>
  )
}

// ─── Preview Modal ────────────────────────────────────────────────────────────

function PreviewModal({ doc, onClose, onDownload }: {
  doc: DocItem
  onClose: () => void
  onDownload: (doc: DocItem) => void
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  const cfg = FILE_TYPE_CONFIG[doc.fileType]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-white dark:bg-ide-surface border border-gray-200 dark:border-ide-border
          rounded-xl shadow-2xl w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-ide-border">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
              <span className={cfg.color}>
                <FileText size={20} />
              </span>
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-gray-900 dark:text-ide-bright truncate pr-2">
                {doc.title}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <FileBadge type={doc.fileType} />
                <CategoryBadge label={doc.categoryLabel} />
                <span className="text-[11px] text-gray-400 dark:text-ide-muted">{doc.version}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 dark:text-ide-muted
              hover:bg-gray-100 dark:hover:bg-ide-hover hover:text-gray-600 dark:hover:text-ide-text transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Preview area */}
        <div className="p-5">
          <div className="rounded-lg bg-gray-50 dark:bg-ide-base border border-dashed border-gray-200 dark:border-ide-border
            flex flex-col items-center justify-center py-10 gap-3">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${cfg.bg}`}>
              <span className={cfg.color}>
                <FileText size={28} />
              </span>
            </div>
            <p className="text-sm font-medium text-gray-700 dark:text-ide-text">{doc.title}</p>
            <p className="text-xs text-gray-400 dark:text-ide-muted">
              {doc.fileType.toUpperCase()} · {doc.size}
            </p>
            <p className="text-xs text-gray-400 dark:text-ide-muted max-w-xs text-center leading-relaxed">
              파일 미리보기는 다운로드 후 확인 가능합니다.
            </p>
          </div>

          {/* Meta */}
          <div className="mt-4 space-y-2">
            <div className="text-xs text-gray-500 dark:text-ide-subtle leading-relaxed">
              {doc.description}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-gray-100 dark:border-ide-border">
              {[
                ['등록일', doc.uploadedAt],
                ['등록자', `${doc.uploader} (${doc.uploaderDept})`],
                ['버전', doc.version],
                ['다운로드 수', `${doc.downloads.toLocaleString()}회`],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <span className="text-[11px] text-gray-400 dark:text-ide-muted w-20 flex-shrink-0">{label}</span>
                  <span className="text-[11px] text-gray-700 dark:text-ide-text font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-ide-border
              text-gray-600 dark:text-ide-text hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors"
          >
            닫기
          </button>
          <button
            onClick={() => { onDownload(doc); onClose() }}
            className="px-4 py-2 text-sm rounded-lg bg-slate-800 dark:bg-ide-active
              text-white dark:text-ide-bright hover:bg-slate-700 dark:hover:bg-slate-600
              transition-colors flex items-center gap-1.5"
          >
            <Download size={14} />
            다운로드
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Download Toast ───────────────────────────────────────────────────────────

function DownloadToast({ name, onDone }: { name: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3
      bg-gray-900 dark:bg-ide-surface border border-gray-700 dark:border-ide-border
      rounded-xl shadow-2xl text-white dark:text-ide-bright text-sm
      animate-[fadeInUp_0.25s_ease-out]">
      <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
      <span className="max-w-xs truncate">{name} 다운로드 완료</span>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const pageRef           = useRef<HTMLDivElement>(null)
  const [activeCategory, setActiveCategory] = useState<DocCategory>('all')
  const [searchQuery,    setSearchQuery]    = useState('')
  const [sortField,      setSortField]      = useState<'title' | 'uploadedAt' | 'downloads'>('uploadedAt')
  const [sortDir,        setSortDir]        = useState<'asc' | 'desc'>('desc')
  const [previewDoc,     setPreviewDoc]     = useState<DocItem | null>(null)
  const [toastDoc,       setToastDoc]       = useState<DocItem | null>(null)

  useEffect(() => {
    if (!pageRef.current) return
    gsap.fromTo(pageRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' })
  }, [])

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<DocCategory, number>> = {}
    for (const doc of mockDocs) {
      counts[doc.category] = (counts[doc.category] ?? 0) + 1
    }
    return counts
  }, [])

  const filtered = useMemo(() => {
    let list = mockDocs
    if (activeCategory !== 'all') list = list.filter(d => d.category === activeCategory)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.uploaderDept.toLowerCase().includes(q) ||
        d.categoryLabel.toLowerCase().includes(q)
      )
    }
    return [...list].sort((a, b) => {
      let cmp = 0
      if (sortField === 'title')      cmp = a.title.localeCompare(b.title)
      if (sortField === 'uploadedAt') cmp = a.uploadedAt.localeCompare(b.uploadedAt)
      if (sortField === 'downloads')  cmp = a.downloads - b.downloads
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [activeCategory, searchQuery, sortField, sortDir])

  function handleSort(field: typeof sortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  function handleDownload(doc: DocItem) {
    setToastDoc(doc)
  }

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return <ChevronDown size={12} className="text-gray-300 dark:text-ide-muted" />
    return (
      <ChevronDown
        size={12}
        className={`text-gray-500 dark:text-ide-subtle transition-transform ${sortDir === 'asc' ? 'rotate-180' : ''}`}
      />
    )
  }

  return (
    <div ref={pageRef} className="p-6 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 dark:bg-ide-active flex items-center justify-center">
            <FolderOpen size={16} className="text-white dark:text-ide-bright" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-ide-bright">문서 자료실</h1>
            <p className="text-xs text-gray-400 dark:text-ide-muted mt-0.5">
              사규, 공통 양식, 각종 업무 서식을 열람하고 다운로드하세요
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-400 dark:text-ide-muted">
          총 <span className="font-semibold text-gray-600 dark:text-ide-text">{mockDocs.length}</span>개 문서
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-ide-muted pointer-events-none" />
          <input
            type="text"
            placeholder="문서 검색..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-ide-border
              bg-white dark:bg-ide-surface text-gray-900 dark:text-ide-text
              placeholder-gray-400 dark:placeholder-ide-muted
              focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto flex-shrink-0">
          {CATEGORIES.map(cat => {
            const count = cat.value === 'all' ? mockDocs.length : (categoryCounts[cat.value] ?? 0)
            const active = activeCategory === cat.value
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-slate-800 text-white dark:bg-ide-active dark:text-ide-bright'
                    : 'text-gray-500 dark:text-ide-subtle hover:bg-gray-100 dark:hover:bg-ide-hover hover:text-gray-700 dark:hover:text-ide-text'
                }`}
              >
                {cat.label}
                <span className={`text-[10px] px-1 py-0.5 rounded font-semibold ${
                  active
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 dark:bg-ide-hover text-gray-400 dark:text-ide-muted'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-ide-surface border border-gray-200 dark:border-ide-border rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[minmax(0,1fr)_100px_80px_120px_90px_100px]
          px-4 py-2.5 border-b border-gray-100 dark:border-ide-border
          bg-gray-50 dark:bg-ide-base text-[11px] font-semibold text-gray-400 dark:text-ide-muted uppercase tracking-wide">
          <button
            className="flex items-center gap-1 text-left hover:text-gray-600 dark:hover:text-ide-subtle transition-colors"
            onClick={() => handleSort('title')}
          >
            문서명 <SortIcon field="title" />
          </button>
          <div>유형</div>
          <div>형식</div>
          <button
            className="flex items-center gap-1 hover:text-gray-600 dark:hover:text-ide-subtle transition-colors"
            onClick={() => handleSort('uploadedAt')}
          >
            등록일 <SortIcon field="uploadedAt" />
          </button>
          <button
            className="flex items-center gap-1 hover:text-gray-600 dark:hover:text-ide-subtle transition-colors"
            onClick={() => handleSort('downloads')}
          >
            다운로드 <SortIcon field="downloads" />
          </button>
          <div className="text-right">액션</div>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen size={32} className="text-gray-200 dark:text-ide-border mb-3" />
            <p className="text-sm text-gray-400 dark:text-ide-muted">검색 결과가 없습니다</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50 dark:divide-ide-border">
            {filtered.map(doc => (
              <li
                key={doc.id}
                className="grid grid-cols-[minmax(0,1fr)_100px_80px_120px_90px_100px]
                  px-4 py-3 items-center hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors group"
              >
                {/* Title */}
                <div className="min-w-0 pr-4">
                  <p
                    className="text-sm font-medium text-gray-800 dark:text-ide-text truncate
                      group-hover:text-slate-900 dark:group-hover:text-ide-bright transition-colors cursor-pointer"
                    onClick={() => setPreviewDoc(doc)}
                  >
                    {doc.title}
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-ide-muted mt-0.5 truncate">
                    {doc.uploaderDept} · {doc.version} · {doc.size}
                  </p>
                </div>

                {/* Category */}
                <div><CategoryBadge label={doc.categoryLabel} /></div>

                {/* File Type */}
                <div><FileBadge type={doc.fileType} /></div>

                {/* Date */}
                <div className="text-xs text-gray-500 dark:text-ide-subtle">{doc.uploadedAt}</div>

                {/* Downloads */}
                <div className="text-xs text-gray-500 dark:text-ide-subtle tabular-nums">
                  {doc.downloads.toLocaleString()}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    title="열람"
                    className="p-1.5 rounded-md text-gray-400 dark:text-ide-muted
                      hover:bg-gray-100 dark:hover:bg-ide-hover hover:text-blue-600 dark:hover:text-blue-400
                      transition-colors"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    title="다운로드"
                    className="p-1.5 rounded-md text-gray-400 dark:text-ide-muted
                      hover:bg-gray-100 dark:hover:bg-ide-hover hover:text-emerald-600 dark:hover:text-emerald-400
                      transition-colors"
                  >
                    <Download size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-50 dark:border-ide-border
            bg-gray-50 dark:bg-ide-base text-[11px] text-gray-400 dark:text-ide-muted">
            {filtered.length}개 문서
            {searchQuery && ` — "${searchQuery}" 검색 결과`}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <PreviewModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
          onDownload={handleDownload}
        />
      )}

      {/* Download Toast */}
      {toastDoc && (
        <DownloadToast
          name={toastDoc.title}
          onDone={() => setToastDoc(null)}
        />
      )}
    </div>
  )
}
