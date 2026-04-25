import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import {
  Moon, Flame, Droplet, TrendingDown, ArrowRight,
  Sparkles, Info, RotateCcw, Zap, Heart, Leaf,
  Target, Activity, ChevronRight
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
  if (risk > 60) return { label: 'High Risk', short: 'High', color: '#E8A598', textColor: '#C0392B', bg: '#FDECEA', ring: '#E8A598' }
  if (risk > 35) return { label: 'Moderate Risk', short: 'Moderate', color: '#F0C060', textColor: '#B8860B', bg: '#FFF8E7', ring: '#F0C060' }
  return { label: 'Low Risk', short: 'Low', color: '#7EC8A4', textColor: '#2E7D5E', bg: '#E8F5EF', ring: '#7EC8A4' }
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

function RiskCircle({ risk, level, size = 'md' }) {
  const r = size === 'lg' ? 52 : 38
  const dim = r * 2 + 16
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - risk / 100)
  const sw = size === 'lg' ? 9 : 7

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} className="-rotate-90">
        <circle cx={dim / 2} cy={dim / 2} r={r} stroke="#EEECF5" strokeWidth={sw} fill="none" />
        <circle
          cx={dim / 2} cy={dim / 2} r={r}
          stroke={level.color}
          strokeWidth={sw} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`font-bold text-[#1E1B5E] ${size === 'lg' ? 'text-2xl' : 'text-base'}`}>{risk}%</span>
      </div>
    </div>
  )
}

