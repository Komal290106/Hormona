import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Heart, ChevronRight, ChevronLeft, Check,
  Moon, Droplet, Flame, Apple, Activity,
  AlertCircle, Calendar, Sparkles
} from 'lucide-react'

// ─── Step definitions ───────────────────────────────────────────────────────
const STEPS = [
  { id: 1, title: 'About You',         subtitle: 'Basic info to personalise your experience' },
  { id: 2, title: 'Your Cycle',        subtitle: 'Help us understand your menstrual health' },
  { id: 3, title: 'Daily Habits',      subtitle: 'Your typical lifestyle patterns' },
  { id: 4, title: 'PCOD Symptoms',     subtitle: 'Let us know what you experience' },
  { id: 5, title: 'Health Baseline',   subtitle: 'Recent trends to calibrate your score' },
]

const SYMPTOM_OPTIONS = [
  { key: 'irregularPeriods',   label: 'Irregular periods',     icon: '🔄' },
  { key: 'acne',               label: 'Acne / oily skin',      icon: '✨' },
  { key: 'hairLoss',           label: 'Hair thinning / loss',  icon: '💆' },
  { key: 'weightGain',         label: 'Unexplained weight gain',icon: '⚖️' },
  { key: 'fatigue',            label: 'Chronic fatigue',       icon: '😴' },
  { key: 'moodSwings',         label: 'Mood swings',           icon: '🌊' },
  { key: 'bloating',           label: 'Bloating',              icon: '🫧' },
  { key: 'excessHairGrowth',   label: 'Excess hair (face/body)',icon: '🌿' },
  { key: 'cramping',           label: 'Severe cramps',         icon: '⚡' },
  { key: 'none',               label: 'None of these',         icon: '✅' },
]

const MOOD_OPTIONS = ['Great', 'Good', 'Okay', 'Low', 'Bad']

// ─── Component ───────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ── Form state ──
  const [form, setForm] = useState({
    // Step 1 — About You
    age: '',
    ageRange: '',           // 'under18' | '18-24' | '25-34' | '35+'

    // Step 2 — Cycle
    lastPeriodDate: '',
    avgCycleLength: 28,
    cycleVariation: 'regular',    // 'regular' | 'slightly' | 'irregular' | 'very_irregular'
    avgPeriodDuration: 5,
    typicalFlow: 'medium',        // 'light' | 'medium' | 'heavy' | 'varies'
    everDiagnosedPCOD: '',        // 'yes' | 'no' | 'suspected' | 'unsure'

    // Step 3 — Habits
    avgSleepHours: 7,
    sleepQuality: 'okay',         // 'poor' | 'okay' | 'good' | 'excellent'
    avgStressLevel: 5,            // 1-10
    avgWaterIntake: 6,            // glasses
    exerciseFrequency: '2-3',     // 'none' | '1-2' | '2-3' | '4-5' | 'daily'
    dietType: 'balanced',         // 'balanced' | 'high_sugar' | 'vegetarian' | 'vegan' | 'keto'
    sugarIntake: 'medium',        // 'low' | 'medium' | 'high'

    // Step 4 — Symptoms
    symptoms: [],

    // Step 5 — Baseline
    recentMoodTrend: 'okay',      // mood in past 2 weeks
    recentSleepTrend: 'okay',     // 'declining' | 'stable' | 'improving'
    recentStressTrend: 'stable',
    goal: 'understand',           // 'understand' | 'track_cycle' | 'manage_pcod' | 'improve_habits' | 'all'
  })

  // ── Helpers ──
  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const toggleSymptom = (key) => {
    if (key === 'none') {
      set('symptoms', form.symptoms.includes('none') ? [] : ['none'])
      return
    }
    const cur = form.symptoms.filter(s => s !== 'none')
    set('symptoms', cur.includes(key) ? cur.filter(s => s !== key) : [...cur, key])
  }

  const validate = () => {
    if (step === 1 && !form.ageRange) return 'Please select your age range.'
    if (step === 2 && !form.lastPeriodDate) return 'Please enter your last period start date.'
    if (step === 2 && !form.everDiagnosedPCOD) return 'Please answer the PCOD diagnosis question.'
    if (step === 4 && form.symptoms.length === 0) return 'Please select at least one option (or "None of these").'
    return ''
  }

  const next = () => {
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    if (step < STEPS.length) setStep(s => s + 1)
    else handleSubmit()
  }

  const back = () => { setError(''); setStep(s => s - 1) }
