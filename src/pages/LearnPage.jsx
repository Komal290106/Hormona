import { useState } from 'react'
import { BookOpen, ArrowRight } from 'lucide-react'

const articles = [
  {
    category: 'Basics',
    title: 'What is PCOD?',
    description: 'PCOD is a hormonal condition where the ovaries produce excess androgens, affecting menstrual cycles and overall health.',
  },
  {
    category: 'Basics',
    title: 'PCOD vs PCOS',
    description: 'PCOD is common and manageable, while PCOS is more severe and involves metabolic complications.',
  },
  {
    category: 'Symptoms',
    title: 'Common Symptoms',
    description: 'Irregular periods, acne, weight gain, and hair thinning are common indicators of PCOD.',
  },
  {
    category: 'Symptoms',
    title: 'Early Warning Signs',
    description: 'Delayed cycles, fatigue, and hormonal acne can be early signals that should not be ignored.',
  },
  {
    category: 'Lifestyle',
    title: 'Sleep & Hormones',
    description: 'Poor sleep disrupts hormonal balance and can worsen PCOD symptoms over time.',
  },
  {
    category: 'Lifestyle',
    title: 'Stress Impact',
    description: 'Chronic stress increases cortisol, which negatively affects reproductive hormones.',
  },
  {
    category: 'Lifestyle',
    title: 'Exercise Benefits',
    description: 'Regular moderate exercise improves insulin sensitivity and helps regulate hormonal cycles.',
  },
  {
    category: 'Diet',
    title: 'Best Diet for PCOD',
    description: 'A low-glycemic, high-fiber diet helps regulate insulin and improve symptoms.',
  },
  {
    category: 'Diet',
    title: 'Foods to Avoid',
    description: 'Processed sugars and refined carbs can increase insulin resistance and worsen PCOD.',
  },
  {
    category: 'Diet',
    title: 'Preventive Habits',
    description: 'Consistent meal timing, hydration, and avoiding crash diets support long-term hormonal health.',
  },
]

const CATEGORY_COLORS = {
  Basics:    { tag: '#E8F5EE', text: '#2E7D5A', border: '#C8E8D8' },
  Symptoms:  { tag: '#FEF0EE', text: '#C0392B', border: '#FACBC5' },
  Lifestyle: { tag: '#FDF7E3', text: '#9C6C00', border: '#F5E4A0' },
  Diet:      { tag: '#EAF3FD', text: '#1A6FAD', border: '#BDD9F5' },
}

const FILTERS = ['All', 'Basics', 'Symptoms', 'Lifestyle', 'Diet']

export default function LearnPage() {
  const [active, setActive] = useState('All')

  const visible = active === 'All' ? articles : articles.filter(a => a.category === active)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#E8F5EE' }}
          >
            <BookOpen size={20} style={{ color: '#7EC8A4' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#1E1B5E' }}>
              Learn About PCOD
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#6B6B8A' }}>
              Research-backed insights to help you understand hormonal health better.
            </p>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {FILTERS.map(f => {
          const isActive = f === active
          return (
            <button
              key={f}
              onClick={() => setActive(f)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: isActive ? '#1E1B5E' : 'white',
                color: isActive ? 'white' : '#6B6B8A',
                border: `1px solid ${isActive ? '#1E1B5E' : '#EEECF5'}`,
              }}
            >
              {f}
            </button>
          )
        })}
      </div>

      {/* Cards grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visible.map((article, i) => {
          const colors = CATEGORY_COLORS[article.category]
          return (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
              style={{ border: '1px solid #EEECF5' }}
            >
              {/* Category tag */}
              <span
                className="inline-block self-start px-2.5 py-0.5 rounded-full text-xs font-semibold mb-3"
                style={{
                  backgroundColor: colors.tag,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                }}
              >
                {article.category}
              </span>

              {/* Title */}
              <h3 className="font-bold text-base mb-2" style={{ color: '#1E1B5E' }}>
                {article.title}
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed flex-1" style={{ color: '#6B6B8A' }}>
                {article.description}
              </p>

              {/* Read more */}
              <div className="mt-4 flex items-center gap-1">
                <span className="text-xs font-semibold" style={{ color: '#7EC8A4' }}>
                  Read more
                </span>
                <ArrowRight size={12} style={{ color: '#7EC8A4' }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
