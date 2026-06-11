import { useEffect, useRef, useState, useMemo } from 'react'
import gsap from 'gsap'
import type { LucideIcon } from 'lucide-react'
import {
  Search, SquarePen, Pin, Flame, Heart, MessageCircle, Eye,
  ChevronRight, Cake, ExternalLink, TrendingUp, X, Send, CheckCircle2,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type BoardType = 'all' | 'announcement' | 'free' | 'praise' | 'event'

interface Post {
  id: number
  board: Exclude<BoardType, 'all'>
  boardLabel: string
  title: string
  preview: string
  author: string
  dept: string
  initial: string
  avatarColor: string
  createdAt: string
  likes: number
  comments: number
  views: number
  pinned: boolean
  hot: boolean
}

interface BirthdayMember {
  name: string
  dept: string
  date: string
  initial: string
  color: string
}

interface QuickLink {
  label: string
  href: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_POSTS: Post[] = [
  {
    id: 1, board: 'announcement', boardLabel: '공지',
    title: '[필독] 2026년 하반기 보안 정책 업데이트 안내',
    preview: '전 임직원 대상 보안 정책이 7월 1일부터 변경됩니다. 비밀번호 정책 강화, VPN 필수 사용, 개인 기기 업무 활용 제한 등 주요 변경 사항을 확인해 주세요.\n\n변경 사항 요약:\n• 비밀번호 90일마다 변경 의무화\n• 재택근무 시 VPN 필수 접속\n• 개인 USB 사용 금지 (IT팀 지급 장비만 허용)\n• 외부 클라우드 업무 자료 저장 금지\n\n위반 사항 발견 시 정보보안팀으로 즉시 신고해 주시기 바랍니다.',
    author: '정보보안팀', dept: '정보보안', initial: '보', avatarColor: 'bg-slate-500',
    createdAt: '1시간 전', likes: 8, comments: 12, views: 248, pinned: true, hot: false,
  },
  {
    id: 2, board: 'announcement', boardLabel: '공지',
    title: '[안내] 2026년 하반기 조직개편 결과 안내',
    preview: '이번 조직개편을 통해 기술본부 산하에 AI 사업부가 신설되며 플랫폼팀과 인프라팀이 통합됩니다. 자세한 내용은 첨부 파일을 확인해 주세요.\n\n주요 변경 내용:\n• AI 사업부 신설 (팀장: 박성호 이사)\n• 플랫폼팀 + 인프라팀 → 플랫폼인프라팀으로 통합\n• 마케팅팀 내 콘텐츠 파트 독립 → 콘텐츠팀 신설\n• 변경 시행일: 2026년 7월 1일',
    author: '인사팀', dept: '인사', initial: '인', avatarColor: 'bg-blue-600',
    createdAt: '3시간 전', likes: 24, comments: 31, views: 512, pinned: true, hot: true,
  },
  {
    id: 3, board: 'free', boardLabel: '자유',
    title: '오늘 점심 추천! 회사 근처 새로 생긴 파스타집 후기',
    preview: '어제 팀원들이랑 회사 앞 골목 새로 생긴 파스타집 다녀왔는데 정말 맛있었어요. 까르보나라가 특히 진해서 추천합니다. 가격도 착하고 양도 많아요!\n\n위치는 회사 후문에서 도보 3분 거리에 있는 "파스타노" 입니다. 런치 세트가 12,000원인데 파스타 + 샐러드 + 음료 다 포함이라 가성비 최고예요. 웨이팅이 좀 있을 수 있으니 12시 전에 가시는 걸 추천드려요!',
    author: '김민준', dept: '디자인팀', initial: '민', avatarColor: 'bg-emerald-500',
    createdAt: '2시간 전', likes: 42, comments: 18, views: 203, pinned: false, hot: true,
  },
  {
    id: 4, board: 'free', boardLabel: '자유',
    title: '재택근무 시 집중력 유지 꿀팁 공유해요',
    preview: '재택 3년차로서 터득한 집중력 유지 방법들을 공유합니다. 뽀모도로 기법, 노이즈 캔슬링 이어폰, 정해진 시간 점심 먹기 등 실용적인 팁들이에요.\n\n1. 뽀모도로 기법 (25분 집중 + 5분 휴식)\n2. 노이즈 캔슬링 이어폰 필수\n3. 점심은 무조건 12시~13시 사이 (루틴이 중요)\n4. 슬랙/메일 알림 오전에만 확인\n5. 퇴근 시간 되면 노트북 닫기 (심리적 분리)\n\n특히 뽀모도로는 진짜 효과 있었어요. 앱 추천: Forest',
    author: '이서연', dept: '개발팀', initial: '서', avatarColor: 'bg-violet-500',
    createdAt: '5시간 전', likes: 33, comments: 22, views: 187, pinned: false, hot: false,
  },
  {
    id: 5, board: 'free', boardLabel: '자유',
    title: 'TypeScript 심화 스터디 같이 하실 분 구해요',
    preview: '매주 토요일 오전 10시~12시, TypeScript 심화 내용 함께 공부할 분 구합니다. 온라인(Discord) 진행 예정이고 경력 무관 누구나 환영합니다.\n\n커리큘럼 (예정):\n- 1~2주차: 고급 타입 시스템 (Conditional Types, Mapped Types)\n- 3~4주차: 제네릭 심화\n- 5~6주차: 타입 체조 문제 풀이\n- 7~8주차: 실제 프로젝트 타입 개선 실습\n\n관심 있으신 분은 댓글 달아주시거나 슬랙 DM 주세요!',
    author: '박준혁', dept: '개발팀', initial: '준', avatarColor: 'bg-cyan-500',
    createdAt: '1일 전', likes: 15, comments: 9, views: 134, pinned: false, hot: false,
  },
  {
    id: 6, board: 'praise', boardLabel: '칭찬해요',
    title: '개발팀 이서연 님 덕분에 배포 이슈 해결됐어요!',
    preview: '지난주 금요일 늦은 시간에 배포 이슈가 발생했는데, 이서연 님께서 퇴근 후에도 남아서 끝까지 해결해 주셨습니다. 덕분에 주말에 안심하고 쉴 수 있었어요.\n\n갑작스러운 상황에서도 침착하게 로그를 분석하고 원인을 찾아내는 모습이 정말 인상적이었습니다. 그 덕분에 서비스 장애 없이 주말을 넘길 수 있었어요. 이서연 님 덕분에 팀 전체가 정말 든든합니다. 항상 감사해요! 🙏',
    author: '최유진', dept: '기획팀', initial: '유', avatarColor: 'bg-rose-500',
    createdAt: '1일 전', likes: 56, comments: 14, views: 289, pinned: false, hot: true,
  },
  {
    id: 7, board: 'praise', boardLabel: '칭찬해요',
    title: '디자인팀 김민준 님 항상 꼼꼼한 디자인 감사해요',
    preview: '항상 피드백을 꼼꼼히 반영해 주시고 기한 내에 완성도 높은 결과물을 주셔서 정말 감사합니다. 함께 일하는 게 든든해요!\n\n이번 프로젝트에서 디자인 수정만 무려 다섯 번이었는데, 한 번도 힘든 내색 없이 완벽하게 반영해 주셨어요. 덕분에 클라이언트도 매우 만족했습니다. 앞으로도 잘 부탁드립니다! 😊',
    author: '한지우', dept: '개발팀', initial: '지', avatarColor: 'bg-orange-500',
    createdAt: '2일 전', likes: 38, comments: 7, views: 156, pinned: false, hot: false,
  },
  {
    id: 8, board: 'event', boardLabel: '이벤트',
    title: '2026 상반기 우수사원 투표가 진행 중입니다',
    preview: '상반기 동안 뛰어난 성과를 보여준 동료를 추천해 주세요. 6월 20일까지 투표 가능하며 결과는 6월 말 시상식에서 발표됩니다.\n\n투표 방법:\n1. 인트라넷 → 인사 메뉴 → 우수사원 투표\n2. 추천 사유 50자 이상 필수 작성\n3. 1인당 1명만 투표 가능\n\n시상 내역:\n• 대상 1명: 상패 + 해외여행 상품권 200만원\n• 우수상 3명: 상패 + 백화점 상품권 50만원\n\n많은 참여 부탁드립니다!',
    author: '인사팀', dept: '인사', initial: '인', avatarColor: 'bg-blue-600',
    createdAt: '3일 전', likes: 44, comments: 28, views: 620, pinned: false, hot: true,
  },
]

const birthdayMembers: BirthdayMember[] = [
  { name: '김민준', dept: '디자인팀', date: '6월 15일', initial: '민', color: 'bg-emerald-500' },
  { name: '정재원', dept: '마케팅팀', date: '6월 22일', initial: '재', color: 'bg-violet-500' },
]

const quickLinks: QuickLink[] = [
  { label: '사내 인트라넷', href: '#' },
  { label: '근무 신청 시스템', href: '#' },
  { label: '경비 처리 포털', href: '#' },
  { label: '사내 교육 플랫폼', href: '#' },
]

// ─── Config ───────────────────────────────────────────────────────────────────

const BOARDS: { key: BoardType; label: string }[] = [
  { key: 'all',          label: '전체' },
  { key: 'announcement', label: '공지사항' },
  { key: 'free',         label: '자유게시판' },
  { key: 'praise',       label: '칭찬해요' },
  { key: 'event',        label: '이벤트' },
]

const BOARD_LABELS: Record<Exclude<BoardType, 'all'>, string> = {
  announcement: '공지',
  free:         '자유',
  praise:       '칭찬해요',
  event:        '이벤트',
}

const boardBadgeConfig: Record<Exclude<BoardType, 'all'>, { bg: string; text: string }> = {
  announcement: { bg: 'bg-slate-100 dark:bg-slate-700/50',   text: 'text-slate-600 dark:text-slate-300' },
  free:         { bg: 'bg-blue-50 dark:bg-blue-500/10',      text: 'text-blue-600 dark:text-blue-400' },
  praise:       { bg: 'bg-rose-50 dark:bg-rose-500/10',      text: 'text-rose-600 dark:text-rose-400' },
  event:        { bg: 'bg-violet-50 dark:bg-violet-500/10',  text: 'text-violet-600 dark:text-violet-400' },
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post, onSelect }: { post: Post; onSelect: (post: Post) => void }) {
  const [liked, setLiked] = useState(false)
  const badge = boardBadgeConfig[post.board]

  return (
    <article
      onClick={() => onSelect(post)}
      className="lounge-post bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl p-4 hover:border-gray-300 dark:hover:border-ide-active hover:shadow-sm transition-all cursor-pointer"
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {post.pinned && <Pin size={12} className="text-amber-500 dark:text-amber-400 flex-shrink-0" />}
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${badge.bg} ${badge.text}`}>
            {post.boardLabel}
          </span>
          {post.hot && (
            <span className="flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-500/10 text-orange-500 dark:text-orange-400">
              <Flame size={10} />인기
            </span>
          )}
        </div>
        <span className="text-[11px] text-gray-400 dark:text-ide-muted flex-shrink-0 tabular-nums">{post.createdAt}</span>
      </div>

      {/* Title */}
      <h3 className={`text-sm font-semibold mb-1 line-clamp-1 ${post.pinned ? 'text-gray-900 dark:text-ide-bright' : 'text-gray-800 dark:text-ide-text'}`}>
        {post.title}
      </h3>

      {/* Preview */}
      <p className="text-xs text-gray-500 dark:text-ide-subtle line-clamp-2 mb-3 leading-relaxed">
        {post.preview}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`w-5 h-5 rounded-full ${post.avatarColor} flex items-center justify-center flex-shrink-0`}>
            <span className="text-[9px] font-bold text-white">{post.initial}</span>
          </div>
          <span className="text-[11px] text-gray-600 dark:text-ide-subtle">{post.author}</span>
          <span className="text-[11px] text-gray-300 dark:text-ide-border">·</span>
          <span className="text-[11px] text-gray-400 dark:text-ide-muted">{post.dept}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            className={`flex items-center gap-1 text-[11px] transition-colors ${liked ? 'text-rose-500' : 'text-gray-400 dark:text-ide-muted hover:text-rose-500'}`}
            onClick={e => { e.stopPropagation(); setLiked(v => !v) }}
          >
            <Heart size={11} className={liked ? 'fill-current' : ''} />
            <span>{post.likes + (liked ? 1 : 0)}</span>
          </button>
          <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-ide-muted">
            <MessageCircle size={11} />{post.comments}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-ide-muted">
            <Eye size={11} />{post.views}
          </span>
        </div>
      </div>
    </article>
  )
}

// ─── Sidebar Card Shell ───────────────────────────────────────────────────────

function SideCard({ title, icon: Icon, children }: {
  title: string
  icon: LucideIcon
  children: React.ReactNode
}) {
  return (
    <div className="lounge-sidebar bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-ide-border">
        <Icon size={14} className="text-gray-400 dark:text-ide-subtle" />
        <h2 className="text-sm font-semibold text-gray-800 dark:text-ide-text">{title}</h2>
      </div>
      {children}
    </div>
  )
}

// ─── Post Detail Modal ────────────────────────────────────────────────────────

function PostDetailModal({ post, onClose }: { post: Post; onClose: () => void }) {
  const [liked, setLiked] = useState(false)
  const [commentInput, setCommentInput] = useState('')
  const [commentCount, setCommentCount] = useState(post.comments)
  const badge = boardBadgeConfig[post.board]

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  function submitComment() {
    if (!commentInput.trim()) return
    setCommentCount(c => c + 1)
    setCommentInput('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-white dark:bg-ide-surface border border-gray-200 dark:border-ide-border
          rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-ide-border flex-shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {post.pinned && <Pin size={12} className="text-amber-500 dark:text-amber-400" />}
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${badge.bg} ${badge.text}`}>
              {post.boardLabel}
            </span>
            {post.hot && (
              <span className="flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-500/10 text-orange-500 dark:text-orange-400">
                <Flame size={10} />인기
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 dark:text-ide-muted
              hover:bg-gray-100 dark:hover:bg-ide-hover hover:text-gray-600 dark:hover:text-ide-text transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <h2 className="text-base font-bold text-gray-900 dark:text-ide-bright mb-3 leading-snug">
            {post.title}
          </h2>

          {/* Author info */}
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100 dark:border-ide-border">
            <div className={`w-7 h-7 rounded-full ${post.avatarColor} flex items-center justify-center flex-shrink-0`}>
              <span className="text-[10px] font-bold text-white">{post.initial}</span>
            </div>
            <div>
              <span className="text-xs font-medium text-gray-700 dark:text-ide-text">{post.author}</span>
              <span className="text-[11px] text-gray-400 dark:text-ide-muted ml-1.5">{post.dept}</span>
            </div>
            <span className="text-[11px] text-gray-400 dark:text-ide-muted ml-auto">{post.createdAt}</span>
          </div>

          {/* Content */}
          <div className="text-sm text-gray-700 dark:text-ide-text leading-relaxed whitespace-pre-wrap mb-5">
            {post.preview}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 py-3 border-t border-b border-gray-100 dark:border-ide-border mb-4">
            <button
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                liked ? 'text-rose-500' : 'text-gray-400 dark:text-ide-muted hover:text-rose-500'
              }`}
              onClick={() => setLiked(v => !v)}
            >
              <Heart size={13} className={liked ? 'fill-current' : ''} />
              <span>좋아요 {post.likes + (liked ? 1 : 0)}</span>
            </button>
            <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-ide-muted">
              <MessageCircle size={13} />댓글 {commentCount}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-ide-muted">
              <Eye size={13} />조회 {post.views}
            </span>
          </div>

          {/* Comment Input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="댓글을 입력하세요..."
              value={commentInput}
              onChange={e => setCommentInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment() } }}
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-ide-border
                bg-white dark:bg-ide-base text-gray-900 dark:text-ide-text
                placeholder-gray-400 dark:placeholder-ide-muted
                focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
            />
            <button
              onClick={submitComment}
              disabled={!commentInput.trim()}
              className="px-3 py-2 rounded-lg bg-slate-800 dark:bg-ide-active text-white
                hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Write Post Modal ─────────────────────────────────────────────────────────

function WritePostModal({ onClose, onSubmit }: {
  onClose: () => void
  onSubmit: (post: Post) => void
}) {
  const [board,   setBoard]   = useState<Exclude<BoardType, 'all'>>('free')
  const [title,   setTitle]   = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleSubmit() {
    if (!title.trim() || !content.trim()) return
    const newPost: Post = {
      id: Date.now(),
      board,
      boardLabel: BOARD_LABELS[board],
      title: title.trim(),
      preview: content.trim(),
      author: '관리자',
      dept: '관리팀',
      initial: '관',
      avatarColor: 'bg-slate-600',
      createdAt: '방금 전',
      likes: 0,
      comments: 0,
      views: 1,
      pinned: false,
      hot: false,
    }
    onSubmit(newPost)
    onClose()
  }

  const canSubmit = title.trim() && content.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-white dark:bg-ide-surface border border-gray-200 dark:border-ide-border
          rounded-xl shadow-2xl w-full max-w-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-ide-border">
          <div className="flex items-center gap-2">
            <SquarePen size={15} className="text-slate-600 dark:text-ide-text" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-ide-bright">새 글 작성</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 dark:text-ide-muted
              hover:bg-gray-100 dark:hover:bg-ide-hover hover:text-gray-600 dark:hover:text-ide-text transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Board + Title */}
          <div className="grid grid-cols-[140px_1fr] gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-ide-subtle mb-1">게시판</label>
              <select
                value={board}
                onChange={e => setBoard(e.target.value as Exclude<BoardType, 'all'>)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-ide-border
                  bg-white dark:bg-ide-base text-gray-900 dark:text-ide-text
                  focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
              >
                {BOARDS.filter(b => b.key !== 'all').map(b => (
                  <option key={b.key} value={b.key}>{b.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-ide-subtle mb-1">
                제목 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-ide-border
                  bg-white dark:bg-ide-base text-gray-900 dark:text-ide-text
                  placeholder-gray-400 dark:placeholder-ide-muted
                  focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-ide-subtle mb-1">
              내용 <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={7}
              placeholder="내용을 입력하세요..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-ide-border
                bg-white dark:bg-ide-base text-gray-900 dark:text-ide-text
                placeholder-gray-400 dark:placeholder-ide-muted resize-none
                focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-600"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-ide-border
              text-gray-600 dark:text-ide-text hover:bg-gray-50 dark:hover:bg-ide-hover transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-4 py-2 text-sm rounded-lg bg-slate-800 dark:bg-ide-active
              text-white dark:text-ide-bright hover:bg-slate-700 dark:hover:bg-slate-600
              transition-colors flex items-center gap-1.5
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <SquarePen size={14} />
            작성 완료
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
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
      <span className="max-w-xs truncate">{message}</span>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LoungePage() {
  const rootRef   = useRef<HTMLDivElement>(null)
  const isMount   = useRef(true)

  const [posts,        setPosts]       = useState<Post[]>(INITIAL_POSTS)
  const [activeBoard,  setActiveBoard] = useState<BoardType>('all')
  const [searchQuery,  setSearchQuery] = useState('')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [showWrite,    setShowWrite]   = useState(false)
  const [toast,        setToast]       = useState<string | null>(null)

  const filteredPosts = useMemo(() => {
    const byBoard = activeBoard === 'all'
      ? posts
      : posts.filter(p => p.board === activeBoard)
    const q = searchQuery.trim().toLowerCase()
    return q
      ? byBoard.filter(p => p.title.toLowerCase().includes(q) || p.preview.toLowerCase().includes(q))
      : byBoard
  }, [posts, activeBoard, searchQuery])

  const popularPosts = useMemo(() =>
    [...posts]
      .filter(p => p.hot)
      .sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments))
      .slice(0, 4),
  [posts])

  const boardCount = (key: BoardType) =>
    key === 'all' ? posts.length : posts.filter(p => p.board === key).length

  // Mount animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.lounge-header',
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      )
      gsap.fromTo('.lounge-post',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.07, ease: 'power2.out', delay: 0.2 }
      )
      gsap.fromTo('.lounge-sidebar',
        { opacity: 0, x: 14 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.25 }
      )
    }, rootRef)
    return () => ctx.revert()
  }, [])

  // Filter change animation (skip on first render)
  useEffect(() => {
    if (isMount.current) { isMount.current = false; return }
    gsap.fromTo('.lounge-post',
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.05, ease: 'power2.out' }
    )
  }, [activeBoard, searchQuery])

  function handleNewPost(post: Post) {
    setPosts(prev => [post, ...prev])
    setToast('글이 등록되었습니다')
  }

  return (
    <div ref={rootRef} className="space-y-5 pb-6">

      {/* Page Header */}
      <div className="lounge-header flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-ide-bright">사내 라운지</h1>
          <p className="text-sm text-gray-500 dark:text-ide-subtle mt-0.5">
            전사 공지 및 소통 공간입니다.
          </p>
        </div>
        <button
          onClick={() => setShowWrite(true)}
          className="flex items-center gap-2 px-3 py-2 bg-slate-800 dark:bg-ide-active text-white text-xs font-semibold rounded-lg hover:bg-slate-700 dark:hover:bg-ide-border transition-colors"
        >
          <SquarePen size={14} />
          새 글 작성
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-ide-muted pointer-events-none" />
        <input
          type="text"
          placeholder="게시글 제목 또는 내용 검색..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-lg text-gray-800 dark:text-ide-text placeholder:text-gray-400 dark:placeholder:text-ide-muted focus:outline-none focus:border-slate-400 dark:focus:border-ide-active transition-colors"
        />
      </div>

      {/* Board Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
        {BOARDS.map(board => (
          <button
            key={board.key}
            onClick={() => setActiveBoard(board.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              activeBoard === board.key
                ? 'bg-slate-800 dark:bg-ide-active text-white'
                : 'text-gray-500 dark:text-ide-subtle hover:bg-gray-100 dark:hover:bg-ide-hover hover:text-gray-800 dark:hover:text-ide-text'
            }`}
          >
            {board.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full tabular-nums ${
              activeBoard === board.key
                ? 'bg-white/20 text-white'
                : 'bg-gray-100 dark:bg-ide-hover text-gray-500 dark:text-ide-muted'
            }`}>
              {boardCount(board.key)}
            </span>
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-4">

        {/* ── Left: Post List ── */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-3">
          {filteredPosts.length === 0 ? (
            <div className="bg-white dark:bg-ide-base border border-gray-200 dark:border-ide-border rounded-xl py-16 flex flex-col items-center justify-center">
              <Search size={26} className="text-gray-300 dark:text-ide-border mb-3" />
              <p className="text-sm text-gray-500 dark:text-ide-subtle">검색 결과가 없습니다.</p>
              <p className="text-xs text-gray-400 dark:text-ide-muted mt-1">다른 키워드로 검색해 보세요.</p>
            </div>
          ) : (
            filteredPosts.map(post => (
              <PostCard key={post.id} post={post} onSelect={setSelectedPost} />
            ))
          )}
        </div>

        {/* ── Right: Sidebar ── */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">

          {/* Popular Posts */}
          <SideCard title="이번 주 인기 글" icon={TrendingUp}>
            <ul className="p-3 space-y-0.5">
              {popularPosts.map((post, i) => (
                <li
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-ide-hover transition-colors cursor-pointer"
                >
                  <span className={`text-xs font-bold w-4 flex-shrink-0 mt-0.5 tabular-nums ${i === 0 ? 'text-orange-500' : 'text-gray-400 dark:text-ide-muted'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 dark:text-ide-text line-clamp-2 leading-snug">{post.title}</p>
                    <div className="flex items-center gap-2.5 mt-1">
                      <span className="text-[10px] text-gray-400 dark:text-ide-muted flex items-center gap-0.5">
                        <Heart size={9} />{post.likes}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-ide-muted flex items-center gap-0.5">
                        <MessageCircle size={9} />{post.comments}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-ide-muted flex items-center gap-0.5">
                        <Eye size={9} />{post.views}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </SideCard>

          {/* Birthday */}
          <SideCard title="이번 달 생일" icon={Cake}>
            <ul className="p-3 space-y-1.5">
              {birthdayMembers.map(member => (
                <li
                  key={member.name}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-ide-hover transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full ${member.color} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-xs font-bold text-white">{member.initial}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 dark:text-ide-text">{member.name}</p>
                    <p className="text-[10px] text-gray-400 dark:text-ide-muted">{member.dept}</p>
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-ide-subtle flex-shrink-0">{member.date}</span>
                </li>
              ))}
            </ul>
          </SideCard>

          {/* Quick Links */}
          <SideCard title="바로가기" icon={ExternalLink}>
            <ul className="p-3 space-y-0.5">
              {quickLinks.map(link => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="flex items-center justify-between px-2 py-2 rounded-lg text-xs text-gray-600 dark:text-ide-subtle hover:bg-slate-50 dark:hover:bg-ide-hover hover:text-gray-800 dark:hover:text-ide-text transition-colors"
                  >
                    {link.label}
                    <ChevronRight size={12} className="text-gray-300 dark:text-ide-border" />
                  </a>
                </li>
              ))}
            </ul>
          </SideCard>

        </div>
      </div>

      {/* Write Post Modal */}
      {showWrite && (
        <WritePostModal
          onClose={() => setShowWrite(false)}
          onSubmit={handleNewPost}
        />
      )}

      {/* Post Detail Modal */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

    </div>
  )
}
