import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import {
  Moon, Flame, Droplet, TrendingDown, TrendingUp,
  ArrowRight, Activity, Sparkles, Info, RotateCcw,
  Zap, Shield, Heart
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
  if (risk > 60) return { label: 'High Risk', color: '#E8A598', bg: '#FDECEA', border: '#E8A598' }
  if (risk > 35) return { label: 'Moderate Risk', color: '#D4A040', bg: '#FFF8E7', border: '#F0C060' }
  return { label: 'Low Risk', color: '#3A9E72', bg: '#E8F5EF', border: '#7EC8A4' }
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

function RiskGauge({ risk, level, label }) {
  const circumference = 2 * Math.PI * 44
  const offset = circumference * (1 - risk / 100)
  return (
    <div className="flex flex-col items-center">
      <p className="text-xs font-medium text-[#6B6B8A] mb-3 uppercase tracking-wide">{label}</p>
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" stroke="#EEECF5" strokeWidth="8" fill="none" />
          <circle
            cx="50" cy="50" r="44"
            stroke={level.color}
            strokeWidth="8" fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-[#1E1B5E]">{risk}</span>
          <span className="text-xs text-[#6B6B8A]">%</span>
        </div>
      </div>
      <span
        className="mt-3 text-xs font-semibold px-3 py-1 rounded-full"
        style={{ color: level.color, backgroundColor: level.bg, border: `1px solid ${level.border}` }}
      >
        {level.label}
      </span>
    </div>
  )
}

function SliderRow({ icon: Icon, iconColor, label, currentVal, simulatedVal, min, max, step, onChangeCurrent, onChangeSimulated, hint, displayFn }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={16} style={{ color: iconColor }} />
          <span className="text-sm font-semibold text-[#1E1B5E]">{label}</span>
        </div>
        <span className="text-[10px] text-[#6B6B8A] bg-[#FAF8F5] px-2 py-0.5 rounded-full">{hint}</span>
      </div>

      {/* Current */}
      <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#EEECF5]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#6B6B8A]">Your current</span>
          <span className="text-sm font-bold text-[#1E1B5E]">{displayFn(currentVal)}</span>
        </div>
        <input
          type="range" min={min} max={max} step={step}
          value={currentVal}
          onChange={e => onChangeCurrent(step === 1 ? parseInt(e.target.value) : parseFloat(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none"
          style={{ accentColor: '#1E1B5E' }}
        />
      </div>

      {/* Target */}
      <div className="bg-[#E8F5EF] rounded-xl p-3 border border-[#C8E9D8]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#3A9E72] font-medium">Your target</span>
          <span className="text-sm font-bold text-[#3A9E72]">{displayFn(simulatedVal)}</span>
        </div>
        <input
          type="range" min={min} max={max} step={step}
          value={simulatedVal}
          onChange={e => onChangeSimulated(step === 1 ? parseInt(e.target.value) : parseFloat(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none"
          style={{ accentColor: '#7EC8A4' }}
        />
      </div>
    </div>
  )
}

export default function RiskSimulatorPage() {
  const navigate = useNavigate()
  const isDemoMode = localStorage.getItem('hormonaDemoMode') === 'true'
  const userId = localStorage.getItem('hormonaUserId')

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
          sugarIntake: loaded.sugarIntake === 'high' ? 'medium' : 'low',
        })
        if (!u.onboardingComplete) {
          setProfileNote('Complete onboarding to use your real health baseline.')
        }
      })
      .catch(() => {
        setProfileNote('Using default values — your profile could not be loaded.')
      })
      .finally(() => setProfileLoading(false))
  }, [userId, isDemoMode])

  const updateCurrent = (key, value) => setParams(prev => ({ ...prev, [key]: value }))
  const updateSimulated = (key, value) => setSimulatedParams(prev => ({ ...prev, [key]: value }))
  const resetToBaseline = () => setSimulatedParams({ ...params })

  const currentRiskVal = calculateRisk(params.sleepHours, params.stressLevel, params.sugarIntake, params.cycleGapDays)
  const simulatedRiskVal = calculateRisk(simulatedParams.sleepHours, simulatedParams.stressLevel, simulatedParams.sugarIntake, simulatedParams.cycleGapDays)
  const currentLevel = getRiskLevel(currentRiskVal)
  const simulatedLevel = getRiskLevel(simulatedRiskVal)
  const riskDelta = currentRiskVal - simulatedRiskVal

  const curMetrics = getMetrics(params)
  const simMetrics = getMetrics(simulatedParams)

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-2 border-[#7EC8A4] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#6B6B8A]">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1B5E]">Risk Simulator</h1>
          <p className="text-sm text-[#6B6B8A] mt-1">
            See how changing your lifestyle habits impacts your estimated PCOD risk.
          </p>
        </div>
        <button
          onClick={resetToBaseline}
          className="flex items-center gap-1.5 text-xs font-medium text-[#6B6B8A] bg-white border border-[#EEECF5] px-3 py-2 rounded-xl hover:bg-[#FAF8F5] hover:text-[#1E1B5E] transition-all shadow-sm"
        >
          <RotateCcw size={13} /> Reset targets
        </button>
      </div>

      {/* Banners */}
      {isDemoMode && (
        <div className="bg-[#E8F5EF] border border-[#C8E9D8] rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-[#1E1B5E]">
          <Sparkles size={14} className="text-[#7EC8A4] flex-shrink-0" />
          Demo mode — using Anaya's profile as your current baseline.
        </div>
      )}
      {profileNote && !isDemoMode && (
        <div className="bg-[#EEF7F2] rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-[#6B6B8A]">
          <Info size={14} className="text-[#7EC8A4] flex-shrink-0" />
          {profileNote}
        </div>
      )}

      {/* Risk Summary — always visible */}
      <div className="bg-white rounded-2xl border border-[#EEECF5] shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Activity size={18} className="text-[#7EC8A4]" />
          <h2 className="font-semibold text-[#1E1B5E] text-lg">Risk Overview</h2>
          <span className="ml-auto text-xs text-[#6B6B8A]">Updates in real time as you adjust</span>
        </div>

        <div className="grid grid-cols-3 gap-6 items-center">
          {/* Current gauge */}
          <RiskGauge risk={currentRiskVal} level={currentLevel} label="Current" />

          {/* Delta */}
          <div className="text-center">
            {riskDelta !== 0 ? (
              <>
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-2"
                  style={{ backgroundColor: riskDelta > 0 ? '#E8F5EF' : '#FDECEA' }}
                >
                  {riskDelta > 0
                    ? <TrendingDown size={24} className="text-[#7EC8A4]" />
                    : <TrendingUp size={24} className="text-[#E8A598]" />
                  }
                </div>
                <p className="text-2xl font-bold" style={{ color: riskDelta > 0 ? '#3A9E72' : '#E8A598' }}>
                  {riskDelta > 0 ? '−' : '+'}{Math.abs(riskDelta)}%
                </p>
                <p className="text-xs text-[#6B6B8A] mt-1">
                  {riskDelta > 0 ? 'potential reduction' : 'risk increase'}
                </p>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-[#FAF8F5] flex items-center justify-center mx-auto mb-2">
                  <span className="text-2xl">↔</span>
                </div>
                <p className="text-sm text-[#6B6B8A]">No change</p>
              </>
            )}
          </div>

          {/* Simulated gauge */}
          <RiskGauge risk={simulatedRiskVal} level={simulatedLevel} label="With targets" />
        </div>
      </div>

      {/* Controls + Metrics side by side */}
      <div className="grid lg:grid-cols-5 gap-6">

        {/* Left — Controls (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-[#EEECF5] shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-[#1E1B5E] text-lg">Adjust Habits</h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded bg-[#1E1B5E]/25 inline-block" />
                <span className="text-[#6B6B8A]">Current</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 rounded bg-[#7EC8A4] inline-block" />
                <span className="text-[#6B6B8A]">Target</span>
              </span>
            </div>
          </div>

          <SliderRow
            icon={Moon} iconColor="#7EC8A4" label="Sleep Duration"
            hint="Ideal: 7–9 hrs"
            currentVal={params.sleepHours} simulatedVal={simulatedParams.sleepHours}
            min={3} max={10} step={0.5}
            displayFn={v => `${v} hrs`}
            onChangeCurrent={v => updateCurrent('sleepHours', v)}
            onChangeSimulated={v => updateSimulated('sleepHours', v)}
          />

          <SliderRow
            icon={Flame} iconColor="#E8A598" label="Stress Level"
            hint="Lower is better"
            currentVal={params.stressLevel} simulatedVal={simulatedParams.stressLevel}
            min={1} max={10} step={1}
            displayFn={v => `${v} / 10`}
            onChangeCurrent={v => updateCurrent('stressLevel', v)}
            onChangeSimulated={v => updateSimulated('stressLevel', v)}
          />

          {/* Sugar intake */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplet size={16} className="text-[#7EC8A4]" />
                <span className="text-sm font-semibold text-[#1E1B5E]">Sugar Intake</span>
              </div>
              <span className="text-[10px] text-[#6B6B8A] bg-[#FAF8F5] px-2 py-0.5 rounded-full">Lower = better insulin</span>
            </div>

            <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#EEECF5]">
              <p className="text-xs text-[#6B6B8A] mb-2">Your current</p>
              <div className="flex gap-2">
                {['low', 'medium', 'high'].map(level => (
                  <button
                    key={level}
                    onClick={() => updateCurrent('sugarIntake', level)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${params.sugarIntake === level
                      ? 'bg-[#1E1B5E] text-white shadow-sm'
                      : 'bg-white border border-[#EEECF5] text-[#6B6B8A] hover:border-[#1E1B5E]/30 hover:bg-[#F0EEF8]/40'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#E8F5EF] rounded-xl p-3 border border-[#C8E9D8]">
              <p className="text-xs text-[#3A9E72] font-medium mb-2">Your target</p>
              <div className="flex gap-2">
                {['low', 'medium', 'high'].map(level => (
                  <button
                    key={level}
                    onClick={() => updateSimulated('sugarIntake', level)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${simulatedParams.sugarIntake === level
                      ? 'bg-[#7EC8A4] text-white shadow-sm'
                      : 'bg-white border border-[#C8E9D8] text-[#6B6B8A] hover:border-[#7EC8A4]/60 hover:bg-[#E8F5EF]/50'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right — Metrics (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EEECF5] shadow-sm p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-5">
            <Shield size={18} className="text-[#7EC8A4]" />
            <h2 className="font-semibold text-[#1E1B5E] text-lg">Health Metrics</h2>
          </div>

          <div className="space-y-5 flex-1">
            {[
              { label: 'Cycle Regularity', cur: curMetrics.cycleRegularity, sim: simMetrics.cycleRegularity, color: '#7EC8A4' },
              { label: 'Hormonal Stability', cur: curMetrics.hormonalStability, sim: simMetrics.hormonalStability, color: '#7EC8A4' },
              { label: 'Energy Level', cur: curMetrics.energyLevel, sim: simMetrics.energyLevel, color: '#F0C060' },
            ].map(({ label, cur, sim, color }) => {
              const diff = sim - cur
              return (
                <div key={label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#6B6B8A]">{label}</span>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-[#1E1B5E] font-medium">{cur}%</span>
                      <span className="text-[#6B6B8A]">→</span>
                      <span className="font-bold" style={{ color: diff > 0 ? '#3A9E72' : diff < 0 ? '#E8A598' : '#6B6B8A' }}>
                        {sim}%
                      </span>
                      {diff !== 0 && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                          style={{ color: diff > 0 ? '#3A9E72' : '#E8A598', backgroundColor: diff > 0 ? '#E8F5EF' : '#FDECEA' }}
                        >
                          {diff > 0 ? '+' : ''}{diff}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Stacked bars */}
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-[#EEECF5] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#1E1B5E]/20 transition-all duration-500"
                        style={{ width: `${cur}%` }}
                      />
                    </div>
                    <div className="w-full h-1.5 bg-[#EEECF5] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${sim}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Insight box */}
          <div className="mt-5 p-3 bg-[#EEF7F2] rounded-xl border border-[#C8E9D8]">
            <div className="flex items-start gap-2">
              <Zap size={14} className="text-[#7EC8A4] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#6B6B8A] leading-relaxed">
                {riskDelta >= 10
                  ? `Your targets could cut PCOD risk by ${riskDelta}%. Small changes, big impact.`
                  : riskDelta > 0
                    ? 'Good start! Push your targets a bit further for bigger results.'
                    : 'Set more ambitious targets to see your risk drop.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why it matters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Moon, title: 'Better Sleep', desc: 'Regulates cortisol & reproductive hormones', color: '#7EC8A4', bg: '#E8F5EF' },
          { icon: Flame, title: 'Lower Stress', desc: 'Balances cortisol, supports cycle regularity', color: '#E8A598', bg: '#FDECEA' },
          { icon: Droplet, title: 'Less Sugar', desc: 'Improves insulin sensitivity, reduces PCOD markers', color: '#7EC8A4', bg: '#EEF7F2' },
          { icon: Zap, title: 'Consistency', desc: 'Small daily changes compound over weeks', color: '#D4A040', bg: '#FFF8E7' },
        ].map(({ icon: Icon, title, desc, color, bg }) => (
          <div key={title} className="bg-white rounded-xl border border-[#EEECF5] p-4 shadow-sm">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: bg }}
            >
              <Icon size={17} style={{ color }} />
            </div>
            <h3 className="font-semibold text-sm text-[#1E1B5E] mb-1">{title}</h3>
            <p className="text-xs text-[#6B6B8A] leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-[#EEF7F2] rounded-2xl p-5 border border-[#C8E9D8] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Heart size={20} className="text-[#7EC8A4] flex-shrink-0" fill="#7EC8A4" />
          <div>
            <p className="font-semibold text-[#1E1B5E] text-sm">Ready to start making changes?</p>
            <p className="text-xs text-[#6B6B8A] mt-0.5">Log today's data to track your real progress over time.</p>
          </div>
        </div>
        <button
          onClick={() => navigate(isDemoMode ? '/signup' : '/log')}
          className="flex items-center gap-2 bg-[#7EC8A4] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-[#6ab890] transition-all text-sm flex-shrink-0 shadow-sm"
        >
          {isDemoMode ? 'Create Account' : 'Log Today'}
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  )
}
