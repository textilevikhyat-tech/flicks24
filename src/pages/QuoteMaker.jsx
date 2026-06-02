import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { 
  FiDownload, FiShare2, FiSave, FiImage, FiType, FiGrid,
  FiX, FiLoader, FiCheck, FiHeart, FiStar, FiUsers
} from 'react-icons/fi'

// Quote Templates Library
const quoteTemplates = {
  english: [
    { id: 1, text: "Be the change you wish to see in the world.", author: "Mahatma Gandhi", category: "inspirational" },
    { id: 2, text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "motivational" },
    { id: 3, text: "Success is not final, failure is not fatal.", author: "Winston Churchill", category: "success" },
    { id: 4, text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "motivational" },
    { id: 5, text: "Dream it. Wish it. Do it.", author: "Unknown", category: "inspirational" },
    { id: 6, text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "dreams" },
    { id: 7, text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", category: "perseverance" },
    { id: 8, text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair", category: "courage" },
    { id: 9, text: "The only limit to our realization of tomorrow is our doubts of today.", author: "Franklin D. Roosevelt", category: "belief" },
    { id: 10, text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt", category: "action" }
  ],
  hindi: [
    { id: 11, text: "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।", author: "भगवद गीता", category: "spiritual" },
    { id: 12, text: "जिंदगी एक संघर्ष है, हारना नहीं मंजूर।", author: "अज्ञात", category: "motivational" },
    { id: 13, text: "सपने वो नहीं जो हम सोते हैं, सपने वो हैं जो हमें सोने नहीं देते।", author: "ए.पी.जे. अब्दुल कलाम", category: "dreams" },
    { id: 14, text: "मंजिलें उन्हीं को मिलती है जिनके सपनों में जान होती है।", author: "अज्ञात", category: "dreams" },
    { id: 15, text: "हौसलों की उड़ान को कोई सीमा नहीं।", author: "अज्ञात", category: "courage" }
  ],
  hinglish: [
    { id: 16, text: "Believe in yourself, kyunki tu hai special!", author: "Motivation", category: "motivational" },
    { id: 17, text: "Success ki koi shortcut nahi, bas consistent rehna hai.", author: "Success", category: "success" },
    { id: 18, text: "Apne dreams ko pakad, aur unhe achieve kar.", author: "Dreams", category: "dreams" },
    { id: 19, text: "Darr ke aage jeet hai, bas ek kadam aur.", author: "Courage", category: "courage" },
    { id: 20, text: "Koshish karne walon ki haar nahi hoti.", author: "Inspiration", category: "inspirational" }
  ]
}

// Color Palette
const backgroundColors = [
  '#FF5A5F', '#00C4FF', '#1a1a2e', '#16213e', '#0f3460', '#533483',
  '#f9a826', '#00b4d8', '#2b9348', '#9c27b0', '#ff6b6b', '#4a4a4a',
  '#2c3e50', '#e74c3c', '#8e44ad', '#3498db', '#1abc9c', '#f39c12'
]

const textColors = ['#ffffff', '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#c084fc', '#f97316', '#06b6d4', '#ec4899']

const fonts = ['Inter', 'Georgia', 'Arial', 'Courier New', 'Impact', 'Comic Sans MS', 'Times New Roman', 'Verdana']

const QuoteMaker = () => {
  const { user } = useAuth()
  const [quote, setQuote] = useState('')
  const [author, setAuthor] = useState('')
  const [language, setLanguage] = useState('english')
  const [category, setCategory] = useState('all')
  const [bgColor, setBgColor] = useState('#1a1a2e')
  const [textColor, setTextColor] = useState('#ffffff')
  const [font, setFont] = useState('Inter')
  const [fontSize, setFontSize] = useState(28)
  const [backgroundImage, setBackgroundImage] = useState(null)
  const [savedQuotes, setSavedQuotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('editor')
  const canvasRef = useRef(null)

  useEffect(() => {
    fetchSavedQuotes()
  }, [])

  const fetchSavedQuotes = async () => {
    const { data } = await supabase
      .from('user_quotes')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
    setSavedQuotes(data || [])
  }

  const getFilteredTemplates = () => {
    let templates = quoteTemplates[language] || quoteTemplates.english
    if (category !== 'all') {
      templates = templates.filter(q => q.category === category)
    }
    return templates
  }

  const selectRandomQuote = () => {
    const templates = getFilteredTemplates()
    const random = templates[Math.floor(Math.random() * templates.length)]
    setQuote(random.text)
    setAuthor(random.author)
  }

  const drawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = 500
    const height = 500
    canvas.width = width
    canvas.height = height

    // Background
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, width, height)

    // Background Image (if any)
    if (backgroundImage) {
      const img = new Image()
      img.src = backgroundImage
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height)
        drawText(ctx, width, height)
      }
      return
    }

    drawText(ctx, width, height)
  }

  const drawText = (ctx, width, height) => {
    ctx.fillStyle = textColor
    ctx.font = `${fontSize}px ${font}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Quote text
    const lines = wrapText(ctx, quote, width - 80)
    const lineHeight = fontSize + 10
    const startY = height / 2 - (lines.length * lineHeight) / 2

    lines.forEach((line, i) => {
      ctx.fillText(line, width / 2, startY + i * lineHeight)
    })

    // Author
    if (author) {
      ctx.font = `${fontSize - 8}px ${font}`
      ctx.fillStyle = `${textColor}cc`
      ctx.fillText(`— ${author}`, width / 2, startY + lines.length * lineHeight + 30)
    }

    // Watermark
    ctx.font = '12px Inter'
    ctx.fillStyle = `${textColor}66`
    ctx.fillText('flicksindia.online', width - 80, height - 15)

    // User signature
    ctx.font = '10px Inter'
    ctx.fillStyle = `${textColor}66`
    ctx.fillText(`✨ Created by @${user?.user_metadata?.username}`, 20, height - 15)
  }

  const wrapText = (ctx, text, maxWidth) => {
    const words = text.split(' ')
    const lines = []
    let currentLine = words[0]

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i]
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth) {
        lines.push(currentLine)
        currentLine = words[i]
      } else {
        currentLine = testLine
      }
    }
    lines.push(currentLine)
    return lines
  }

  useEffect(() => {
    drawCanvas()
  }, [quote, author, bgColor, textColor, font, fontSize, backgroundImage])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const link = document.createElement('a')
      link.download = `quote-${Date.now()}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  const handleShare = async () => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.toBlob(async (blob) => {
        const file = new File([blob], 'quote.png', { type: 'image/png' })
        // In production: upload to Supabase storage and create post
        alert('Share to feed coming soon!')
      })
    }
  }

  const handleSaveQuote = async () => {
    setSaving(true)
    const canvas = canvasRef.current
    if (canvas) {
      const imageData = canvas.toDataURL()
      const { error } = await supabase
        .from('user_quotes')
        .insert({
          user_id: user.id,
          quote_text: quote,
          author: author,
          image_url: imageData,
          settings: { bgColor, textColor, font, fontSize }
        })
      
      if (!error) {
        fetchSavedQuotes()
        alert('Quote saved!')
      }
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-flicks-dark p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold gradient-text">Quote Maker</h1>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('editor')} className={`px-4 py-2 rounded-full text-sm ${activeTab === 'editor' ? 'gradient-bg' : 'bg-white/10'}`}>
              Editor
            </button>
            <button onClick={() => setActiveTab('saved')} className={`px-4 py-2 rounded-full text-sm ${activeTab === 'saved' ? 'gradient-bg' : 'bg-white/10'}`}>
              My Quotes ({savedQuotes.length})
            </button>
          </div>
        </div>

        {activeTab === 'editor' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Editor Panel */}
            <div className="glass rounded-2xl p-5 space-y-4">
              {/* Quote Input */}
              <div>
                <label className="text-sm text-gray-400 block mb-1">Quote Text</label>
                <textarea
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  className="w-full bg-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-flicks-primary resize-none"
                  rows="3"
                  placeholder="Write your quote here..."
                />
              </div>

              {/* Author */}
              <div>
                <label className="text-sm text-gray-400 block mb-1">Author (Optional)</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-flicks-primary"
                  placeholder="Author name"
                />
              </div>

              {/* Language & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-white/10 rounded-xl px-3 py-2 outline-none"
                  >
                    <option value="english">English</option>
                    <option value="hindi">हिंदी</option>
                    <option value="hinglish">Hinglish</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/10 rounded-xl px-3 py-2 outline-none"
                  >
                    <option value="all">All</option>
                    <option value="inspirational">Inspirational</option>
                    <option value="motivational">Motivational</option>
                    <option value="dreams">Dreams</option>
                    <option value="success">Success</option>
                    <option value="courage">Courage</option>
                  </select>
                </div>
              </div>

              {/* Random Quote Button */}
              <button onClick={selectRandomQuote} className="w-full bg-white/10 py-2 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-white/20 transition">
                <FiStar /> Random Quote
              </button>

              {/* Color Controls */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-400 block mb-1 flex items-center gap-1"><FiGrid /> Background</label>
                  <div className="flex flex-wrap gap-1">
                    {backgroundColors.slice(0, 12).map(color => (
                      <button key={color} onClick={() => setBgColor(color)} className={`w-6 h-6 rounded-full border-2 ${bgColor === color ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1 flex items-center gap-1"><FiType /> Text Color</label>
                  <div className="flex flex-wrap gap-1">
                    {textColors.map(color => (
                      <button key={color} onClick={() => setTextColor(color)} className={`w-6 h-6 rounded-full border-2 ${textColor === color ? 'border-white' : 'border-transparent'}`} style={{ backgroundColor: color }} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Font Controls */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Font</label>
                  <select value={font} onChange={(e) => setFont(e.target.value)} className="w-full bg-white/10 rounded-xl px-3 py-2 outline-none">
                    {fonts.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Font Size: {fontSize}px</label>
                  <input type="range" min="16" max="48" value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="w-full" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveQuote} disabled={saving} className="flex-1 bg-white/10 py-2 rounded-xl font-semibold flex items-center justify-center gap-2">
                  {saving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave />} Save
                </button>
                <button onClick={handleDownload} className="flex-1 gradient-bg py-2 rounded-xl font-semibold flex items-center justify-center gap-2">
                  <FiDownload /> Download
                </button>
                <button onClick={handleShare} className="flex-1 bg-white/10 py-2 rounded-xl font-semibold flex items-center justify-center gap-2">
                  <FiShare2 /> Share
                </button>
              </div>
            </div>

            {/* Preview Panel */}
            <div>
              <canvas ref={canvasRef} className="w-full rounded-2xl shadow-lg" style={{ aspectRatio: '1/1' }} />
              <div className="text-center mt-3">
                <p className="text-xs text-gray-500">✨ flicksindia.online | @{user?.user_metadata?.username}</p>
              </div>
            </div>

            {/* Quote Templates */}
            <div className="lg:col-span-2 mt-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><FiHeart /> Popular Quotes</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {getFilteredTemplates().slice(0, 10).map(q => (
                  <button key={q.id} onClick={() => { setQuote(q.text); setAuthor(q.author) }} className="glass px-4 py-2 rounded-full text-sm whitespace-nowrap hover:bg-white/10 transition">
                    {q.text.length > 40 ? q.text.substring(0, 40) + '...' : q.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {savedQuotes.map((quote) => (
              <div key={quote.id} className="glass rounded-2xl overflow-hidden cursor-pointer hover:scale-105 transition">
                <img src={quote.image_url} alt="Saved quote" className="w-full aspect-square object-cover" />
                <div className="p-2 text-center">
                  <p className="text-xs text-gray-400 line-clamp-2">{quote.quote_text}</p>
                </div>
              </div>
            ))}
            {savedQuotes.length === 0 && (
              <div className="lg:col-span-3 glass rounded-2xl p-12 text-center">
                <div className="text-5xl mb-3">📸</div>
                <p className="text-gray-400">No saved quotes yet</p>
                <p className="text-sm text-gray-500">Create and save your first quote!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default QuoteMaker