function HabitSlider({ icon: Icon, iconColor, label, currentVal, targetVal, min, max, step, onChangeCurrent, onChangeTarget, hint, displayFn, currentLabel, targetLabel }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: iconColor + '18' }}>
            <Icon size={14} style={{ color: iconColor }} />
          </div>
          <span className="text-sm font-semibold text-[#1E1B5E]">{label}</span>
        </div>
        <span className="text-[10px] text-[#6B6B8A] bg-[#FAF8F5] px-2 py-0.5 rounded-full border border-[#EEECF5]">{hint}</span>
      </div>

      <div className="space-y-2">
        {/* Current row */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#6B6B8A] w-14 shrink-0">{currentLabel}: <span className="font-semibold text-[#1E1B5E]">{displayFn(currentVal)}</span></span>
          <div className="flex-1">
            <input
              type="range" min={min} max={max} step={step}
              value={currentVal}
              onChange={e => onChangeCurrent(step === 1 ? parseInt(e.target.value) : parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none"
              style={{ accentColor: '#1E1B5E' }}
            />
          </div>
        </div>
        {/* Target row */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#3A9E72] w-14 shrink-0">{targetLabel}: <span className="font-semibold">{displayFn(targetVal)}</span></span>
          <div className="flex-1">
            <input
              type="range" min={min} max={max} step={step}
              value={targetVal}
              onChange={e => onChangeTarget(step === 1 ? parseInt(e.target.value) : parseFloat(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none"
              style={{ accentColor: '#7EC8A4' }}
            />
          </div>
        </div>
      </div>

      {/* Min/max labels */}
      <div className="flex justify-between text-[9px] text-[#AAAAAA] mt-1 ml-[72px]">
        <span>{min}{typeof min === 'number' && label.includes('Sleep') ? ' hrs' : label.includes('Stress') ? ' (Low)' : ''}</span>
        <span>{max}{typeof max === 'number' && label.includes('Sleep') ? ' hrs' : label.includes('Stress') ? ' (High)' : ''}</span>
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

  const [params, setParams] = useState({ cycleGapDays: 28, stressLevel: 5, sleepHours: 7, sugarIntake: 'medium' })
  const [simulatedParams, setSimulatedParams] = useState({ cycleGapDays: 28, stressLevel: 3, sleepHours: 8, sugarIntake: 'low' })

  useEffect(() => {
    if (isDemoMode) {
      const p = DEMO_PROFILE
      const loaded = { cycleGapDays: p.avgCycleLength || 28, stressLevel: p.avgStressLevel || 5, sleepHours: p.avgSleepHours || 7, sugarIntake: p.sugarIntake || 'medium' }
      setParams(loaded)
      setSimulatedParams({ cycleGapDays: loaded.cycleGapDays, stressLevel: Math.max(1, loaded.stressLevel - 2), sleepHours: Math.min(10, loaded.sleepHours + 0.5), sugarIntake: loaded.sugarIntake === 'high' ? 'medium' : 'low' })
      return
    }
    if (!userId) { setProfileLoading(false); return }
    api.get(`/users/${userId}`)
      .then(res => {
        const u = res.data
        const loaded = { cycleGapDays: u.avgCycleLength || 28, stressLevel: u.avgStressLevel || 5, sleepHours: u.avgSleepHours || 7, sugarIntake: u.sugarIntake || 'medium' }
        setParams(loaded)
        setSimulatedParams({ cycleGapDays: loaded.cycleGapDays, stressLevel: Math.max(1, loaded.stressLevel - 2), sleepHours: Math.min(10, loaded.sleepHours + 0.5), sugarIntake: loaded.sugarIntake === 'high' ? 'medium' : 'low' })
        if (!u.onboardingComplete) setProfileNote('Complete onboarding to use your real health baseline.')
      })
      .catch(() => setProfileNote('Using default values — profile could not be loaded.'))
      .finally(() => setProfileLoading(false))
  }, [userId, isDemoMode])

  const updateCurrent = (key, value) => setParams(prev => ({ ...prev, [key]: value }))
  const updateTarget = (key, value) => setSimulatedParams(prev => ({ ...prev, [key]: value }))
  const resetToBaseline = () => setSimulatedParams({ ...params })

  const curRisk = calculateRisk(params.sleepHours, params.stressLevel, params.sugarIntake, params.cycleGapDays)
  const simRisk = calculateRisk(simulatedParams.sleepHours, simulatedParams.stressLevel, simulatedParams.sugarIntake, simulatedParams.cycleGapDays)
  const curLevel = getRiskLevel(curRisk)
  const simLevel = getRiskLevel(simRisk)
  const delta = curRisk - simRisk

  const curMetrics = getMetrics(params)
  const simMetrics = getMetrics(simulatedParams)

  // Trend sparkline data (simplified bar chart)
  const trendBars = [
    { label: 'Current', risk: curRisk },
    { label: 'Target', risk: simRisk },
  ]

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-2 border-[#7EC8A4] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#1E1B5E]">Simulate Your Future</h1>
            <span className="text-xl">🌿</span>
          </div>
          <p className="text-sm text-[#6B6B8A] mt-0.5">See how lifestyle changes can improve your hormonal health.</p>
        </div>
        <button
          onClick={resetToBaseline}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#1E1B5E] bg-white border border-[#EEECF5] px-3 py-2 rounded-xl hover:bg-[#FAF8F5] transition-all shadow-sm"
        >
          <RotateCcw size={12} /> Reset to Current
        </button>
      </div>

      {isDemoMode && (
        <div className="bg-[#E8F5EF] border border-[#C8E9D8] rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-[#1E1B5E]">
          <Sparkles size={13} className="text-[#7EC8A4] flex-shrink-0" />
          Demo mode — using Anaya's profile as your baseline.
        </div>
      )}
      {profileNote && !isDemoMode && (
        <div className="bg-[#EEF7F2] rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-[#6B6B8A]">
          <Info size={13} className="text-[#7EC8A4] flex-shrink-0" />{profileNote}
        </div>
      )}

      {/* ── BENTO GRID ── */}
      <div className="grid grid-cols-12 gap-4">

        {/* ━━ ADJUST HABITS (col 1–5, row 1) ━━ */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-2xl border border-[#EEECF5] shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-[#1E1B5E] text-base">Adjust Your Habits</h2>
              <p className="text-[11px] text-[#6B6B8A] mt-0.5">Move the sliders to simulate different lifestyle choices.</p>
            </div>
          </div>

          <div className="space-y-5">
            <HabitSlider
              icon={Moon} iconColor="#7EC8A4" label="Sleep Duration"
              currentLabel="Current" targetLabel="Target"
              hint="Ideal: 7–9 hrs"
              currentVal={params.sleepHours} targetVal={simulatedParams.sleepHours}
              min={3} max={10} step={0.5}
              displayFn={v => `${v} hrs`}
              onChangeCurrent={v => updateCurrent('sleepHours', v)}
              onChangeTarget={v => updateTarget('sleepHours', v)}
            />
            <div className="border-t border-[#FAF8F5]" />
            <HabitSlider
              icon={Flame} iconColor="#E8A598" label="Stress Level"
              currentLabel="Current" targetLabel="Target"
              hint="Lower 1–4"
              currentVal={params.stressLevel} targetVal={simulatedParams.stressLevel}
              min={1} max={10} step={1}
              displayFn={v => `${v}/10`}
              onChangeCurrent={v => updateCurrent('stressLevel', v)}
              onChangeTarget={v => updateTarget('stressLevel', v)}
            />
            <div className="border-t border-[#FAF8F5]" />

            {/* Sugar */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#7EC8A418' }}>
                    <Droplet size={14} className="text-[#7EC8A4]" />
                  </div>
                  <span className="text-sm font-semibold text-[#1E1B5E]">Daily Sugar Intake</span>
                </div>
                <span className="text-[10px] text-[#6B6B8A] bg-[#FAF8F5] px-2 py-0.5 rounded-full border border-[#EEECF5]">Ideal: Low</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[#6B6B8A] w-14 shrink-0">Current: <span className="font-semibold text-[#1E1B5E] capitalize">{params.sugarIntake}</span></span>
                  <div className="flex flex-1 gap-1.5">
                    {['low', 'medium', 'high'].map(v => (
                      <button key={v} onClick={() => updateCurrent('sugarIntake', v)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${params.sugarIntake === v ? 'bg-[#1E1B5E] text-white' : 'bg-[#FAF8F5] border border-[#EEECF5] text-[#6B6B8A] hover:border-[#1E1B5E]/30'}`}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[#3A9E72] w-14 shrink-0">Target: <span className="font-semibold capitalize">{simulatedParams.sugarIntake}</span></span>
                  <div className="flex flex-1 gap-1.5">
                    {['low', 'medium', 'high'].map(v => (
                      <button key={v} onClick={() => updateTarget('sugarIntake', v)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${simulatedParams.sugarIntake === v ? 'bg-[#7EC8A4] text-white' : 'bg-[#E8F5EF] border border-[#C8E9D8] text-[#6B6B8A] hover:border-[#7EC8A4]/60'}`}>
                        {v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-[9px] text-[#AAAAAA] mt-1 ml-[72px]">
                <span>Low</span><span>Medium</span><span>High</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 bg-[#EEF7F2] rounded-xl p-3 border border-[#C8E9D8]">
            <Leaf size={12} className="text-[#7EC8A4] mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-[#6B6B8A] leading-relaxed">
              These adjustments are based on research-backed recommendations for hormonal balance and PCOD risk reduction.
            </p>
          </div>
        </div>

        {/* ━━ RIGHT COLUMN (col 6–12) ━━ */}
        <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-4">

          {/* ── Simulation Results (col 1–2, row 1) ── */}
          <div className="col-span-2 bg-white rounded-2xl border border-[#EEECF5] shadow-sm p-5">
            <h2 className="font-bold text-[#1E1B5E] text-base mb-1">Your Simulation Results</h2>
            <p className="text-[11px] text-[#6B6B8A] mb-4">See the potential impact of your new habits.</p>

            <div className="grid grid-cols-3 gap-4 items-center">
              {/* Current status */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs font-semibold text-[#6B6B8A]">Current Status</p>
                <RiskCircle risk={curRisk} level={curLevel} size="lg" />
                <div>
                  <p className="text-xs font-bold text-center" style={{ color: curLevel.textColor }}>{curLevel.short}</p>
                  <p className="text-[10px] text-[#6B6B8A] text-center">Risk Score</p>
                </div>
                <div className="w-full space-y-1.5 mt-1">
                  {[
                    { label: 'Cycle Regularity', val: curMetrics.cycleRegularity },
                    { label: 'Hormonal Stability', val: curMetrics.hormonalStability },
                    { label: 'Energy Levels', val: curMetrics.energyLevel },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-[9px] text-[#6B6B8A]">{label}</span>
                      <span className="text-[9px] font-bold text-[#1E1B5E]">{val}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delta arrow */}
              <div className="flex flex-col items-center gap-2">
                {delta > 0 ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[#E8F5EF] flex items-center justify-center">
                      <TrendingDown size={22} className="text-[#7EC8A4]" />
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-[#3A9E72]">{delta}%</p>
                      <p className="text-[10px] text-[#6B6B8A]">Potential reduction</p>
                    </div>
                    <p className="text-[10px] text-center text-[#7EC8A4] font-semibold px-2 leading-snug">
                      Amazing! These changes can reduce your PCOD risk by {delta}%!
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-[#FAF8F5] flex items-center justify-center">
                      <span className="text-2xl text-[#6B6B8A]">→</span>
                    </div>
                    <p className="text-[10px] text-center text-[#6B6B8A] px-2">Adjust targets to see reduction</p>
                  </>
                )}
              </div>

              {/* Simulated outcome */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs font-semibold text-[#7EC8A4]">Simulated Outcome</p>
                <RiskCircle risk={simRisk} level={simLevel} size="lg" />
                <div>
                  <p className="text-xs font-bold text-center" style={{ color: simLevel.textColor }}>{simLevel.short}</p>
                  <p className="text-[10px] text-[#6B6B8A] text-center">Risk Score</p>
                </div>
                <div className="w-full space-y-1.5 mt-1">
                  {[
                    { label: 'Cycle Regularity', val: simMetrics.cycleRegularity },
                    { label: 'Hormonal Stability', val: simMetrics.hormonalStability },
                    { label: 'Energy Levels', val: simMetrics.energyLevel },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-[9px] text-[#6B6B8A]">{label}</span>
                      <span className="text-[9px] font-bold text-[#7EC8A4]">{val}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Risk Score Trend (col 1) ── */}
          <div className="bg-white rounded-2xl border border-[#EEECF5] shadow-sm p-5">
            <h3 className="font-bold text-[#1E1B5E] text-sm mb-1">Risk Score Trend</h3>
            <p className="text-[10px] text-[#6B6B8A] mb-4">Current vs simulated risk.</p>

            {/* Bar chart */}
            <div className="flex items-end gap-6 h-28 px-2 mb-3">
              {/* Current bar */}
              <div className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs font-bold" style={{ color: curLevel.textColor }}>{curRisk}%</span>
                <div className="w-full rounded-t-lg transition-all duration-700" style={{
                  height: `${Math.max(8, (curRisk / 100) * 88)}px`,
                  backgroundColor: curLevel.color,
                  opacity: 0.85
                }} />
              </div>
              {/* Simulated bar */}
              <div className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs font-bold" style={{ color: simLevel.textColor }}>{simRisk}%</span>
                <div className="w-full rounded-t-lg transition-all duration-700" style={{
                  height: `${Math.max(8, (simRisk / 100) * 88)}px`,
                  backgroundColor: simLevel.color,
                  opacity: 0.85
                }} />
              </div>
            </div>

            <div className="flex gap-4 text-[10px]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: curLevel.color }} />
                <span className="text-[#6B6B8A]">Current Risk</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: simLevel.color }} />
                <span className="text-[#6B6B8A]">Simulated Risk</span>
              </div>
            </div>

            {/* Metric bars */}
            <div className="mt-4 space-y-2.5">
              {[
                { label: 'Cycle Regularity', cur: curMetrics.cycleRegularity, sim: simMetrics.cycleRegularity },
                { label: 'Hormonal Stability', cur: curMetrics.hormonalStability, sim: simMetrics.hormonalStability },
                { label: 'Energy Levels', cur: curMetrics.energyLevel, sim: simMetrics.energyLevel },
              ].map(({ label, cur, sim }) => (
                <div key={label}>
                  <div className="flex justify-between text-[9px] text-[#6B6B8A] mb-1">
                    <span>{label}</span>
                    <span className="font-semibold text-[#1E1B5E]">{cur}% → <span className="text-[#7EC8A4]">{sim}%</span></span>
                  </div>
                  <div className="h-1.5 bg-[#EEECF5] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${sim}%`, backgroundColor: '#7EC8A4' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── What's Improving (col 2) ── */}
          <div className="bg-white rounded-2xl border border-[#EEECF5] shadow-sm p-5">
            <h3 className="font-bold text-[#1E1B5E] text-sm mb-1">What's Improving?</h3>
            <p className="text-[10px] text-[#6B6B8A] mb-3">Key benefits of your target habits.</p>

            <div className="space-y-3">
              {[
                { icon: Moon, color: '#7EC8A4', bg: '#E8F5EF', title: 'Better Sleep', desc: 'Increased sleep improves hormone regulation and reduces stress.' },
                { icon: Flame, color: '#E8A598', bg: '#FDECEA', title: 'Lower Stress', desc: 'Managing stress helps balance cortisol and other hormones.' },
                { icon: Droplet, color: '#7EC8A4', bg: '#EEF7F2', title: 'Balanced Sugar', desc: 'Lower sugar intake improves insulin sensitivity and reduces PCOD markers.' },
              ].map(({ icon: Icon, color, bg, title, desc }) => (
                <div key={title} className="flex items-start gap-2.5 p-2.5 rounded-xl border border-[#EEECF5] bg-[#FAF8F5]">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1E1B5E]">{title}</p>
                    <p className="text-[10px] text-[#6B6B8A] leading-relaxed mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 p-2.5 bg-[#E8F5EF] rounded-xl border border-[#C8E9D8]">
              <p className="text-[10px] text-[#6B6B8A] text-center leading-relaxed">
                Consistency is key! Small changes today lead to big results tomorrow.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ━━ BOTTOM ROW ━━ */}
      <div className="grid grid-cols-12 gap-4">

        {/* Goal banner */}
        <div className="col-span-12 md:col-span-5 bg-[#EEF7F2] rounded-2xl border border-[#C8E9D8] p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#7EC8A4]/20 flex items-center justify-center flex-shrink-0">
            <Target size={22} className="text-[#7EC8A4]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[#1E1B5E] text-sm">Your Goal: Better Hormonal Health</h3>
            <p className="text-[11px] text-[#6B6B8A] mt-0.5">Keep making consistent choices and track your progress.</p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="col-span-12 md:col-span-7 bg-white rounded-2xl border border-[#EEECF5] shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={15} className="text-[#7EC8A4]" />
            <h3 className="font-bold text-[#1E1B5E] text-sm">Personalized Recommendations</h3>
          </div>
          <div className="space-y-2">
            {[
              { title: 'Aim for 7–9 hours of sleep', desc: 'Try a consistent sleep schedule and avoid screens before bed.' },
              { title: 'Practice stress management', desc: 'Try breathing, meditation or yoga for 10–15 minutes daily.' },
              { title: 'Choose balanced meals', desc: 'Focus on whole foods, fiber and healthy fats.' },
            ].map(({ title, desc }) => (
              <div key={title} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-[#E8F5EF] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap size={10} className="text-[#7EC8A4]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1E1B5E]">{title}</p>
                  <p className="text-[10px] text-[#6B6B8A]">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => navigate(isDemoMode ? '/signup' : '/log')}
              className="flex-1 flex items-center justify-center gap-2 bg-[#1E1B5E] text-white font-semibold py-2.5 rounded-xl hover:bg-[#2A2670] transition-all text-xs shadow-sm"
            >
              Apply These Changes <ArrowRight size={13} />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center justify-center gap-1.5 border border-[#EEECF5] text-[#6B6B8A] font-medium py-2.5 px-4 rounded-xl hover:bg-[#FAF8F5] transition-all text-xs"
            >
              Back to Dashboard <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
