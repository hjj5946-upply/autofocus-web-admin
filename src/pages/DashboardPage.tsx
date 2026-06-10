import {
  Users,
  TrendingUp,
  FolderOpen,
  Archive,
  Activity,
} from 'lucide-react'

const stats = [
  { label: '전체 연락처', value: '—', icon: Users,       change: null },
  { label: '진행 프로젝트', value: '—', icon: FolderOpen,  change: null },
  { label: 'CRM 파이프라인', value: '—', icon: TrendingUp,  change: null },
  { label: '등록 자산',    value: '—', icon: Archive,     change: null },
]

export default function DashboardPage() {
  return (
    <div className="max-w-5xl">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-ide-bright">대시보드</h1>
        <p className="text-sm text-gray-500 dark:text-ide-subtle mt-0.5">
          AutoFocus Admin에 오신 것을 환영합니다.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white dark:bg-ide-base rounded-lg border border-gray-200 dark:border-ide-border p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 dark:text-ide-subtle font-medium">
                  {stat.label}
                </span>
                <div className="w-7 h-7 rounded-md bg-gray-100 dark:bg-ide-hover flex items-center justify-center">
                  <Icon size={14} className="text-gray-500 dark:text-ide-subtle" />
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900 dark:text-ide-text">
                {stat.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* Recent activity placeholder */}
      <div className="bg-white dark:bg-ide-base rounded-lg border border-gray-200 dark:border-ide-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={15} className="text-gray-400 dark:text-ide-subtle" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-ide-text">최근 활동</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-ide-hover flex items-center justify-center mb-3">
            <Activity size={18} className="text-gray-400 dark:text-ide-subtle" />
          </div>
          <p className="text-sm text-gray-500 dark:text-ide-subtle">아직 활동 내역이 없습니다.</p>
          <p className="text-xs text-gray-400 dark:text-ide-muted mt-1">
            데이터가 연동되면 여기에 표시됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}
