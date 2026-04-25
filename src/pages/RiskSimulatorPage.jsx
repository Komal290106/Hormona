import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { 
  Moon, 
  Flame, 
  Droplet, 
  TrendingUp, 
  TrendingDown,
  Heart,
  Brain,
  Zap,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Target,
  Activity,
  Calendar,
  Clock,
  Award,
  Sparkles,
  Shield,
  LineChart
} from 'lucide-react'

export default function RiskSimulatorPage() {
  const navigate = useNavigate()
  const userId = localStorage.getItem('hormonaUserId')
  const isDemo = localStorage.getItem('hormonaIsDemo') === 'true'

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
  const [currentRisk, setCurrentRisk]   = useState(null)
  const [simulatedRisk, setSimulatedRisk] = useState(null)
  const [profileLoaded, setProfileLoaded] = useState(false)

  // Prefill "current" sliders from real user profile
  useEffect(() => {
    if (isDemo) {
      setParams({ cycleGapDays: 29, stressLevel: 7, sleepHours: 6.5, sugarIntake: 'high' })
      setProfileLoaded(true)
      return
    }
    axios.get(`/api/users/${userId}`).then(res => {
      const u = res.data
      setParams({
        cycleGapDays: u.avgCycleLength || 28,
        stressLevel:  u.avgStressLevel || 5,
        sleepHours:   u.avgSleepHours  || 7,
        sugarIntake:  u.sugarIntake    || 'medium',
      })
      setProfileLoaded(true)
    }).catch(() => setProfileLoaded(true))
  }, [userId])

  // Calculate risk based on parameters
  const calculateRisk = (sleepHours, stressLevel, sugarIntake, cycleGapDays) => {
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

  const getRiskLevel = (risk) => {
    if (risk > 60) return { label: 'High', color: '#EA9A98', bg: '#FDECEA' }
    if (risk > 35) return { label: 'Moderate', color: '#F0C060', bg: '#FFF8E7' }
    return { label: 'Low', color: '#7EC8A4', bg: '#E8F5EF' }
  }

  // Update calculations when params change
  useEffect(() => {
    const current = calculateRisk(
      params.sleepHours, 
      params.stressLevel, 
      params.sugarIntake, 
      params.cycleGapDays
    )
    setCurrentRisk({
      risk: current,
      level: getRiskLevel(current)
    })

    const simulated = calculateRisk(
      simulatedParams.sleepHours, 
      simulatedParams.stressLevel, 
      simulatedParams.sugarIntake, 
      simulatedParams.cycleGapDays
    )
    setSimulatedRisk({
      risk: simulated,
      level: getRiskLevel(simulated)
    })
  }, [params, simulatedParams])

  const updateCurrentParam = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }

  const updateSimulatedParam = (key, value) => {
    setSimulatedParams(prev => ({ ...prev, [key]: value }))
  }

  const resetToCurrent = () => {
    setSimulatedParams({ ...params })
  }

  const riskReduction = currentRisk && simulatedRisk 
    ? currentRisk.risk - simulatedRisk.risk 
    : 0

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#1E1B5E]">Simulate</h1>
        <p className="text-sm text-[#6B6B8A] mt-1">
          Small changes today, big impact tomorrow. Simulate different habits and see how they shape your hormonal future.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column - Adjust Your Habits */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-[#EEECF5] p-6 shadow-sm">
            <h2 className="font-semibold text-[#1E1B5E] text-lg mb-4">Adjust Your Habits</h2>
            <p className="text-xs text-[#6B6B8A] mb-5">Move the sliders to simulate better lifestyle choices.</p>

            {/* Sleep Duration */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-[#1E1B5E] flex items-center gap-2">
                  <Moon size={16} className="text-[#7EC8A4]" /> Sleep Duration
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#6B6B8A]">Current: <span className="font-semibold text-[#1E1B5E]">{params.sleepHours} hrs</span></span>
                  <span className="text-xs text-[#6B6B8A]">Simulated: <span className="font-semibold text-[#7EC8A4]">{simulatedParams.sleepHours} hrs</span></span>
                </div>
              </div>
              
              {/* Current slider */}
              <div className="mb-3">
                <input
                  type="range"
                  min="3"
                  max="10"
                  step="0.5"
                  value={params.sleepHours}
                  onChange={(e) => updateCurrentParam('sleepHours', parseFloat(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none bg-[#EEECF5]"
                  style={{ accentColor: '#7EC8A4' }}
                />
                <div className="flex justify-between text-[10px] text-[#6B6B8A] mt-0.5">
                  <span>3 hrs</span>
                  <span className="text-[#7EC8A4]">Ideal: 7-9 hrs</span>
                  <span>10 hrs</span>
                </div>
              </div>
              
              {/* Simulated slider */}
              <input
                type="range"
                min="3"
                max="10"
                step="0.5"
                value={simulatedParams.sleepHours}
                onChange={(e) => updateSimulatedParam('sleepHours', parseFloat(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none bg-[#E8F5EF]"
                style={{ accentColor: '#7EC8A4' }}
              />
              <div className="flex justify-between text-[10px] text-[#6B6B8A] mt-0.5">
                <span></span>
                <span className="text-[#7EC8A4]">Optimal range</span>
                <span></span>
              </div>
            </div>

            {/* Stress Level */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-[#1E1B5E] flex items-center gap-2">
                  <Flame size={16} className="text-[#EA9A98]" /> Stress Level
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#6B6B8A]">Current: <span className="font-semibold text-[#1E1B5E]">{params.stressLevel}/10</span></span>
                  <span className="text-xs text-[#6B6B8A]">Simulated: <span className="font-semibold text-[#7EC8A4]">{simulatedParams.stressLevel}/10</span></span>
                </div>
              </div>
              
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={params.stressLevel}
                onChange={(e) => updateCurrentParam('stressLevel', parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none bg-[#EEECF5] mb-2"
                style={{ accentColor: '#EA9A98' }}
              />
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={simulatedParams.stressLevel}
                onChange={(e) => updateSimulatedParam('stressLevel', parseInt(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none bg-[#FDECEA]"
                style={{ accentColor: '#EA9A98' }}
              />
              <div className="flex justify-between text-[10px] text-[#6B6B8A] mt-0.5">
                <span>1 (Low Stress)</span>
                <span>10 (High Stress)</span>
              </div>
            </div>

            {/* Daily Sugar Intake */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-medium text-[#1E1B5E] flex items-center gap-2">
                  <Droplet size={16} className="text-[#7EC8A4]" /> Daily Sugar Intake
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#6B6B8A]">Current: <span className="font-semibold text-[#1E1B5E] capitalize">{params.sugarIntake}</span></span>
                  <span className="text-xs text-[#6B6B8A]">Simulated: <span className="font-semibold text-[#7EC8A4] capitalize">{simulatedParams.sugarIntake}</span></span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-2">
                {['low', 'medium', 'high'].map(level => (
                  <button
                    key={level}
                    onClick={() => updateCurrentParam('sugarIntake', level)}
                    className={`py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                      params.sugarIntake === level
                        ? 'bg-[#1E1B5E] text-white'
                        : 'bg-[#FAF8F5] border border-[#EEECF5] text-[#6B6B8A]'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['low', 'medium', 'high'].map(level => (
                  <button
                    key={level}
                    onClick={() => updateSimulatedParam('sugarIntake', level)}
                    className={`py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                      simulatedParams.sugarIntake === level
                        ? 'bg-[#7EC8A4] text-white'
                        : 'bg-[#FAF8F5] border border-[#EEECF5] text-[#6B6B8A]'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-[#6B6B8A] mt-2">
                <span>Low</span>
                <span className="text-[#7EC8A4]">Lower is better</span>
                <span>High</span>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-4 p-3 bg-[#EDE9F8] rounded-xl">
              <p className="text-xs text-[#6B6B8A] text-center">
                These adjustments are based on research-backed recommendations for hormonal balance and PCOD risk reduction.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Simulation Results */}
        <div className="space-y-5">
          {/* Current vs Simulated Risk */}
          <div className="bg-white rounded-2xl border border-[#EEECF5] p-6 shadow-sm">
            <h2 className="font-semibold text-[#1E1B5E] text-lg mb-4">Your Simulation Results</h2>
            <p className="text-xs text-[#6B6B8A] mb-5">See the potential impact of your new habits.</p>

            <div className="grid grid-cols-2 gap-6">
              {/* Current Status */}
              <div className="text-center">
                <p className="text-sm text-[#6B6B8A] mb-3">Current Status</p>
                <div className="relative inline-flex items-center justify-center mb-3">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="#EEECF5" strokeWidth="10" fill="none" />
                    <circle 
                      cx="64" cy="64" r="56" 
                      stroke={currentRisk?.level.color || '#EA9A98'} 
                      strokeWidth="10" 
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - (currentRisk?.risk || 62) / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-bold text-[#1E1B5E]">{currentRisk?.risk || 62}</span>
                    <span className="text-xs text-[#6B6B8A]">%</span>
                  </div>
                </div>
                <p className="text-sm font-semibold" style={{ color: currentRisk?.level.color || '#EA9A98' }}>
                  {currentRisk?.level.label || 'High'} Risk
                </p>
                <p className="text-xs text-[#6B6B8A] mt-1">Risk Score</p>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center">
                <ArrowRight size={32} className="text-[#7EC8A4]" />
              </div>

              {/* Simulated Outcome */}
              <div className="text-center">
                <p className="text-sm text-[#6B6B8A] mb-3">Simulated Outcome</p>
                <div className="relative inline-flex items-center justify-center mb-3">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="#EEECF5" strokeWidth="10" fill="none" />
                    <circle 
                      cx="64" cy="64" r="56" 
                      stroke={simulatedRisk?.level.color || '#7EC8A4'} 
                      strokeWidth="10" 
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 56}`}
                      strokeDashoffset={`${2 * Math.PI * 56 * (1 - (simulatedRisk?.risk || 28) / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-bold text-[#1E1B5E]">{simulatedRisk?.risk || 28}</span>
                    <span className="text-xs text-[#6B6B8A]">%</span>
                  </div>
                </div>
                <p className="text-sm font-semibold" style={{ color: simulatedRisk?.level.color || '#7EC8A4' }}>
                  {simulatedRisk?.level.label || 'Low'} Risk
                </p>
                <p className="text-xs text-[#6B6B8A] mt-1">Risk Score</p>
              </div>
            </div>

            {/* Risk Reduction Banner */}
            {riskReduction > 0 && (
              <div className="mt-5 p-3 bg-[#E8F5EF] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown size={16} className="text-[#7EC8A4]" />
                  <span className="text-sm font-medium text-[#1E1B5E]">Risk Reduction</span>
                </div>
                <span className="text-xl font-bold text-[#7EC8A4]">{riskReduction}%</span>
              </div>
            )}
          </div>

          {/* Metrics Comparison */}
          <div className="bg-white rounded-2xl border border-[#EEECF5] p-6 shadow-sm">
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-[#EEECF5]">
                <span className="text-sm text-[#6B6B8A]">Metric</span>
                <div className="flex gap-8">
                  <span className="text-sm text-[#6B6B8A]">Current</span>
                  <span className="text-sm text-[#7EC8A4]">Simulated</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#1E1B5E]">Cycle Regularity</span>
                <div className="flex gap-8">
                  <span className="text-sm text-[#1E1B5E]">{Math.max(50, 100 - (params.cycleGapDays - 28) * 2)}%</span>
                  <span className="text-sm text-[#7EC8A4]">86%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#1E1B5E]">Hormonal Stability</span>
                <div className="flex gap-8">
                  <span className="text-sm text-[#1E1B5E]">65%</span>
                  <span className="text-sm text-[#7EC8A4]">82%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#1E1B5E]">Energy Levels</span>
                <div className="flex gap-8">
                  <span className="text-sm text-[#1E1B5E]">58%</span>
                  <span className="text-sm text-[#7EC8A4]">85%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Score Trend Mini Chart */}
          <div className="bg-white rounded-2xl border border-[#EEECF5] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-[#7EC8A4]" />
              <h3 className="font-semibold text-[#1E1B5E]">Risk Score Trend</h3>
            </div>
            
            <div className="flex items-end gap-4 h-24">
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full bg-[#EA9A98] rounded-t-lg transition-all duration-500" 
                  style={{ height: `${(currentRisk?.risk || 62) * 1.2}px` }} />
                <span className="text-xs text-[#6B6B8A] mt-2">Current</span>
                <span className="text-xs font-semibold text-[#EA9A98]">{currentRisk?.risk || 62}%</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full bg-[#7EC8A4] rounded-t-lg transition-all duration-500" 
                  style={{ height: `${(simulatedRisk?.risk || 28) * 1.2}px` }} />
                <span className="text-xs text-[#6B6B8A] mt-2">Simulated</span>
                <span className="text-xs font-semibold text-[#7EC8A4]">{simulatedRisk?.risk || 28}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What's Improving Section */}
      <div className="bg-white rounded-2xl border border-[#EEECF5] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Award size={18} className="text-[#7EC8A4]" />
          <h2 className="font-semibold text-[#1E1B5E] text-lg">What's Improving?</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-xl bg-[#E8F5EF]">
            <div className="flex items-center gap-2 mb-1">
              <Moon size={14} className="text-[#7EC8A4]" />
              <h3 className="font-medium text-sm text-[#1E1B5E]">Better Sleep</h3>
            </div>
            <p className="text-xs text-[#6B6B8A]">Increased sleep improves hormone regulation and reduces stress.</p>
          </div>
          <div className="p-3 rounded-xl bg-[#FDECEA]">
            <div className="flex items-center gap-2 mb-1">
              <Flame size={14} className="text-[#EA9A98]" />
              <h3 className="font-medium text-sm text-[#1E1B5E]">Lower Stress</h3>
            </div>
            <p className="text-xs text-[#6B6B8A]">Reduced stress helps balance cortisol and other hormones.</p>
          </div>
          <div className="p-3 rounded-xl bg-[#EDE9F8]">
            <div className="flex items-center gap-2 mb-1">
              <Droplet size={14} className="text-[#7EC8A4]" />
              <h3 className="font-medium text-sm text-[#1E1B5E]">Balanced Sugar</h3>
            </div>
            <p className="text-xs text-[#6B6B8A]">Lower sugar intake improves insulin sensitivity and reduces inflammation.</p>
          </div>
          <div className="p-3 rounded-xl bg-[#E8F5EF]">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} className="text-[#7EC8A4]" />
              <h3 className="font-medium text-sm text-[#1E1B5E]">Consistency is Key!</h3>
            </div>
            <p className="text-xs text-[#6B6B8A]">Small changes today lead to big results tomorrow.</p>
          </div>
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div className="bg-gradient-to-r from-[#EDE9F8] to-[#E8F5EF] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-[#7EC8A4]" />
          <h2 className="font-semibold text-[#1E1B5E] text-lg">Personalized Recommendations</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-4">
            <h3 className="font-medium text-sm text-[#1E1B5E] mb-1">Aim for 7-9 hours of sleep</h3>
            <p className="text-xs text-[#6B6B8A]">Try a consistent sleep schedule and avoid screens before bed.</p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <h3 className="font-medium text-sm text-[#1E1B5E] mb-1">Practice stress management</h3>
            <p className="text-xs text-[#6B6B8A]">Try breathing exercises, meditation or yoga for 10-15 minutes daily.</p>
          </div>
          <div className="bg-white rounded-xl p-4">
            <h3 className="font-medium text-sm text-[#1E1B5E] mb-1">Choose balanced meals</h3>
            <p className="text-xs text-[#6B6B8A]">Focus on whole foods, protein, fiber and healthy fats.</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={resetToCurrent}
          className="flex-1 py-3 rounded-xl border border-[#EEECF5] text-[#1E1B5E] font-medium hover:bg-[#FAF8F5] transition-all"
        >
          Reset to Current
        </button>
        <button
          className="flex-1 bg-[#7EC8A4] text-white font-semibold py-3 rounded-xl hover:bg-[#6ab890] transition-all flex items-center justify-center gap-2"
        >
          Apply These Changes
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Back to Dashboard Link */}
      <button
        onClick={() => navigate('/dashboard')}
        className="text-center w-full text-sm text-[#7EC8A4] hover:underline py-4"
      >
        ← Back to Dashboard
      </button>
    </div>
  )
}