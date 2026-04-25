import { useNavigate } from 'react-router-dom'
import {
  Activity, TriangleAlert as AlertTriangle, ArrowRight,
  ChartBar as BarChart3, Bell, BookOpen, Brain, Calendar,
  CircleCheck as CheckCircle2, ChevronRight, Droplet, Eye,
  Flame, Heart, ChartLine as LineChart, Lock, Shield,
  Sparkles, Target, TrendingUp, Users, Zap
} from 'lucide-react'
import logo from '../assets/logo.png'

export default function LandingPage() {
  const navigate = useNavigate()

  const handleDemo = () => {
    // Fully static demo — no backend call
    localStorage.setItem('hormonaDemoMode', 'true')
    localStorage.setItem('hormonaUserName', 'Anaya')
    localStorage.removeItem('hormonaUserId')
    localStorage.removeItem('hormonaOnboardingComplete')
    navigate('/dashboard')
  }

  const handleStart = () => {
    navigate('/signup')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F5' }}>
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-1 cursor-pointer" onClick={() => navigate('/')}>
          <img src={logo} alt="Hormona" className="h-9 w-9 object-contain" />
          <span className="text-2xl font-bold tracking-tight" style={{ color: '#1E1B5E' }}>HORMONA</span>
        </div>
        <button
          onClick={handleStart}
          className="text-white font-semibold px-6 py-2 rounded-xl transition flex items-center gap-2 hover:opacity-90"
          style={{ backgroundColor: '#7EC8A4' }}
        >
          Get Started
        </button>
      </nav>

      {/* HERO */}
      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div
              className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full mb-6"
              style={{ backgroundColor: '#E8F5EF', color: '#1E1B5E' }}
            >
              <Sparkles size={14} />
              Elite Her Hackathon 2026
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4" style={{ color: '#1E1B5E' }}>
              Understand Your Hormones.
              <span style={{ color: '#7EC8A4' }}> Prevent the Risk.</span>
            </h1>
            <p className="text-lg mb-6" style={{ color: '#6B6B8A' }}>
              1 in 5 women has PCOD. 50% don't even know it.
              Hormona connects your daily habits to your hormonal health.
            </p>

            <div className="flex flex-col gap-3">
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={handleStart}
                  className="text-white font-semibold px-8 py-3 rounded-xl transition flex items-center gap-2 hover:opacity-90"
                  style={{ backgroundColor: '#7EC8A4' }}
                >
                  Start Your Journey
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={handleDemo}
                  className="font-semibold px-8 py-3 rounded-xl transition flex items-center gap-2 hover:bg-[#F0EFF8]"
                  style={{ border: '2px solid #1E1B5E', color: '#1E1B5E', backgroundColor: 'transparent' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F0EFF8'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Eye size={18} />
                  Watch Demo
                </button>
              </div>
              <p className="text-xs" style={{ color: '#6B6B8A' }}>
                Demo: See Hormona with pre-loaded data for "Anaya" — no signup required.
              </p>
            </div>

            <div className="flex gap-6 mt-8 text-sm" style={{ color: '#6B6B8A' }}>
              <span className="flex items-center gap-1"><CheckCircle2 size={13} /> No credit card</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={13} /> Free forever</span>
              <span className="flex items-center gap-1"><Lock size={12} /> Private &amp; secure</span>
            </div>
          </div>

          {/* Hero card mockup */}
          <div
            className="rounded-3xl p-8 text-center"
            style={{ backgroundColor: '#EEF7F2' }}
          >
            <div className="bg-white rounded-2xl shadow-md p-5 max-w-xs mx-auto" style={{ border: '1px solid #E0F0E8' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-sm" style={{ color: '#1E1B5E' }}>Hormonal Health Score</div>
                <Activity size={16} style={{ color: '#7EC8A4' }} />
              </div>
              <div className="text-5xl font-bold mb-1" style={{ color: '#7EC8A4' }}>
                72<span className="text-base" style={{ color: '#6B6B8A' }}>/100</span>
              </div>
              <div className="w-full rounded-full h-2 mb-4" style={{ backgroundColor: '#EEECF5' }}>
                <div className="rounded-full h-2 w-[72%]" style={{ backgroundColor: '#7EC8A4' }} />
              </div>
              <div className="flex items-center justify-center gap-2">
                <Target size={14} style={{ color: '#7EC8A4' }} />
                <p className="text-xs" style={{ color: '#6B6B8A' }}>PCOD Risk: 22% — Low</p>
              </div>
            </div>
            <p className="text-xs mt-4 flex items-center justify-center gap-1" style={{ color: '#6B6B8A' }}>
              <Sparkles size={12} /> Interactive dashboard preview
            </p>
          </div>
        </div>

        {/* STATS */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 py-8"
          style={{ borderTop: '1px solid #EEECF5', borderBottom: '1px solid #EEECF5' }}
        >
          {[
            { icon: Users, value: '1 in 5', label: 'women affected by PCOD', color: '#7EC8A4' },
            { icon: AlertTriangle, value: '50%', label: 'remain undiagnosed', color: '#EA9A98' },
            { icon: TrendingUp, value: '3x', label: 'higher risk if untreated', color: '#EA9A98' },
          ].map(({ icon: Icon, value, label, color }) => (
            <div key={label} className="text-center">
              <div className="flex justify-center mb-2">
                <Icon size={32} style={{ color }} />
              </div>
              <div className="text-3xl font-bold" style={{ color: '#1E1B5E' }}>{value}</div>
              <div className="text-sm mt-1" style={{ color: '#6B6B8A' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* PROBLEM vs SOLUTION */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-4" style={{ color: '#1E1B5E' }}>
            Period Trackers Don't Work for PCOD
          </h2>
          <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: '#6B6B8A' }}>
            Most apps just log dates. Hormona gives you actionable insights.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold mb-4 text-lg flex items-center gap-2" style={{ color: '#1E1B5E' }}>
                <Flame size={20} style={{ color: '#EA9A98' }} /> The Problem
              </h3>
              {[
                { icon: Calendar, title: 'Cycles, not causes', desc: 'Know when your period starts, but not why it\'s irregular' },
                { icon: Bell, title: 'Early signals ignored', desc: 'Miss warning signs that could lead to early intervention' },
                { icon: Activity, title: 'Reactive healthcare', desc: 'Only see a doctor after symptoms become severe' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-white rounded-xl p-4" style={{ border: '1px solid #EEECF5' }}>
                  <div className="font-medium mb-1 flex items-center gap-2" style={{ color: '#EA9A98' }}>
                    <Icon size={16} /> {title}
                  </div>
                  <div className="text-sm" style={{ color: '#6B6B8A' }}>{desc}</div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold mb-4 text-lg flex items-center gap-2" style={{ color: '#1E1B5E' }}>
                <Zap size={20} style={{ color: '#7EC8A4' }} /> Hormona Solution
              </h3>
              {[
                { icon: Brain, title: 'Root cause insights', desc: 'Connect sleep, stress & nutrition to cycle health' },
                { icon: LineChart, title: 'Risk simulation', desc: 'See how lifestyle changes affect your PCOD risk in real time' },
                { icon: Shield, title: 'Preventive action', desc: 'Personalized recommendations to lower risk before symptoms appear' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="rounded-xl p-4" style={{ backgroundColor: '#E8F5EF', border: '1px solid #C8E9D8' }}>
                  <div className="font-medium mb-1 flex items-center gap-2" style={{ color: '#1E1B5E' }}>
                    <Icon size={16} /> {title}
                  </div>
                  <div className="text-sm" style={{ color: '#6B6B8A' }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#1E1B5E' }}>
            How Hormona Works
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Log Daily', desc: 'Track sleep, stress, hydration & symptoms', icon: BookOpen },
              { step: '2', title: 'Get Your Score', desc: 'AI-powered hormonal health score', icon: BarChart3 },
              { step: '3', title: 'Simulate Changes', desc: 'See your risk drop in real time', icon: Brain },
              { step: '4', title: 'Take Action', desc: 'Personalized prevention plan', icon: CheckCircle2 },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="text-center">
                <div className="flex justify-center mb-3">
                  <Icon size={32} style={{ color: '#7EC8A4' }} />
                </div>
                <div
                  className="text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold"
                  style={{ backgroundColor: '#7EC8A4' }}
                >
                  {step}
                </div>
                <h3 className="font-semibold mb-1" style={{ color: '#1E1B5E' }}>{title}</h3>
                <p className="text-xs" style={{ color: '#6B6B8A' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FINAL CTA */}
        <div
          className="mt-20 text-center rounded-3xl p-12"
          style={{ backgroundColor: '#EEF7F2' }}
        >
          <Heart size={40} style={{ color: '#7EC8A4' }} className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3" style={{ color: '#1E1B5E' }}>
            Ready to understand your body?
          </h2>
          <p className="mb-6 max-w-md mx-auto" style={{ color: '#6B6B8A' }}>
            Join hundreds of women taking control of their hormonal health.
          </p>
          <button
            onClick={handleStart}
            className="text-white font-semibold px-8 py-3 rounded-xl transition inline-flex items-center gap-2 hover:opacity-90"
            style={{ backgroundColor: '#7EC8A4' }}
          >
            Get Started Free
            <ChevronRight size={18} />
          </button>
        </div>

        {/* FOOTER */}
        <footer className="mt-20 pt-8 text-center text-sm" style={{ borderTop: '1px solid #EEECF5', color: '#6B6B8A' }}>
          <div className="flex justify-center gap-6 mb-3">
            <span className="flex items-center gap-1">
              <Heart size={12} style={{ color: '#7EC8A4' }} /> Hormona
            </span>
            <span>Predictive Health. Preventing Risk.</span>
          </div>
          <p>Team CodeNova — Elite Her Hackathon 2026</p>
        </footer>
      </main>
    </div>
  )
}
