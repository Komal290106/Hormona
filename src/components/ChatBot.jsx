import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader as Loader2, ChevronDown } from 'lucide-react'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const SUGGESTED_QUESTIONS = [
  'What are the main symptoms of PCOD?',
  'What foods should I avoid with PCOD?',
  'How does stress affect my hormones?',
  'Can PCOD be reversed naturally?',
]

function getUserContext() {
  const userId = localStorage.getItem('hormonaUserId')
  const userName = localStorage.getItem('hormonaUserName')
  const isDemoMode = localStorage.getItem('hormonaDemoMode') === 'true'
  if (isDemoMode) return 'User is viewing demo mode for a user named Anaya in the Follicular Phase with a low PCOD risk score.'
  if (!userId) return null
  const stored = localStorage.getItem(`userData_${userId}`)
  if (!stored) return `User's name is ${userName || 'unknown'}.`
  try {
    const data = JSON.parse(stored)
    return `User's name is ${userName || 'unknown'}. Last period: ${data.lastPeriodDate || 'unknown'}. Average cycle length: ${data.avgCycleLength || 28} days.`
  } catch {
    return null
  }
}

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your PCOD Health Assistant. Ask me anything about PCOD, your cycle, hormones, diet, or lifestyle — I'm here to help.",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      inputRef.current?.focus()
    }
  }, [open, messages])

  async function sendMessage(text) {
    const userText = text || input.trim()
    if (!userText || loading) return

    setInput('')
    setShowSuggestions(false)
    const newMessages = [...messages, { role: 'user', content: userText }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          messages: newMessages,
          userContext: getUserContext(),
        }),
      })

      const data = await res.json()
      if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please check your internet and try again.' }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 ${open ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100'}`}
        style={{ backgroundColor: '#1E1B5E' }}
        aria-label="Open PCOD Assistant"
      >
        <Bot size={20} style={{ color: '#7EC8A4' }} />
        <span className="text-white text-sm font-semibold">Ask PCOD AI</span>
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}
        style={{
          width: 'min(380px, calc(100vw - 24px))',
          height: 'min(540px, calc(100vh - 80px))',
          backgroundColor: '#FAFAF8',
          border: '1px solid #E8E5F0',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ backgroundColor: '#1E1B5E' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(126,200,164,0.2)' }}>
              <Bot size={16} style={{ color: '#7EC8A4' }} />
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-none">PCOD Assistant</p>
              <p className="text-xs mt-0.5" style={{ color: '#7EC8A4' }}>Powered by Gemini AI</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
          >
            <ChevronDown size={18} style={{ color: 'rgba(255,255,255,0.7)' }} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ scrollbarWidth: 'thin' }}>
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: msg.role === 'user' ? '#7EC8A4' : '#1E1B5E' }}
              >
                {msg.role === 'user'
                  ? <User size={12} style={{ color: 'white' }} />
                  : <Bot size={12} style={{ color: '#7EC8A4' }} />
                }
              </div>
              <div
                className="max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed"
                style={{
                  backgroundColor: msg.role === 'user' ? '#1E1B5E' : 'white',
                  color: msg.role === 'user' ? 'white' : '#1E1B5E',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  boxShadow: msg.role === 'assistant' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#1E1B5E' }}>
                <Bot size={12} style={{ color: '#7EC8A4' }} />
              </div>
              <div className="px-3 py-2 rounded-2xl bg-white shadow-sm" style={{ borderRadius: '18px 18px 18px 4px' }}>
                <Loader2 size={16} className="animate-spin" style={{ color: '#7EC8A4' }} />
              </div>
            </div>
          )}

          {/* Suggested questions */}
          {showSuggestions && messages.length === 1 && (
            <div className="space-y-1.5 mt-2">
              <p className="text-xs text-center" style={{ color: '#9B9BB0' }}>Try asking:</p>
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="w-full text-left text-xs px-3 py-2 rounded-xl border transition-all hover:shadow-sm"
                  style={{
                    backgroundColor: 'white',
                    borderColor: '#E8E5F0',
                    color: '#1E1B5E',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 px-3 py-3 border-t" style={{ borderColor: '#E8E5F0', backgroundColor: 'white' }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: '#F4F2F8' }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about PCOD, cycles, hormones..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              style={{ color: '#1E1B5E' }}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{
                backgroundColor: input.trim() && !loading ? '#7EC8A4' : '#D8D5E8',
              }}
            >
              <Send size={14} style={{ color: 'white' }} />
            </button>
          </div>
          <p className="text-center text-xs mt-2" style={{ color: '#B0ADBF' }}>Not a substitute for medical advice</p>
        </div>
      </div>
    </>
  )
}
