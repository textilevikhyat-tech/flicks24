import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiMoreHorizontal, FiSend, FiSmile, FiThumbsUp, FiHeart as FiHeartFilled, FiFrown, FiAngry } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import Stories from '../components/Stories'

const Home = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [newPost, setNewPost] = useState('')
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState({})
  const [showComments, setShowComments] = useState({})
  const [showReactions, setShowReactions] = useState({})
  const [postReactions, setPostReactions] = useState({})
  const reactionRefs = useRef({})

  // Reaction options
  const reactions = [
    { type: 'like', icon: <FiThumbsUp className="w-6 h-6 text-blue-500" />, label: 'Like' },
    { type: 'love', icon: <FiHeartFilled className="w-6 h-6 text-red-500" />, label: 'Love' },
    { type: 'wow', icon: <span className="text-2xl">😮</span>, label: 'Wow' },
    { type: 'sad', icon: <FiFrown className="w-6 h-6 text-yellow-500" />, label: 'Sad' },
    { type: 'angry', icon: <FiAngry className="w-6 h-6 text-red-400" />, label: 'Angry' },
  ]

  useEffect(() => {
    fetchPosts()
    // Click outside to close reaction picker
    const handleClickOutside = (e) => {
      Object.keys(showReactions).forEach(postId => {
        if (reactionRefs.current[postId] && !reactionRefs.current[postId].contains(e.target)) {
          setShowReactions(prev => ({ ...prev, [postId]: false }))
        }
      })
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*, user:users(username, avatar, id)')
      .order('created_at', { ascending: false })
    
    if (data) {
      setPosts(data)
      // Initialize reaction states
      const reactionsState = {}
      data.forEach(post => { reactionsState[post.id] = { type: null, count: 0 } })
      setPostReactions(reactionsState)
    }
    setLoading(false)
  }

  const handleReaction = async (postId, reactionType) => {
    setPostReactions(prev => ({
      ...prev,
      [postId]: { type: reactionType, count: (prev[postId]?.count || 0) + 1 }
    }))
    setShowReactions(prev => ({ ...prev, [postId]: false }))
    
    // Update in database
    await supabase.from('post_reactions').upsert({
      post_id: postId,
      user_id: user.id,
      reaction_type: reactionType
    })
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

  const getReactionIcon = (type) => {
    switch(type) {
      case 'like': return <FiThumbsUp className="w-4 h-4 text-blue-500" />
      case 'love': return <FiHeartFilled className="w-4 h-4 text-red-500" />
      case 'wow': return <span className="text-sm">😮</span>
      case 'sad': return <FiFrown className="w-4 h-4 text-yellow-500" />
      case 'angry': return <FiAngry className="w-4 h-4 text-red-400" />
      default: return <FiHeart className="w-4 h-4" />
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
      {/* Stories Component */}
      <Stories />

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

            {/* Reactions & Comments Count */}
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <div className="flex items-center gap-1">
                {postReactions[post.id]?.type ? (
                  <div className="flex items-center gap-1">
                    {getReactionIcon(postReactions[post.id].type)}
                    <span>{postReactions[post.id].count}</span>
                  </div>
                ) : (
                  <span>0 reactions</span>
                )}
              </div>
              <span>{post.comments_count || 0} comments</span>
            </div>

            {/* Action Buttons with Reactions */}
            <div className="flex justify-between pt-3 border-t border-white/10 relative">
              {/* Like Button with Reaction Picker */}
              <div className="relative" ref={el => reactionRefs.current[post.id] = el}>
                <button 
                  onClick={() => setShowReactions(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                  className="flex items-center gap-2 text-gray-400 hover:text-flicks-primary transition"
                >
                  {postReactions[post.id]?.type ? getReactionIcon(postReactions[post.id].type) : <FiHeart />}
                  {postReactions[post.id]?.type ? 'Reacted' : 'Like'}
                </button>
                
                {/* Reaction Picker */}
                {showReactions[post.id] && (
                  <div className="absolute bottom-full left-0 mb-2 bg-flicks-surface rounded-full p-2 flex gap-2 shadow-xl z-10">
                    {reactions.map(react => (
                      <button
                        key={react.type}
                        onClick={() => handleReaction(post.id, react.type)}
                        className="hover:scale-125 transition-transform p-1"
                        title={react.label}
                      >
                        {react.icon}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))} className="flex items-center gap-2 text-gray-400 hover:text-flicks-secondary transition">
                <FiMessageCircle /> Comment
              </button>
              
              <button className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition">
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
                
                {/* Comments List */}
                <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                  <div className="flex gap-2">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=user1" alt="" className="w-6 h-6 rounded-full" />
                    <div className="flex-1 bg-white/5 rounded-lg p-2">
                      <p className="text-xs font-semibold">john_doe</p>
                      <p className="text-sm">Great post! 🔥</p>
                      <div className="flex gap-2 mt-1 text-xs text-gray-500">
                        <button className="hover:text-flicks-primary">Like</button>
                        <button className="hover:text-flicks-primary">Reply</button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=user2" alt="" className="w-6 h-6 rounded-full" />
                    <div className="flex-1 bg-white/5 rounded-lg p-2">
                      <p className="text-xs font-semibold">jane_doe</p>
                      <p className="text-sm">So true! 💯</p>
                      <div className="flex gap-2 mt-1 text-xs text-gray-500">
                        <button className="hover:text-flicks-primary">Like</button>
                        <button className="hover:text-flicks-primary">Reply</button>
                      </div>
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
