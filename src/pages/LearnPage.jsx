import { useState } from 'react'
import { BookOpen, ArrowRight, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { articles } from '../data/articles'

const CATEGORY_COLORS = {
  Basics:    { tag: '#E8F5EE', text: '#2E7D5A', border: '#C8E8D8' },
  Symptoms:  { tag: '#FEF0EE', text: '#C0392B', border: '#FACBC5' },
  Lifestyle: { tag: '#FDF7E3', text: '#9C6C00', border: '#F5E4A0' },
  Diet:      { tag: '#EAF3FD', text: '#1A6FAD', border: '#BDD9F5' },
}

const FILTERS = ['All', 'Basics', 'Symptoms', 'Lifestyle', 'Diet']

export default function LearnPage() {
  const [active, setActive] = useState('All')
  const navigate = useNavigate()

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
        {visible.map((article) => {
          const colors = CATEGORY_COLORS[article.category]
          return (
            <div
              key={article.slug}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col cursor-pointer"
              style={{ border: '1px solid #EEECF5' }}
              onClick={() => navigate(`/learn/${article.slug}`)}
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

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs" style={{ color: '#9B9BB5' }}>
                  <Clock size={11} />
                  {article.readTime}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#7EC8A4' }}>
                  Read more
                  <ArrowRight size={12} />
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
