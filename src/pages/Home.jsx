import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiMoreHorizontal, FiSend, FiSmile } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const Home = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [newPost, setNewPost] = useState('')
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState({})
  const [showComments, setShowComments] = useState({})
  const [likedPosts, setLikedPosts] = useState({})

  const stories = [
    { id: 1, username: 'Your Story', avatar: user?.user_metadata?.avatar, isAdd: true },
    { id: 2, username: 'alex_chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', isLive: true },
    { id: 3, username: 'emily_wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', isLive: false },
    { id: 4, username: 'mike_johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', isLive: false },
  ]

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*, user:users(username, avatar, id)')
      .order('created_at', { ascending: false })
    
    if (data) {
      setPosts(data)
      // Initialize liked states
      const likes = {}
      data.forEach(post => { likes[post.id] = false })
      setLikedPosts(likes)
    }
    setLoading(false)
  }

  const handleLike = async (postId) => {
    setLikedPosts(prev => ({ ...prev, [postId]: !prev[postId] }))
    
    // Update likes in database
    await supabase.rpc('toggle_like', { post_id: postId, user_id: user.id })
    
    // Refresh posts to update like count
    fetchPosts()
  }

  const handleComment = async (postId) => {
    if (!commentText[postId]?.trim()) return
    
    await supabase.from('comments').insert({
      post_id: postId,
      user_id: user.id,
      content: commentText[postId]
    })
    
    setCommentText(prev => ({ ...prev, [postId]: '' }))
    fetchPosts()
  }

  const handleShare = async (post) => {
    const shareUrl = `${window.location.origin}/post/${post.id}`
    try {
      await navigator.share({
        title: 'Check out this post',
        text: post.content,
        url: shareUrl
      })
    } catch (err) {
      navigator.clipboard.writeText(shareUrl)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-flicks-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Stories Row */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 mb-4">
        {stories.map((story) => (
          <div key={story.id} className="flex flex-col items-center gap-1 cursor-pointer">
            <div className={`${story.isAdd ? 'bg-gradient-to-r from-flicks-primary to-flicks-secondary p-[2px] rounded-full' : 'story-ring'}`}>
              <div className="w-16 h-16 rounded-full bg-flicks-surface flex items-center justify-center overflow-hidden">
                {story.isAdd ? (
                  <div className="w-full h-full bg-gradient-to-br from-flicks-primary to-flicks-secondary flex items-center justify-center">
                    <span className="text-2xl">+</span>
                  </div>
                ) : (
                  <img src={story.avatar} alt={story.username} className="w-full h-full object-cover" />
                )}
              </div>
            </div>
            <span className="text-xs text-gray-400">{story.username}</span>
            {story.isLive && <span className="text-[10px] text-red-500 -mt-1">● Live</span>}
          </div>
        ))}
      </div>

      {/* Create Post */}
      <div className="glass rounded-2xl p-4 mb-6">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-flicks-primary to-flicks-secondary flex items-center justify-center text-white font-bold overflow-hidden">
            <img src={user?.user_metadata?.avatar} alt="" className="w-full h-full object-cover" />
          </div>
          <input
            type="text"
            placeholder="What's on your mind?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
          />
        </div>
        <div className="flex justify-between mt-3 pt-3 border-t border-white/10">
          <button className="flex items-center gap-2 text-gray-400 hover:text-flicks-primary transition">📷 Photo</button>
          <button className="flex items-center gap-2 text-gray-400 hover:text-flicks-primary transition">🎥 Video</button>
          <button className="flex items-center gap-2 text-gray-400 hover:text-flicks-primary transition">🔗 Link</button>
        </div>
      </div>

      {/* Feed Posts */}
      {posts.map((post) => (
        <div key={post.id} className="glass rounded-2xl mb-4 overflow-hidden">
          <div className="p-4">
            {/* Post Header */}
            <div className="flex items-center justify-between mb-3">
              <Link to={`/profile/${post.user?.id}`} className="flex items-center gap-3">
                <div className="story-ring">
                  <img src={post.user?.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold">{post.user?.username}</p>
                  <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
                </div>
              </Link>
              <FiMoreHorizontal className="text-gray-400 cursor-pointer" />
            </div>

            {/* Post Content */}
            <p className="mb-3">{post.content}</p>
            {post.image_url && (
              <img src={post.image_url} alt="Post" className="rounded-xl mb-3 w-full" />
            )}

            {/* Like & Comment Counts */}
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>{post.likes_count || 0} likes</span>
              <span>{post.comments_count || 0} comments</span>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-3 border-t border-white/10">
              <button onClick={() => handleLike(post.id)} className={`flex items-center gap-2 transition ${likedPosts[post.id] ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
                <FiHeart className={likedPosts[post.id] ? 'fill-red-500' : ''} /> Like
              </button>
              <button onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))} className="flex items-center gap-2 text-gray-400 hover:text-flicks-secondary transition">
                <FiMessageCircle /> Comment
              </button>
              <button onClick={() => handleShare(post)} className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition">
                <FiShare2 /> Share
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition">
                <FiBookmark /> Save
              </button>
            </div>

            {/* Comments Section */}
            {showComments[post.id] && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText[post.id] || ''}
                    onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                    className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-flicks-primary"
                  />
                  <button onClick={() => handleComment(post.id)} className="p-2 bg-flicks-primary rounded-full">
                    <FiSend className="w-4 h-4" />
                  </button>
                </div>
                {/* Mock Comments */}
                <div className="mt-3 space-y-2">
                  <div className="flex gap-2">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=commenter1" alt="" className="w-6 h-6 rounded-full" />
                    <div className="flex-1 bg-white/5 rounded-lg p-2">
                      <p className="text-xs font-semibold">john_doe</p>
                      <p className="text-sm">Great post! 🔥</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Home
