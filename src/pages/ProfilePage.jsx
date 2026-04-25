import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import {
  User, Calendar, Activity, Flame, Moon, Droplet, Award,
  Target, CreditCard as Edit2, Save, X, Heart, Bell,
  Shield, ChevronRight, Sparkles, CircleAlert as AlertCircle, Info
} from 'lucide-react'

function getCyclePhase(lastPeriodDate, avgCycleLength = 28) {
  if (!lastPeriodDate) return { phase: 'Unknown', day: 0, color: '#7EC8A4' }
  const daysSince = Math.floor((Date.now() - new Date(lastPeriodDate)) / (1000 * 60 * 60 * 24))
  const cycleDay = (daysSince % avgCycleLength) + 1
  if (cycleDay <= 5) return { phase: 'Menstrual', day: cycleDay, color: '#E8A598' }
  if (cycleDay <= 13) return { phase: 'Follicular', day: cycleDay, color: '#7EC8A4' }
  if (cycleDay <= 16) return { phase: 'Ovulatory', day: cycleDay, color: '#F5C16C' }
  return { phase: 'Luteal', day: cycleDay, color: '#9B8EC4' }
}

function daysUntilNextPeriod(lastPeriodDate, avgCycleLength = 28) {
  if (!lastPeriodDate) return null
  const daysSince = Math.floor((Date.now() - new Date(lastPeriodDate)) / (1000 * 60 * 60 * 24))
  const remaining = avgCycleLength - (daysSince % avgCycleLength)
  const nextDate = new Date(Date.now() + remaining * 86400000)
  return {
    days: remaining,
    date: nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

// Static demo profile
const DEMO_PROFILE = {
  name: 'Anaya',
  ageRange: '18-24',
  age: 22,
  everDiagnosedPCOD: 'suspected',
  goal: 'manage_pcod',
  lastPeriodDate: '2025-04-01',
  avgCycleLength: 29,
  avgPeriodDuration: 5,
  cycleVariation: 'slightly',
  avgSleepHours: 7.5,
  avgStressLevel: 4,
  avgWaterIntake: 7,
  exerciseFrequency: '2-3',
  sugarIntake: 'medium',
  symptoms: ['acne', 'moodSwings'],
  onboardingComplete: true,
  stats: {
    daysLogged: 14,
    currentStreak: 7,
    consistencyPct: 85,
    totalInsights: 21,
  },
}

const SYMPTOM_LABELS = {
  irregularPeriods: 'Irregular periods',
  acne: 'Acne / oily skin',
  hairLoss: 'Hair thinning',
  weightGain: 'Weight gain',
  fatigue: 'Fatigue',
  moodSwings: 'Mood swings',
  bloating: 'Bloating',
  excessHairGrowth: 'Excess hair',
  cramping: 'Severe cramps',
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const isDemoMode = localStorage.getItem('hormonaDemoMode') === 'true'
  const userId = localStorage.getItem('hormonaUserId')

  const [profile, setProfile] = useState(isDemoMode ? DEMO_PROFILE : null)
  const [loading, setLoading] = useState(!isDemoMode)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (isDemoMode) return

    if (!userId) { setLoading(false); return }

    Promise.all([
      api.get(`/users/${userId}`).catch(() => null),
      api.get(`/logs/${userId}`).catch(() => null),
    ]).then(([userRes, logsRes]) => {
      const u = userRes?.data
      const logs = logsRes?.data || []

      if (!u) { setProfile(null); setLoading(false); return }

      const daysLogged = logs.length
      const logDates = new Set(logs.map(l => new Date(l.date).toDateString()))
      const today = new Date()
      let streak = 0
      for (let i = 0; i < 30; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        if (logDates.has(d.toDateString())) streak++
        else if (i > 0) break
      }
      const consistencyPct = Math.min(Math.round((daysLogged / 30) * 100), 100)

      setProfile({
        ...u,
        stats: {
          daysLogged,
          currentStreak: streak,
          consistencyPct,
          totalInsights: Math.floor(daysLogged * 1.5),
        }
      })
      setLoading(false)
    })
  }, [userId, isDemoMode])

  const startEdit = () => {
    setEditForm({
      age: profile.age || '',
      avgCycleLength: profile.avgCycleLength || 28,
      avgPeriodDuration: profile.avgPeriodDuration || 5,
      avgSleepHours: profile.avgSleepHours || 7,
      avgStressLevel: profile.avgStressLevel || 5,
      avgWaterIntake: profile.avgWaterIntake || 6,
      sugarIntake: profile.sugarIntake || 'medium',
      exerciseFrequency: profile.exerciseFrequency || '2-3',
    })
    setEditing(true)
  }

  const saveEdit = async () => {
    setSaving(true)
    setSaveError('')
    try {
      const res = await api.put(`/users/${userId}`, editForm)
      setProfile({ ...profile, ...res.data })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      setEditing(false)
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Unable to save changes. Please check your connection.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-2 border-[#7EC8A4] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64 text-center">
        <div>
          <AlertCircle size={32} className="text-[#E8A598] mx-auto mb-3" />
          <p className="text-lg font-semibold text-[#1E1B5E] mb-2">Profile not found</p>
          <p className="text-sm text-[#6B6B8A]">Make sure you're logged in and try again.</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 bg-[#7EC8A4] text-white px-4 py-2 rounded-xl text-sm hover:bg-[#6ab890]"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  const p = profile
  const cycleInfo = getCyclePhase(p.lastPeriodDate, p.avgCycleLength)
  const nextPeriod = daysUntilNextPeriod(p.lastPeriodDate, p.avgCycleLength)

  const STAT_CARDS = [
    { label: 'Days Logged', value: p.stats?.daysLogged ?? 0, icon: Calendar, color: '#7EC8A4', bg: '#E8F5EF' },
    { label: 'Day Streak', value: p.stats?.currentStreak ?? 0, icon: Flame, color: '#E8A598', bg: '#FDECEA' },
    { label: 'Consistency', value: `${p.stats?.consistencyPct ?? 0}%`, icon: Target, color: '#1E1B5E', bg: '#EDE9F8' },
    { label: 'Insights', value: p.stats?.totalInsights ?? 0, icon: Sparkles, color: '#F5C16C', bg: '#FEF9EC' },
  ]

  return (
    <div className="space-y-6">

      {isDemoMode && (
        <div className="bg-[#E8F5EF] border border-[#C8E9D8] rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-[#1E1B5E]">
          <Info size={15} className="text-[#7EC8A4]" />
          Viewing Anaya's demo profile. Create an account to manage your own.
        </div>
      )}

      {!isDemoMode && !profile.onboardingComplete && (
        <div className="bg-[#EEF7F2] border border-[#C8E9D8] rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertCircle size={16} className="text-[#7EC8A4] flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[#1E1B5E]">Complete your onboarding</p>
            <p className="text-xs text-[#6B6B8A]">Your health baseline will be more accurate once you finish setup.</p>
          </div>
          <button
            onClick={() => navigate('/onboarding')}
            className="text-xs font-semibold text-white bg-[#7EC8A4] px-3 py-1.5 rounded-lg hover:bg-[#6ab890] transition-all flex-shrink-0"
          >
            Finish Setup
          </button>
        </div>
      )}

      {saveSuccess && (
        <div className="bg-[#E8F5EF] text-[#1E1B5E] text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <Shield size={15} className="text-[#7EC8A4]" /> Profile updated successfully!
        </div>
      )}

      {saveError && (
        <div className="bg-[#FDECEA] text-[#E8A598] text-sm px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle size={15} /> {saveError}
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1B5E]">My Profile</h1>
          <p className="text-sm text-[#6B6B8A] mt-1">Your health information and journey</p>
        </div>
        {!isDemoMode && (
          !editing ? (
            <button
              onClick={startEdit}
              className="flex items-center gap-2 border border-[#1E1B5E] text-[#1E1B5E] font-semibold px-4 py-2 rounded-xl hover:bg-[#F0EEF8] transition-colors text-sm"
            >
              <Edit2 size={15} /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)}
                className="flex items-center gap-1 border border-[#EEECF5] text-[#6B6B8A] px-3 py-2 rounded-xl text-sm hover:bg-[#FAF8F5]">
                <X size={14} /> Cancel
              </button>
              <button onClick={saveEdit} disabled={saving}
                className="flex items-center gap-1 bg-[#7EC8A4] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#6ab890] disabled:opacity-50">
                <Save size={14} /> {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )
        )}
      </div>

      {/* Avatar + name */}
      <div className="bg-white rounded-2xl border border-[#EEECF5] p-6 shadow-sm flex items-center gap-5">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl flex-shrink-0"
          style={{ backgroundColor: '#1E1B5E' }}
        >
          {p.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-[#1E1B5E]">{p.name}</h2>
          <p className="text-sm text-[#6B6B8A] mt-0.5">
            {p.ageRange ? `Age: ${p.ageRange}` : p.age ? `Age: ${p.age}` : ''}
            {p.everDiagnosedPCOD && p.everDiagnosedPCOD !== 'no' && (
              <span className="ml-3 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8A598]" />
                PCOD {p.everDiagnosedPCOD === 'yes' ? 'Diagnosed' : p.everDiagnosedPCOD === 'suspected' ? '(Suspected)' : ''}
              </span>
            )}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <Heart size={13} style={{ color: '#7EC8A4' }} fill="#7EC8A4" />
            <span className="text-xs text-[#6B6B8A]">
              Goal: {
                {
                  understand: 'Understand hormonal health',
                  track_cycle: 'Track cycle',
                  manage_pcod: 'Manage PCOD',
                  improve_habits: 'Improve habits',
                  all: 'Holistic wellness',
                }[p.goal] || 'Holistic wellness'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-[#EEECF5] p-4 shadow-sm text-center">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: bg }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div className="text-xl font-bold text-[#1E1B5E]">{value}</div>
            <div className="text-xs text-[#6B6B8A] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Two-column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Cycle Info */}
        <div className="bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1E1B5E] flex items-center gap-2">
              <Calendar size={16} className="text-[#7EC8A4]" /> Cycle Information
            </h3>
            {!isDemoMode && (
              <button onClick={() => navigate('/log')}
                className="text-xs text-[#7EC8A4] flex items-center gap-0.5 hover:gap-1 transition-all font-medium">
                Log today <ChevronRight size={12} />
              </button>
            )}
          </div>

          <div className="bg-[#EEF7F2] rounded-xl p-4 mb-4 flex items-center gap-3 border border-[#C8E9D8]">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: cycleInfo.color + '30' }}
            >
              <Activity size={18} style={{ color: cycleInfo.color }} />
            </div>
            <div>
              <div className="text-xs text-[#6B6B8A]">Current phase</div>
              <div className="font-bold text-[#1E1B5E]">{cycleInfo.phase} Phase</div>
              <div className="text-xs text-[#6B6B8A]">Day {cycleInfo.day} of cycle</div>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Avg cycle length', value: `${p.avgCycleLength || 28} days` },
              { label: 'Period duration', value: `${p.avgPeriodDuration || 5} days` },
              { label: 'Last period', value: p.lastPeriodDate ? new Date(p.lastPeriodDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
              { label: 'Next period', value: nextPeriod ? `~${nextPeriod.date} (${nextPeriod.days} days)` : '—', highlight: true },
              { label: 'Cycle regularity', value: { regular: 'Very regular', slightly: 'Slightly irregular', irregular: 'Irregular', very_irregular: 'Very irregular' }[p.cycleVariation] || '—' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-sm text-[#6B6B8A]">{item.label}</span>
                <span className={`text-sm font-medium ${item.highlight ? 'text-[#7EC8A4]' : 'text-[#1E1B5E]'}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lifestyle Baseline */}
        <div className="bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm">
          <h3 className="font-semibold text-[#1E1B5E] flex items-center gap-2 mb-4">
            <Activity size={16} className="text-[#7EC8A4]" /> Lifestyle Baseline
          </h3>

          <div className="space-y-4">
            {[
              { label: 'Avg sleep', key: 'avgSleepHours', icon: Moon, color: '#7EC8A4', min: 4, max: 12, step: 0.5, display: v => `${v} hrs/night` },
              { label: 'Typical stress', key: 'avgStressLevel', icon: Flame, color: '#E8A598', min: 1, max: 10, step: 1, display: v => `${v}/10` },
              { label: 'Water intake', key: 'avgWaterIntake', icon: Droplet, color: '#7EC8A4', min: 1, max: 15, step: 1, display: v => `${v} glasses/day` },
            ].map(({ label, key, icon: Icon, color, min, max, step, display }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Icon size={14} style={{ color }} />
                    <span className="text-sm text-[#6B6B8A]">{label}</span>
                  </div>
                  <span className="text-sm font-medium text-[#1E1B5E]">
                    {display(editing ? editForm[key] : (p[key] ?? min))}
                  </span>
                </div>
                {editing && !isDemoMode ? (
                  <input type="range" min={min} max={max} step={step}
                    value={editForm[key]}
                    onChange={e => setEditForm(f => ({ ...f, [key]: parseFloat(e.target.value) }))}
                    className="w-full"
                    style={{ accentColor: color }}
                  />
                ) : (
                  <div className="w-full h-1.5 bg-[#EEECF5] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${(((p[key] ?? min) - min) / (max - min)) * 100}%`, backgroundColor: color }} />
                  </div>
                )}
              </div>
            ))}

            <div className="pt-2 border-t border-[#EEECF5]">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#6B6B8A] flex items-center gap-1.5">
                  <Activity size={13} className="text-[#7EC8A4]" /> Exercise
                </span>
                {editing && !isDemoMode ? (
                  <select
                    value={editForm.exerciseFrequency}
                    onChange={e => setEditForm(f => ({ ...f, exerciseFrequency: e.target.value }))}
                    className="border border-[#EEECF5] rounded-lg px-2 py-1 text-xs text-[#1E1B5E] focus:outline-none"
                  >
                    {[['none', 'None'], ['1-2', '1–2×/week'], ['2-3', '2–3×/week'], ['4-5', '4–5×/week'], ['daily', 'Daily']].map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm font-medium text-[#1E1B5E]">
                    {{ none: 'None', '1-2': '1–2×/week', '2-3': '2–3×/week', '4-5': '4–5×/week', daily: 'Daily' }[p.exerciseFrequency] || '—'}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-[#6B6B8A]">Sugar intake</span>
                {editing && !isDemoMode ? (
                  <select
                    value={editForm.sugarIntake}
                    onChange={e => setEditForm(f => ({ ...f, sugarIntake: e.target.value }))}
                    className="border border-[#EEECF5] rounded-lg px-2 py-1 text-xs text-[#1E1B5E] focus:outline-none"
                  >
                    {[['low', 'Low'], ['medium', 'Medium'], ['high', 'High']].map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${p.sugarIntake === 'low'
                    ? 'bg-[#E8F5EF] text-[#7EC8A4]'
                    : p.sugarIntake === 'high'
                      ? 'bg-[#FDECEA] text-[#E8A598]'
                      : 'bg-[#FAF8F5] text-[#6B6B8A]'
                    }`}>
                    {p.sugarIntake ? p.sugarIntake.charAt(0).toUpperCase() + p.sugarIntake.slice(1) : '—'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Symptoms */}
      {p.symptoms && p.symptoms.length > 0 && !p.symptoms.includes('none') && (
        <div className="bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm">
          <h3 className="font-semibold text-[#1E1B5E] mb-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-[#E8A598]" /> Reported Symptoms
          </h3>
          <div className="flex flex-wrap gap-2">
            {p.symptoms.map(s => {
              const label = SYMPTOM_LABELS[s]
              if (!label) return null
              return (
                <span key={s} className="flex items-center gap-1.5 bg-[#FDECEA] text-[#E8A598] text-xs font-medium px-3 py-1.5 rounded-full border border-[#E8A598]/20">
                  {label}
                </span>
              )
            })}
          </div>
          <p className="text-xs text-[#6B6B8A] mt-3">
            These symptoms are factored into your PCOD risk calculation.
          </p>
        </div>
      )}

      {/* Privacy */}
      <div className="bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm">
        <h3 className="font-semibold text-[#1E1B5E] mb-4 flex items-center gap-2">
          <Shield size={16} className="text-[#7EC8A4]" /> Privacy &amp; Notifications
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Data encryption', value: 'Enabled', icon: Shield },
            { label: 'Daily log reminder', value: '8:00 PM', icon: Bell },
            { label: 'Period prediction alerts', value: 'Enabled', icon: Calendar },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-[#EEECF5] last:border-0">
              <div className="flex items-center gap-2 text-sm text-[#6B6B8A]">
                <Icon size={14} className="text-[#7EC8A4]" /> {label}
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#E8F5EF] text-[#7EC8A4]">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Motivational footer */}
      <div className="bg-[#EEF7F2] rounded-2xl p-5 text-center border border-[#C8E9D8]">
        <Heart size={20} style={{ color: '#7EC8A4' }} fill="#7EC8A4" className="mx-auto mb-2" />
        <p className="text-[#1E1B5E] font-semibold text-sm">Your health journey is uniquely yours</p>
        <p className="text-[#6B6B8A] text-xs mt-1">
          Every log you add makes your insights more accurate and personalised.
        </p>
      </div>
    </div>
  )
}
