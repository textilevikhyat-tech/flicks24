import React, { useState, useEffect, useRef } from 'react'
import { FiHeart, FiMessageCircle, FiShare2, FiMusic, FiVolume2, FiVolumeX } from 'react-icons/fi'

const Reels = () => {
  const [reels, setReels] = useState([
    { id: 1, user: 'dance_master', video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', likes: '234K', comments: '12.3K', shares: '4.5K', caption: '#dance #trending', music: 'Original Audio - 1.2M uses', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dance' },
    { id: 2, user: 'comedy_club', video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFunflies.mp4', likes: '567K', comments: '34.2K', shares: '12.8K', caption: '😂😂😂 #comedy', music: 'Funny Sounds - 890K uses', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Comedy' },
    { id: 3, user: 'travel_foodie', video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', likes: '123K', comments: '5.6K', shares: '2.1K', caption: '📍Bali paradise 🌴', music: 'Travel Vibes - 456K uses', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Travel' },
  ])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(true)
  const videoRefs = useRef([])

  useEffect(() => {
    const handleScroll = () => {
      const reelsContainer = document.getElementById('reels-container')
      if (reelsContainer) {
        const index = Math.round(reelsContainer.scrollTop / window.innerHeight)
        if (index !== currentIndex) {
          setCurrentIndex(index)
          // Pause all videos except current
          videoRefs.current.forEach((video, i) => {
            if (video) {
              if (i === index) {
                video.play().catch(e => console.log('Auto-play blocked:', e))
              } else {
                video.pause()
              }
            }
          })
        }
      }
    }

    const container = document.getElementById('reels-container')
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [currentIndex])

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (videoRefs.current[currentIndex]) {
      videoRefs.current[currentIndex].muted = !isMuted
    }
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
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20">
            {/* Right Side Actions */}
            <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6">
              <button className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
                  <FiHeart className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs mt-1">{reel.likes}</span>
              </button>
              <button className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
                  <FiMessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs mt-1">{reel.comments}</span>
              </button>
              <button className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
                  <FiShare2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs mt-1">{reel.shares}</span>
              </button>
              <button onClick={toggleMute} className="flex flex-col items-center">
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
          </div>
        </div>
      ))}
    </div>
  )
}

export default Reels
