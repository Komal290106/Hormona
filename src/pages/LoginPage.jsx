import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react'
import api from '../lib/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    try {
      setLoading(true)
      setError('')
      const res = await api.post('/users/login', form)
      localStorage.setItem('hormonaUserId', res.data._id)
      localStorage.setItem('hormonaUserName', res.data.name)

      if (res.data.onboardingComplete) {
        localStorage.setItem('hormonaOnboardingComplete', 'true')
        navigate('/dashboard')
      } else {
        navigate('/onboarding')
      }
    } catch (err) {
      const msg = err.response?.data?.message
      setError(msg || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Demo shortcut — fetches real Anaya from backend
  const handleDemoLogin = async () => {
    try {
      const res = await api.get('/users/demo')
      localStorage.setItem('hormonaUserId', res.data._id)
      localStorage.setItem('hormonaUserName', res.data.name)
      if (res.data.onboardingComplete) {
        localStorage.setItem('hormonaOnboardingComplete', 'true')
      }
      navigate('/dashboard')
    } catch {
      setError('Could not connect to the server. Please check your connection and try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex">
      {/* Left decorative panel */}
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
            Your hormonal health,<br />
            <span style={{ color: '#7EC8A4' }}>understood.</span>
          </h2>
          <p className="text-white/60 text-base leading-relaxed">
            Track your cycle, log daily habits, and get AI-powered insights to understand your body's unique patterns.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { icon: '🌿', text: 'Personalized PCOD risk analysis' },
              { icon: '📊', text: 'Smart lifestyle tracking & trends' },
              { icon: '🔮', text: 'Predictive cycle intelligence' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <span className="text-white/80 text-sm">{item.text}</span>
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
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <Heart size={24} style={{ color: '#7EC8A4' }} fill="#7EC8A4" />
            <span className="text-[#1E1B5E] font-bold text-xl tracking-tight">HORMONA</span>
          </div>

          <h1 className="text-2xl font-bold text-[#1E1B5E] mb-1">Welcome back</h1>
          <p className="text-[#6B6B8A] text-sm mb-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#7EC8A4] font-medium hover:underline">
              Sign up free
            </Link>
          </p>

          {error && (
            <div className="bg-[#FDECEA] text-red-600 text-sm px-4 py-3 rounded-xl mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-[#1A1A2E]">Password</label>
                <button type="button" className="text-xs text-[#7EC8A4] hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full border border-[#EEECF5] rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-[#7EC8A4] focus:ring-2 focus:ring-[#7EC8A4]/20 transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B8A] hover:text-[#1E1B5E]"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#7EC8A4] text-white font-semibold py-3 rounded-xl hover:bg-[#6ab890] transition-colors mt-2 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : (
                <>Sign in <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Demo divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#EEECF5]" />
            <span className="text-xs text-[#6B6B8A]">or</span>
            <div className="flex-1 h-px bg-[#EEECF5]" />
          </div>

          <button
            onClick={handleDemoLogin}
            className="w-full flex items-center justify-center gap-2 border border-[#EEECF5] bg-white text-[#1E1B5E] font-medium py-3 rounded-xl hover:bg-[#F0EEF8] transition-colors text-sm"
          >
            <Sparkles size={16} className="text-[#7EC8A4]" />
            Try demo as Anaya (no account needed)
          </button>

          <p className="text-center text-xs text-[#6B6B8A] mt-6">
            By continuing, you agree to our{' '}
            <span className="underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  )
}
