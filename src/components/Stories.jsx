import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { FiPlus, FiX, FiSend, FiLoader } from 'react-icons/fi'
import { Link } from 'react-router-dom'

// Story Viewer Component
const StoryViewer = ({ stories, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [progress, setProgress] = useState(0)
  const [replyText, setReplyText] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(prev => prev + 1)
            return 0
          } else {
            onClose()
            return 0
          }
        }
        return prev + 2
      })
    }, 50)
    return () => clearInterval(timer)
  }, [currentIndex, stories.length, onClose])

  const handleReply = async () => {
    if (!replyText.trim()) return
    // Save reply to database
    setReplyText('')
  }

  const currentStory = stories[currentIndex]

  if (!currentStory) return null

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Close Button */}
      <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full">
        <FiX className="w-6 h-6 text-white" />
      </button>

      {/* Progress Bars */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
        {stories.map((_, idx) => (
          <div key={idx} className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-50"
              style={{ width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%' }}
            />
          </div>
        ))}
      </div>

      {/* Story Content */}
      <div className="flex-1 flex items-center justify-center">
        {currentStory.image_url ? (
          <img src={currentStory.image_url} alt="Story" className="max-h-full w-auto object-contain" />
        ) : currentStory.video_url ? (
          <video src={currentStory.video_url} autoPlay loop muted className="max-h-full w-auto" />
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-4">📸</div>
            <p className="text-gray-400">No media</p>
          </div>
        )}
      </div>

      {/* User Info & Reply */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <Link to={`/profile/${currentStory.user?.id}`} className="flex items-center gap-2 mb-3">
          <img src={currentStory.user?.avatar} alt="" className="w-10 h-10 rounded-full" />
          <div>
            <p className="font-semibold">{currentStory.user?.username}</p>
            <p className="text-xs text-gray-400">{currentStory.time_ago}</p>
          </div>
        </Link>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Send message..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="flex-1 bg-white/20 rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-flicks-primary"
          />
          <button onClick={handleReply} className="p-2 bg-flicks-primary rounded-full">
            <FiSend className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Taps */}
      <div className="absolute inset-y-0 left-0 w-1/2" onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))} />
      <div className="absolute inset-y-0 right-0 w-1/2" onClick={() => {
        if (currentIndex < stories.length - 1) {
          setCurrentIndex(prev => prev + 1)
          setProgress(0)
        } else {
          onClose()
        }
      }} />
    </div>
  )
}

// Main Stories Component
const Stories = () => {
  const { user } = useAuth()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewingStory, setViewingStory] = useState(null)
  const [uploading, setUploading] = useState(false)

  const fetchStories = useCallback(async () => {
    const { data, error } = await supabase
      .from('stories')
      .select(`
        *,
        user:users(id, username, avatar),
        views:story_views(count)
      `)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (data) {
      // Mark viewed stories
      const { data: viewed } = await supabase
        .from('story_views')
        .select('story_id')
        .eq('user_id', user?.id)

      const viewedIds = new Set(viewed?.map(v => v.story_id) || [])

      const transformed = data.map(story => ({
        ...story,
        is_viewed: viewedIds.has(story.id),
        view_count: story.views?.[0]?.count || 0,
        time_ago: getTimeAgo(story.created_at)
      }))
      setStories(transformed)
    }
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    fetchStories()

    // Subscribe to new stories
    const subscription = supabase
      .channel('public:stories')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stories' }, () => {
        fetchStories()
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }, [fetchStories])

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const handleAddStory = async () => {
    // In production: open camera/gallery upload
    alert('Story upload feature coming soon!')
  }

  const markAsViewed = async (storyId) => {
    await supabase.from('story_views').insert({
      story_id: storyId,
      user_id: user.id
    })
    fetchStories()
  }

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-flicks-surface animate-pulse"></div>
        <div className="w-16 h-16 rounded-full bg-flicks-surface animate-pulse"></div>
        <div className="w-16 h-16 rounded-full bg-flicks-surface animate-pulse"></div>
      </div>
    )
  }

  // Only show stories from last 24 hours
  const activeStories = stories.filter(s => new Date(s.expires_at) > new Date())

  return (
    <>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 mb-4">
        {/* Add Story Button */}
        <div className="flex flex-col items-center gap-1 cursor-pointer" onClick={handleAddStory}>
          <div className="bg-gradient-to-r from-flicks-primary to-flicks-secondary p-[2px] rounded-full">
            <div className="w-16 h-16 rounded-full bg-flicks-surface flex items-center justify-center">
              {uploading ? <FiLoader className="w-6 h-6 animate-spin" /> : <FiPlus className="w-6 h-6 text-flicks-primary" />}
            </div>
          </div>
          <span className="text-xs text-gray-400">Your Story</span>
        </div>

        {/* Stories List */}
        {activeStories.map((story, idx) => (
          <div
            key={story.id}
            className="flex flex-col items-center gap-1 cursor-pointer"
            onClick={() => {
              setViewingStory({ stories: activeStories, index: idx })
              if (!story.is_viewed) markAsViewed(story.id)
            }}
          >
            <div className={`${!story.is_viewed ? 'story-ring' : 'bg-gray-600 p-[2px] rounded-full'}`}>
              <img src={story.user?.avatar} alt={story.user?.username} className="w-16 h-16 rounded-full object-cover" />
            </div>
            <span className="text-xs text-gray-400 truncate max-w-[70px]">{story.user?.username}</span>
            {!story.is_viewed && <div className="w-2 h-2 bg-flicks-primary rounded-full -mt-1" />}
          </div>
        ))}
      </div>

      {/* Story Viewer */}
      {viewingStory && (
        <StoryViewer
          stories={viewingStory.stories}
          initialIndex={viewingStory.index}
          onClose={() => setViewingStory(null)}
        />
      )}
    </>
  )
}

export default Stories
