import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import {
  Moon, Flame, Droplet, TrendingDown, Zap,
  CircleAlert as AlertCircle, ArrowRight, Target,
  Activity, Award, Sparkles, ChartBar as BarChart3, Info
} from 'lucide-react'

const DEMO_PROFILE = {
  avgCycleLength: 29,
  avgStressLevel: 4,
  avgSleepHours: 7.5,
  sugarIntake: 'medium',
  onboardingComplete: true,
}

function calculateRisk(sleepHours, stressLevel, sugarIntake, cycleGapDays) {
  let risk = 0
  if (cycleGapDays > 45) risk += 35
  else if (cycleGapDays > 35) risk += 20
  else if (cycleGapDays > 30) risk += 10

  if (stressLevel >= 8) risk += 25
  else if (stressLevel >= 6) risk += 15
  else if (stressLevel >= 4) risk += 8

  if (sleepHours < 5) risk += 25
  else if (sleepHours < 6.5) risk += 15
  else if (sleepHours < 7.5) risk += 5

  if (sugarIntake === 'high') risk += 20
  else if (sugarIntake === 'medium') risk += 8

  return Math.min(risk, 100)
}

function getRiskLevel(risk) {
  if (risk > 60) return { label: 'High', color: '#EA9A98', bg: '#FDECEA' }
  if (risk > 35) return { label: 'Moderate', color: '#F0C060', bg: '#FFF8E7' }
  return { label: 'Low', color: '#7EC8A4', bg: '#E8F5EF' }
}

function getMetrics(p) {
  return {
    cycleRegularity: Math.max(40, 100 - Math.max(0, p.cycleGapDays - 28) * 3),
    hormonalStability: Math.max(20, 100 - calculateRisk(p.sleepHours, p.stressLevel, p.sugarIntake, p.cycleGapDays)),
    energyLevel: Math.round(
      ((Math.min(p.sleepHours, 9) / 9) * 50) +
      (((10 - p.stressLevel) / 10) * 30) +
      (p.sugarIntake === 'low' ? 20 : p.sugarIntake === 'medium' ? 10 : 0)
    ),
  }
}

