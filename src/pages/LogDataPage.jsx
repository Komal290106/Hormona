import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import {
  Droplet, Moon, Activity, Smile, Award, Clock,
  CircleAlert as AlertCircle, ChevronLeft, ChevronRight,
  Flame, Zap, CircleCheck as CheckCircle2, Info
} from 'lucide-react'

const moodOptions = [
  { value: 'great', label: 'Very Happy', color: '#7EC8A4' },
  { value: 'good', label: 'Happy', color: '#A8D5BA' },
  { value: 'okay', label: 'Neutral', color: '#F0C060' },
  { value: 'low', label: 'Sad', color: '#EA9A98' },
  { value: 'bad', label: 'Very Sad', color: '#D4847A' },
]

const sugarOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const symptomsList = [
  { id: 'acne', label: 'Acne' },
  { id: 'bloating', label: 'Bloating' },
  { id: 'fatigue', label: 'Fatigue' },
  { id: 'headache', label: 'Headache' },
  { id: 'moodSwings', label: 'Mood Swings' },
  { id: 'cramps', label: 'Cramps' },
  { id: 'none', label: 'None' },
]

// Demo placeholder — log page is disabled in demo mode
function DemoBanner({ onSignUp }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1E1B5E]">Log Your Data</h1>
        <p className="text-sm text-[#6B6B8A] mt-1">Track your daily habits and symptoms to get better insights.</p>
      </div>
      <div className="bg-white rounded-2xl border border-[#EEECF5] p-10 shadow-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#E8F5EF] flex items-center justify-center mx-auto mb-4">
          <Info size={26} className="text-[#7EC8A4]" />
        </div>
        <h2 className="text-lg font-bold text-[#1E1B5E] mb-2">Demo Mode</h2>
        <p className="text-sm text-[#6B6B8A] max-w-sm mx-auto mb-6">
          You're viewing Anaya's demo data. Create your own account to log your daily health data and get personalised insights.
        </p>
        <button
          onClick={onSignUp}
          className="bg-[#7EC8A4] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#6ab890] transition-all"
        >
          Create Free Account
        </button>
      </div>
    </div>
  )
}

const EMPTY_FORM = (userId) => ({
  userId,
  sleepHours: 7,
  stressLevel: 5,
  hydration: 6,
  sugarIntake: '',
  cycleStatus: '',
  flow: 'none',
  mood: '',
  symptoms: [],
  notes: '',
})

