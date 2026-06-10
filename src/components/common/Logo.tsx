interface LogoProps {
  collapsed?: boolean
  size?: 'sm' | 'md'
  theme?: 'dark' | 'light'
}

export default function Logo({ collapsed = false, size = 'md', theme = 'light' }: LogoProps) {
  const boxSize = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-8 h-8 text-sm'
  const textSize = size === 'sm' ? 'text-sm' : 'text-base'
  const textColor =
    theme === 'dark'
      ? 'text-white'
      : 'text-slate-900 dark:text-slate-100'

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`flex items-center justify-center rounded-lg bg-slate-800 font-bold text-white flex-shrink-0 ${boxSize}`}
      >
        AF
      </div>
      {!collapsed && (
        <span className={`font-semibold whitespace-nowrap ${textColor} ${textSize}`}>
          AutoFocus
        </span>
      )}
    </div>
  )
}
