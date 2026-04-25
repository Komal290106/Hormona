import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Eye, EyeOff, ArrowRight, CircleCheck as CheckCircle } from 'lucide-react'
import api from '../lib/api'

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all required fields.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    try {
      setLoading(true)
      setError('')
      const res = await api.post('/users/signup', {
        name: form.name,
        email: form.email,
        password: form.password,
      })
      localStorage.removeItem('hormonaDemoMode')
      localStorage.removeItem('hormonaOnboardingComplete')
      localStorage.setItem('hormonaUserId', res.data._id)
      localStorage.setItem('hormonaUserName', res.data.name)
      navigate('/onboarding')
    } catch (err) {
      const msg = err.response?.data?.message
      setError(msg || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = () => {
    const pw = form.password
    if (!pw) return null
    if (pw.length < 6) return { label: 'Too short', color: '#E8A598', width: '20%' }
    if (pw.length < 8) return { label: 'Weak', color: '#E8A598', width: '40%' }
    if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return { label: 'Fair', color: '#F5C16C', width: '65%' }
    return { label: 'Strong', color: '#7EC8A4', width: '100%' }
  }
  const strength = passwordStrength()

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{ backgroundColor: '#1E1B5E' }}
      >
        <div className="flex items-center gap-2">
          <Heart size={28} style={{ color: '#7EC8A4' }} fill="#7EC8A4" />
          <span className="text-white font-bold text-2xl tracking-tight">HORMONA</span>
        </div>

        <div>
          <h2 className="text-white text-4xl font-bold leading-tight mb-4">
            Start your journey to<br />
            <span style={{ color: '#7EC8A4' }}>hormonal wellness.</span>
          </h2>
          <p className="text-white/60 text-base leading-relaxed">
            Join thousands of women who've gained clarity about their health with Hormona's predictive intelligence.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { value: '10K+', label: 'Active users' },
              { value: '94%', label: 'Accuracy rate' },
              { value: '2 wks', label: 'Avg to first insight' },
              { value: 'Free', label: 'Always free to start' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs">
          Your data is encrypted and never shared. Privacy first, always.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <Heart size={24} style={{ color: '#7EC8A4' }} fill="#7EC8A4" />
            <span className="text-[#1E1B5E] font-bold text-xl tracking-tight">HORMONA</span>
          </div>

          <h1 className="text-2xl font-bold text-[#1E1B5E] mb-1">Create your account</h1>
          <p className="text-[#6B6B8A] text-sm mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-[#7EC8A4] font-medium hover:underline">
              Sign in
            </Link>
          </p>

          {error && (
            <div className="bg-[#FDECEA] text-red-600 text-sm px-4 py-3 rounded-xl mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Full name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your first name"
                className="w-full border border-[#EEECF5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7EC8A4] focus:ring-2 focus:ring-[#7EC8A4]/20 transition-all bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Email address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full border border-[#EEECF5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7EC8A4] focus:ring-2 focus:ring-[#7EC8A4]/20 transition-all bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="w-full border border-[#EEECF5] rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-[#7EC8A4] focus:ring-2 focus:ring-[#7EC8A4]/20 transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B8A] hover:text-[#1E1B5E] transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {strength && (
                <div className="mt-2">
                  <div className="h-1 bg-[#EEECF5] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: strength.width, backgroundColor: strength.color }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: strength.color }}>{strength.label}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Confirm password</label>
              <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                className="w-full border border-[#EEECF5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7EC8A4] focus:ring-2 focus:ring-[#7EC8A4]/20 transition-all bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#7EC8A4] text-white font-semibold py-3 rounded-xl hover:bg-[#6ab890] transition-colors mt-2 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : (
                <>Create account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[#6B6B8A] mt-6">
            By creating an account, you agree to our{' '}
            <span className="underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  )
}
