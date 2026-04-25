import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Droplet,
  Moon,
  Activity,
  Smile,
  Award,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Flame,
  Zap,
  CheckCircle2
} from 'lucide-react'

const moodOptions = [
  { value: 'great', label: 'Very Happy', emoji: '😊', color: '#7EC8A4' },
  { value: 'good', label: 'Happy', emoji: '🙂', color: '#A8D5BA' },
  { value: 'okay', label: 'Neutral', emoji: '😐', color: '#F0C060' },
  { value: 'low', label: 'Sad', emoji: '😔', color: '#EA9A98' },
  { value: 'bad', label: 'Very Sad', emoji: '😢', color: '#D4847A' }
]

const flowOptions = [
  { value: 'none', label: 'None' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' }
]

const sugarOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
]

const symptomsList = [
  { id: 'acne', label: 'Acne', icon: '🔴' },
  { id: 'bloating', label: 'Bloating', icon: '🎈' },
  { id: 'fatigue', label: 'Fatigue', icon: '😴' },
  { id: 'headache', label: 'Headache', icon: '🤕' },
  { id: 'moodSwings', label: 'Mood Swings', icon: '🎭' },
  { id: 'cramps', label: 'Cramps', icon: '⚡' },
  { id: 'none', label: 'None', icon: '✓' }
]

