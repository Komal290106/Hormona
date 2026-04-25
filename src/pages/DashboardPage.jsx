import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import {
  Activity, CircleAlert as AlertCircle, Calendar,
  ClipboardList, Droplet, Heart, ChartLine as LineChart,
  Lock, Moon, Shield, Sparkles, Target, Zap
} from 'lucide-react'

// ── Static demo data shown when demoMode is active ──────────────────────────
const DEMO_DATA = {
  userName: 'Anaya',
  score: 72,
  risk: 22,
  riskLevel: 'Low',
  cyclePhase: 'Follicular Phase',
  cycleDay: 8,
  daysUntilNext: 20,
  nextPeriodDate: 'May 2',
  hasData: true,
  trend: [
    { date: 'Apr 8', cycle: 28, sleep: 7.5, stress: 4 },
    { date: 'Apr 12', cycle: 28, sleep: 7, stress: 5 },
    { date: 'Apr 16', cycle: 28, sleep: 8, stress: 3 },
    { date: 'Apr 20', cycle: 28, sleep: 6.5, stress: 6 },
    { date: 'Apr 24', cycle: 28, sleep: 7, stress: 4 },
  ],
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-[#EEECF5] rounded-xl" />
      <div className="grid grid-cols-3 gap-5">
        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-[#EEECF5] rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 h-72 bg-[#EEECF5] rounded-2xl" />
        <div className="h-72 bg-[#EEECF5] rounded-2xl" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const isDemoMode = localStorage.getItem('hormonaDemoMode') === 'true'
  const userId = localStorage.getItem('hormonaUserId')
  const userName = localStorage.getItem('hormonaUserName') || 'there'

  const [data, setData] = useState(isDemoMode ? DEMO_DATA : null)
  const [loading, setLoading] = useState(!isDemoMode)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isDemoMode) return // use static data, never fetch

    if (!userId) { navigate('/login'); return }

    api.get(`/logs/${userId}/dashboard`)
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.error || 'Could not load dashboard. Please check your connection.'))
      .finally(() => setLoading(false))
  }, [userId, isDemoMode, navigate])

  if (loading) return <LoadingSkeleton />

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-sm">
          <AlertCircle size={32} className="text-[#E8A598] mx-auto mb-3" />
          <p className="font-semibold text-[#1E1B5E] mb-2">Could not load dashboard</p>
          <p className="text-sm text-[#6B6B8A] mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm bg-[#7EC8A4] text-white px-4 py-2 rounded-xl hover:bg-[#6ab890]"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const d = data || {}
  const hasData = d.hasData && d.trend?.length > 0
  const displayName = d.userName || userName

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-[#1E1B5E]">
            Good morning, {displayName}!
          </h1>
          <p className="text-sm text-[#6B6B8A] mt-1">Here's your hormonal health overview</p>
        </div>
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full bg-[#7EC8A4] flex items-center justify-center hover:bg-[#6ab890] transition-colors"
        >
          <span className="text-white font-semibold text-sm">
            {(displayName?.[0] || 'U').toUpperCase()}
          </span>
        </button>
      </div>

      {/* Demo mode banner */}
      {isDemoMode && (
        <div className="bg-[#E8F5EF] border border-[#C8E9D8] rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[#1E1B5E]">
            <Sparkles size={15} className="text-[#7EC8A4]" />
            You're viewing demo data for Anaya. This is not your real data.
          </div>
          <button
            onClick={() => navigate('/signup')}
            className="text-xs bg-[#7EC8A4] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-[#6ab890] transition-all"
          >
            Create Account
          </button>
        </div>
      )}

      {/* Privacy Banner */}
      <div className="bg-white rounded-2xl border border-[#EEECF5] p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#E8F5EF] flex items-center justify-center">
            <Lock size={16} className="text-[#7EC8A4]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#1E1B5E]">Your data is private &amp; secure</p>
            <p className="text-xs text-[#6B6B8A]">We prioritise your privacy. Encrypted and never shared.</p>
          </div>
        </div>
        <Shield size={24} className="text-[#7EC8A4]" />
      </div>

      {/* Top 3 Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Health Score */}
        <div className="bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-medium text-[#7EC8A4] bg-[#E8F5EF] px-2 py-1 rounded-full">SCORE</span>
            <Activity size={18} className="text-[#7EC8A4]" />
          </div>
          <div className="relative w-28 h-28 mx-auto mb-3">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 112 112">
              <circle cx="56" cy="56" r="48" stroke="#EEECF5" strokeWidth="10" fill="none" />
              <circle
                cx="56" cy="56" r="48"
                stroke="#7EC8A4" strokeWidth="10" fill="none"
                strokeDasharray={`${2 * Math.PI * 48}`}
                strokeDashoffset={`${2 * Math.PI * 48 * (1 - (d.score || 0) / 100)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-[#1E1B5E]">{hasData ? d.score : '—'}</span>
              <span className="text-xs text-[#6B6B8A]">/100</span>
            </div>
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-[#1E1B5E]">Hormonal Health Score</h3>
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 bg-[#E8F5EF] text-[#7EC8A4]">
              {hasData
                ? (d.score >= 70 ? 'Good' : d.score >= 50 ? 'Moderate' : 'Needs Attention')
                : 'Log to unlock'}
            </span>
          </div>
        </div>

        {/* PCOD Risk */}
        <div className="bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-[#1E1B5E]">PCOD Risk Level</h3>
            <Target size={18} className="text-[#7EC8A4]" />
          </div>
          {hasData ? (
            <>
              <div className="text-3xl font-bold mb-1 text-[#1E1B5E]">{d.risk}%</div>
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-3 bg-[#E8F5EF] text-[#7EC8A4]">
                {d.riskLevel} Risk
              </span>
              <div className="w-full bg-[#EEECF5] rounded-full h-1.5 mb-3">
                <div className="rounded-full h-1.5 bg-[#7EC8A4]" style={{ width: `${d.risk}%` }} />
              </div>
              <p className="text-xs text-[#6B6B8A]">Keep up the healthy habits!</p>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-[#6B6B8A]">Log 3+ days to calculate risk</p>
              <button
                onClick={() => navigate('/log')}
                className="mt-3 text-xs bg-[#7EC8A4] text-white px-4 py-2 rounded-xl hover:bg-[#6ab890] transition-colors"
              >
                Log Today
              </button>
            </div>
          )}
        </div>

        {/* Cycle Status */}
        <div className="bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-[#1E1B5E]">Cycle Status</h3>
            <Calendar size={18} className="text-[#7EC8A4]" />
          </div>
          {hasData && d.cyclePhase ? (
            <>
              <div className="mb-3">
                <span className="text-xs font-medium text-[#1E1B5E] bg-[#E8F5EF] px-2 py-1 rounded-full">
                  {d.cyclePhase}
                </span>
              </div>
              <div className="space-y-2 mt-3">
                <div className="flex justify-between">
                  <span className="text-sm text-[#6B6B8A]">Day of cycle</span>
                  <span className="text-sm font-medium text-[#1E1B5E]">Day {d.cycleDay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#6B6B8A]">Next period in</span>
                  <span className="text-sm font-medium text-[#1E1B5E]">{d.daysUntilNext} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#6B6B8A]">Next date</span>
                  <span className="text-sm font-medium text-[#7EC8A4]">{d.nextPeriodDate}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-[#6B6B8A]">
                Complete onboarding to unlock cycle tracking
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chart + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-semibold text-[#1E1B5E] text-lg">Cycle &amp; Lifestyle Trend</h3>
              <p className="text-xs text-[#6B6B8A]">Last 30 days</p>
            </div>
            <LineChart size={20} className="text-[#6B6B8A]" />
          </div>

          <div className="flex gap-4 mb-4 text-xs">
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#1E1B5E] rounded" /><span className="text-[#6B6B8A]">Cycle (days)</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#7EC8A4] rounded" /><span className="text-[#6B6B8A]">Sleep (hrs)</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#EA9A98] rounded" /><span className="text-[#6B6B8A]">Stress (1-10)</span></div>
          </div>

          {hasData ? (
            <div className="relative h-56 mb-4">
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-[#6B6B8A] py-2">
                <span>40</span><span>30</span><span>20</span><span>10</span><span>0</span>
              </div>
              <div className="ml-8 h-full flex items-end gap-4">
                {d.trend.map((item, idx) => {
                  const cycleH = item.cycle > 0 ? (item.cycle / 40) * 140 : 2
                  const sleepH = item.sleep > 0 ? (item.sleep / 10) * 140 : 2
                  const stressH = item.stress > 0 ? (item.stress / 10) * 140 : 2
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="w-full flex justify-center gap-1">
                        <div className="w-2 rounded-t opacity-70 group-hover:opacity-100 transition-opacity" style={{ height: `${cycleH}px`, backgroundColor: '#1E1B5E' }} />
                        <div className="w-2 rounded-t opacity-70 group-hover:opacity-100 transition-opacity" style={{ height: `${sleepH}px`, backgroundColor: '#7EC8A4' }} />
                        <div className="w-2 rounded-t opacity-70 group-hover:opacity-100 transition-opacity" style={{ height: `${stressH}px`, backgroundColor: '#EA9A98' }} />
                      </div>
                      <span className="text-[10px] text-[#6B6B8A]">{item.date}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center gap-3">
              <p className="text-sm text-[#6B6B8A] text-center">
                Start logging to see your trend chart
              </p>
              <button
                onClick={() => navigate('/log')}
                className="text-xs bg-[#7EC8A4] text-white px-4 py-2 rounded-xl hover:bg-[#6ab890]"
              >
                Log Today's Data
              </button>
            </div>
          )}

          <div className="p-3 bg-[#E8F5EF] rounded-xl flex items-center gap-2">
            <Zap size={14} className="text-[#7EC8A4]" />
            <p className="text-xs text-[#6B6B8A]">Consistent sleep and low stress improve hormonal balance.</p>
          </div>
        </div>

        {/* Smart Insights */}
        <div className="bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-[#1E1B5E] text-lg">Smart Insights</h3>
            <Sparkles size={18} className="text-[#7EC8A4]" />
          </div>

          {hasData ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#E8F5EF]">
                <div className="flex items-start gap-2">
                  <Moon size={14} className="text-[#7EC8A4] mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm text-[#1E1B5E]">Sleep</h4>
                    <p className="text-xs text-[#6B6B8A] mt-0.5">
                      {(d.trend.at(-1)?.sleep ?? 0) >= 7
                        ? "You've been sleeping well this week."
                        : 'Try to get 7–8 hours tonight.'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#FDECEA]">
                <div className="flex items-start gap-2">
                  <AlertCircle size={14} className="text-[#EA9A98] mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm text-[#1E1B5E]">Stress</h4>
                    <p className="text-xs text-[#6B6B8A] mt-0.5">
                      {(d.trend.at(-1)?.stress ?? 0) >= 6
                        ? 'High stress detected — try breathing exercises.'
                        : 'Stress levels looking good!'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#EEF7F2]">
                <div className="flex items-start gap-2">
                  <Droplet size={14} className="text-[#7EC8A4] mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm text-[#1E1B5E]">Hydration Tip</h4>
                    <p className="text-xs text-[#6B6B8A] mt-0.5">Aim for 8 glasses of water daily.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/insights')}
                className="w-full mt-2 text-center text-sm font-medium py-2 rounded-xl bg-[#FAF8F5] text-[#1E1B5E] hover:bg-[#EEECF5] transition-all"
              >
                View All Insights
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-[#6B6B8A]">Log a few days to unlock personalised insights.</p>
              <button
                onClick={() => navigate('/log')}
                className="mt-3 text-xs text-white bg-[#7EC8A4] px-4 py-2 rounded-xl hover:bg-[#6ab890] transition-colors"
              >
                Log Today
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Motivation Banner */}
      <div className="bg-[#EEF7F2] rounded-2xl p-5 text-center border border-[#C8E9D8]">
        <Heart size={20} className="text-[#7EC8A4] mx-auto mb-2" />
        <p className="text-sm font-semibold text-[#1E1B5E]">Small steps today, stronger tomorrow.</p>
        <p className="text-xs text-[#6B6B8A] mt-1">Keep tracking, stay consistent, and listen to your body.</p>
      </div>

      {/* Log Data FAB */}
      {!isDemoMode && (
        <button
          onClick={() => navigate('/log')}
          className="fixed bottom-6 right-6 flex items-center gap-2 bg-[#7EC8A4] text-white font-medium px-5 py-3 rounded-full shadow-lg hover:bg-[#6ab890] transition-all z-50"
        >
          <ClipboardList size={18} />
          <span>Log Today's Data</span>
        </button>
      )}
    </div>
  )
}