export default function RiskSimulatorPage() {
  const navigate = useNavigate()
  const isDemoMode = localStorage.getItem('hormonaDemoMode') === 'true'
  const userId = localStorage.getItem('hormonaUserId')

  const [hasInteracted, setHasInteracted] = useState(false)
  const [profileLoading, setProfileLoading] = useState(!isDemoMode)
  const [profileNote, setProfileNote] = useState('')

  const [params, setParams] = useState({
    cycleGapDays: 28,
    stressLevel: 5,
    sleepHours: 7,
    sugarIntake: 'medium',
  })

  const [simulatedParams, setSimulatedParams] = useState({
    cycleGapDays: 28,
    stressLevel: 3,
    sleepHours: 8,
    sugarIntake: 'low',
  })

  const [currentRisk, setCurrentRisk] = useState(null)
  const [simulatedRisk, setSimulatedRisk] = useState(null)

  useEffect(() => {
    if (isDemoMode) {
      const p = DEMO_PROFILE
      const loaded = {
        cycleGapDays: p.avgCycleLength || 28,
        stressLevel: p.avgStressLevel || 5,
        sleepHours: p.avgSleepHours || 7,
        sugarIntake: p.sugarIntake || 'medium',
      }
      setParams(loaded)
      setSimulatedParams({
        cycleGapDays: loaded.cycleGapDays,
        stressLevel: Math.max(1, loaded.stressLevel - 2),
        sleepHours: Math.min(10, loaded.sleepHours + 0.5),
        sugarIntake: loaded.sugarIntake === 'high' ? 'medium' : 'low',
      })
      return
    }

    if (!userId) { setProfileLoading(false); return }

    api.get(`/users/${userId}`)
      .then(res => {
        const u = res.data
        const loaded = {
          cycleGapDays: u.avgCycleLength || 28,
          stressLevel: u.avgStressLevel || 5,
          sleepHours: u.avgSleepHours || 7,
          sugarIntake: u.sugarIntake || 'medium',
        }
        setParams(loaded)
        setSimulatedParams({
          cycleGapDays: loaded.cycleGapDays,
          stressLevel: Math.max(1, loaded.stressLevel - 2),
          sleepHours: Math.min(10, loaded.sleepHours + 0.5),
          sugarIntake: loaded.sugarIntake === 'high' ? 'medium'
            : loaded.sugarIntake === 'medium' ? 'low' : 'low',
        })
        if (!u.onboardingComplete) {
          setProfileNote('Complete onboarding to use your real health baseline.')
        }
      })
      .catch(() => {
        setProfileNote('Using average defaults — your profile could not be loaded.')
      })
      .finally(() => setProfileLoading(false))
  }, [userId, isDemoMode])

  useEffect(() => {
    if (!hasInteracted) return
    const cur = calculateRisk(params.sleepHours, params.stressLevel, params.sugarIntake, params.cycleGapDays)
    setCurrentRisk({ risk: cur, level: getRiskLevel(cur) })
    const sim = calculateRisk(simulatedParams.sleepHours, simulatedParams.stressLevel, simulatedParams.sugarIntake, simulatedParams.cycleGapDays)
    setSimulatedRisk({ risk: sim, level: getRiskLevel(sim) })
  }, [params, simulatedParams, hasInteracted])

  const updateCurrentParam = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }))
    setHasInteracted(true)
  }

  const updateSimulatedParam = (key, value) => {
    setSimulatedParams(prev => ({ ...prev, [key]: value }))
    setHasInteracted(true)
  }

  const resetToCurrent = () => setSimulatedParams({ ...params })

  const riskReduction = currentRisk && simulatedRisk ? currentRisk.risk - simulatedRisk.risk : 0

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#7EC8A4] border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#6B6B8A]">Loading your profile...</p>
        </div>
      </div>
    )
  }

  const curMetrics = getMetrics(params)
  const simMetrics = getMetrics(simulatedParams)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1E1B5E]">Risk Simulator</h1>
        <p className="text-sm text-[#6B6B8A] mt-1">
          Adjust your lifestyle habits and see how they affect your estimated PCOD risk.
        </p>
      </div>

      {isDemoMode && (
        <div className="bg-[#E8F5EF] border border-[#C8E9D8] rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-[#1E1B5E]">
          <Sparkles size={15} className="text-[#7EC8A4]" />
          Demo mode — using Anaya's profile as baseline.
        </div>
      )}

      {profileNote && !isDemoMode && (
        <div className="bg-[#EEF7F2] rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-[#6B6B8A]">
          <Info size={15} className="text-[#7EC8A4] flex-shrink-0" />
          {profileNote}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left — Sliders */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-[#EEECF5] p-5 shadow-sm">
            <h2 className="font-semibold text-[#1E1B5E] text-lg mb-1">Adjust Your Habits</h2>
            <p className="text-xs text-[#6B6B8A] mb-5">
              The <span className="font-medium text-[#1E1B5E]">top slider</span> is your current baseline.
              The <span className="font-medium text-[#7EC8A4]">bottom slider</span> is your simulated target.
            </p>

            {/* Sleep */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-[#1E1B5E] flex items-center gap-2">
                  <Moon size={16} className="text-[#7EC8A4]" /> Sleep Duration
                </label>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-[#6B6B8A]">Current: <span className="font-semibold text-[#1E1B5E]">{params.sleepHours} hrs</span></span>
                  <span className="text-[#6B6B8A]">Target: <span className="font-semibold text-[#7EC8A4]">{simulatedParams.sleepHours} hrs</span></span>
                </div>
              </div>
              <input
                type="range" min="3" max="10" step="0.5"
                value={params.sleepHours}
                onChange={e => updateCurrentParam('sleepHours', parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-lg appearance-none bg-[#EEECF5]"
                style={{ accentColor: '#1E1B5E' }}
              />
              <input
                type="range" min="3" max="10" step="0.5"
                value={simulatedParams.sleepHours}
                onChange={e => updateSimulatedParam('sleepHours', parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-lg appearance-none bg-[#E8F5EF] mt-1"
                style={{ accentColor: '#7EC8A4' }}
              />
              <div className="flex justify-between text-[10px] text-[#6B6B8A] mt-1">
                <span>3 hrs</span><span className="text-[#7EC8A4]">Ideal: 7–9 hrs</span><span>10 hrs</span>
              </div>
            </div>

            {/* Stress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-[#1E1B5E] flex items-center gap-2">
                  <Flame size={16} className="text-[#EA9A98]" /> Stress Level
                </label>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-[#6B6B8A]">Current: <span className="font-semibold text-[#1E1B5E]">{params.stressLevel}/10</span></span>
                  <span className="text-[#6B6B8A]">Target: <span className="font-semibold text-[#7EC8A4]">{simulatedParams.stressLevel}/10</span></span>
                </div>
              </div>
              <input
                type="range" min="1" max="10" step="1"
                value={params.stressLevel}
                onChange={e => updateCurrentParam('stressLevel', parseInt(e.target.value))}
                className="w-full h-1.5 rounded-lg appearance-none bg-[#EEECF5]"
                style={{ accentColor: '#EA9A98' }}
              />
              <input
                type="range" min="1" max="10" step="1"
                value={simulatedParams.stressLevel}
                onChange={e => updateSimulatedParam('stressLevel', parseInt(e.target.value))}
                className="w-full h-1.5 rounded-lg appearance-none bg-[#FDECEA] mt-1"
                style={{ accentColor: '#EA9A98' }}
              />
              <div className="flex justify-between text-[10px] text-[#6B6B8A] mt-1">
                <span>1 (Calm)</span><span>10 (High stress)</span>
              </div>
            </div>

            {/* Sugar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-[#1E1B5E] flex items-center gap-2">
                  <Droplet size={16} className="text-[#7EC8A4]" /> Daily Sugar Intake
                </label>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-[#6B6B8A]">Current: <span className="font-semibold text-[#1E1B5E] capitalize">{params.sugarIntake}</span></span>
                  <span className="text-[#6B6B8A]">Target: <span className="font-semibold text-[#7EC8A4] capitalize">{simulatedParams.sugarIntake}</span></span>
                </div>
              </div>

              <div className="flex gap-2 mb-1">
                {['low', 'medium', 'high'].map(level => (
                  <button
                    key={level}
                    onClick={() => updateCurrentParam('sugarIntake', level)}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${params.sugarIntake === level
                      ? 'bg-[#1E1B5E] text-white'
                      : 'bg-[#FAF8F5] border border-[#EEECF5] text-[#6B6B8A]'
                      }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {['low', 'medium', 'high'].map(level => (
                  <button
                    key={level}
                    onClick={() => updateSimulatedParam('sugarIntake', level)}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${simulatedParams.sugarIntake === level
                      ? 'bg-[#7EC8A4] text-white'
                      : 'bg-[#FAF8F5] border border-[#EEECF5] text-[#6B6B8A]'
                      }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-[#6B6B8A] mt-1">
                <span>Low (Best)</span><span>Lower is better for insulin</span><span>High</span>
              </div>
            </div>

            <div className="p-2.5 bg-[#EEF7F2] rounded-lg mt-4">
              <p className="text-[10px] text-[#6B6B8A] text-center">
                Adjustments are based on research-backed recommendations for hormonal balance and PCOD risk reduction.
              </p>
            </div>
          </div>
        </div>

        {/* Right — Results */}
        <div className="space-y-5">
          {!hasInteracted ? (
            <div className="bg-white rounded-xl border border-[#EEECF5] p-8 shadow-sm flex flex-col items-center justify-center text-center min-h-[280px]">
              <div className="w-16 h-16 rounded-full bg-[#E8F5EF] flex items-center justify-center mb-4">
                <Activity size={28} className="text-[#7EC8A4]" />
              </div>
              <h2 className="font-semibold text-[#1E1B5E] text-lg mb-2">Adjust sliders to simulate</h2>
              <p className="text-sm text-[#6B6B8A] max-w-xs">
                Move any slider or change a sugar level to see your estimated PCOD risk in real time.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-[#7EC8A4] font-medium">
                <ArrowRight size={14} />
                Start by adjusting sleep or stress
              </div>
            </div>
          ) : (
            <>
              {/* Risk Gauges */}
              <div className="bg-white rounded-xl border border-[#EEECF5] p-5 shadow-sm">
                <h2 className="font-semibold text-[#1E1B5E] text-lg mb-4">Simulation Results</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-[#FAF8F5] rounded-xl">
                    <p className="text-xs text-[#6B6B8A] mb-2">Current Lifestyle</p>
                    <div className="relative inline-flex items-center justify-center mb-2">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="42" stroke="#EEECF5" strokeWidth="8" fill="none" />
                        <circle
                          cx="48" cy="48" r="42"
                          stroke={currentRisk.level.color}
                          strokeWidth="8" fill="none"
                          strokeDasharray={`${2 * Math.PI * 42}`}
                          strokeDashoffset={`${2 * Math.PI * 42 * (1 - currentRisk.risk / 100)}`}
                          strokeLinecap="round"
                          className="transition-all duration-500"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-xl font-bold text-[#1E1B5E]">{currentRisk.risk}</span>
                        <span className="text-[10px] text-[#6B6B8A]">%</span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: currentRisk.level.color }}>
                      {currentRisk.level.label} Risk
                    </p>
                  </div>

                  <div className="text-center p-3 bg-[#FAF8F5] rounded-xl">
                    <p className="text-xs text-[#6B6B8A] mb-2">Simulated Target</p>
                    <div className="relative inline-flex items-center justify-center mb-2">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle cx="48" cy="48" r="42" stroke="#EEECF5" strokeWidth="8" fill="none" />
                        <circle
                          cx="48" cy="48" r="42"
                          stroke={simulatedRisk.level.color}
                          strokeWidth="8" fill="none"
                          strokeDasharray={`${2 * Math.PI * 42}`}
                          strokeDashoffset={`${2 * Math.PI * 42 * (1 - simulatedRisk.risk / 100)}`}
                          strokeLinecap="round"
                          className="transition-all duration-500"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-xl font-bold text-[#1E1B5E]">{simulatedRisk.risk}</span>
                        <span className="text-[10px] text-[#6B6B8A]">%</span>
                      </div>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: simulatedRisk.level.color }}>
                      {simulatedRisk.level.label} Risk
                    </p>
                  </div>
                </div>

                {riskReduction > 0 && (
                  <div className="mt-4 p-3 bg-[#E8F5EF] rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingDown size={16} className="text-[#7EC8A4]" />
                      <span className="text-sm font-medium text-[#1E1B5E]">Potential Risk Reduction</span>
                    </div>
                    <span className="text-xl font-bold text-[#7EC8A4]">{riskReduction}%</span>
                  </div>
                )}
              </div>

              {/* Metrics Comparison */}
              <div className="bg-white rounded-xl border border-[#EEECF5] p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 size={16} className="text-[#7EC8A4]" />
                  <h3 className="font-semibold text-[#1E1B5E] text-sm">Key Metrics Comparison</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Cycle Regularity', cur: curMetrics.cycleRegularity, sim: simMetrics.cycleRegularity },
                    { label: 'Hormonal Stability', cur: curMetrics.hormonalStability, sim: simMetrics.hormonalStability },
                    { label: 'Energy Level', cur: curMetrics.energyLevel, sim: simMetrics.energyLevel },
                  ].map(({ label, cur, sim }) => (
                    <div key={label}>
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-[#6B6B8A]">{label}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-[#1E1B5E] font-medium">{cur}%</span>
                          <span className="text-[#6B6B8A]">→</span>
                          <span className={`font-semibold ${sim > cur ? 'text-[#7EC8A4]' : sim < cur ? 'text-[#EA9A98]' : 'text-[#6B6B8A]'}`}>{sim}%</span>
                        </div>
                      </div>
                      <div className="flex gap-1 h-1.5">
                        <div className="flex-1 bg-[#EEECF5] rounded-full overflow-hidden">
                          <div className="h-full bg-[#1E1B5E]/30 rounded-full transition-all duration-500" style={{ width: `${cur}%` }} />
                        </div>
                        <div className="flex-1 bg-[#EEECF5] rounded-full overflow-hidden">
                          <div className="h-full bg-[#7EC8A4] rounded-full transition-all duration-500" style={{ width: `${sim}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Why These Habits Matter */}
      <div className="bg-white rounded-xl border border-[#EEECF5] p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Award size={16} className="text-[#7EC8A4]" />
          <h2 className="font-semibold text-[#1E1B5E] text-sm">Why These Habits Matter</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Moon, title: 'Better Sleep', desc: 'Regulates cortisol and reproductive hormones', bg: '#E8F5EF', color: '#7EC8A4' },
            { icon: Flame, title: 'Lower Stress', desc: 'Balances cortisol, supports cycle regularity', bg: '#FDECEA', color: '#EA9A98' },
            { icon: Droplet, title: 'Balanced Sugar', desc: 'Improves insulin sensitivity, reduces PCOD risk', bg: '#EEF7F2', color: '#7EC8A4' },
            { icon: Zap, title: 'Consistency', desc: 'Small daily changes compound over weeks', bg: '#E8F5EF', color: '#7EC8A4' },
          ].map(({ icon: Icon, title, desc, bg, color }) => (
            <div key={title} className="p-3 rounded-lg" style={{ backgroundColor: bg }}>
              <div className="flex items-center gap-1 mb-1">
                <Icon size={13} style={{ color }} />
                <h3 className="font-medium text-xs text-[#1E1B5E]">{title}</h3>
              </div>
              <p className="text-[10px] text-[#6B6B8A]">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-[#EEF7F2] rounded-xl p-4 border border-[#C8E9D8]">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-[#7EC8A4]" />
          <h2 className="font-semibold text-[#1E1B5E] text-sm">Personalised Recommendations</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { title: 'Sleep 7–9 hours', desc: 'Consistent schedule matters most' },
            { title: 'Manage stress daily', desc: '10 min of mindfulness or breathwork' },
            { title: 'Choose whole foods', desc: 'Fibre & protein over refined sugar' },
          ].map(({ title, desc }) => (
            <div key={title} className="bg-white rounded-lg p-3">
              <h3 className="font-medium text-xs text-[#1E1B5E] mb-0.5">{title}</h3>
              <p className="text-[10px] text-[#6B6B8A]">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {hasInteracted && (
          <button
            onClick={resetToCurrent}
            className="flex-1 py-2.5 rounded-xl border border-[#EEECF5] text-[#1E1B5E] font-medium text-sm hover:bg-[#FAF8F5] transition-all"
          >
            Reset to Current
          </button>
        )}
        {!isDemoMode && (
          <button
            onClick={() => navigate('/log')}
            className="flex-1 bg-[#7EC8A4] text-white font-semibold py-2.5 rounded-xl hover:bg-[#6ab890] transition-all flex items-center justify-center gap-2 text-sm"
          >
            Log Today's Data
            <ArrowRight size={14} />
          </button>
        )}
        {isDemoMode && (
          <button
            onClick={() => navigate('/signup')}
            className="flex-1 bg-[#7EC8A4] text-white font-semibold py-2.5 rounded-xl hover:bg-[#6ab890] transition-all flex items-center justify-center gap-2 text-sm"
          >
            Create Account
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