export default function LogDataPage() {
  const navigate = useNavigate()
  const isDemoMode = localStorage.getItem('hormonaDemoMode') === 'true'
  const userId = localStorage.getItem('hormonaUserId')

  const [form, setForm] = useState(EMPTY_FORM(userId))
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [saved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)
  const [streak, setStreak] = useState(0)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loggedDates, setLoggedDates] = useState([])

  const setValue = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const toggleSymptom = (symptomId) => {
    if (symptomId === 'none') {
      setSelectedSymptoms(['none'])
      setValue('symptoms', ['none'])
      return
    }
    setSelectedSymptoms(prev => {
      const filtered = prev.filter(s => s !== 'none')
      const next = filtered.includes(symptomId)
        ? filtered.filter(s => s !== symptomId)
        : [...filtered, symptomId]
      setValue('symptoms', next)
      return next
    })
  }

  const validate = () => {
    if (!form.mood) return 'Please select your mood for today.'
    if (!form.sugarIntake) return 'Please select your sugar intake level.'
    return ''
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setSubmitError(err); return }
    setSubmitError('')

    try {
      setLoading(true)
      await api.post('/logs', {
        ...form,
        sugarIntake: form.sugarIntake,
        cycleStatus: form.cycleStatus || 'none',
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 4000)
      fetchLoggedDates()
    } catch (err) {
      console.error('Failed to save log:', err)
      setSubmitError('Unable to save log. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setForm(EMPTY_FORM(userId))
    setSelectedSymptoms([])
    setSubmitError('')
  }

  const fetchLoggedDates = async () => {
    if (!userId) return
    try {
      const res = await api.get(`/logs/${userId}`)
      const dates = res.data.map(log => new Date(log.date).toDateString())
      setLoggedDates(dates)

      const dateSet = new Set(dates)
      const today = new Date()
      let s = 0
      for (let i = 0; i < 60; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        if (dateSet.has(d.toDateString())) s++
        else if (i > 0) break
      }
      setStreak(s)
    } catch {
      setLoggedDates([])
      setStreak(0)
    }
  }

  useEffect(() => {
    if (!isDemoMode) fetchLoggedDates()
  }, [userId, isDemoMode])

  if (isDemoMode) {
    return <DemoBanner onSignUp={() => navigate('/signup')} />
  }

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

  const changeMonth = (delta) => {
    setCurrentMonth(prev => {
      const d = new Date(prev)
      d.setMonth(prev.getMonth() + delta)
      return d
    })
  }

  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const today = new Date().toDateString()

    const days = []
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />)
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const dateString = date.toDateString()
      const isLogged = loggedDates.includes(dateString)
      const isToday = dateString === today
      days.push(
        <div key={d} className="flex flex-col items-center">
          <div className={`w-8 h-8 flex items-center justify-center text-sm rounded-full
            ${isToday ? 'bg-[#7EC8A4] text-white font-semibold' : 'text-[#1E1B5E]'}`}>
            {d}
          </div>
          {isLogged && <div className="w-1 h-1 rounded-full bg-[#7EC8A4] mt-0.5" />}
        </div>
      )
    }
    return days
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E1B5E]">Log Your Data</h1>
        <p className="text-sm text-[#6B6B8A] mt-1">Track your daily habits and symptoms to get better insights.</p>
      </div>

      {saved && (
        <div className="bg-[#E8F5EF] text-[#1E1B5E] text-sm px-4 py-3 rounded-xl mb-6 font-medium flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#7EC8A4]" />
          Today's log saved! Your insights will update shortly.
        </div>
      )}

      {submitError && (
        <div className="bg-[#FDECEA] text-[#E8A598] text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
          <AlertCircle size={16} />
          {submitError}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* 1. Period Information */}
          <div className="bg-white rounded-xl border border-[#EEECF5] p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-[#E8F5EF] flex items-center justify-center text-xs font-semibold text-[#7EC8A4]">1</div>
              <h2 className="font-semibold text-[#1E1B5E] text-sm">Period Information</h2>
            </div>

            <div className="flex items-center gap-6 mb-3">
              <p className="text-sm text-[#6B6B8A]">Are you on your period today?</p>
              <div className="flex gap-3">
                {[{ val: 'period', label: 'Yes' }, { val: 'none', label: 'No' }].map(({ val, label }) => (
                  <button
                    key={val}
                    onClick={() => setValue('cycleStatus', val)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${form.cycleStatus === val
                      ? 'bg-[#7EC8A4] text-white'
                      : 'bg-[#FAF8F5] border border-[#EEECF5] text-[#6B6B8A] hover:border-[#7EC8A4]/50'
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {form.cycleStatus === 'period' && (
              <div className="flex items-center gap-4">
                <p className="text-sm text-[#6B6B8A]">Flow Intensity</p>
                <div className="flex gap-2">
                  {['light', 'medium', 'heavy'].map(v => (
                    <button
                      key={v}
                      onClick={() => setValue('flow', v)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${form.flow === v
                        ? 'bg-[#EA9A98] text-white'
                        : 'bg-[#FAF8F5] border border-[#EEECF5] text-[#6B6B8A]'
                        }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Lifestyle Data */}
          <div className="bg-white rounded-xl border border-[#EEECF5] p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-[#E8F5EF] flex items-center justify-center text-xs font-semibold text-[#7EC8A4]">2</div>
              <h2 className="font-semibold text-[#1E1B5E] text-sm">Lifestyle Data</h2>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#1E1B5E] mb-1">
                  Sleep — <span className="text-[#7EC8A4] font-semibold">{form.sleepHours} hrs</span>
                </label>
                <input
                  type="range" min="3" max="10" step="0.5"
                  value={form.sleepHours}
                  onChange={e => setValue('sleepHours', parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none bg-[#EEECF5]"
                  style={{ accentColor: '#7EC8A4' }}
                />
                <div className="flex justify-between text-[10px] text-[#6B6B8A] mt-0.5">
                  <span>3 hrs</span><span>10 hrs</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1E1B5E] mb-1">
                  Stress — <span className="text-[#EA9A98] font-semibold">{form.stressLevel} / 10</span>
                </label>
                <input
                  type="range" min="1" max="10" step="1"
                  value={form.stressLevel}
                  onChange={e => setValue('stressLevel', parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none bg-[#EEECF5]"
                  style={{ accentColor: '#EA9A98' }}
                />
                <div className="flex justify-between text-[10px] text-[#6B6B8A] mt-0.5">
                  <span>Low</span><span>High</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1E1B5E] mb-1">
                  Water — <span className="text-[#7EC8A4] font-semibold">{form.hydration} glasses</span>
                </label>
                <input
                  type="range" min="0" max="12" step="1"
                  value={form.hydration}
                  onChange={e => setValue('hydration', parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none bg-[#EEECF5]"
                  style={{ accentColor: '#7EC8A4' }}
                />
                <div className="flex justify-between text-[10px] text-[#6B6B8A] mt-0.5">
                  <span>0</span><span>12+</span>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-medium text-[#1E1B5E] mb-1">
                Sugar Intake <span className="text-[#EA9A98]">*</span>
              </label>
              <div className="flex gap-2">
                {sugarOptions.map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setValue('sugarIntake', value)}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${form.sugarIntake === value
                      ? 'bg-[#1E1B5E] text-white'
                      : 'bg-[#FAF8F5] border border-[#EEECF5] text-[#6B6B8A] hover:border-[#1E1B5E]/40'
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Symptoms */}
          <div className="bg-white rounded-xl border border-[#EEECF5] p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-[#E8F5EF] flex items-center justify-center text-xs font-semibold text-[#7EC8A4]">3</div>
              <h2 className="font-semibold text-[#1E1B5E] text-sm">Symptoms (Select all that apply)</h2>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {symptomsList.map(symptom => (
                <button
                  key={symptom.id}
                  onClick={() => toggleSymptom(symptom.id)}
                  className={`flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-all ${selectedSymptoms.includes(symptom.id)
                    ? 'border-2 border-[#7EC8A4] bg-[#E8F5EF] text-[#1E1B5E]'
                    : 'border border-[#EEECF5] text-[#6B6B8A] hover:border-[#7EC8A4]'
                    }`}
                >
                  {symptom.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Mood & Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-[#EEECF5] p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-[#E8F5EF] flex items-center justify-center text-xs font-semibold text-[#7EC8A4]">4</div>
                <h2 className="font-semibold text-[#1E1B5E] text-sm">
                  Mood Today <span className="text-[#EA9A98]">*</span>
                </h2>
              </div>
              <div className="flex flex-wrap gap-1">
                {moodOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setValue('mood', option.value)}
                    className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all flex-1 ${form.mood === option.value
                      ? 'bg-[#E8F5EF] border border-[#7EC8A4]'
                      : 'border border-[#EEECF5] hover:border-[#7EC8A4]'
                      }`}
                  >
                    <span className="text-sm font-medium" style={{ color: option.color }}>
                      {option.label.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#EEECF5] p-4 shadow-sm">
              <h2 className="font-semibold text-[#1E1B5E] text-sm mb-1">Additional Notes</h2>
              <textarea
                value={form.notes}
                onChange={e => setValue('notes', e.target.value)}
                placeholder="How are you feeling today?"
                className="w-full p-2 rounded-lg border border-[#EEECF5] text-sm text-[#1E1B5E] placeholder:text-[#6B6B8A] focus:outline-none focus:border-[#7EC8A4] resize-none"
                rows={3}
                maxLength={500}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-[#7EC8A4] text-white font-semibold py-2.5 rounded-xl hover:bg-[#6ab890] transition-all disabled:opacity-50 text-sm"
            >
              {loading ? 'Saving...' : 'Save Log'}
            </button>
            <button
              onClick={handleClear}
              className="px-6 py-2.5 rounded-xl border border-[#EEECF5] text-[#6B6B8A] font-medium hover:bg-[#FAF8F5] transition-all text-sm"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Calendar */}
          <div className="bg-white rounded-xl border border-[#EEECF5] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[#1E1B5E] text-sm">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-1">
                <button onClick={() => changeMonth(-1)} className="p-1 rounded hover:bg-[#FAF8F5]">
                  <ChevronLeft size={14} className="text-[#6B6B8A]" />
                </button>
                <button onClick={() => changeMonth(1)} className="p-1 rounded hover:bg-[#FAF8F5]">
                  <ChevronRight size={14} className="text-[#6B6B8A]" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-center mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                <div key={i} className="text-[10px] font-medium text-[#6B6B8A] py-1">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {renderCalendar()}
            </div>
          </div>

          {/* Streak */}
          <div className="bg-[#EEF7F2] rounded-xl p-4 border border-[#C8E9D8]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-[#7EC8A4]" />
                <h3 className="font-semibold text-[#1E1B5E] text-sm">Logging Streak</h3>
              </div>
              <span className="text-xl font-bold text-[#7EC8A4]">
                {streak > 0 ? `${streak}d` : '—'}
              </span>
            </div>
            {streak > 0 ? (
              <>
                <p className="text-xs text-[#1E1B5E] font-medium">
                  {streak >= 7 ? 'Excellent consistency!' : 'Great job! Keep logging daily.'}
                </p>
                <div className="mt-2 flex items-center gap-1">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded-full"
                      style={{ backgroundColor: i < Math.min(streak, 7) ? '#7EC8A4' : '#EEECF5' }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-[#6B6B8A]">Log today to start your streak!</p>
            )}
          </div>

          {/* Today's Preview */}
          <div className="bg-white rounded-xl border border-[#EEECF5] p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-[#7EC8A4]" />
              <h3 className="font-semibold text-[#1E1B5E] text-sm">Today's Entry Preview</h3>
            </div>
            <div className="space-y-1.5 text-sm">
              {[
                { icon: Moon, label: 'Sleep', value: `${form.sleepHours} hrs` },
                { icon: Flame, label: 'Stress', value: `${form.stressLevel} / 10` },
                { icon: Droplet, label: 'Water', value: `${form.hydration} glasses` },
                { icon: Activity, label: 'Symptoms', value: `${selectedSymptoms.filter(s => s !== 'none').length} logged` },
                { icon: Smile, label: 'Mood', value: form.mood || '—' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-[#6B6B8A] text-xs flex items-center gap-1">
                    <Icon size={12} /> {label}
                  </span>
                  <span className="text-[#1E1B5E] text-xs font-medium capitalize">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div className="bg-[#EDE9F8] rounded-xl p-4">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                <Zap size={14} className="text-[#7EC8A4]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#1E1B5E] text-xs mb-0.5">Tip for You</h4>
                <p className="text-[10px] text-[#6B6B8A] leading-relaxed">
                  A consistent sleep routine can help regulate hormones and improve your cycle health.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
