import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { 
  FiHeart, FiMessageCircle, FiShare2, FiMusic, FiVolume2, FiVolumeX,
  FiLoader, FiSend, FiMoreHorizontal, FiFlag, FiBookmark, FiX
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

// Reel Card Component
const ReelCard = ({ reel, isActive, currentUserId, onLike, onComment, onShare, onSave, onReport }) => {
  const [isMuted, setIsMuted] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const videoRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(e => console.log('Auto-play blocked:', e))
      } else {
        videoRef.current.pause()
      }
    }
  }, [isActive])

  useEffect(() => {
    setIsLiked(reel.is_liked || false)
    setIsSaved(reel.is_saved || false)
  }, [reel.is_liked, reel.is_saved])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLikeClick = async () => {
    setIsLiked(!isLiked)
    await onLike(reel.id)
  }

  const handleSaveClick = async () => {
    setIsSaved(!isSaved)
    await onSave(reel.id)
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    await onComment(reel.id, commentText)
    setCommentText('')
  }

  const handleReport = () => {
    const reason = prompt('Why are you reporting this reel?')
    if (reason) onReport(reel.id, reason)
    setShowMenu(false)
  }

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  return (
    <div className="relative h-screen w-full bg-black">
      {/* Video */}
      <video
        ref={videoRef}
        src={reel.video_url}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted={isMuted}
        playsInline
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

      {/* Right Side Actions */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-10">
        {/* Like Button */}
        <button onClick={handleLikeClick} className="flex flex-col items-center group">
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur flex items-center justify-center group-hover:scale-110 transition">
            <FiHeart className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </div>
          <span className="text-white text-xs mt-1">{formatNumber(reel.likes_count)}</span>
        </button>

        {/* Comments Button */}
        <button onClick={() => setShowComments(!showComments)} className="flex flex-col items-center group">
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur flex items-center justify-center group-hover:scale-110 transition">
            <FiMessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs mt-1">{formatNumber(reel.comments_count)}</span>
        </button>

        {/* Share Button */}
        <button onClick={() => onShare(reel)} className="flex flex-col items-center group">
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur flex items-center justify-center group-hover:scale-110 transition">
            <FiShare2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-white text-xs mt-1">{formatNumber(reel.shares_count)}</span>
        </button>

        {/* Save Button */}
        <button onClick={handleSaveClick} className="flex flex-col items-center group">
          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur flex items-center justify-center group-hover:scale-110 transition">
            <FiBookmark className={`w-6 h-6 ${isSaved ? 'fill-yellow-500 text-yellow-500' : 'text-white'}`} />
          </div>
        </button>

        {/* Menu Button */}
        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowMenu(!showMenu)} className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur flex items-center justify-center">
              <FiMoreHorizontal className="w-6 h-6 text-white" />
            </div>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-14 bg-flicks-surface rounded-xl shadow-lg w-40 overflow-hidden z-20">
              <button onClick={handleReport} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-white/10 flex items-center gap-2">
                <FiFlag className="w-4 h-4" /> Report
              </button>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        <Link to={`/profile/${reel.user?.id}`} className="story-ring">
          <img src={reel.user?.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
        </Link>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-4 left-4 right-20 z-10">
        <div className="flex items-center gap-2 mb-2">
          <Link to={`/profile/${reel.user?.id}`} className="font-semibold text-white hover:underline">
            @{reel.user?.username}
          </Link>
          <button className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold hover:bg-white/30 transition">
            Follow
          </button>
        </div>
        <p className="text-white text-sm mb-1 line-clamp-2">{reel.caption}</p>
        <div className="flex items-center gap-1">
          <FiMusic className="w-3 h-3 text-white" />
          <span className="text-white text-xs opacity-80">{reel.audio_title || 'Original Audio'}</span>
        </div>
      </div>

      {/* Volume/Mute Button */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute left-4 bottom-24 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur flex items-center justify-center"
      >
        {isMuted ? <FiVolumeX className="w-4 h-4 text-white" /> : <FiVolume2 className="w-4 h-4 text-white" />}
      </button>

      {/* Comments Panel */}
      {showComments && (
        <div className="absolute bottom-0 left-0 right-0 glass rounded-t-2xl p-4 z-20 animate-slide-up">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold">Comments ({formatNumber(reel.comments_count)})</h4>
            <button onClick={() => setShowComments(false)} className="p-1">
              <FiX className="w-5 h-5" />
            </button>
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-3 mb-3">
            {reel.comments?.slice(0, 5).map((comment) => (
              <div key={comment.id} className="flex gap-2">
                <img src={comment.user?.avatar} alt="" className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <p className="text-xs font-semibold">{comment.user?.username}</p>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
            {(!reel.comments || reel.comments.length === 0) && (
              <p className="text-gray-500 text-sm text-center py-4">No comments yet. Be the first!</p>
            )}
          </div>

          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-flicks-primary"
            />
            <button type="submit" className="p-2 bg-flicks-primary rounded-full">
              <FiSend className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

// Reel Skeleton
const ReelSkeleton = () => (
  <div className="h-screen w-full bg-flicks-surface animate-pulse flex items-center justify-center">
    <FiLoader className="w-8 h-8 animate-spin text-flicks-primary" />
  </div>
)

// Main Reels Component
const Reels = () => {
  const { user } = useAuth()
  const [reels, setReels] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef(null)

  const fetchReels = useCallback(async () => {
    const { data, error } = await supabase
      .from('reels')
      .select(`
        *,
        user:users(id, username, avatar),
        comments:reel_comments(count),
        user_like:reel_likes!inner(user_id)
      `)
      .eq('user_like.user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) {
      // Get saved status
      const { data: saved } = await supabase
        .from('saved_reels')
        .select('reel_id')
        .eq('user_id', user?.id)

      const savedIds = new Set(saved?.map(s => s.reel_id) || [])

      const transformed = data.map(reel => ({
        ...reel,
        likes_count: reel.likes_count || 0,
        comments_count: reel.comments?.[0]?.count || 0,
        shares_count: reel.shares_count || 0,
        is_liked: !!reel.user_like,
        is_saved: savedIds.has(reel.id)
      }))
      setReels(transformed)
    }
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    fetchReels()

    // Subscribe to new reels
    const subscription = supabase
      .channel('public:reels')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reels' }, () => {
        fetchReels()
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }, [fetchReels])

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const index = Math.round(containerRef.current.scrollTop / window.innerHeight)
      if (index !== currentIndex) {
        setCurrentIndex(index)
      }
    }
  }, [currentIndex])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  const handleLike = async (reelId) => {
    const existing = reels.find(r => r.id === reelId)?.is_liked
    if (existing) {
      await supabase.from('reel_likes').delete().eq('reel_id', reelId).eq('user_id', user.id)
    } else {
      await supabase.from('reel_likes').insert({ reel_id: reelId, user_id: user.id })
      await supabase.rpc('increment_reel_likes', { reel_id: reelId })
    }
    fetchReels()
  }

  const handleComment = async (reelId, content) => {
    await supabase.from('reel_comments').insert({
      reel_id: reelId,
      user_id: user.id,
      content
    })
    await supabase.rpc('increment_reel_comments', { reel_id: reelId })
    fetchReels()
  }

  const handleShare = async (reel) => {
    const shareUrl = `${window.location.origin}/reel/${reel.id}`
    try {
      await navigator.share({ title: 'Check out this reel', text: reel.caption, url: shareUrl })
    } catch {
      navigator.clipboard.writeText(shareUrl)
      alert('Link copied!')
    }
  }

  const handleSave = async (reelId) => {
    const existing = reels.find(r => r.id === reelId)?.is_saved
    if (existing) {
      await supabase.from('saved_reels').delete().eq('reel_id', reelId).eq('user_id', user.id)
    } else {
      await supabase.from('saved_reels').insert({ reel_id: reelId, user_id: user.id })
    }
    fetchReels()
  }

  const handleReport = async (reelId, reason) => {
    await supabase.from('reel_reports').insert({
      reel_id: reelId,
      user_id: user.id,
      reason
    })
    alert('Thank you for reporting. Our team will review it.')
  }

  if (loading) {
    return (
      <div className="h-screen bg-flicks-dark">
        <ReelSkeleton />
      </div>
    )
  }

  if (reels.length === 0) {
    return (
      <div className="h-screen bg-flicks-dark flex items-center justify-center">
        <div className="text-center p-4">
          <div className="text-6xl mb-4">🎥</div>
          <h3 className="text-xl font-semibold mb-2">No Reels Yet</h3>
          <p className="text-gray-400">Be the first to upload a reel!</p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
    >
      {reels.map((reel, index) => (
        <div key={reel.id} className="snap-start snap-always">
          <ReelCard
            reel={reel}
            isActive={index === currentIndex}
            currentUserId={user?.id}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            onSave={handleSave}
            onReport={handleReport}
          />
        </div>
      ))}
    </div>
  )
}

export default Reels
