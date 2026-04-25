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
      setTip(getDailyTip('2025-04-01', 28))
      return
    }

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
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="px-6 pt-7 pb-5 border-b border-[#F0EEF8] cursor-pointer"
        onClick={() => { navigate('/'); if (onLinkClick) onLinkClick() }}
      >
        <div className="flex items-center gap-2 mb-0.5">
          <Heart size={22} style={{ color: '#7EC8A4' }} fill="#7EC8A4" />
          <h1 className="text-[#1A1A2E] font-bold text-xl tracking-tight">HORMONA</h1>
        </div>
        <p className="text-[10px] font-medium tracking-wider text-[#9B9BB4] uppercase">Understand. Balance. Thrive.</p>
      </div>

      {/* User card */}
      <div className="mx-4 mt-5 p-3 rounded-xl bg-[#F7FBF9] border border-[#E0F2EA]">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #7EC8A4, #5ab08a)' }}
          >
            {userName ? userName[0]?.toUpperCase() : 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-[#9B9BB4] text-[10px] font-medium uppercase tracking-wide">
              {localStorage.getItem('hormonaDemoMode') === 'true' ? 'Demo Mode' : 'Good morning'}
            </p>
            <p className="text-[#1A1A2E] font-semibold text-sm truncate">{userName}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        <p className="text-[10px] font-semibold tracking-widest text-[#C4C4D4] uppercase px-3 mb-3">Menu</p>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onLinkClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-[#1A1A2E] bg-[#E8F5EF] shadow-sm'
                  : 'text-[#8888A4] hover:text-[#1A1A2E] hover:bg-[#F5F5FA]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all ${isActive ? 'bg-[#7EC8A4]' : 'bg-transparent'}`}>
                  <Icon size={15} className={isActive ? 'text-white' : 'text-current'} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Daily tip */}
      <div className="mx-4 mb-4 p-3 rounded-xl bg-gradient-to-br from-[#F0FBF5] to-[#E8F5EF] border border-[#C8E9D8]">
        <div className="flex items-start gap-2">
          <Leaf size={13} className="text-[#7EC8A4] mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-[10px] font-bold block mb-1 text-[#5ab08a] uppercase tracking-wide">{tip.phase}</span>
            <p className="text-[#4a7a60] text-xs leading-relaxed">{tip.tip}</p>
          </div>
        </div>
      </div>

      {/* Sign out */}
      <div className="px-3 pb-6">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full text-[#B0B0C8] hover:text-[#1A1A2E] hover:bg-[#F5F5FA]"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-lg">
            <LogOut size={15} />
          </span>
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-[#F6F4F9]">

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed h-full w-60 flex-col bg-white border-r border-[#EEECF5] shadow-sm">
        <SidebarContent onLinkClick={undefined} />
      </aside>

      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-lg md:hidden shadow-md bg-white border border-[#EEECF5]"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen
          ? <X size={20} className="text-[#1A1A2E]" />
          : <Menu size={20} className="text-[#1A1A2E]" />
        }
      </button>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 z-40 flex flex-col bg-white border-r border-[#EEECF5] transform transition-transform duration-300 md:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <SidebarContent onLinkClick={() => setMobileMenuOpen(false)} />
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-60">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
