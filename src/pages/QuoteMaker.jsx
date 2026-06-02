import React, { useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { FiDownload, FiShare2, FiEdit3, FiSave, FiImage, FiType, FiPalette } from 'react-icons/fi'

const QuoteMaker = () => {
  const { user } = useAuth()
  const [quote, setQuote] = useState('')
  const [bgColor, setBgColor] = useState('#1a1a2e')
  const [textColor, setTextColor] = useState('#ffffff')
  const [fontSize, setFontSize] = useState(24)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [quoteImage, setQuoteImage] = useState(null)
  const canvasRef = useRef(null)

  const defaultQuotes = [
    { id: 1, text: 'Be the change you wish to see in the world.', author: 'Mahatma Gandhi', lang: 'en' },
    { id: 2, text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', lang: 'en' },
    { id: 3, text: 'Success is not final, failure is not fatal.', author: 'Winston Churchill', lang: 'en' },
    { id: 4, text: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।', author: 'Bhagavad Gita', lang: 'hi' },
    { id: 5, text: 'Believe you can and you are halfway there.', author: 'Theodore Roosevelt', lang: 'en' },
    { id: 6, text: 'जिंदगी एक संघर्ष है, हारना नहीं मंजूर।', author: 'Unknown', lang: 'hi' },
    { id: 7, text: 'Dream it. Wish it. Do it.', author: 'Unknown', lang: 'en' },
    { id: 8, text: 'सपने वो नहीं जो हम सोते हैं, सपने वो हैं जो हमें सोने नहीं देते।', author: 'APJ Abdul Kalam', lang: 'hi' },
  ]

  const colors = [
    '#1a1a2e', '#16213e', '#0f3460', '#e94560', '#533483',
    '#f9a826', '#00b4d8', '#2b9348', '#9c27b0', '#ff6b6b'
  ]

  const handleGenerateQuote = () => {
    if (quote.trim()) return
    const random = defaultQuotes[Math.floor(Math.random() * defaultQuotes.length)]
    setQuote(`${random.text} — ${random.author}`)
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const link = document.createElement('a')
      link.download = `quote-${Date.now()}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  return (
    <div className="min-h-screen bg-flicks-dark p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold gradient-text mb-6">Quote Maker</h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Editor Panel */}
          <div className="glass rounded-2xl p-4">
            <textarea
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Write your quote here or select from templates..."
              className="w-full bg-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-flicks-primary mb-4"
              rows="3"
            />
            
            <button onClick={handleGenerateQuote} className="w-full bg-white/10 py-2 rounded-lg mb-4 text-sm">
              ✨ Random Quote
            </button>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400 flex items-center gap-2 mb-1"><FiPalette /> Background Color</label>
                <div className="flex gap-2 flex-wrap">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setBgColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${bgColor === color ? 'border-white' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 flex items-center gap-2 mb-1"><FiType /> Text Color</label>
                <div className="flex gap-2">
                  {['#ffffff', '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#c084fc'].map(color => (
                    <button
                      key={color}
                      onClick={() => setTextColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${textColor === color ? 'border-white' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-1">Font Size: {fontSize}px</label>
                <input
                  type="range"
                  min="16"
                  max="48"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="flex-1 bg-flicks-primary py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
                <FiSave /> Save
              </button>
              <button onClick={handleDownload} className="flex-1 bg-white/10 py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
                <FiDownload /> Download
              </button>
              <button className="flex-1 bg-white/10 py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
                <FiShare2 /> Share
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div>
            <canvas
              ref={canvasRef}
              width="400"
              height="500"
              className="w-full rounded-2xl shadow-lg"
              style={{ backgroundColor: bgColor }}
            />
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-400">✨ Created by @{user?.user_metadata?.username}</div>
              <div className="text-xs text-gray-500 mt-1">flicksindia.online</div>
            </div>
          </div>
        </div>

        {/* Quote Templates */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3">Popular Quotes</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {defaultQuotes.slice(0, 6).map(q => (
              <button
                key={q.id}
                onClick={() => setQuote(q.text)}
                className="glass px-4 py-2 rounded-full text-sm whitespace-nowrap hover:bg-white/10 transition"
              >
                {q.text.substring(0, 30)}...
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuoteMaker
