import { useState, useEffect } from 'react'
import { Apple, Activity, TrendingUp, TrendingDown, Heart, Moon, Flame, Droplet,
  Brain, Zap, Calendar, Award, CheckCircle2, AlertCircle, ChevronRight,
  Sparkles, Shield, Target, BarChart3, LineChart, Clock } from 'lucide-react'
import axios from 'axios'

export default function InsightsPage() {
  const userId = localStorage.getItem('hormonaUserId')
  const isDemo = localStorage.getItem('hormonaIsDemo') === 'true'
  const [insights, setInsights] = useState(null)
  const [user, setUser]         = useState(null)
  const [loading, setLoading]   = useState(true)

  // ── Demo data — only when isDemo ─────────────────────────────────────────
  const DEMO = {
    healthScore: { score: 72, label: 'Good', trend: '+8%', trendDirection: 'up' },
    cycleRegularity: { score: 85, label: 'Regular', trend: '+15%', trendDirection: 'up' },
    pcodRisk: { score: 22, label: 'Low', trend: '-12%', trendDirection: 'down' },
    loggedDays: 42,
    trendData: [
      { week: 'Apr 8',  sleep: 6.2, stress: 7.5, energy: 5 },
      { week: 'Apr 15', sleep: 6.8, stress: 6.5, energy: 6 },
      { week: 'Apr 22', sleep: 7.2, stress: 5.5, energy: 7 },
      { week: 'Apr 29', sleep: 7.5, stress: 4.8, energy: 7.5 },
      { week: 'May 6',  sleep: 7.8, stress: 4.2, energy: 8 },
    ],
    cycleHighlights: { longest: 34, shortest: 26, average: 30 },
    positivePatterns: [
      { title: 'Better Sleep, Better You', description: 'You slept > 7 hrs on 16 days. Your energy levels were higher on these days.', icon: 'moon' },
      { title: 'Low Stress Days are Powerful', description: 'On low stress days, your cycle stability improves by 23%.', icon: 'stress' },
      { title: 'Hydration Matters', description: 'Days with 6+ glasses of water showed reduced bloating and cramps.', icon: 'droplet' },
    ],
  }

  useEffect(() => {
    if (isDemo) {
      setInsights(DEMO)
      setLoading(false)
      return
    }

    // Fetch real logs + user profile and derive insights
    Promise.all([
      axios.get(`/api/logs/${userId}/dashboard`).catch(() => null),
      axios.get(`/api/users/${userId}`).catch(() => null),
      axios.get(`/api/logs/${userId}`).catch(() => null),
    ]).then(([dashRes, userRes, logsRes]) => {
      const dash = dashRes?.data
      const u    = userRes?.data
      const logs = logsRes?.data || []

      if (!dash && logs.length === 0) {
        setInsights(null)
        setLoading(false)
        return
      }

      // Derive real metrics from logs
      const avgSleep  = logs.length ? (logs.reduce((s, l) => s + (l.sleepHours || 0), 0) / logs.length) : 0
      const avgStress = logs.length ? (logs.reduce((s, l) => s + (l.stressLevel || 0), 0) / logs.length) : 0
      const avgHydration = logs.length ? (logs.reduce((s, l) => s + (l.hydration || 0), 0) / logs.length) : 0

      // Group into weekly buckets for the chart
      const weekly = {}
      logs.forEach(log => {
        const d = new Date(log.date)
        const week = `${d.toLocaleString('default', { month: 'short' })} ${Math.ceil(d.getDate() / 7) * 7 - 6}`
        if (!weekly[week]) weekly[week] = { sleep: [], stress: [], energy: [] }
        weekly[week].sleep.push(log.sleepHours || 0)
        weekly[week].stress.push(log.stressLevel || 0)
        weekly[week].energy.push(log.mood === 'great' ? 9 : log.mood === 'good' ? 7 : log.mood === 'okay' ? 5 : 3)
      })
      const trendData = Object.entries(weekly).slice(-5).map(([week, vals]) => ({
        week,
        sleep:  parseFloat((vals.sleep.reduce((a, b) => a + b, 0) / vals.sleep.length).toFixed(1)),
        stress: parseFloat((vals.stress.reduce((a, b) => a + b, 0) / vals.stress.length).toFixed(1)),
        energy: parseFloat((vals.energy.reduce((a, b) => a + b, 0) / vals.energy.length).toFixed(1)),
      }))

      // Positive patterns from real data
      const patterns = []
      if (avgSleep >= 7) patterns.push({ title: 'Good Sleep Habits', description: `You're averaging ${avgSleep.toFixed(1)} hrs/night — great for hormonal balance.`, icon: 'moon' })
      if (avgStress <= 5) patterns.push({ title: 'Stress Under Control', description: `Average stress of ${avgStress.toFixed(1)}/10 — low stress supports cycle regularity.`, icon: 'stress' })
      if (avgHydration >= 6) patterns.push({ title: 'Staying Hydrated', description: `You're averaging ${avgHydration.toFixed(1)} glasses/day — keep it up!`, icon: 'droplet' })
      if (patterns.length === 0) patterns.push({ title: 'Keep Going!', description: 'Log more days to reveal your positive health patterns.', icon: 'moon' })

      setInsights({
        healthScore:      { score: dash?.score || 0, label: dash?.score >= 75 ? 'Great' : dash?.score >= 55 ? 'Good' : 'Building', trend: dash?.trendDirection || '', trendDirection: 'up' },
        cycleRegularity:  { score: u?.cycleVariation === 'regular' ? 90 : u?.cycleVariation === 'slightly' ? 70 : 45, label: u?.cycleVariation === 'regular' ? 'Regular' : 'Variable', trend: '', trendDirection: 'up' },
        pcodRisk:         { score: dash?.risk || 0, label: (dash?.risk || 0) < 30 ? 'Low' : (dash?.risk || 0) < 60 ? 'Moderate' : 'High', trend: '', trendDirection: 'down' },
        loggedDays:       logs.length,
        trendData,
        cycleHighlights:  { average: u?.avgCycleLength || 28, longest: (u?.avgCycleLength || 28) + 4, shortest: (u?.avgCycleLength || 28) - 3 },
        positivePatterns: patterns,
        avgSleep, avgStress, avgHydration,
      })
      setUser(u)
      setLoading(false)
    })
  }, [userId])

  const renderIcon = (iconName, size = 14, color = '#7EC8A4') => {
    if (iconName === 'moon')    return <Moon size={size} style={{ color }} />
    if (iconName === 'stress')  return <Flame size={size} style={{ color }} />
    if (iconName === 'droplet') return <Droplet size={size} style={{ color }} />
    return <Zap size={size} style={{ color }} />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-2 border-[#7EC8A4] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!insights) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1E1B5E]">Insights</h1>
          <p className="text-sm text-[#6B6B8A] mt-1">Your health data analyzed for meaningful patterns</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#EEECF5] p-12 shadow-sm text-center">
          <Activity size={32} className="text-[#7EC8A4] mx-auto mb-4" />
          <h2 className="text-lg font-bold text-[#1E1B5E] mb-2">No insights yet</h2>
          <p className="text-sm text-[#6B6B8A] max-w-sm mx-auto">
            Insights unlock after a few days of logging. Head to Log Data and record today's sleep, stress, and mood.
          </p>
        </div>
      </div>
    )
  }

  const d = insights
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1E1B5E]">Insights</h1>
        <p className="text-sm text-[#6B6B8A] mt-1">Your health data analyzed for meaningful patterns</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Hormonal Health Score', value: `${d.healthScore.score}`, suffix: '/100', label2: d.healthScore.label, trend: d.healthScore.trend, dir: d.healthScore.trendDirection, icon: Activity },
          { label: 'Cycle Regularity',      value: `${d.cycleRegularity.score}`, suffix: '%', label2: d.cycleRegularity.label, trend: d.cycleRegularity.trend, dir: 'up', icon: Calendar },
          { label: 'PCOD Risk Level',       value: `${d.pcodRisk.score}`, suffix: '%', label2: d.pcodRisk.label, trend: d.pcodRisk.trend, dir: 'down', icon: Target, valueColor: d.pcodRisk.label === 'Low' ? '#7EC8A4' : '#E8A598' },
          { label: 'Logged Days',           value: `${d.loggedDays}`, suffix: '', label2: null, trend: null, icon: Clock },
        ].map(({ label, value, suffix, label2, trend, dir, icon: Icon, valueColor }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#EEECF5] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B6B8A]">{label}</span>
              <Icon size={16} className="text-[#7EC8A4]" />
            </div>
            <div className="text-2xl font-bold" style={{ color: valueColor || '#1E1B5E' }}>
              {value}<span className="text-sm text-[#6B6B8A] font-normal">{suffix}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              {label2 && <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8F5EF] text-[#7EC8A4]">{label2}</span>}
              {trend && (
                <div className="flex items-center gap-1">
                  {dir === 'up' ? <TrendingUp size={12} className="text-[#7EC8A4]" /> : <TrendingDown size={12} className="text-[#7EC8A4]" />}
                  <span className="text-xs text-[#6B6B8A]">{trend}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      {d.trendData && d.trendData.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-semibold text-[#1E1B5E] text-lg">Key Lifestyle Trends</h2>
              <p className="text-xs text-[#6B6B8A]">Based on your logs</p>
            </div>
            <LineChart size={20} className="text-[#6B6B8A]" />
          </div>
          <div className="flex gap-4 mb-4 text-xs">
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#7EC8A4] rounded" /><span className="text-[#6B6B8A]">Sleep (hrs)</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#EA9A98] rounded" /><span className="text-[#6B6B8A]">Stress (1-10)</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#F0C060] rounded" /><span className="text-[#6B6B8A]">Energy (1-10)</span></div>
          </div>
          <div className="relative h-48 mb-4">
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-[#6B6B8A] py-2">
              <span>10</span><span>7.5</span><span>5</span><span>2.5</span><span>0</span>
            </div>
            <div className="ml-8 h-full flex items-end gap-4">
              {d.trendData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="w-full flex justify-center gap-1.5">
                    <div className="w-2 rounded-t opacity-70 group-hover:opacity-100 transition-all" style={{ height: `${(item.sleep / 10) * 120}px`, backgroundColor: '#7EC8A4' }} />
                    <div className="w-2 rounded-t opacity-70 group-hover:opacity-100 transition-all" style={{ height: `${(item.stress / 10) * 120}px`, backgroundColor: '#EA9A98' }} />
                    <div className="w-2 rounded-t opacity-70 group-hover:opacity-100 transition-all" style={{ height: `${(item.energy / 10) * 120}px`, backgroundColor: '#F0C060' }} />
                  </div>
                  <span className="text-[10px] text-[#6B6B8A]">{item.week?.split(' ')[1]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 bg-[#E8F5EF] rounded-xl flex items-center gap-2">
            <Brain size={14} className="text-[#7EC8A4]" />
            <p className="text-xs text-[#6B6B8A]">Knowledge is power. The more you log, the more accurate your insights become.</p>
          </div>
        </div>
      )}

      {/* Body message */}
      <div className="bg-gradient-to-r from-[#EDE9F8] to-[#E8F5EF] rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <Heart size={20} className="text-[#7EC8A4]" />
          </div>
          <div>
            <h2 className="font-semibold text-[#1E1B5E] text-lg">What Your Body is Telling You</h2>
            <p className="text-sm text-[#6B6B8A] mt-1 leading-relaxed">
              {d.healthScore.score >= 65
                ? 'Your body shows signs of good balance! Continue focusing on sleep, hydration and stress management.'
                : 'Keep logging consistently — your score improves as you build healthier habits and we learn your patterns.'}
            </p>
          </div>
        </div>
      </div>

      {/* Cycle highlights + Positive patterns */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-[#7EC8A4]" />
            <h2 className="font-semibold text-[#1E1B5E] text-lg">Cycle Highlights</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-[#6B6B8A]">Longest Cycle</p><p className="text-xl font-bold text-[#1E1B5E]">{d.cycleHighlights.longest} <span className="text-sm font-normal">days</span></p></div>
            <div><p className="text-xs text-[#6B6B8A]">Shortest Cycle</p><p className="text-xl font-bold text-[#1E1B5E]">{d.cycleHighlights.shortest} <span className="text-sm font-normal">days</span></p></div>
            <div><p className="text-xs text-[#6B6B8A]">Avg Cycle Length</p><p className="text-xl font-bold text-[#7EC8A4]">{d.cycleHighlights.average} <span className="text-sm font-normal">days</span></p></div>
            <div><p className="text-xs text-[#6B6B8A]">Normal Range</p><p className="text-sm font-medium text-[#1E1B5E]">21–35 days</p></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Award size={18} className="text-[#7EC8A4]" />
            <h2 className="font-semibold text-[#1E1B5E] text-lg">Top Positive Patterns</h2>
          </div>
          <div className="space-y-3">
            {d.positivePatterns.map((pattern, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#E8F5EF]">
                <div className="flex items-start gap-2">
                  {renderIcon(pattern.icon, 14, '#7EC8A4')}
                  <div>
                    <h3 className="font-medium text-sm text-[#1E1B5E]">{pattern.title}</h3>
                    <p className="text-xs text-[#6B6B8A] mt-0.5">{pattern.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-[#7EC8A4]" />
          <h2 className="font-semibold text-[#1E1B5E] text-lg">Personalized Recommendations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Improve Sleep Quality', description: '7-8 hours of sleep helps regulate hormones.', icon: 'moon', show: !d.avgSleep || d.avgSleep < 7 },
            { title: 'Manage Stress',         description: 'High stress can impact your cycle regularity.', icon: 'stress', show: !d.avgStress || d.avgStress > 5 },
            { title: 'Stay Hydrated',         description: 'Aim for 8 glasses a day. Hydration helps reduce cramps.', icon: 'droplet', show: !d.avgHydration || d.avgHydration < 6 },
          ].filter(r => r.show).map((rec, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-[#EEECF5] hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-2">
                {renderIcon(rec.icon, 18, '#7EC8A4')}
                <h3 className="font-semibold text-sm text-[#1E1B5E]">{rec.title}</h3>
              </div>
              <p className="text-xs text-[#6B6B8A]">{rec.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
