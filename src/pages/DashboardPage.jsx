import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import {
  Activity, CircleAlert as AlertCircle, Bell, Calendar,
  ClipboardList, Droplet, Heart, ChartLine as LineChart,
  Lock, Moon, Shield, Sparkles, Target, Zap, ArrowUpRight, ChevronRight
} from 'lucide-react'

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

// Pexels illustration of a woman/wellness
const HERO_IMAGE = 'https://images.pexels.com/photos/3757954/pexels-photo-3757954.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop'

export default function DashboardPage() {
  const navigate = useNavigate()
  const isDemoMode = localStorage.getItem('hormonaDemoMode') === 'true'
  const userId = localStorage.getItem('hormonaUserId')
  const userName = localStorage.getItem('hormonaUserName') || 'there'

  const [data, setData] = useState(isDemoMode ? DEMO_DATA : null)
  const [loading, setLoading] = useState(!isDemoMode)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isDemoMode) return
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
          <p className="font-semibold text-[#1A1A2E] mb-2">Could not load dashboard</p>
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

  const scoreStatus = !hasData ? 'Log to unlock' : d.score >= 70 ? 'Good' : d.score >= 50 ? 'Moderate' : 'Needs Attention'
  const scoreColor = !hasData ? '#9B9BB4' : d.score >= 70 ? '#7EC8A4' : d.score >= 50 ? '#F0B97A' : '#EA9A98'

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E] tracking-tight">
            Good morning, {displayName}!
          </h1>
          <p className="text-sm text-[#9B9BB4] mt-0.5">Here's your hormonal health overview</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="w-9 h-9 rounded-full bg-white border border-[#EEECF5] flex items-center justify-center hover:bg-[#F5F5FA] transition-colors shadow-sm">
            <Bell size={16} className="text-[#6B6B8A]" />
          </button>
          <div className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #7EC8A4, #5ab08a)' }}>
            <span className="text-white font-bold text-sm">{(displayName?.[0] || 'U').toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Demo banner */}
      {isDemoMode && (
        <div className="bg-gradient-to-r from-[#E8F5EF] to-[#F0FBF5] border border-[#C8E9D8] rounded-2xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[#1A1A2E]">
            <Sparkles size={15} className="text-[#7EC8A4]" />
            <span>You're viewing demo data for Anaya. <span className="text-[#9B9BB4]">This is not your real data.</span></span>
          </div>
          <button
            onClick={() => navigate('/signup')}
            className="text-xs bg-[#7EC8A4] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-[#6ab890] transition-all flex items-center gap-1"
          >
            Create Account <ArrowUpRight size={12} />
          </button>
        </div>
      )}

      {/* Hero banner: privacy + girl image */}
      <div className="relative bg-gradient-to-r from-[#1A1A2E] to-[#2C2C4A] rounded-2xl overflow-hidden shadow-lg">
        <div className="px-6 py-5 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-[#7EC8A4]/20 flex items-center justify-center">
                <Lock size={13} className="text-[#7EC8A4]" />
              </div>
              <span className="text-white font-semibold text-sm">Your data is private &amp; secure</span>
            </div>
            <p className="text-white/50 text-xs max-w-xs leading-relaxed">
              We prioritise your privacy. Your health data is encrypted and never shared.
            </p>
            <button className="mt-3 text-xs text-[#7EC8A4] font-semibold flex items-center gap-1 hover:gap-2 transition-all">
              Learn more <ChevronRight size={12} />
            </button>
          </div>
          <div className="relative flex-shrink-0 ml-4">
            <div className="w-24 h-28 rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl">
              <img
                src={HERO_IMAGE}
                alt="Wellness"
                className="w-full h-full object-cover object-top"
              />
            </div>
            {/* decorative dots */}
            <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#7EC8A4]/40" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-[#7EC8A4]/20" />
          </div>
        </div>
        {/* subtle leaf decoration */}
        <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[#7EC8A4]/5 -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      </div>

      {/* Score cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Health Score */}
        <div className="bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-semibold text-[#9B9BB4] uppercase tracking-wider">Health Score</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-bold text-[#1A1A2E]">{hasData ? d.score : '—'}</span>
                {hasData && <span className="text-sm text-[#9B9BB4]">/100</span>}
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#E8F5EF] flex items-center justify-center">
              <Activity size={16} className="text-[#7EC8A4]" />
            </div>
          </div>

          <div className="relative w-24 h-24 mx-auto my-3">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" stroke="#F0EEF8" strokeWidth="8" fill="none" />
              <circle
                cx="48" cy="48" r="40"
                stroke={scoreColor}
                strokeWidth="8" fill="none"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - (d.score || 0) / 100)}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold" style={{ color: scoreColor }}>{scoreStatus}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-[#9B9BB4]">Hormonal Health</span>
            {hasData && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${scoreColor}20`, color: scoreColor }}>
                +8% this week
              </span>
            )}
          </div>
        </div>

        {/* Cycle Status */}
        <div className="bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs font-semibold text-[#9B9BB4] uppercase tracking-wider">Cycle Status</p>
            <div className="w-8 h-8 rounded-lg bg-[#EEF4FF] flex items-center justify-center">
              <Calendar size={16} className="text-[#7B9FE0]" />
            </div>
          </div>

          {hasData && d.cyclePhase ? (
            <>
              <div className="mb-3">
                <span className="inline-block text-xs font-semibold text-[#5b7fd4] bg-[#EEF4FF] px-2.5 py-1 rounded-full">
                  {d.cyclePhase}
                </span>
              </div>
              <p className="text-2xl font-bold text-[#1A1A2E] mb-3">Day {d.cycleDay}</p>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#9B9BB4]">Next period in</span>
                  <span className="text-xs font-semibold text-[#1A1A2E]">{d.daysUntilNext} days</span>
                </div>
                <div className="w-full bg-[#F0EEF8] rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-[#7B9FE0] to-[#5b7fd4]"
                    style={{ width: `${((28 - d.daysUntilNext) / 28) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#9B9BB4]">Expected date</span>
                  <span className="text-xs font-semibold text-[#7B9FE0]">{d.nextPeriodDate}</span>
                </div>
              </div>
              <button
                onClick={() => navigate('/log')}
                className="mt-4 w-full text-xs font-semibold text-[#5b7fd4] bg-[#EEF4FF] py-2 rounded-xl hover:bg-[#dce8ff] transition-colors"
              >
                View Calendar
              </button>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-[#9B9BB4]">Complete onboarding to unlock cycle tracking</p>
            </div>
          )}
        </div>

        {/* PCOD Risk */}
        <div className="bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <p className="text-xs font-semibold text-[#9B9BB4] uppercase tracking-wider">PCOD Risk Level</p>
            <div className="w-8 h-8 rounded-lg bg-[#E8F5EF] flex items-center justify-center">
              <Shield size={16} className="text-[#7EC8A4]" />
            </div>
          </div>

          {hasData ? (
            <>
              <div className="mb-2">
                <span className="inline-block text-xs font-semibold text-[#7EC8A4] bg-[#E8F5EF] px-2.5 py-1 rounded-full">
                  {d.riskLevel}
                </span>
              </div>
              <p className="text-2xl font-bold text-[#1A1A2E] mb-1">Risk Score: {d.risk}/100</p>
              <p className="text-xs text-[#9B9BB4] mb-4">Your lifestyle factors are in a healthy range.</p>
              <div className="w-full bg-[#F0EEF8] rounded-full h-2 mb-4">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-[#7EC8A4] to-[#5ab08a]"
                  style={{ width: `${d.risk}%` }}
                />
              </div>
              <button
                onClick={() => navigate('/simulate')}
                className="w-full text-xs font-semibold text-[#7EC8A4] bg-[#E8F5EF] py-2 rounded-xl hover:bg-[#d4eddf] transition-colors flex items-center justify-center gap-1"
              >
                View Details <ChevronRight size={12} />
              </button>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-[#9B9BB4]">Log 3+ days to calculate risk</p>
              <button
                onClick={() => navigate('/log')}
                className="mt-3 text-xs bg-[#7EC8A4] text-white px-4 py-2 rounded-xl hover:bg-[#6ab890] transition-colors"
              >
                Log Today
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chart + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <div>
              <h3 className="font-bold text-[#1A1A2E]">Cycle &amp; Lifestyle Trend</h3>
              <p className="text-xs text-[#9B9BB4]">Last 30 days</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#9B9BB4]">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#1A1A2E]" /><span>Cycle (days)</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#7EC8A4]" /><span>Sleep (hrs)</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#EA9A98]" /><span>Stress (1-10)</span></div>
            </div>
          </div>

          {hasData ? (
            <div className="relative h-52 mt-4 mb-3">
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-[#C4C4D4] py-1">
                <span>40</span><span>30</span><span>20</span><span>10</span><span>0</span>
              </div>
              <div className="ml-7 h-full flex items-end gap-3">
                {d.trend.map((item, idx) => {
                  const cycleH = item.cycle > 0 ? (item.cycle / 40) * 140 : 2
                  const sleepH = item.sleep > 0 ? (item.sleep / 10) * 140 : 2
                  const stressH = item.stress > 0 ? (item.stress / 10) * 140 : 2
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group cursor-pointer">
                      <div className="w-full flex justify-center gap-1 items-end">
                        <div
                          className="w-2.5 rounded-t-md opacity-75 group-hover:opacity-100 transition-all group-hover:scale-y-105 origin-bottom"
                          style={{ height: `${cycleH}px`, backgroundColor: '#1A1A2E' }}
                        />
                        <div
                          className="w-2.5 rounded-t-md opacity-75 group-hover:opacity-100 transition-all group-hover:scale-y-105 origin-bottom"
                          style={{ height: `${sleepH}px`, backgroundColor: '#7EC8A4' }}
                        />
                        <div
                          className="w-2.5 rounded-t-md opacity-75 group-hover:opacity-100 transition-all group-hover:scale-y-105 origin-bottom"
                          style={{ height: `${stressH}px`, backgroundColor: '#EA9A98' }}
                        />
                      </div>
                      <span className="text-[9px] text-[#C4C4D4] mt-1">{item.date}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center gap-3">
              <LineChart size={32} className="text-[#EEECF5]" />
              <p className="text-sm text-[#9B9BB4] text-center">Start logging to see your trend chart</p>
              <button
                onClick={() => navigate('/log')}
                className="text-xs bg-[#7EC8A4] text-white px-4 py-2 rounded-xl hover:bg-[#6ab890]"
              >
                Log Today's Data
              </button>
            </div>
          )}

          <div className="p-3 bg-[#F7FBF9] rounded-xl flex items-center gap-2 border border-[#E0F2EA]">
            <Zap size={13} className="text-[#7EC8A4] flex-shrink-0" />
            <p className="text-xs text-[#6B8A7A]">Consistent sleep and low stress improve hormonal balance.</p>
          </div>
        </div>

        {/* Smart Insights */}
        <div className="bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-[#1A1A2E]">Smart Insights</h3>
              <p className="text-xs text-[#9B9BB4]">This week</p>
            </div>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
              <Sparkles size={14} className="text-amber-400" />
            </div>
          </div>

          {hasData ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#F7FBF9] border border-[#E0F2EA] hover:border-[#7EC8A4]/40 transition-colors cursor-default">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#7EC8A4]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Moon size={12} className="text-[#7EC8A4]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-[#1A1A2E]">Good sleep routine!</h4>
                    <p className="text-xs text-[#9B9BB4] mt-0.5 leading-relaxed">
                      {(d.trend.at(-1)?.sleep ?? 0) >= 7
                        ? "You've been sleeping well this week."
                        : 'Try to get 7–8 hours tonight.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FFF6F5] border border-[#FDDAD8] hover:border-[#EA9A98]/60 transition-colors cursor-default">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#EA9A98]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <AlertCircle size={12} className="text-[#EA9A98]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-[#1A1A2E]">Stress Alert</h4>
                    <p className="text-xs text-[#9B9BB4] mt-0.5 leading-relaxed">
                      {(d.trend.at(-1)?.stress ?? 0) >= 6
                        ? 'High stress detected — try breathing exercises.'
                        : 'Stress levels looking good!'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F0F9FF] border border-[#C8E4F8] hover:border-[#7BB8E8]/60 transition-colors cursor-default">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-[#7BB8E8]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Droplet size={12} className="text-[#7BB8E8]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs text-[#1A1A2E]">Hydration Tip</h4>
                    <p className="text-xs text-[#9B9BB4] mt-0.5 leading-relaxed">Aim for 8 glasses of water daily. You averaged 5.2 this week.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/insights')}
                className="w-full mt-1 text-center text-xs font-semibold py-2.5 rounded-xl bg-[#F5F5FA] text-[#1A1A2E] hover:bg-[#EEECF5] transition-all flex items-center justify-center gap-1"
              >
                View All Insights <ChevronRight size={12} />
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Sparkles size={28} className="text-[#EEECF5] mx-auto mb-3" />
              <p className="text-sm text-[#9B9BB4]">Log a few days to unlock personalised insights.</p>
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

      {/* Motivation + girl section */}
      <div className="relative bg-gradient-to-r from-[#F7FBF9] to-[#EFF9F4] rounded-2xl border border-[#C8E9D8] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Heart size={16} className="text-[#7EC8A4]" />
              <span className="text-xs font-semibold text-[#5ab08a] uppercase tracking-wide">Daily Motivation</span>
            </div>
            <p className="text-base font-bold text-[#1A1A2E] leading-snug">Small steps today, stronger tomorrow.</p>
            <p className="text-xs text-[#6B8A7A] mt-1 leading-relaxed max-w-sm">
              Keep tracking, stay consistent, and listen to your body. You're doing amazing.
            </p>
          </div>
          <div className="flex-shrink-0 ml-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-md">
              <img
                src="https://images.pexels.com/photos/6551136/pexels-photo-6551136.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop"
                alt="Wellness"
                className="w-full h-full object-cover object-top"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Log Data FAB */}
      {!isDemoMode && (
        <button
          onClick={() => navigate('/log')}
          className="fixed bottom-6 right-6 flex items-center gap-2 text-white font-semibold px-5 py-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all z-50"
          style={{ background: 'linear-gradient(135deg, #7EC8A4, #5ab08a)' }}
        >
          <ClipboardList size={17} />
          <span className="text-sm">Log Your Data</span>
        </button>
      )}
    </div>
  )
}
