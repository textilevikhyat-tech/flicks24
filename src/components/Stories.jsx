import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { FiPlus, FiX } from 'react-icons/fi'

const Stories = () => {
  const { user } = useAuth()
  const [stories, setStories] = useState([])
  const [viewingStory, setViewingStory] = useState(null)
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  // Mock stories data
  const mockStories = [
    { id: 1, user: 'alex_chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', image: 'https://picsum.photos/id/1/500/800', time: '5 min ago', viewed: false },
    { id: 2, user: 'emily_wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', image: 'https://picsum.photos/id/2/500/800', time: '1 hour ago', viewed: false },
    { id: 3, user: 'mike_johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', image: 'https://picsum.photos/id/3/500/800', time: '3 hours ago', viewed: true },
  ]

  useEffect(() => {
    setStories(mockStories)
  }, [])

  useEffect(() => {
    if (viewingStory) {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            if (currentStoryIndex < stories.length - 1) {
              setCurrentStoryIndex(prevIndex => prevIndex + 1)
              return 0
            } else {
              setViewingStory(null)
              setCurrentStoryIndex(0)
              return 0
            }
          }
          return prev + 2
        })
      }, 50)
      return () => clearInterval(timer)
    }
  }, [viewingStory, currentStoryIndex, stories.length])

  const handleAddStory = () => {
    alert('Upload story feature coming soon!')
  }

  return (
    <>
      {/* Stories Row */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 mb-4">
        {/* Add Story Button */}
        <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={handleAddStory}>
          <div className="bg-gradient-to-r from-flicks-primary to-flicks-secondary p-[2px] rounded-full">
            <div className="w-16 h-16 rounded-full bg-flicks-surface flex items-center justify-center">
              <FiPlus className="w-6 h-6 text-flicks-primary" />
            </div>
          </div>
          <span className="text-xs text-gray-400">Your Story</span>
        </div>

        {/* Other Stories */}
        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => { setViewingStory(stories); setCurrentStoryIndex(stories.findIndex(s => s.id === story.id)) }}>
            <div className={`${!story.viewed ? 'story-ring' : 'bg-gray-600 p-[2px] rounded-full'}`}>
              <img src={story.avatar} alt={story.user} className="w-16 h-16 rounded-full object-cover" />
            </div>
            <span className="text-xs text-gray-400">{story.user}</span>
          </div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {viewingStory && viewingStory[currentStoryIndex] && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          {/* Close Button */}
          <button onClick={() => { setViewingStory(null); setCurrentStoryIndex(0); }} className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full">
            <FiX className="w-6 h-6 text-white" />
          </button>

          {/* Progress Bars */}
          <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
            {viewingStory.map((_, idx) => (
              <div key={idx} className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-50" style={{ width: idx === currentStoryIndex ? `${progress}%` : idx < currentStoryIndex ? '100%' : '0%' }}></div>
              </div>
            ))}
          </div>

          {/* Story Content */}
          <div className="flex-1 flex items-center justify-center">
            <img src={viewingStory[currentStoryIndex].image} alt="Story" className="max-h-full w-auto object-contain" />
          </div>

          {/* User Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center gap-2">
              <div className="story-ring">
                <img src={viewingStory[currentStoryIndex].avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
              </div>
              <div>
                <p className="font-semibold">{viewingStory[currentStoryIndex].user}</p>
                <p className="text-xs text-gray-400">{viewingStory[currentStoryIndex].time}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <input type="text" placeholder="Send message..." className="flex-1 bg-white/20 rounded-full px-4 py-2 text-sm outline-none" />
              <button className="px-4 py-2 bg-flicks-primary rounded-full text-sm">Send</button>
            </div>
          </div>

          {/* Navigation Taps */}
          <div className="absolute inset-y-0 left-0 w-1/2" onClick={() => setCurrentStoryIndex(prev => Math.max(0, prev - 1))}></div>
          <div className="absolute inset-y-0 right-0 w-1/2" onClick={() => setCurrentStoryIndex(prev => Math.min(viewingStory.length - 1, prev + 1))}></div>
        </div>
      )}
    </>
  )
}

export default Stories
