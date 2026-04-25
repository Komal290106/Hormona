import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardList,
  Lightbulb,
  Brain,
  User,
  LogOut,
  Heart,
  Menu,
  X,
  Leaf,
} from 'lucide-react'
import { useState, useEffect } from 'react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/log', label: 'Log Data', icon: ClipboardList },
  { to: '/insights', label: 'Insights', icon: Lightbulb },
  { to: '/simulate', label: 'Simulate', icon: Brain },
  { to: '/profile', label: 'Profile', icon: User },
]

const PHASE_TIPS = {
  menstrual: { tip: 'Rest is productive today. Gentle movement supports your body.', phase: 'Menstrual Phase' },
  follicular: { tip: 'Energy is rising — great time to start new healthy habits.', phase: 'Follicular Phase' },
  ovulatory: { tip: 'Peak energy and clarity. Make the most of it!', phase: 'Ovulatory Phase' },
  luteal: { tip: 'Prioritise sleep and reduce sugar for hormonal balance.', phase: 'Luteal Phase' },
  default: { tip: 'Log your data daily to unlock personalised cycle insights.', phase: 'Your Cycle' },
}

function getDailyTip(lastPeriodDate, avgCycleLength = 28) {
  if (!lastPeriodDate) return PHASE_TIPS.default
  const daysSince = Math.floor((Date.now() - new Date(lastPeriodDate)) / 86400000)
  const cycleDay = (daysSince % avgCycleLength) + 1
  if (cycleDay <= 5) return PHASE_TIPS.menstrual
  if (cycleDay <= 13) return PHASE_TIPS.follicular
  if (cycleDay <= 16) return PHASE_TIPS.ovulatory
  return PHASE_TIPS.luteal
}

export default function Layout() {
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userName, setUserName] = useState('')
  const [tip, setTip] = useState(PHASE_TIPS.default)

  useEffect(() => {
    const storedName = localStorage.getItem('hormonaUserName')
    setUserName(storedName || 'there')

    const demoMode = localStorage.getItem('hormonaDemoMode') === 'true'
    if (demoMode) {
      // Demo user — compute tip from static demo data
      setTip(getDailyTip('2025-04-01', 28))
      return
    }

    // Real user — compute tip from stored onboarding data
    const userId = localStorage.getItem('hormonaUserId')
    if (userId) {
      const stored = localStorage.getItem(`userData_${userId}`)
      if (stored) {
        try {
          const data = JSON.parse(stored)
          if (data.lastPeriodDate) {
            setTip(getDailyTip(data.lastPeriodDate, data.avgCycleLength || 28))
          }
        } catch { /* ignore */ }
      }
    }
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('hormonaUserId')
    localStorage.removeItem('hormonaUserName')
    localStorage.removeItem('hormonaDemoMode')
    localStorage.removeItem('hormonaOnboardingComplete')
    navigate('/')
  }

  const SidebarContent = ({ onLinkClick }) => (
    <>
      {/* Logo */}
      <div
        className="px-6 pt-8 pb-6 border-b cursor-pointer"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
        onClick={() => { navigate('/'); if (onLinkClick) onLinkClick() }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Heart size={26} style={{ color: '#7EC8A4' }} fill="#7EC8A4" />
          <h1 className="text-white font-bold text-2xl tracking-tight">HORMONA</h1>
        </div>
        <p className="text-xs" style={{ color: '#7EC8A4' }}>Understand. Balance. Thrive.</p>
      </div>

      {/* User card */}
      <div className="mx-5 mt-5 p-4 rounded-xl" style={{ backgroundColor: 'rgba(126, 200, 164, 0.15)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
            style={{ backgroundColor: '#7EC8A4' }}
          >
            {userName ? userName[0]?.toUpperCase() : 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-white/70 text-xs font-medium">
              {localStorage.getItem('hormonaDemoMode') === 'true' ? 'Demo Mode' : 'Good morning,'}
            </p>
            <p className="text-white font-bold text-sm truncate">{userName}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-5 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onLinkClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                ? 'text-white shadow-md'
                : 'text-white/65 hover:text-white hover:bg-white/10'
              }`
            }
            style={({ isActive }) => ({
              backgroundColor: isActive ? '#7EC8A4' : 'transparent',
            })}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Daily tip */}
      <div className="mx-5 mb-4 p-3 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-start gap-2">
          <Leaf size={13} style={{ color: '#7EC8A4' }} className="mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-xs font-semibold block mb-1" style={{ color: '#7EC8A4' }}>{tip.phase}</span>
            <p className="text-white/60 text-xs leading-relaxed">{tip.tip}</p>
          </div>
        </div>
      </div>

      {/* Sign out */}
      <div className="px-4 pb-6">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full text-white/50 hover:text-white hover:bg-white/10"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#FAF8F5' }}>

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex fixed h-full w-64 flex-col"
        style={{ backgroundColor: '#1E1B5E' }}
      >
        <SidebarContent onLinkClick={undefined} />
      </aside>

      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-lg md:hidden shadow-md"
        style={{ backgroundColor: '#1E1B5E' }}
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen
          ? <X size={22} style={{ color: 'white' }} />
          : <Menu size={22} style={{ color: 'white' }} />
        }
      </button>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-40 flex flex-col transform transition-transform duration-300 md:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ backgroundColor: '#1E1B5E' }}
      >
        <SidebarContent onLinkClick={() => setMobileMenuOpen(false)} />
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
