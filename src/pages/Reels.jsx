import React, { useState, useEffect, useRef } from 'react'
import { FiHeart, FiMessageCircle, FiShare2, FiMusic, FiVolume2, FiVolumeX } from 'react-icons/fi'

const Reels = () => {
  const [reels, setReels] = useState([
    { id: 1, user: 'dance_master', video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', likes: 234000, comments: 12300, shares: 4500, caption: '#dance #trending 🔥', music: 'Original Audio - 1.2M uses', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dance', liked: false },
    { id: 2, user: 'comedy_club', video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFunflies.mp4', likes: 567000, comments: 34200, shares: 12800, caption: '😂😂😂 #comedy #relatable', music: 'Funny Sounds - 890K uses', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Comedy', liked: false },
    { id: 3, user: 'travel_foodie', video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', likes: 123000, comments: 5600, shares: 2100, caption: '📍Bali paradise 🌴 #travel', music: 'Travel Vibes - 456K uses', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Travel', liked: false },
  ])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const [showComments, setShowComments] = useState({})
  const [commentText, setCommentText] = useState({})
  const videoRefs = useRef([])

  useEffect(() => {
    const handleScroll = () => {
      const container = document.getElementById('reels-container')
      if (container) {
        const index = Math.round(container.scrollTop / window.innerHeight)
        if (index !== currentIndex) {
          setCurrentIndex(index)
          videoRefs.current.forEach((video, i) => {
            if (video) {
              if (i === index) video.play().catch(e => console.log('Auto-play blocked'))
              else video.pause()
            }
          })
        }
      }
    }
    const container = document.getElementById('reels-container')
    if (container) container.addEventListener('scroll', handleScroll)
    return () => container?.removeEventListener('scroll', handleScroll)
  }, [currentIndex])

  const handleLike = (id) => {
    setReels(prev => prev.map(reel => 
      reel.id === id ? { ...reel, liked: !reel.liked, likes: reel.liked ? reel.likes - 1 : reel.likes + 1 } : reel
    ))
  }

  const handleComment = (id) => {
    if (!commentText[id]?.trim()) return
    setCommentText(prev => ({ ...prev, [id]: '' }))
    alert('Comment posted!')
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  return (
    <div id="reels-container" className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
      {reels.map((reel, idx) => (
        <div key={reel.id} className="h-screen snap-start snap-always relative bg-black">
          <video
            ref={el => videoRefs.current[idx] = el}
            src={reel.video}
            className="w-full h-full object-cover"
            loop
            muted={isMuted}
            playsInline
            autoPlay={idx === 0}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20">
            {/* Right Side Actions */}
            <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6">
              <button onClick={() => handleLike(reel.id)} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
                  <FiHeart className={`w-6 h-6 ${reel.liked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </div>
                <span className="text-white text-xs mt-1">{formatNumber(reel.likes)}</span>
              </button>
              
              <button onClick={() => setShowComments(prev => ({ ...prev, [reel.id]: !prev[reel.id] }))} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
                  <FiMessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs mt-1">{formatNumber(reel.comments)}</span>
              </button>
              
              <button className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
                  <FiShare2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs mt-1">{formatNumber(reel.shares)}</span>
              </button>
              
              <button onClick={() => setIsMuted(!isMuted)} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
                  {isMuted ? <FiVolumeX className="w-6 h-6 text-white" /> : <FiVolume2 className="w-6 h-6 text-white" />}
                </div>
              </button>
              
              <div className="story-ring">
                <img src={reel.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
              </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-4 left-4 right-20">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-white">@{reel.user}</span>
                <button className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold">Follow</button>
              </div>
              <p className="text-white text-sm mb-1">{reel.caption}</p>
              <div className="flex items-center gap-1">
                <FiMusic className="w-3 h-3 text-white" />
                <span className="text-white text-xs">{reel.music}</span>
              </div>
            </div>

            {/* Comments Panel */}
            {showComments[reel.id] && (
              <div className="absolute bottom-0 left-0 right-0 glass p-4 rounded-t-2xl">
                <h4 className="font-semibold mb-2">Comments</h4>
                <div className="max-h-40 overflow-y-auto space-y-2 mb-2">
                  <div className="flex gap-2"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=user1" alt="" className="w-6 h-6 rounded-full" /><p className="text-sm"><span className="font-semibold">user123</span> Awesome reel! 🔥</p></div>
                  <div className="flex gap-2"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=user2" alt="" className="w-6 h-6 rounded-full" /><p className="text-sm"><span className="font-semibold">fan_4ever</span> Love this! ❤️</p></div>
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Add comment..." value={commentText[reel.id] || ''} onChange={(e) => setCommentText(prev => ({ ...prev, [reel.id]: e.target.value }))} className="flex-1 bg-white/10 rounded-full px-3 py-1 text-sm outline-none" />
                  <button onClick={() => handleComment(reel.id)} className="px-3 py-1 bg-flicks-primary rounded-full text-sm">Post</button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Reels
