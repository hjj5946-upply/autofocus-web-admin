import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-ide-deep flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 text-white font-bold text-lg mb-3">
            AF
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-ide-bright">AutoFocus Admin</h1>
          <p className="text-sm text-gray-500 dark:text-ide-subtle mt-1">관리자 시스템에 로그인하세요</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-ide-base rounded-xl border border-gray-200 dark:border-ide-border shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-ide-bright mb-5">로그인</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-ide-text mb-1.5">
                이메일
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="admin@autofocus.co.kr"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-ide-border bg-white dark:bg-ide-hover text-gray-900 dark:text-ide-text placeholder-gray-400 dark:placeholder-ide-muted focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-ide-border focus:border-transparent transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-ide-text mb-1.5">
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="비밀번호를 입력하세요"
                  className="w-full px-3 py-2 pr-9 text-sm rounded-lg border border-gray-300 dark:border-ide-border bg-white dark:bg-ide-hover text-gray-900 dark:text-ide-text placeholder-gray-400 dark:placeholder-ide-muted focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-ide-border focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-ide-muted dark:hover:text-ide-subtle cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 dark:bg-ide-active dark:hover:bg-ide-border text-white dark:text-ide-bright text-sm font-medium rounded-lg transition-colors mt-1 cursor-pointer"
            >
              <LogIn size={16} />
              로그인
            </button>
          </form>
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-gray-500 dark:text-ide-subtle mt-4">
          계정이 없으신가요?{' '}
          <Link
            to="/register"
            className="font-medium text-slate-800 dark:text-ide-text hover:underline"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
