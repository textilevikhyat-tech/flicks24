import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { 
  FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiMoreHorizontal, 
  FiSend, FiSmile, FiThumbsUp, FiHeart as FiHeartFilled, FiFrown,
  FiTrash2, FiEdit2, FiFlag, FiX, FiImage, FiVideo, FiLink
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

const Home = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [newPost, setNewPost] = useState('')
  const [newPostImage, setNewPostImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState({})
  const [showComments, setShowComments] = useState({})
  const [showReactions, setShowReactions] = useState({})
  const [postReactions, setPostReactions] = useState({})
  const [editingPost, setEditingPost] = useState(null)
  const [editContent, setEditContent] = useState('')
  const [showPostMenu, setShowPostMenu] = useState({})
  const [showEmojiPicker, setShowEmojiPicker] = useState({})
  const reactionRefs = useRef({})
  const menuRefs = useRef({})
  const fileInputRef = useRef(null)

  // Stories data
  const [stories, setStories] = useState([
    { id: 1, user: 'alex_chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', image: 'https://picsum.photos/id/1/500/800', time: '5 min ago', viewed: false },
    { id: 2, user: 'emily_wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', image: 'https://picsum.photos/id/2/500/800', time: '1 hour ago', viewed: false },
    { id: 3, user: 'mike_johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', image: 'https://picsum.photos/id/3/500/800', time: '3 hours ago', viewed: true },
    { id: 4, user: 'sarah_chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', image: 'https://picsum.photos/id/4/500/800', time: '5 hours ago', viewed: false },
  ])
  const [viewingStory, setViewingStory] = useState(null)
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [storyProgress, setStoryProgress] = useState(0)

  // Reaction options
  const reactions = [
    { type: 'like', icon: <FiThumbsUp className="w-7 h-7 text-blue-500" />, label: 'Like' },
    { type: 'love', icon: <FiHeartFilled className="w-7 h-7 text-red-500" />, label: 'Love' },
    { type: 'wow', icon: <span className="text-3xl">😮</span>, label: 'Wow' },
    { type: 'sad', icon: <FiFrown className="w-7 h-7 text-yellow-500" />, label: 'Sad' },
  ]

  // Emojis for comments
  const emojis = ['😊', '😂', '❤️', '👍', '🔥', '🥺', '😍', '🎉', '😭', '👏']

  useEffect(() => {
    fetchPosts()
    fetchUserReactions()
    
    const handleClickOutside = (e) => {
      Object.keys(showReactions).forEach(postId => {
        if (reactionRefs.current[postId] && !reactionRefs.current[postId].contains(e.target)) {
          setShowReactions(prev => ({ ...prev, [postId]: false }))
        }
      })
      Object.keys(showPostMenu).forEach(postId => {
        if (menuRefs.current[postId] && !menuRefs.current[postId].contains(e.target)) {
          setShowPostMenu(prev => ({ ...prev, [postId]: false }))
        }
      })
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Story auto-progress
  useEffect(() => {
    if (viewingStory) {
      const timer = setInterval(() => {
        setStoryProgress(prev => {
          if (prev >= 100) {
            if (currentStoryIndex < stories.length - 1) {
              setCurrentStoryIndex(prev => prev + 1)
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

  const fetchPosts = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('posts')
      .select('*, user:users(username, avatar, id)')
      .order('created_at', { ascending: false })
    
    if (data) {
      setPosts(data)
    }
    setLoading(false)
  }

  const fetchUserReactions = async () => {
    const { data } = await supabase
      .from('post_reactions')
      .select('post_id, reaction_type')
      .eq('user_id', user?.id)
    
    if (data) {
      const reactionsState = {}
      data.forEach(r => { reactionsState[r.post_id] = { type: r.reaction_type, count: 1 } })
      setPostReactions(reactionsState)
    }
  }

  const handleCreatePost = async () => {
    if (!newPost.trim() && !newPostImage) {
      alert('Please write something or add an image!')
      return
    }
    
    let imageUrl = null
    if (newPostImage) {
      // For demo, using placeholder - in real app upload to Supabase storage
      imageUrl = URL.createObjectURL(newPostImage)
    }
    
    const { error } = await supabase
      .from('posts')
      .insert([{
        user_id: user.id,
        content: newPost,
        image_url: imageUrl,
        likes_count: 0,
        comments_count: 0
      }])
    
    if (error) {
      alert('Error: ' + error.message)
    } else {
      setNewPost('')
      setNewPostImage(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchPosts()
    }
  }

  const handleReaction = async (postId, reactionType) => {
    const existing = postReactions[postId]
    
    if (existing?.type === reactionType) {
      // Remove reaction
      await supabase
        .from('post_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
      
      setPostReactions(prev => {
        const newState = { ...prev }
        delete newState[postId]
        return newState
      })
    } else {
      // Add or update reaction
      if (existing) {
        await supabase
          .from('post_reactions')
          .update({ reaction_type: reactionType })
          .eq('post_id', postId)
          .eq('user_id', user.id)
      } else {
        await supabase
          .from('post_reactions')
          .insert({ post_id: postId, user_id: user.id, reaction_type: reactionType })
      }
      
      setPostReactions(prev => ({
        ...prev,
        [postId]: { type: reactionType, count: 1 }
      }))
    }
    
    setShowReactions(prev => ({ ...prev, [postId]: false }))
    fetchPosts()
  }

  const handleLike = async (postId) => {
    const existing = postReactions[postId]
    if (existing) {
      await supabase
        .from('post_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
      setPostReactions(prev => {
        const newState = { ...prev }
        delete newState[postId]
        return newState
      })
    } else {
      await supabase
        .from('post_reactions')
        .insert({ post_id: postId, user_id: user.id, reaction_type: 'like' })
      setPostReactions(prev => ({
        ...prev,
        [postId]: { type: 'like', count: 1 }
      }))
    }
    fetchPosts()
  }

  const handleComment = async (postId) => {
    if (!commentText[postId]?.trim()) return
    
    await supabase.from('comments').insert({
      post_id: postId,
      user_id: user.id,
      content: commentText[postId]
    })
    
    await supabase.rpc('increment_comments', { post_id: postId })
    setCommentText(prev => ({ ...prev, [postId]: '' }))
    fetchPosts()
  }

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await supabase.from('posts').delete().eq('id', postId)
      fetchPosts()
    }
    setShowPostMenu(prev => ({ ...prev, [postId]: false }))
  }

  const handleEditPost = async (postId) => {
    if (!editContent.trim()) return
    
    await supabase.from('posts').update({ content: editContent }).eq('id', postId)
    setEditingPost(null)
    setEditContent('')
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

  const handleSavePost = async (postId) => {
    const { data } = await supabase
      .from('saved_posts')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', user.id)
    
    if (data?.length > 0) {
      await supabase.from('saved_posts').delete().eq('post_id', postId).eq('user_id', user.id)
      alert('Post removed from saved')
    } else {
      await supabase.from('saved_posts').insert({ post_id: postId, user_id: user.id })
      alert('Post saved!')
    }
  }

  const handleReportPost = async (postId) => {
    const reason = prompt('Why are you reporting this post?')
    if (reason) {
      await supabase.from('reports').insert({
        post_id: postId,
        user_id: user.id,
        reason: reason
      })
      alert('Thank you for reporting. Our team will review it.')
    }
    setShowPostMenu(prev => ({ ...prev, [postId]: false }))
  }

  const addEmojiToComment = (postId, emoji) => {
    setCommentText(prev => ({
      ...prev,
      [postId]: (prev[postId] || '') + emoji
    }))
    setShowEmojiPicker(prev => ({ ...prev, [postId]: false }))
  }

  const getReactionIcon = (type) => {
    switch(type) {
      case 'like': return <FiThumbsUp className="w-4 h-4 text-blue-500" />
      case 'love': return <FiHeartFilled className="w-4 h-4 text-red-500" />
      case 'wow': return <span className="text-sm">😮</span>
      case 'sad': return <FiFrown className="w-4 h-4 text-yellow-500" />
      default: return <FiHeart className="w-4 h-4" />
    }
  }

  const openStory = (index) => {
    setCurrentStoryIndex(index)
    setViewingStory(stories)
    setStoryProgress(0)
  }

  const closeStory = () => {
    setViewingStory(null)
    setCurrentStoryIndex(0)
    setStoryProgress(0)
  }

  const nextStory = () => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1)
      setStoryProgress(0)
    } else {
      closeStory()
    }
  }

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1)
      setStoryProgress(0)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-2 border-flicks-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      {/* Stories Row */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 mb-4">
        {/* Add Story Button */}
        <div className="flex flex-col items-center gap-1 cursor-pointer">
          <div className="bg-gradient-to-r from-flicks-primary to-flicks-secondary p-[2px] rounded-full">
            <div className="w-16 h-16 rounded-full bg-flicks-surface flex items-center justify-center">
              <span className="text-2xl text-flicks-primary">+</span>
            </div>
          </div>
          <span className="text-xs text-gray-400">Your Story</span>
        </div>

        {/* Stories List */}
        {stories.map((story, idx) => (
          <div key={story.id} className="flex flex-col items-center gap-1 cursor-pointer" onClick={() => openStory(idx)}>
            <div className={`${!story.viewed ? 'story-ring' : 'bg-gray-600 p-[2px] rounded-full'}`}>
              <img src={story.avatar} alt={story.user} className="w-16 h-16 rounded-full object-cover" />
            </div>
            <span className="text-xs text-gray-400">{story.user}</span>
            {!story.viewed && <div className="w-2 h-2 bg-flicks-primary rounded-full -mt-1"></div>}
          </div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {viewingStory && viewingStory[currentStoryIndex] && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <button onClick={closeStory} className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full">
            <FiX className="w-6 h-6 text-white" />
          </button>
          
          <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
            {viewingStory.map((_, idx) => (
              <div key={idx} className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-50" style={{ width: idx === currentStoryIndex ? `${storyProgress}%` : idx < currentStoryIndex ? '100%' : '0%' }}></div>
              </div>
            ))}
          </div>

          <div className="flex-1 flex items-center justify-center">
            <img src={viewingStory[currentStoryIndex].image} alt="Story" className="max-h-full w-auto object-contain" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center gap-2">
              <img src={viewingStory[currentStoryIndex].avatar} alt="" className="w-10 h-10 rounded-full" />
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

          <div className="absolute inset-y-0 left-0 w-1/2" onClick={prevStory}></div>
          <div className="absolute inset-y-0 right-0 w-1/2" onClick={nextStory}></div>
        </div>
      )}

      {/* Create Post */}
      <div className="glass rounded-2xl p-4 mb-6">
        <div className="flex gap-3">
          <img src={user?.user_metadata?.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
          <textarea
            placeholder="What's on your mind?"
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 resize-none"
            rows="2"
          />
        </div>
        
        {newPostImage && (
          <div className="relative mt-2">
            <img src={URL.createObjectURL(newPostImage)} alt="Preview" className="rounded-xl max-h-48 w-auto" />
            <button onClick={() => setNewPostImage(null)} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex justify-between mt-3 pt-3 border-t border-white/10">
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-gray-400 hover:text-flicks-primary transition">
            <FiImage /> Photo
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setNewPostImage(e.target.files[0])} />
          <button className="flex items-center gap-2 text-gray-400 hover:text-flicks-primary transition">
            <FiVideo /> Video
          </button>
          <button className="flex items-center gap-2 text-gray-400 hover:text-flicks-primary transition">
            <FiLink /> Link
          </button>
          <button 
            onClick={handleCreatePost}
            className="px-5 py-1.5 bg-gradient-to-r from-flicks-primary to-flicks-secondary rounded-full text-sm font-semibold hover:opacity-90 transition"
          >
            Post
          </button>
        </div>
      </div>

      {/* Feed Posts */}
      {posts.map((post) => (
        <div key={post.id} className="glass rounded-2xl mb-4 overflow-hidden">
          <div className="p-4">
            {/* Post Header */}
            <div className="flex justify-between items-start mb-3">
              <Link to={`/profile/${post.user?.id}`} className="flex gap-3">
                <img src={post.user?.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-semibold">{post.user?.username}</p>
                  <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
                </div>
              </Link>
              
              {/* Three dots menu */}
              <div className="relative" ref={el => menuRefs.current[post.id] = el}>
                <button onClick={() => setShowPostMenu(prev => ({ ...prev, [post.id]: !prev[post.id] }))}>
                  <FiMoreHorizontal className="text-gray-400 cursor-pointer" />
                </button>
                {showPostMenu[post.id] && (
                  <div className="absolute right-0 top-6 bg-flicks-surface rounded-xl shadow-lg z-10 w-40">
                    {post.user?.id === user?.id && (
                      <>
                        <button onClick={() => { setEditingPost(post.id); setEditContent(post.content); setShowPostMenu(prev => ({ ...prev, [post.id]: false })); }} className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 flex items-center gap-2">
                          <FiEdit2 /> Edit
                        </button>
                        <button onClick={() => handleDeletePost(post.id)} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-white/10 flex items-center gap-2">
                          <FiTrash2 /> Delete
                        </button>
                      </>
                    )}
                    <button onClick={() => handleReportPost(post.id)} className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 flex items-center gap-2">
                      <FiFlag /> Report
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Post Content */}
            {editingPost === post.id ? (
              <div className="mb-3">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-white/10 rounded-lg p-3 outline-none"
                  rows="3"
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleEditPost(post.id)} className="px-3 py-1 bg-flicks-primary rounded-lg text-sm">Save</button>
                  <button onClick={() => setEditingPost(null)} className="px-3 py-1 bg-white/10 rounded-lg text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <p className="mb-3">{post.content}</p>
            )}
            
            {post.image_url && (
              <img src={post.image_url} alt="Post" className="rounded-xl mb-3 w-full" />
            )}

            {/* Reactions & Comments Count */}
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <div className="flex items-center gap-1">
                {postReactions[post.id]?.type ? (
                  <div className="flex items-center gap-1">
                    {getReactionIcon(postReactions[post.id].type)}
                    <span>{post.likes_count || 1}</span>
                  </div>
                ) : (
                  <span>0 likes</span>
                )}
              </div>
              <span>{post.comments_count || 0} comments</span>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-3 border-t border-white/10">
              {/* Like with Reaction Picker */}
              <div className="relative" ref={el => reactionRefs.current[post.id] = el}>
                <button 
                  onClick={() => setShowReactions(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                  className={`flex items-center gap-2 transition ${postReactions[post.id]?.type ? 'text-flicks-primary' : 'text-gray-400 hover:text-flicks-primary'}`}
                >
                  {postReactions[post.id]?.type ? getReactionIcon(postReactions[post.id].type) : <FiHeart />}
                  {postReactions[post.id]?.type ? 'Reacted' : 'Like'}
                </button>
                
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
              
              <button onClick={() => handleShare(post)} className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition">
                <FiShare2 /> Share
              </button>
              
              <button onClick={() => handleSavePost(post.id)} className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition">
                <FiBookmark /> Save
              </button>
            </div>

            {/* Comments Section */}
            {showComments[post.id] && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex gap-2">
                  <div className="relative">
                    <button onClick={() => setShowEmojiPicker(prev => ({ ...prev, [post.id]: !prev[post.id] }))} className="p-2 text-gray-400 hover:text-white">
                      <FiSmile />
                    </button>
                    {showEmojiPicker[post.id] && (
                      <div className="absolute bottom-full left-0 mb-2 bg-flicks-surface rounded-xl p-2 grid grid-cols-5 gap-1 z-10">
                        {emojis.map(emoji => (
                          <button key={emoji} onClick={() => addEmojiToComment(post.id, emoji)} className="text-xl hover:scale-125 transition">
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentText[post.id] || ''}
                    onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                    className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-flicks-primary"
                  />
                  <button onClick={() => handleComment(post.id)} className="p-2 bg-flicks-primary rounded-full">
                    <FiSend className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {posts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-gray-400">No posts yet</p>
          <p className="text-sm text-gray-500">Be the first to share something!</p>
        </div>
      )}
    </div>
  )
}

export default Home
