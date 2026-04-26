import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, BookOpen } from 'lucide-react'
import { getArticleBySlug } from '../data/articles'

const CATEGORY_COLORS = {
  Basics:    { tag: '#E8F5EE', text: '#2E7D5A', border: '#C8E8D8' },
  Symptoms:  { tag: '#FEF0EE', text: '#C0392B', border: '#FACBC5' },
  Lifestyle: { tag: '#FDF7E3', text: '#9C6C00', border: '#F5E4A0' },
  Diet:      { tag: '#EAF3FD', text: '#1A6FAD', border: '#BDD9F5' },
}

function renderBlock(block, i) {
  switch (block.type) {
    case 'intro':
      return (
        <p key={i} className="text-lg leading-relaxed mb-8" style={{ color: '#3D3A5C', fontWeight: 400 }}>
          {block.text}
        </p>
      )
    case 'heading':
      return (
        <h2 key={i} className="text-xl font-bold mt-10 mb-3" style={{ color: '#1E1B5E' }}>
          {block.text}
        </h2>
      )
    case 'paragraph':
      return (
        <p key={i} className="text-base leading-relaxed mb-5" style={{ color: '#4A4869', lineHeight: '1.8' }}>
          {block.text}
        </p>
      )
    case 'callout':
      return (
        <div
          key={i}
          className="rounded-2xl p-5 my-7"
          style={{ backgroundColor: '#E8F5EE', borderLeft: '4px solid #7EC8A4' }}
        >
          <p className="text-sm leading-relaxed font-medium" style={{ color: '#2E7D5A', lineHeight: '1.7' }}>
            {block.text}
          </p>
        </div>
      )
    case 'list':
      return (
        <ul key={i} className="space-y-2.5 mb-6 mt-2">
          {block.items.map((item, j) => (
            <li key={j} className="flex items-start gap-3">
              <span
                className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: '#7EC8A4' }}
              />
              <span className="text-base leading-relaxed" style={{ color: '#4A4869', lineHeight: '1.7' }}>
                {item}
              </span>
            </li>
          ))}
        </ul>
      )
    default:
      return null
  }
}

export default function ArticlePage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const article = getArticleBySlug(slug)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [slug])

  if (!article) {
    return (
      <div className="text-center py-20">
        <p style={{ color: '#6B6B8A' }}>Article not found.</p>
        <button
          onClick={() => navigate('/learn')}
          className="mt-4 text-sm font-semibold"
          style={{ color: '#7EC8A4' }}
        >
          Back to Learn
        </button>
      </div>
    )
  }

  const colors = CATEGORY_COLORS[article.category]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/learn')}
        className="flex items-center gap-2 mb-8 text-sm font-medium transition-opacity hover:opacity-70"
        style={{ color: '#6B6B8A' }}
      >
        <ArrowLeft size={16} />
        Back to Learn
      </button>

      {/* Article header */}
      <div
        className="bg-white rounded-2xl p-8 mb-2 shadow-sm"
        style={{ border: '1px solid #EEECF5' }}
      >
        {/* Category tag + read time */}
        <div className="flex items-center gap-3 mb-5">
          <span
            className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: colors.tag,
              color: colors.text,
              border: `1px solid ${colors.border}`,
            }}
          >
            {article.category}
          </span>
          <span className="flex items-center gap-1 text-xs" style={{ color: '#9B9BB5' }}>
            <Clock size={12} />
            {article.readTime}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-3 leading-tight" style={{ color: '#1E1B5E' }}>
          {article.title}
        </h1>

        {/* Description */}
        <p className="text-base" style={{ color: '#6B6B8A' }}>
          {article.description}
        </p>

        {/* Divider */}
        <div className="mt-6 pt-6" style={{ borderTop: '1px solid #EEECF5' }}>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#E8F5EE' }}
            >
              <BookOpen size={14} style={{ color: '#7EC8A4' }} />
            </div>
            <span className="text-xs font-medium" style={{ color: '#9B9BB5' }}>
              Hormona Research Team
            </span>
          </div>
        </div>
      </div>

      {/* Article body */}
      <div
        className="bg-white rounded-2xl px-8 pt-8 pb-10 shadow-sm"
        style={{ border: '1px solid #EEECF5' }}
      >
        {article.content.map((block, i) => renderBlock(block, i))}
      </div>

      {/* Footer nav */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => navigate('/learn')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
          style={{ backgroundColor: '#1E1B5E', color: 'white' }}
        >
          <ArrowLeft size={15} />
          Back to all articles
        </button>
      </div>
    </div>
  )
}
