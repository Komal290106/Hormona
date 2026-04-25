import { useState, useEffect } from 'react'
import { Activity, TrendingUp, TrendingDown, Heart, Moon, Flame, Droplet, Brain, Zap, Calendar, Award, CircleAlert as AlertCircle, Sparkles, Target, ChartLine as LineChart, Clock } from 'lucide-react'
import api from '../lib/api'

export default function InsightsPage() {
  const userId = localStorage.getItem('hormonaUserId')
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) return

    api.get(`/logs/${userId}/insights`)
      .then(res => setInsights(res.data))
      .catch(err => setError(err.response?.data?.error || 'Failed to load insights'))
      .finally(() => setLoading(false))
  }, [userId])

  const renderIcon = (iconName, size = 14, color = '#7EC8A4') => {
    if (iconName === 'moon') return <Moon size={size} style={{ color }} />
    if (iconName === 'stress') return <Flame size={size} style={{ color }} />
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div>
          <AlertCircle size={32} className="text-[#E8A598] mx-auto mb-3" />
          <p className="text-sm text-[#6B6B8A]">{error}</p>
        </div>
      </div>
    )
  }

  // No logs yet
  if (!insights?.hasData) {
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
          { label: 'Hormonal Health Score', value: `${d.healthScore.score}`, suffix: '/100', badge: d.healthScore.label, icon: Activity, dir: 'up' },
          { label: 'Cycle Regularity', value: `${d.cycleRegularity.score}`, suffix: '%', badge: d.cycleRegularity.label, icon: Calendar, dir: 'up' },
          { label: 'PCOD Risk Level', value: `${d.pcodRisk.score}`, suffix: '%', badge: d.pcodRisk.label, icon: Target, dir: 'down', valueColor: d.pcodRisk.label === 'Low' ? '#7EC8A4' : '#E8A598' },
          { label: 'Logged Days', value: `${d.loggedDays}`, suffix: '', badge: `${d.currentStreak} day streak`, icon: Clock, dir: 'up' },
        ].map(({ label, value, suffix, badge, icon: Icon, dir, valueColor }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#EEECF5] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B6B8A]">{label}</span>
              <Icon size={16} className="text-[#7EC8A4]" />
            </div>
            <div className="text-2xl font-bold" style={{ color: valueColor || '#1E1B5E' }}>
              {value}<span className="text-sm text-[#6B6B8A] font-normal">{suffix}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8F5EF] text-[#7EC8A4]">{badge}</span>
              {dir === 'up'
                ? <TrendingUp size={12} className="text-[#7EC8A4]" />
                : <TrendingDown size={12} className="text-[#7EC8A4]" />}
            </div>
          </div>
        ))}
      </div>

      {/* Trend chart */}
      {d.trendData?.length > 0 && (
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
                  <div className="w-full flex justify-center gap-1">
                    <div className="w-2 rounded-t opacity-70 group-hover:opacity-100" style={{ height: `${(item.sleep / 10) * 120}px`, backgroundColor: '#7EC8A4' }} />
                    <div className="w-2 rounded-t opacity-70 group-hover:opacity-100" style={{ height: `${(item.stress / 10) * 120}px`, backgroundColor: '#EA9A98' }} />
                    <div className="w-2 rounded-t opacity-70 group-hover:opacity-100" style={{ height: `${(item.energy / 10) * 120}px`, backgroundColor: '#F0C060' }} />
                  </div>
                  <span className="text-[10px] text-[#6B6B8A]">{item.week?.split(' ')[1] || item.week}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 bg-[#E8F5EF] rounded-xl flex items-center gap-2">
            <Brain size={14} className="text-[#7EC8A4]" />
            <p className="text-xs text-[#6B6B8A]">The more you log, the more accurate your insights become.</p>
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
                ? 'Your body shows signs of good balance! Keep focusing on sleep, hydration and stress management.'
                : 'Keep logging consistently — your score improves as you build healthier habits.'}
            </p>
          </div>
        </div>
      </div>

      {/* Cycle highlights + Patterns */}
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
            { title: 'Improve Sleep Quality', desc: '7–8 hours of sleep helps regulate hormones.', icon: 'moon', show: d.avgSleep < 7 },
            { title: 'Manage Stress', desc: 'High stress impacts your cycle regularity.', icon: 'stress', show: d.avgStress > 5 },
            { title: 'Stay Hydrated', desc: 'Aim for 8 glasses/day to reduce cramps.', icon: 'droplet', show: d.avgHydration < 6 },
          ].filter(r => r.show).map((rec, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-[#EEECF5] hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-2">
                {renderIcon(rec.icon, 18, '#7EC8A4')}
                <h3 className="font-semibold text-sm text-[#1E1B5E]">{rec.title}</h3>
              </div>
              <p className="text-xs text-[#6B6B8A]">{rec.desc}</p>
            </div>
          ))}
          {d.avgSleep >= 7 && d.avgStress <= 5 && d.avgHydration >= 6 && (
            <div className="p-4 rounded-xl border border-[#7EC8A4] bg-[#E8F5EF] col-span-full text-center">
              <p className="text-sm font-semibold text-[#1E1B5E]">You're doing great across all key metrics! Keep it up.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
