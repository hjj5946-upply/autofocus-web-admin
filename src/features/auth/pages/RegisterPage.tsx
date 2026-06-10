import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, UserPlus } from 'lucide-react'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.')
      return
    }
    setPasswordError('')
    navigate('/dashboard')
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 11)
    let formatted = digits
    if (digits.length > 7) formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
    else if (digits.length > 3) formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`
    setForm((f) => ({ ...f, phone: formatted }))
  }

  const inputClass =
    'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-ide-border bg-white dark:bg-ide-hover text-gray-900 dark:text-ide-text placeholder-gray-400 dark:placeholder-ide-muted focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-ide-border focus:border-transparent transition-colors'

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-ide-deep flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 text-white font-bold text-lg mb-3">
            AF
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-ide-bright">AutoFocus Admin</h1>
          <p className="text-sm text-gray-500 dark:text-ide-subtle mt-1">관리자 계정을 만드세요</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-ide-base rounded-xl border border-gray-200 dark:border-ide-border shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 dark:text-ide-bright mb-5">회원가입</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-ide-text mb-1.5">
                이름
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="홍길동"
                maxLength={50}
                className={inputClass}
              />
            </div>

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
                maxLength={100}
                className={inputClass}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-ide-text mb-1.5">
                연락처
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={handlePhoneChange}
                placeholder="010-1234-5678"
                maxLength={13}
                className={inputClass}
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
                  maxLength={128}
                  className={`${inputClass} pr-9`}
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

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-ide-text mb-1.5">
                비밀번호 확인
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, confirmPassword: e.target.value }))
                    if (passwordError) setPasswordError('')
                  }}
                  placeholder="비밀번호를 다시 입력하세요"
                  maxLength={128}
                  className={`${inputClass} pr-9 ${passwordError ? 'border-red-400 dark:border-red-500 focus:ring-red-400' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-ide-muted dark:hover:text-ide-subtle cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1 text-xs text-red-500 dark:text-red-400">{passwordError}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 dark:bg-ide-active dark:hover:bg-ide-border text-white dark:text-ide-bright text-sm font-medium rounded-lg transition-colors mt-1 cursor-pointer"
            >
              <UserPlus size={16} />
              회원가입
            </button>
          </form>
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-gray-500 dark:text-ide-subtle mt-4">
          이미 계정이 있으신가요?{' '}
          <Link
            to="/login"
            className="font-medium text-slate-800 dark:text-ide-text hover:underline"
          >
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