// Replace the handleSubmit function in your OnboardingPage.jsx with this:

const handleSubmit = async () => {
  try {
    setLoading(true)
    const userId = localStorage.getItem('hormonaUserId')
    
    if (!userId) {
      console.error('No user ID found')
      navigate('/login')
      return
    }

    // Build payload for backend
    const payload = {
      ...form,
      userId,
      onboardingComplete: true,
      // Flatten nested structure for backend
      age: form.age || null,
      ageRange: form.ageRange,
      lastPeriodDate: form.lastPeriodDate,
      avgCycleLength: form.avgCycleLength,
      cycleVariation: form.cycleVariation,
      avgPeriodDuration: form.avgPeriodDuration,
      typicalFlow: form.typicalFlow,
      everDiagnosedPCOD: form.everDiagnosedPCOD,
      avgSleepHours: form.avgSleepHours,
      sleepQuality: form.sleepQuality,
      avgStressLevel: form.avgStressLevel,
      avgWaterIntake: form.avgWaterIntake,
      exerciseFrequency: form.exerciseFrequency,
      sugarIntake: form.sugarIntake,
      symptoms: form.symptoms,
      recentMoodTrend: form.recentMoodTrend,
      recentSleepTrend: form.recentSleepTrend,
      recentStressTrend: form.recentStressTrend,
      goal: form.goal,
    }

    // Try to save to backend
    try {
      await axios.put(`/api/users/${userId}/onboarding`, payload)
    } catch (err) {
      console.warn('Backend not available, saving to localStorage only:', err.message)
    }
    
    // Save onboarding data to localStorage for demo mode
    localStorage.setItem('hormonaOnboardingComplete', 'true')
    localStorage.setItem('hormonaUserData', JSON.stringify(payload))
    
    // Navigate to dashboard
    navigate('/dashboard')
  } catch (err) {
    console.error('Onboarding error:', err)
    setError('Something went wrong. Please try again.')
  } finally {
    setLoading(false)
  }
}

  // ─── Progress bar ─────────────────────────────────────────────────────────
  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-10">
        <Heart size={24} style={{ color: '#7EC8A4' }} fill="#7EC8A4" />
        <span className="text-[#1E1B5E] font-bold text-xl tracking-tight">HORMONA</span>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#EEECF5] w-full max-w-xl overflow-hidden">

        {/* Progress bar */}
        <div className="h-1.5 bg-[#EEECF5]">
          <div
            className="h-full bg-[#7EC8A4] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step header */}
        <div className="px-8 pt-8 pb-4">
          <div className="flex items-center gap-2 mb-1">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className="flex-1 h-1 rounded-full transition-all"
                style={{ backgroundColor: s.id <= step ? '#7EC8A4' : '#EEECF5' }}
              />
            ))}
          </div>
          <div className="flex justify-between mt-3">
            <div>
              <h2 className="text-xl font-bold text-[#1E1B5E]">{STEPS[step - 1].title}</h2>
              <p className="text-sm text-[#6B6B8A] mt-0.5">{STEPS[step - 1].subtitle}</p>
            </div>
            <span className="text-xs text-[#6B6B8A] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#EEECF5] self-start">
              {step} of {STEPS.length}
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-8 mb-2 bg-[#FDECEA] text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle size={14} /> {error}
          </div>
        )}

        {/* Step content */}
        <div className="px-8 pb-8 space-y-5">
          {/* ── STEP 1: About You ── */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-3">How old are you?</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: 'under18', label: 'Under 18' },
                    { val: '18-24',   label: '18 – 24' },
                    { val: '25-34',   label: '25 – 34' },
                    { val: '35+',     label: '35 or older' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => set('ageRange', opt.val)}
                      className={`py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                        form.ageRange === opt.val
                          ? 'border-[#7EC8A4] bg-[#E8F5EF] text-[#1E1B5E]'
                          : 'border-[#EEECF5] text-[#6B6B8A] hover:border-[#7EC8A4]/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                  Exact age <span className="text-[#6B6B8A] font-normal">(optional, improves accuracy)</span>
                </label>
                <input
                  type="number"
                  value={form.age}
                  onChange={e => set('age', e.target.value)}
                  placeholder="e.g. 24"
                  min="12" max="60"
                  className="w-full border border-[#EEECF5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7EC8A4] bg-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-3">What's your primary goal with Hormona?</label>
                <div className="space-y-2">
                  {[
                    { val: 'understand',     label: 'Understand my hormonal health' },
                    { val: 'track_cycle',    label: 'Track my menstrual cycle' },
                    { val: 'manage_pcod',    label: 'Manage PCOD / PCOS symptoms' },
                    { val: 'improve_habits', label: 'Improve my daily habits' },
                    { val: 'all',            label: 'All of the above' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => set('goal', opt.val)}
                      className={`w-full py-2.5 px-4 rounded-xl border text-sm text-left transition-all ${
                        form.goal === opt.val
                          ? 'border-[#7EC8A4] bg-[#E8F5EF] text-[#1E1B5E] font-medium'
                          : 'border-[#EEECF5] text-[#6B6B8A] hover:border-[#7EC8A4]/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── STEP 2: Your Cycle ── */}
          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5 flex items-center gap-2">
                  <Calendar size={14} className="text-[#7EC8A4]" /> Last period start date *
                </label>
                <input
                  type="date"
                  value={form.lastPeriodDate}
                  onChange={e => set('lastPeriodDate', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full border border-[#EEECF5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#7EC8A4] bg-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
                  Average cycle length: <span className="text-[#7EC8A4]">{form.avgCycleLength} days</span>
                </label>
                <input
                  type="range" min="21" max="45" step="1"
                  value={form.avgCycleLength}
                  onChange={e => set('avgCycleLength', parseInt(e.target.value))}
                  className="w-full accent-[#7EC8A4]"
                />
                <div className="flex justify-between text-xs text-[#6B6B8A] mt-1">
                  <span>21 days</span><span>28 (average)</span><span>45 days</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-3">How regular is your cycle?</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'regular',       label: 'Very regular', sub: '±1-2 days' },
                    { val: 'slightly',      label: 'Slightly irregular', sub: '±3-5 days' },
                    { val: 'irregular',     label: 'Irregular', sub: '±7+ days' },
                    { val: 'very_irregular',label: 'Very irregular', sub: 'Unpredictable' },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => set('cycleVariation', opt.val)}
                      className={`py-2.5 px-3 rounded-xl border text-left transition-all ${
                        form.cycleVariation === opt.val
                          ? 'border-[#7EC8A4] bg-[#E8F5EF]'
                          : 'border-[#EEECF5] hover:border-[#7EC8A4]/50'
                      }`}
                    >
                      <div className="text-sm font-medium text-[#1E1B5E]">{opt.label}</div>
                      <div className="text-xs text-[#6B6B8A]">{opt.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A2E] mb-2">
                    Period duration: <span className="text-[#7EC8A4]">{form.avgPeriodDuration} days</span>
                  </label>
                  <input
                    type="range" min="2" max="10" step="1"
                    value={form.avgPeriodDuration}
                    onChange={e => set('avgPeriodDuration', parseInt(e.target.value))}
                    className="w-full accent-[#E8A598]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A2E] mb-2">Typical flow</label>
                  <div className="space-y-1">
                    {['light','medium','heavy','varies'].map(v => (
                      <button key={v} type="button" onClick={() => set('typicalFlow', v)}
                        className={`w-full py-1.5 px-3 rounded-lg border text-xs text-left transition-all ${
                          form.typicalFlow === v ? 'border-[#E8A598] bg-[#FDECEA] text-[#1E1B5E]' : 'border-[#EEECF5] text-[#6B6B8A]'
                        }`}>
                        {v.charAt(0).toUpperCase() + v.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-3">Have you ever been diagnosed with PCOD/PCOS? *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'yes',       label: 'Yes, diagnosed' },
                    { val: 'suspected', label: 'Suspected but unconfirmed' },
                    { val: 'no',        label: 'No' },
                    { val: 'unsure',    label: "Not sure" },
                  ].map(opt => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => set('everDiagnosedPCOD', opt.val)}
                      className={`py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${
                        form.everDiagnosedPCOD === opt.val
                          ? 'border-[#7EC8A4] bg-[#E8F5EF] text-[#1E1B5E]'
                          : 'border-[#EEECF5] text-[#6B6B8A] hover:border-[#7EC8A4]/50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── STEP 3: Daily Habits ── */}
          {step === 3 && (
            <>
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-2 flex items-center gap-2">
                  <Moon size={14} className="text-[#7EC8A4]" />
                  Average sleep: <span className="text-[#7EC8A4] ml-1">{form.avgSleepHours} hrs/night</span>
                </label>
                <input type="range" min="4" max="12" step="0.5"
                  value={form.avgSleepHours}
                  onChange={e => set('avgSleepHours', parseFloat(e.target.value))}
                  className="w-full accent-[#7EC8A4]"
                />
                <div className="flex justify-between text-xs text-[#6B6B8A] mt-1">
                  <span>4 hrs</span><span>8 hrs (ideal)</span><span>12 hrs</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-3">Sleep quality</label>
                <div className="flex gap-2">
                  {[
                    { val: 'poor',      label: '😴 Poor' },
                    { val: 'okay',      label: '😐 Okay' },
                    { val: 'good',      label: '😊 Good' },
                    { val: 'excellent', label: '✨ Excellent' },
                  ].map(opt => (
                    <button key={opt.val} type="button" onClick={() => set('sleepQuality', opt.val)}
                      className={`flex-1 py-2 px-2 rounded-xl border text-xs font-medium transition-all ${
                        form.sleepQuality === opt.val
                          ? 'border-[#7EC8A4] bg-[#E8F5EF] text-[#1E1B5E]'
                          : 'border-[#EEECF5] text-[#6B6B8A]'
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-2 flex items-center gap-2">
                  <Flame size={14} className="text-[#E8A598]" />
                  Typical stress level: <span className="text-[#E8A598] ml-1">{form.avgStressLevel}/10</span>
                </label>
                <input type="range" min="1" max="10" step="1"
                  value={form.avgStressLevel}
                  onChange={e => set('avgStressLevel', parseInt(e.target.value))}
                  className="w-full accent-[#E8A598]"
                />
                <div className="flex justify-between text-xs text-[#6B6B8A] mt-1">
                  <span>1 – Very calm</span><span>10 – Very stressed</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-2 flex items-center gap-2">
                  <Droplet size={14} className="text-[#7EC8A4]" />
                  Daily water intake: <span className="text-[#7EC8A4] ml-1">{form.avgWaterIntake} glasses</span>
                </label>
                <input type="range" min="1" max="15" step="1"
                  value={form.avgWaterIntake}
                  onChange={e => set('avgWaterIntake', parseInt(e.target.value))}
                  className="w-full accent-[#7EC8A4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A2E] mb-2 flex items-center gap-2">
                    <Activity size={14} className="text-[#7EC8A4]" /> Exercise / week
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { val: 'none', label: 'None' },
                      { val: '1-2',  label: '1–2 times' },
                      { val: '2-3',  label: '2–3 times' },
                      { val: '4-5',  label: '4–5 times' },
                      { val: 'daily',label: 'Daily' },
                    ].map(opt => (
                      <button key={opt.val} type="button" onClick={() => set('exerciseFrequency', opt.val)}
                        className={`w-full py-1.5 px-3 rounded-lg border text-xs text-left transition-all ${
                          form.exerciseFrequency === opt.val
                            ? 'border-[#7EC8A4] bg-[#E8F5EF] text-[#1E1B5E] font-medium'
                            : 'border-[#EEECF5] text-[#6B6B8A]'
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A1A2E] mb-2 flex items-center gap-2">
                    <Apple size={14} className="text-[#7EC8A4]" /> Sugar intake
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { val: 'low',    label: 'Low — I avoid sugar' },
                      { val: 'medium', label: 'Medium — occasionally' },
                      { val: 'high',   label: 'High — most days' },
                    ].map(opt => (
                      <button key={opt.val} type="button" onClick={() => set('sugarIntake', opt.val)}
                        className={`w-full py-1.5 px-3 rounded-lg border text-xs text-left transition-all ${
                          form.sugarIntake === opt.val
                            ? 'border-[#E8A598] bg-[#FDECEA] text-[#1E1B5E] font-medium'
                            : 'border-[#EEECF5] text-[#6B6B8A]'
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── STEP 4: PCOD Symptoms ── */}
          {step === 4 && (
            <>
              <p className="text-sm text-[#6B6B8A]">
                Select all symptoms you commonly experience. This helps us calculate your baseline PCOD risk score accurately.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SYMPTOM_OPTIONS.map(({ key, label, icon }) => {
                  const selected = form.symptoms.includes(key)
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleSymptom(key)}
                      className={`flex items-center gap-2 py-2.5 px-3 rounded-xl border text-sm text-left transition-all ${
                        selected
                          ? 'border-[#7EC8A4] bg-[#E8F5EF] text-[#1E1B5E] font-medium'
                          : 'border-[#EEECF5] text-[#6B6B8A] hover:border-[#7EC8A4]/50'
                      } ${key === 'none' ? 'col-span-2' : ''}`}
                    >
                      <span className="text-base">{icon}</span>
                      <span className="flex-1">{label}</span>
                      {selected && <Check size={14} className="text-[#7EC8A4] flex-shrink-0" />}
                    </button>
                  )
                })}
              </div>

              {form.symptoms.length > 0 && !form.symptoms.includes('none') && (
                <div className="bg-[#E8F5EF] rounded-xl p-3 text-sm text-[#1E1B5E]">
                  <span className="font-medium">{form.symptoms.length} symptom{form.symptoms.length > 1 ? 's' : ''} selected.</span>
                  {' '}We'll factor these into your personalised risk score.
                </div>
              )}
            </>
          )}

          {/* ── STEP 5: Health Baseline ── */}
          {step === 5 && (
            <>
              <p className="text-sm text-[#6B6B8A]">
                Tell us about your recent two weeks. This seeds your first trend charts.
              </p>

              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-3">
                  How has your <span className="text-[#1E1B5E]">mood</span> been lately?
                </label>
                <div className="flex gap-2">
                  {MOOD_OPTIONS.map(m => (
                    <button key={m} type="button" onClick={() => set('recentMoodTrend', m.toLowerCase())}
                      className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all ${
                        form.recentMoodTrend === m.toLowerCase()
                          ? 'border-[#7EC8A4] bg-[#E8F5EF] text-[#1E1B5E]'
                          : 'border-[#EEECF5] text-[#6B6B8A]'
                      }`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-3">
                  Recent <span className="text-[#7EC8A4]">sleep</span> trend
                </label>
                <div className="flex gap-2">
                  {[
                    { val: 'declining', label: '📉 Getting worse' },
                    { val: 'stable',    label: '➡️ Stable' },
                    { val: 'improving', label: '📈 Improving' },
                  ].map(opt => (
                    <button key={opt.val} type="button" onClick={() => set('recentSleepTrend', opt.val)}
                      className={`flex-1 py-2 px-2 rounded-xl border text-xs font-medium transition-all ${
                        form.recentSleepTrend === opt.val
                          ? 'border-[#7EC8A4] bg-[#E8F5EF] text-[#1E1B5E]'
                          : 'border-[#EEECF5] text-[#6B6B8A]'
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-3">
                  Recent <span className="text-[#E8A598]">stress</span> trend
                </label>
                <div className="flex gap-2">
                  {[
                    { val: 'declining', label: '📉 More stressed' },
                    { val: 'stable',    label: '➡️ Stable' },
                    { val: 'improving', label: '📈 Less stressed' },
                  ].map(opt => (
                    <button key={opt.val} type="button" onClick={() => set('recentStressTrend', opt.val)}
                      className={`flex-1 py-2 px-2 rounded-xl border text-xs font-medium transition-all ${
                        form.recentStressTrend === opt.val
                          ? 'border-[#E8A598] bg-[#FDECEA] text-[#1E1B5E]'
                          : 'border-[#EEECF5] text-[#6B6B8A]'
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-r from-[#EDE9F8] to-[#E8F5EF] rounded-xl p-4 mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-[#7EC8A4]" />
                  <span className="text-sm font-semibold text-[#1E1B5E]">You're all set!</span>
                </div>
                <p className="text-xs text-[#6B6B8A]">
                  We'll use your answers to generate a personalised hormonal health score, predict your next cycle, and surface insights specific to you.
                </p>
              </div>
            </>
          )}

          {/* ── Navigation buttons ── */}
          <div className="flex items-center justify-between pt-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={back}
                className="flex items-center gap-1.5 text-sm font-medium text-[#6B6B8A] hover:text-[#1E1B5E] transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={next}
              disabled={loading}
              className="flex items-center gap-2 bg-[#7EC8A4] text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-[#6ab890] transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : step === STEPS.length ? (
                <>Go to Dashboard <Sparkles size={15} /></>
              ) : (
                <>Next <ChevronRight size={15} /></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Skip link */}
      <button
        onClick={() => navigate('/dashboard')}
        className="mt-4 text-xs text-[#6B6B8A] hover:text-[#1E1B5E] underline"
      >
        Skip for now
      </button>
    </div>
  )
}
