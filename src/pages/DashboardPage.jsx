import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { 
  Activity, AlertCircle, ArrowRight, Brain, Calendar,
  CheckCircle2, ChevronRight, ClipboardList, Clock,
  Droplet, Heart, LineChart, Lock, Moon, Shield,
  Sparkles, TrendingUp, TrendingDown, Target, Award,
  Flame, Sun, Star, Eye, Bell, User, BarChart3, Zap
} from 'lucide-react'

export default function DashboardPage() {
  const navigate = useNavigate()
  const userId   = localStorage.getItem('hormonaUserId')
  const userName = localStorage.getItem('hormonaUserName') || 'there'
  const isDemo   = localStorage.getItem('hormonaIsDemo') === 'true'

  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [noData, setNoData]   = useState(false)

  // ── Demo data — ONLY used when isDemo flag is set ──────────────────────
  const DEMO_DATA = {
    userName: 'Anaya',
    score: 72, trendDirection: '+8%',
    risk: { score: 22, level: 'Low', percentage: 22 },
    cycle: { phase: 'Follicular Phase', day: 6, daysUntil: 9, nextPeriodDate: 'May 2' },
    trend: [
      { date: 'Apr 8',  sleep: 6.2, stress: 7,   cycle: 32 },
      { date: 'Apr 12', sleep: 6.5, stress: 6.5, cycle: 32 },
      { date: 'Apr 16', sleep: 6.8, stress: 6,   cycle: 31 },
      { date: 'Apr 20', sleep: 7.0, stress: 5.5, cycle: 31 },
      { date: 'Apr 24', sleep: 7.2, stress: 5,   cycle: 30 },
      { date: 'Apr 28', sleep: 7.5, stress: 4.5, cycle: 30 },
      { date: 'May 2',  sleep: 7.8, stress: 4,   cycle: 29 },
    ],
    insights: [
      { type: 'sleep',     title: 'Good sleep routine!',  description: "You've been sleeping well this week. Consistency is key for hormonal balance.", tint: 'green' },
      { type: 'stress',    title: 'Stress Alert',         description: 'Your stress levels were high on 2 days. Try some breathing exercises.',        tint: 'peach' },
      { type: 'hydration', title: 'Hydration Tip',        description: 'Aim for 8 glasses of water daily. You averaged 5.2 glasses this week.',       tint: 'lavender' },
    ],
    recentLogs: [
      { date: 'Yesterday', sleep: 7.8, stress: 4, water: 7, mood: 'Great' },
      { date: 'Apr 30',    sleep: 7.5, stress: 5, water: 6, mood: 'Good'  },
      { date: 'Apr 29',    sleep: 7.2, stress: 5, water: 8, mood: 'Great' },
    ],
  }

  useEffect(() => {
    if (isDemo) {
      setData(DEMO_DATA)
      setLoading(false)
      return
    }

    axios.get(`/api/logs/${userId}/dashboard`)
      .then(res => {
        // Backend returns empty-ish data if user has no logs yet
        const d = res.data
        const hasLogs = d.trend && d.trend.length > 0
        if (!hasLogs) {
          setNoData(true)
        } else {
          setData(d)
        }
        setLoading(false)
      })
      .catch(() => {
        setNoData(true)
        setLoading(false)
      })
  }, [userId])

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#7EC8A4] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#6B6B8A]">Loading your health data...</p>
        </div>
      </div>
    )
  }

  // ── Empty state — new user, no logs yet ─────────────────────────────────
  if (noData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#1E1B5E]">Good morning, {userName}!</h1>
          <p className="text-sm text-[#6B6B8A] mt-1">Here's your hormonal health overview</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#EEECF5] p-10 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-[#E8F5EF] flex items-center justify-center mx-auto mb-4">
            <ClipboardList size={28} className="text-[#7EC8A4]" />
          </div>
          <h2 className="text-lg font-bold text-[#1E1B5E] mb-2">No data yet — let's get started!</h2>
          <p className="text-sm text-[#6B6B8A] mb-6 max-w-sm mx-auto">
            Your dashboard fills up as you log daily data. Start by logging today's sleep, stress, and cycle status.
          </p>
          <button
            onClick={() => navigate('/log')}
            className="bg-[#7EC8A4] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#6ab890] transition-colors flex items-center gap-2 mx-auto"
          >
            <ClipboardList size={18} /> Log Today's Data
          </button>
        </div>

        {/* Show cycle info from profile even without logs */}
        <div className="bg-[#EDE9F8] rounded-2xl p-5 text-center">
          <Sparkles size={20} className="text-[#7EC8A4] mx-auto mb-2" />
          <p className="text-sm font-medium text-[#1E1B5E]">Log for 3 days to unlock your Hormonal Health Score and PCOD risk analysis.</p>
        </div>
      </div>
    )
  }

  // ── Full dashboard ───────────────────────────────────────────────────────
  const d = data
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-[#1E1B5E]">Good morning, {d.userName || userName}!</h1>
          <p className="text-sm text-[#6B6B8A] mt-1">Here's your hormonal health overview</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-white transition-colors">
            <Bell size={20} className="text-[#6B6B8A]" />
          </button>
          <div className="w-9 h-9 rounded-full bg-[#7EC8A4] flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
        </div>
      </div>

      {/* Privacy Banner */}
      <div className="bg-white rounded-2xl border border-[#EEECF5] p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#E8F5EF] flex items-center justify-center">
            <Lock size={16} className="text-[#7EC8A4]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#1E1B5E]">Your data is private & secure</p>
            <p className="text-xs text-[#6B6B8A]">We prioritize your privacy. Your health data is encrypted and never shared.</p>
          </div>
        </div>
        <Shield size={24} className="text-[#7EC8A4]" />
      </div>

      {/* Three Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Health Score */}
        <div className="bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium text-[#7EC8A4] bg-[#E8F5EF] px-2 py-1 rounded-full">LIVE</span>
            <Activity size={18} className="text-[#7EC8A4]" />
          </div>
          <div className="relative w-28 h-28 mx-auto mb-3">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle cx="56" cy="56" r="48" stroke="#EEECF5" strokeWidth="10" fill="none" />
              <circle cx="56" cy="56" r="48" stroke="#7EC8A4" strokeWidth="10" fill="none"
                strokeDasharray={`${2 * Math.PI * 48}`}
                strokeDashoffset={`${2 * Math.PI * 48 * (1 - d.score / 100)}`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-[#1E1B5E]">{d.score}</span>
              <span className="text-xs text-[#6B6B8A]">/100</span>
            </div>
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-[#1E1B5E]">Hormonal Health Score</h3>
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 bg-[#E8F5EF] text-[#7EC8A4]">
              {d.score >= 75 ? 'Great' : d.score >= 55 ? 'Good' : 'Needs attention'}
            </span>
            {d.trendDirection && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <TrendingUp size={12} className="text-[#7EC8A4]" />
                <span className="text-xs text-[#6B6B8A]">{d.trendDirection} from last week</span>
              </div>
            )}
          </div>
        </div>

        {/* Cycle Status */}
        <div className="bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-[#1E1B5E]">Cycle Status</h3>
            <Calendar size={18} className="text-[#7EC8A4]" />
          </div>
          {d.cycle ? (
            <>
              <div className="mb-3">
                <span className="text-xs font-medium text-[#1E1B5E] bg-[#EDE9F8] px-2 py-1 rounded-full">Current Phase</span>
                <div className="text-lg font-semibold text-[#1E1B5E] mt-2">{d.cycle.phase}</div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-sm text-[#6B6B8A]">Day of cycle</span><span className="text-sm font-medium text-[#1E1B5E]">Day {d.cycle.day}</span></div>
                <div className="flex justify-between"><span className="text-sm text-[#6B6B8A]">Next period in</span><span className="text-sm font-medium text-[#1E1B5E]">{d.cycle.daysUntil} days</span></div>
                <div className="flex justify-between"><span className="text-sm text-[#6B6B8A]">Next date</span><span className="text-sm font-medium text-[#7EC8A4]">{d.cycle.nextPeriodDate}</span></div>
              </div>
            </>
          ) : (
            <p className="text-sm text-[#6B6B8A] mt-4">Set your last period date in Profile to see cycle predictions.</p>
          )}
        </div>

        {/* PCOD Risk */}
        <div className="bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-[#1E1B5E]">PCOD Risk Level</h3>
            <Target size={18} className="text-[#7EC8A4]" />
          </div>
          {d.risk ? (
            <>
              <div className="text-3xl font-bold mb-1" style={{ color: d.risk.level === 'Low' ? '#7EC8A4' : d.risk.level === 'High' ? '#E8A598' : '#F5C16C' }}>
                {d.risk.score}%
              </div>
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-3"
                style={{ backgroundColor: d.risk.level === 'Low' ? '#E8F5EF' : d.risk.level === 'High' ? '#FDECEA' : '#FEF9EC',
                         color:           d.risk.level === 'Low' ? '#7EC8A4' : d.risk.level === 'High' ? '#E8A598' : '#F5C16C' }}>
                {d.risk.level} Risk
              </span>
              <div className="w-full bg-[#EEECF5] rounded-full h-1.5 mb-3">
                <div className="rounded-full h-1.5" style={{ width: `${d.risk.percentage}%`, backgroundColor: d.risk.level === 'Low' ? '#7EC8A4' : '#E8A598' }} />
              </div>
              <p className="text-xs text-[#6B6B8A]">
                {d.risk.level === 'Low' ? 'Great job! Your lifestyle factors are in a healthy range.' : 'Keep logging daily — your trends improve your score over time.'}
              </p>
            </>
          ) : (
            <p className="text-sm text-[#6B6B8A] mt-4">Log at least 3 days to calculate your PCOD risk.</p>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold text-[#1E1B5E] text-lg">Cycle & Lifestyle Trend</h3>
            <p className="text-xs text-[#6B6B8A]">Last 30 days</p>
          </div>
          <LineChart size={20} className="text-[#6B6B8A]" />
        </div>
        <div className="flex gap-4 mb-4 text-xs">
          <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#1E1B5E] rounded" /><span className="text-[#6B6B8A]">Cycle Length (days)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#7EC8A4] rounded" /><span className="text-[#6B6B8A]">Sleep (hrs)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#EA9A98] rounded" /><span className="text-[#6B6B8A]">Stress (1-10)</span></div>
        </div>
        <div className="relative h-56 mb-4">
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-[#6B6B8A] py-2">
            <span>40</span><span>30</span><span>20</span><span>10</span><span>0</span>
          </div>
          <div className="ml-8 h-full flex items-end gap-3">
            {d.trend.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full flex justify-center gap-1">
                  <div className="w-1.5 rounded-t opacity-70 group-hover:opacity-100 transition-all" style={{ height: `${(item.cycle / 40) * 140}px`, backgroundColor: '#1E1B5E' }} />
                  <div className="w-1.5 rounded-t opacity-70 group-hover:opacity-100 transition-all" style={{ height: `${(item.sleep / 10) * 140}px`, backgroundColor: '#7EC8A4' }} />
                  <div className="w-1.5 rounded-t opacity-70 group-hover:opacity-100 transition-all" style={{ height: `${(item.stress / 10) * 140}px`, backgroundColor: '#EA9A98' }} />
                </div>
                <span className="text-[10px] text-[#6B6B8A] rotate-45 origin-left">{item.date?.split(' ')[1]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 p-3 bg-[#E8F5EF] rounded-xl flex items-center gap-2">
          <Zap size={14} className="text-[#7EC8A4]" />
          <p className="text-xs text-[#6B6B8A]">Consistent sleep and low stress improve hormonal balance.</p>
        </div>
      </div>

      {/* Insights + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Smart Insights */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold text-[#1E1B5E] text-lg">Smart Insights</h3>
              <p className="text-xs text-[#6B6B8A]">Based on your logged data</p>
            </div>
            <Sparkles size={18} className="text-[#7EC8A4]" />
          </div>
          <div className="space-y-3">
            {(d.insights || []).map((insight, idx) => (
              <div key={idx} className={`p-3 rounded-xl ${insight.tint === 'green' ? 'bg-[#E8F5EF]' : insight.tint === 'peach' ? 'bg-[#FDECEA]' : 'bg-[#EDE9F8]'}`}>
                <div className="flex items-start gap-2">
                  {insight.type === 'sleep' && <Moon size={14} className="text-[#7EC8A4] mt-0.5" />}
                  {insight.type === 'stress' && <AlertCircle size={14} className="text-[#EA9A98] mt-0.5" />}
                  {insight.type === 'hydration' && <Droplet size={14} className="text-[#7EC8A4] mt-0.5" />}
                  <div>
                    <h4 className="font-medium text-sm text-[#1E1B5E]">{insight.title}</h4>
                    <p className="text-xs text-[#6B6B8A] mt-0.5">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
            {(!d.insights || d.insights.length === 0) && (
              <p className="text-sm text-[#6B6B8A] text-center py-4">Keep logging — insights appear after a few days of data.</p>
            )}
          </div>
          <button onClick={() => navigate('/insights')} className="w-full mt-4 text-center text-sm font-medium py-2 rounded-xl bg-[#FAF8F5] text-[#1E1B5E] hover:bg-[#EEECF5] transition-all">
            View All Insights
          </button>
        </div>

        {/* Recent Activity */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-[#1E1B5E] text-lg">Recent Activity</h3>
              <Clock size={16} className="text-[#6B6B8A]" />
            </div>
            {(d.recentLogs && d.recentLogs.length > 0) ? (
              <div className="space-y-3">
                {d.recentLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-[#EEECF5] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#1E1B5E]">{log.date}</p>
                      <div className="flex gap-3 text-xs text-[#6B6B8A] mt-1">
                        <span className="flex items-center gap-1"><Moon size={10} /> {typeof log.sleep === 'number' ? log.sleep.toFixed(1) : log.sleep} hrs</span>
                        <span className="flex items-center gap-1"><Flame size={10} /> Stress {log.stress}/10</span>
                        <span className="flex items-center gap-1"><Droplet size={10} /> {log.water} glasses</span>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-[#7EC8A4] capitalize">{log.mood}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#6B6B8A] text-center py-4">No logs yet. Start logging today!</p>
            )}
          </div>

          <div className="bg-gradient-to-r from-[#EDE9F8] to-[#E8F5EF] rounded-2xl p-4 border border-[#EEECF5]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <Award size={20} className="text-[#7EC8A4]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#1E1B5E]">Keep it up!</p>
                <p className="text-xs text-[#6B6B8A]">Daily logging unlocks deeper insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button onClick={() => navigate('/log')}
        className="fixed bottom-6 right-6 flex items-center gap-2 bg-[#7EC8A4] text-white font-medium px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:bg-[#6ab890] z-50">
        <ClipboardList size={18} />
        <span>Log Today's Data</span>
      </button>
    </div>
  )
}