export default function LogDataPage() {
  const navigate = useNavigate()
  const userId = localStorage.getItem('hormonaUserId')

  // All defaults are neutral — nothing pre-selected for opinion-based fields
  const [form, setForm] = useState({
    userId,
    sleepHours: 6.5,     // neutral midpoint on the 3–10 scale
    stressLevel: 5,      // neutral midpoint on the 1–10 scale
    hydration: 6,        // midpoint
    sugarIntake: '',     // empty → no button highlighted until user taps
    cycleStatus: '',     // empty → neither Yes nor No pre-selected
    flow: 'none',
    mood: '',            // empty → no mood emoji highlighted
    symptoms: [],
    notes: ''
  })
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [saved, setSaved] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [loading, setLoading] = useState(false)
  const [streak, setStreak] = useState(0)           // real streak, default 0
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loggedDates, setLoggedDates] = useState([]) // real dates from API

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

  // Validate before submitting — mood and sugarIntake must be chosen
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
      await axios.post('/api/logs', {
        ...form,
        sugarIntake: form.sugarIntake || 'medium',
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

  const fetchLoggedDates = async () => {
    if (!userId) return
    try {
      const res = await axios.get(`/api/logs/${userId}`)
      const dates = res.data.map(log => new Date(log.date).toDateString())
      setLoggedDates(dates)

      // Calculate real streak from consecutive days ending today
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
      // API failed — show empty calendar, streak stays 0
      setLoggedDates([])
      setStreak(0)
    }
  }

  useEffect(() => {
    fetchLoggedDates()
  }, [userId])

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

  const changeMonth = (delta) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + delta)
      return newDate
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
          <div className={`
            w-8 h-8 flex items-center justify-center text-sm rounded-full
            ${isToday ? 'bg-[#7EC8A4] text-white font-semibold' : 'text-[#1E1B5E]'}
          `}>
            {d}
          </div>
          {isLogged && <div className="w-1 h-1 rounded-full bg-[#7EC8A4] mt-0.5" />}
        </div>
      )
    }
    return days
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1E1B5E]">Log Your Data</h1>
        <p className="text-sm text-[#6B6B8A] mt-1">Track your daily habits and symptoms to get better insights.</p>
      </div>

      {/* Success banner */}
      {saved && (
        <div className="bg-[#E8F5EF] text-[#1E1B5E] text-sm px-4 py-3 rounded-xl mb-6 font-medium flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#7EC8A4]" />
          Today's log saved successfully! Your insights will update shortly.
        </div>
      )}

      {/* Submit error */}
      {submitError && (
        <div className="bg-[#FDECEA] text-[#E8A598] text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
          <AlertCircle size={16} />
          {submitError}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Main Form - Left Column (2/3 width) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Period Information Row */}
          <div className="bg-white rounded-xl border border-[#EEECF5] p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-[#E8F5EF] flex items-center justify-center text-xs font-semibold text-[#7EC8A4]">1</div>
              <h2 className="font-semibold text-[#1E1B5E] text-sm">Period Information</h2>
            </div>

            <div className="flex items-center gap-6 mb-3">
              <p className="text-sm text-[#6B6B8A]">Are you on your period today?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setValue('cycleStatus', 'period')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${form.cycleStatus === 'period'
                    ? 'bg-[#7EC8A4] text-white'
                    : 'bg-[#FAF8F5] border border-[#EEECF5] text-[#6B6B8A]'
                    }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setValue('cycleStatus', 'none')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${form.cycleStatus === 'none'
                    ? 'bg-[#7EC8A4] text-white'
                    : 'bg-[#FAF8F5] border border-[#EEECF5] text-[#6B6B8A]'
                    }`}
                >
                  No
                </button>
              </div>
            </div>
            {/* No pre-selection — both buttons appear unselected on first load */}

            {form.cycleStatus === 'period' && (
              <div className="flex items-center gap-4">
                <p className="text-sm text-[#6B6B8A]">Flow Intensity</p>
                <div className="flex gap-2">
                  {flowOptions.filter(f => f.value !== 'none').map(option => (
                    <button
                      key={option.value}
                      onClick={() => setValue('flow', option.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${form.flow === option.value
                        ? 'bg-[#EA9A98] text-white'
                        : 'bg-[#FAF8F5] border border-[#EEECF5] text-[#6B6B8A]'
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Lifestyle Data */}
          <div className="bg-white rounded-xl border border-[#EEECF5] p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-[#E8F5EF] flex items-center justify-center text-xs font-semibold text-[#7EC8A4]">2</div>
              <h2 className="font-semibold text-[#1E1B5E] text-sm">Lifestyle Data</h2>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Sleep */}
              <div>
                <label className="block text-xs font-medium text-[#1E1B5E] mb-1">
                  Sleep Duration — <span className="text-[#7EC8A4] font-semibold">{form.sleepHours} hrs</span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  step="0.5"
                  value={form.sleepHours}
                  onChange={e => setValue('sleepHours', parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none bg-[#EEECF5]"
                  style={{ accentColor: '#7EC8A4' }}
                />
                <div className="flex justify-between text-[10px] text-[#6B6B8A] mt-0.5">
                  <span>3 hrs</span>
                  <span>10 hrs</span>
                </div>
              </div>

              {/* Stress */}
              <div>
                <label className="block text-xs font-medium text-[#1E1B5E] mb-1">
                  Stress Level — <span className="text-[#EA9A98] font-semibold">{form.stressLevel} / 10</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={form.stressLevel}
                  onChange={e => setValue('stressLevel', parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none bg-[#EEECF5]"
                  style={{ accentColor: '#EA9A98' }}
                />
                <div className="flex justify-between text-[10px] text-[#6B6B8A] mt-0.5">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>

              {/* Water Intake */}
              <div>
                <label className="block text-xs font-medium text-[#1E1B5E] mb-1">
                  Water Intake — <span className="text-[#7EC8A4] font-semibold">{form.hydration} glasses</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="1"
                  value={form.hydration}
                  onChange={e => setValue('hydration', parseInt(e.target.value))}
                  className="w-full h-1.5 rounded-lg appearance-none bg-[#EEECF5]"
                  style={{ accentColor: '#7EC8A4' }}
                />
                <div className="flex justify-between text-[10px] text-[#6B6B8A] mt-0.5">
                  <span>0</span>
                  <span>12+</span>
                </div>
              </div>
            </div>

            {/* Sugar Intake — required, starts unselected */}
            <div className="mt-3">
              <label className="block text-xs font-medium text-[#1E1B5E] mb-1">
                Sugar Intake <span className="text-[#EA9A98]">*</span>
              </label>
              <div className="flex gap-2">
                {sugarOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setValue('sugarIntake', option.value)}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${form.sugarIntake === option.value
                      ? 'bg-[#1E1B5E] text-white'
                      : 'bg-[#FAF8F5] border border-[#EEECF5] text-[#6B6B8A] hover:border-[#1E1B5E]/40'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Symptoms */}
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
                  <span className="text-sm">{symptom.icon}</span>
                  <span>{symptom.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mood & Notes */}
          <div className="grid grid-cols-2 gap-4">
            {/* Mood — required, starts empty (nothing highlighted) */}
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
                    <span className="text-lg">{option.emoji}</span>
                    <span className="text-[10px] text-[#6B6B8A]">{option.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl border border-[#EEECF5] p-4 shadow-sm">
              <h2 className="font-semibold text-[#1E1B5E] text-sm mb-1">Additional Notes</h2>
              <textarea
                value={form.notes}
                onChange={e => setValue('notes', e.target.value)}
                placeholder="How are you feeling today?"
                className="w-full p-2 rounded-lg border border-[#EEECF5] text-sm text-[#1E1B5E] placeholder:text-[#6B6B8A] focus:outline-none focus:border-[#7EC8A4] resize-none"
                rows={2}
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
              onClick={() => {
                setForm({
                  userId,
                  sleepHours: 6.5,
                  stressLevel: 5,
                  hydration: 6,
                  sugarIntake: '',
                  cycleStatus: '',
                  flow: 'none',
                  mood: '',
                  symptoms: [],
                  notes: ''
                })
                setSelectedSymptoms([])
                setSubmitError('')
              }}
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

          {/* Logging Streak — real data, no fakes */}
          <div className="bg-gradient-to-r from-[#EDE9F8] to-[#E8F5EF] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-[#7EC8A4]" />
                <h3 className="font-semibold text-[#1E1B5E] text-sm">Logging Streak</h3>
              </div>
              <span className="text-xl font-bold text-[#7EC8A4]">
                {streak > 0 ? `${streak} day${streak > 1 ? 's' : ''}` : '—'}
              </span>
            </div>
            {streak > 0 ? (
              <>
                <p className="text-xs text-[#1E1B5E] font-medium">
                  {streak >= 7 ? 'Amazing consistency! Keep it up 🔥' : 'Great job! Keep logging daily.'}
                </p>
                <div className="mt-2 flex items-center gap-1">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 h-1 rounded-full ${i < streak ? 'bg-[#7EC8A4]' : 'bg-[#EEECF5]'}`}
                    />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-xs text-[#6B6B8A]">Log today to start your streak!</p>
            )}
          </div>

          {/* Today's Summary */}
          <div className="bg-white rounded-xl border border-[#EEECF5] p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-[#7EC8A4]" />
              <h3 className="font-semibold text-[#1E1B5E] text-sm">Today's Entry Preview</h3>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B6B8A] text-xs flex items-center gap-1"><Moon size={12} /> Sleep</span>
                <span className="text-[#1E1B5E] text-xs font-medium">{form.sleepHours} hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B8A] text-xs flex items-center gap-1"><Flame size={12} /> Stress</span>
                <span className="text-[#1E1B5E] text-xs font-medium">{form.stressLevel} / 10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B8A] text-xs flex items-center gap-1"><Droplet size={12} /> Water</span>
                <span className="text-[#1E1B5E] text-xs font-medium">{form.hydration} glasses</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B8A] text-xs flex items-center gap-1"><Activity size={12} /> Symptoms</span>
                <span className="text-[#1E1B5E] text-xs font-medium">{selectedSymptoms.filter(s => s !== 'none').length} logged</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B8A] text-xs flex items-center gap-1"><Smile size={12} /> Mood</span>
                <span className="text-[#1E1B5E] text-xs font-medium capitalize">
                  {form.mood ? form.mood : <span className="text-[#EEECF5] italic">not set</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Tip Card */}
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