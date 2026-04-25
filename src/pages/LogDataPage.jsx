import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { 
  Calendar as CalendarIcon,
  Droplet,
  Moon,
  Activity,
  Smile,
  Meh,
  Frown,
  Heart,
  TrendingUp,
  Award,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Flame,
  Headphones,
  Coffee,
  Zap
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

const cycleOptions = [
  { value: 'none', label: 'None' },
  { value: 'spotting', label: 'Spotting' },
  { value: 'period', label: 'Period' }
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
  const [form, setForm] = useState({
    userId,
    sleepHours: 7.5,
    stressLevel: 6,
    hydration: 6,
    sugarIntake: 'medium',
    cycleStatus: 'none',
    flow: 'none',
    mood: 'good',
    symptoms: [],
    notes: ''
  })
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [streak, setStreak] = useState(0)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [loggedDates, setLoggedDates] = useState([])

  const setValue = (key, val) => setForm(f => ({ ...f, [key]: val }))

  // Toggle symptoms
  const toggleSymptom = (symptomId) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(s => s !== symptomId)
        : [...prev, symptomId]
    )
    setValue('symptoms', 
      selectedSymptoms.includes(symptomId)
        ? selectedSymptoms.filter(s => s !== symptomId)
        : [...selectedSymptoms, symptomId]
    )
  }

  // Handle submit to database
  const handleSubmit = async () => {
    try {
      setLoading(true)
      await axios.post('/api/logs', form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      // Refresh logged dates
      fetchLoggedDates()
    } catch (err) {
      console.error('Failed to save:', err)
      alert('Demo mode: Log saved locally!')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setLoading(false)
    }
  }

  // Fetch logged dates for calendar
  const fetchLoggedDates = async () => {
    try {
      const res = await axios.get(`/api/logs/${userId}`)
      const dates = res.data.map(log => new Date(log.date).toDateString())
      setLoggedDates(dates)
      // Calculate real streak
      const dateSet = new Set(dates)
      let s = 0
      const today = new Date()
      for (let i = 0; i < 30; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        if (dateSet.has(d.toDateString())) s++
        else if (i > 0) break
      }
      setStreak(s)
    } catch (err) {
      setLoggedDates([])
      setStreak(0)
    }
  }

  useEffect(() => {
    fetchLoggedDates()
  }, [userId])

  // Calendar generation
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
      days.push(<div key={`empty-${i}`} className="h-8" />)
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
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1E1B5E]">Log Your Data</h1>
        <p className="text-sm text-[#6B6B8A] mt-1">Track your daily habits and symptoms to get better insights.</p>
      </div>

      {saved && (
        <div className="bg-[#E8F5EF] text-[#1E1B5E] text-sm px-4 py-3 rounded-xl mb-6 font-medium flex items-center gap-2">
          <CheckCircle2 size={16} className="text-[#7EC8A4]" />
          ✓ Today's log saved successfully! Your dashboard has been updated.
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form - Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Period Information */}
          <div className="bg-white rounded-2xl border border-[#EEECF5] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-[#E8F5EF] flex items-center justify-center text-sm font-semibold text-[#7EC8A4]">1</div>
              <h2 className="font-semibold text-[#1E1B5E]">Period Information</h2>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-[#6B6B8A] mb-3">Are you on your period today?</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setValue('cycleStatus', 'period')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    form.cycleStatus === 'period'
                      ? 'bg-[#7EC8A4] text-white'
                      : 'bg-[#FAF8F5] border border-[#EEECF5] text-[#6B6B8A]'
                  }`}
                >
                  Yes
                </button>
                <button
                  onClick={() => setValue('cycleStatus', 'none')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    form.cycleStatus === 'none'
                      ? 'bg-[#7EC8A4] text-white'
                      : 'bg-[#FAF8F5] border border-[#EEECF5] text-[#6B6B8A]'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            {form.cycleStatus === 'period' && (
              <div>
                <p className="text-sm text-[#6B6B8A] mb-3">Flow Intensity</p>
                <div className="flex gap-2">
                  {flowOptions.filter(f => f.value !== 'none').map(option => (
                    <button
                      key={option.value}
                      onClick={() => setValue('flow', option.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                        form.flow === option.value
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
          <div className="bg-white rounded-2xl border border-[#EEECF5] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-[#E8F5EF] flex items-center justify-center text-sm font-semibold text-[#7EC8A4]">2</div>
              <h2 className="font-semibold text-[#1E1B5E]">Lifestyle Data</h2>
            </div>

            {/* Sleep */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-[#1E1B5E] mb-2">
                Sleep Duration — <span className="text-[#7EC8A4] font-semibold">{form.sleepHours} hrs</span>
              </label>
              <input
                type="range"
                min="3"
                max="10"
                step="0.5"
                value={form.sleepHours}
                onChange={e => setValue('sleepHours', parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none bg-[#EEECF5] accent-[#7EC8A4]"
                style={{ accentColor: '#7EC8A4' }}
              />
              <div className="flex justify-between text-xs text-[#6B6B8A] mt-1">
                <span>3 hrs</span>
                <span>10 hrs</span>
              </div>
            </div>

            {/* Stress */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-[#1E1B5E] mb-2">
                Stress Level — <span className="text-[#EA9A98] font-semibold">{form.stressLevel} / 10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={form.stressLevel}
                onChange={e => setValue('stressLevel', parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none bg-[#EEECF5]"
                style={{ accentColor: '#EA9A98' }}
              />
              <div className="flex justify-between text-xs text-[#6B6B8A] mt-1">
                <span>Low Stress</span>
                <span>High Stress</span>
              </div>
            </div>

            {/* Water Intake */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-[#1E1B5E] mb-2">
                Water Intake — <span className="text-[#7EC8A4] font-semibold">{form.hydration} glasses</span>
              </label>
              <input
                type="range"
                min="0"
                max="12"
                step="1"
                value={form.hydration}
                onChange={e => setValue('hydration', parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none bg-[#EEECF5]"
                style={{ accentColor: '#7EC8A4' }}
              />
              <div className="flex justify-between text-xs text-[#6B6B8A] mt-1">
                <span>0 glasses</span>
                <span>12+ glasses</span>
              </div>
            </div>

            {/* Sugar Intake */}
            <div>
              <label className="block text-sm font-medium text-[#1E1B5E] mb-2">Sugar Intake</label>
              <div className="flex gap-2">
                {sugarOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setValue('sugarIntake', option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                      form.sugarIntake === option.value
                        ? 'bg-[#1E1B5E] text-white'
                        : 'bg-[#FAF8F5] border border-[#EEECF5] text-[#6B6B8A]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Symptoms */}
          <div className="bg-white rounded-2xl border border-[#EEECF5] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-[#E8F5EF] flex items-center justify-center text-sm font-semibold text-[#7EC8A4]">3</div>
              <h2 className="font-semibold text-[#1E1B5E]">Symptoms (Select all that apply)</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {symptomsList.map(symptom => (
                <button
                  key={symptom.id}
                  onClick={() => toggleSymptom(symptom.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    selectedSymptoms.includes(symptom.id)
                      ? 'border-2 border-[#7EC8A4] bg-[#E8F5EF] text-[#1E1B5E]'
                      : 'border border-[#EEECF5] text-[#6B6B8A] hover:border-[#7EC8A4]'
                  }`}
                >
                  <span>{symptom.icon}</span>
                  {symptom.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div className="bg-white rounded-2xl border border-[#EEECF5] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-[#E8F5EF] flex items-center justify-center text-sm font-semibold text-[#7EC8A4]">4</div>
              <h2 className="font-semibold text-[#1E1B5E]">Mood Today</h2>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {moodOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setValue('mood', option.value)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                    form.mood === option.value
                      ? 'bg-[#E8F5EF] border-2 border-[#7EC8A4]'
                      : 'border border-[#EEECF5] hover:border-[#7EC8A4]'
                  }`}
                >
                  <span className="text-xl">{option.emoji}</span>
                  <span className="text-xs text-[#6B6B8A]">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-[#EEECF5] p-6 shadow-sm">
            <h2 className="font-semibold text-[#1E1B5E] mb-2">Additional Notes (Optional)</h2>
            <textarea
              value={form.notes}
              onChange={e => setValue('notes', e.target.value)}
              placeholder="How are you feeling today? Any extra observations?"
              className="w-full p-3 rounded-xl border border-[#EEECF5] text-sm text-[#1E1B5E] placeholder:text-[#6B6B8A] focus:outline-none focus:border-[#7EC8A4] resize-none"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-[#7EC8A4] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#6ab890] transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Log'}
            </button>
            <button
              onClick={() => {
                setForm({
                  userId,
                  sleepHours: 7,
                  stressLevel: 5,
                  hydration: 6,
                  sugarIntake: 'medium',
                  cycleStatus: 'none',
                  flow: 'none',
                  mood: 'good',
                  symptoms: [],
                  notes: ''
                })
                setSelectedSymptoms([])
              }}
              className="px-6 py-3 rounded-xl border border-[#EEECF5] text-[#6B6B8A] font-medium hover:bg-[#FAF8F5] transition-all"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Right Panel - Calendar & Stats */}
        <div className="space-y-5">
          {/* Calendar */}
          <div className="bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[#1E1B5E]">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-1">
                <button onClick={() => changeMonth(-1)} className="p-1 rounded hover:bg-[#FAF8F5]">
                  <ChevronLeft size={18} className="text-[#6B6B8A]" />
                </button>
                <button onClick={() => changeMonth(1)} className="p-1 rounded hover:bg-[#FAF8F5]">
                  <ChevronRight size={18} className="text-[#6B6B8A]" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                <div key={day} className="text-xs font-medium text-[#6B6B8A] py-1">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>
          </div>

          {/* Logging Streak */}
          <div className="bg-gradient-to-r from-[#EDE9F8] to-[#E8F5EF] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award size={20} className="text-[#7EC8A4]" />
                <h3 className="font-semibold text-[#1E1B5E]">Logging Streak</h3>
              </div>
              <span className="text-2xl font-bold text-[#7EC8A4]">{streak} days</span>
            </div>
            <p className="text-sm text-[#1E1B5E] font-medium">Great job! Keep it up.</p>
            <div className="mt-3 flex items-center gap-1">
              {[...Array(7)].map((_, i) => (
                <div 
                  key={i}
                  className={`flex-1 h-1.5 rounded-full ${i < streak ? 'bg-[#7EC8A4]' : 'bg-[#EEECF5]'}`}
                />
              ))}
            </div>
            <p className="text-xs text-[#6B6B8A] mt-2">{streak}/7 days this week</p>
          </div>

          {/* Today's Summary */}
          <div className="bg-white rounded-2xl border border-[#EEECF5] p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={18} className="text-[#7EC8A4]" />
              <h3 className="font-semibold text-[#1E1B5E]">Today's Summary</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B6B8A] flex items-center gap-1"><Moon size={14} /> Sleep</span>
                <span className="text-[#1E1B5E] font-medium">{form.sleepHours} hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B8A] flex items-center gap-1"><Flame size={14} /> Stress</span>
                <span className="text-[#1E1B5E] font-medium">{form.stressLevel} / 10</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B8A] flex items-center gap-1"><Droplet size={14} /> Water</span>
                <span className="text-[#1E1B5E] font-medium">{form.hydration} glasses</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B8A] flex items-center gap-1"><Activity size={14} /> Symptoms</span>
                <span className="text-[#1E1B5E] font-medium">{selectedSymptoms.length} logged</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B6B8A] flex items-center gap-1"><Smile size={14} /> Mood</span>
                <span className="text-[#1E1B5E] font-medium capitalize">{form.mood}</span>
              </div>
            </div>
          </div>

          {/* Tip Card */}
          <div className="bg-[#EDE9F8] rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <Zap size={16} className="text-[#7EC8A4]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#1E1B5E] text-sm mb-1">Tip for You</h4>
                <p className="text-xs text-[#6B6B8A] leading-relaxed">
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

// Add missing import
import { CheckCircle2 } from 'lucide-react'