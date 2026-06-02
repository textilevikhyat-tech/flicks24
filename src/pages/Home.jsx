import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { 
  FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiMoreHorizontal, 
  FiSend, FiSmile, FiThumbsUp, FiHeart as FiHeartFilled, FiFrown,
  FiTrash2, FiEdit2, FiFlag, FiX, FiImage, FiVideo, FiLink,
  FiLoader, FiCheck, FiAlertCircle
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import Stories from '../components/Stories'
import ContentLoader from 'react-content-loader'

// Reaction Picker Component
const ReactionPicker = ({ onReact, onClose, isVisible }) => {
  const pickerRef = useRef()
  const reactions = [
    { type: 'like', icon: <FiThumbsUp className="w-7 h-7 text-blue-500" />, label: 'Like' },
    { type: 'love', icon: <FiHeartFilled className="w-7 h-7 text-red-500" />, label: 'Love' },
    { type: 'wow', icon: <span className="text-3xl">😮</span>, label: 'Wow' },
    { type: 'sad', icon: <FiFrown className="w-7 h-7 text-yellow-500" />, label: 'Sad' },
  ]

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        onClose()
      }
    }
    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div ref={pickerRef} className="absolute bottom-full left-0 mb-2 bg-flicks-surface rounded-full p-2 flex gap-2 shadow-xl z-50 animate-fade-in">
      {reactions.map(react => (
        <button
          key={react.type}
          onClick={() => onReact(react.type)}
          className="hover:scale-125 transition-transform p-1"
          title={react.label}
        >
          {react.icon}
        </button>
      ))}
    </div>
  )
}

// Post Skeleton Loader
const PostSkeleton = () => (
  <div className="glass rounded-2xl p-4 mb-4">
    <ContentLoader 
      speed={2}
      width={400}
      height={200}
      viewBox="0 0 400 200"
      backgroundColor="#1a1a1a"
      foregroundColor="#2a2a2a"
    >
      <circle cx="30" cy="30" r="20" />
      <rect x="65" y="20" width="100" height="12" />
      <rect x="65" y="40" width="60" height="8" />
      <rect x="20" y="70" width="360" height="60" />
      <rect x="20" y="145" width="80" height="30" />
      <rect x="110" y="145" width="80" height="30" />
      <rect x="200" y="145" width="80" height="30" />
      <rect x="290" y="145" width="80" height="30" />
    </ContentLoader>
  </div>
)

// Post Options Menu
const PostOptionsMenu = ({ isOwner, onEdit, onDelete, onReport, onClose }) => {
  const menuRef = useRef()

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div ref={menuRef} className="absolute right-0 top-6 bg-flicks-surface rounded-xl shadow-lg z-50 w-40 overflow-hidden animate-fade-in">
      {isOwner && (
        <>
          <button onClick={onEdit} className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 flex items-center gap-2">
            <FiEdit2 className="w-4 h-4" /> Edit
          </button>
          <button onClick={onDelete} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-white/10 flex items-center gap-2">
            <FiTrash2 className="w-4 h-4" /> Delete
          </button>
        </>
      )}
      <button onClick={onReport} className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 flex items-center gap-2">
        <FiFlag className="w-4 h-4" /> Report
      </button>
    </div>
  )
}

// Single Post Component
const Post = ({ post, currentUser, onLike, onReaction, onComment, onDelete, onEdit, onReport, onSave, onShare }) => {
  const [showReactions, setShowReactions] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [isLiking, setIsLiking] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showFullContent, setShowFullContent] = useState(false)

  const emojis = ['😊', '😂', '❤️', '👍', '🔥', '🥺', '😍', '🎉', '😭', '👏']
  const isLongContent = post.content?.length > 200
  const displayContent = showFullContent ? post.content : post.content?.slice(0, 200)

  const userReaction = post.user_reaction || null

  const handleLikeClick = async () => {
    if (isLiking) return
    setIsLiking(true)
    await onLike(post.id)
    setIsLiking(false)
  }

  const handleSaveClick = async () => {
    if (isSaving) return
    setIsSaving(true)
    await onSave(post.id)
    setIsSaving(false)
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    await onComment(post.id, commentText)
    setCommentText('')
  }

  const addEmoji = (emoji) => {
    setCommentText(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  return (
    <div className="glass rounded-2xl mb-4 overflow-hidden animate-fade-in">
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <Link to={`/profile/${post.user?.id}`} className="flex gap-3 flex-1">
            <div className="story-ring">
              <img src={post.user?.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            </div>
            <div>
              <p className="font-semibold">{post.user?.username}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
                {post.is_edited && <span className="text-xs text-gray-600">· Edited</span>}
              </div>
            </div>
          </Link>
          
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-1">
              <FiMoreHorizontal className="text-gray-400 cursor-pointer" />
            </button>
            {showMenu && (
              <PostOptionsMenu
                isOwner={post.user?.id === currentUser?.id}
                onEdit={() => { setIsEditing(true); setShowMenu(false) }}
                onDelete={() => { onDelete(post.id); setShowMenu(false) }}
                onReport={() => { onReport(post.id); setShowMenu(false) }}
                onClose={() => setShowMenu(false)}
              />
            )}
          </div>
        </div>

        {/* Edit Mode */}
        {isEditing ? (
          <div className="mb-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-white/10 rounded-xl p-3 outline-none focus:ring-2 focus:ring-flicks-primary"
              rows="3"
            />
            <div className="flex gap-2 mt-2">
              <button onClick={() => onEdit(post.id, editContent)} className="px-3 py-1 bg-flicks-primary rounded-lg text-sm">Save</button>
              <button onClick={() => setIsEditing(false)} className="px-3 py-1 bg-white/10 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            {/* Content */}
            <p className="mb-3 whitespace-pre-wrap break-words">
              {displayContent}
              {isLongContent && !showFullContent && (
                <button onClick={() => setShowFullContent(true)} className="text-gray-500 text-sm ml-1 hover:text-flicks-primary">
                  ...see more
                </button>
              )}
            </p>
            
            {/* Image */}
            {post.image_url && (
              <img src={post.image_url} alt="Post" className="rounded-xl mb-3 w-full max-h-96 object-cover" />
            )}
          </>
        )}

        {/* Stats */}
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <div className="flex items-center gap-1">
            {post.reactions_count > 0 && (
              <div className="flex items-center gap-0.5">
                <FiHeartFilled className="w-4 h-4 text-red-500 fill-red-500" />
                <span>{post.reactions_count}</span>
              </div>
            )}
          </div>
          <button onClick={() => setShowComments(!showComments)} className="hover:text-flicks-secondary">
            {post.comments_count || 0} comments
          </button>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-3 border-t border-white/10">
          {/* Like/Reaction Button */}
          <div className="relative">
            <button 
              onClick={handleLikeClick}
              onMouseEnter={() => setShowReactions(true)}
              className={`flex items-center gap-2 transition ${userReaction ? 'text-flicks-primary' : 'text-gray-400 hover:text-flicks-primary'}`}
            >
              {isLiking ? (
                <FiLoader className="w-5 h-5 animate-spin" />
              ) : userReaction ? (
                userReaction === 'like' ? <FiThumbsUp className="w-5 h-5 fill-current" /> :
                userReaction === 'love' ? <FiHeartFilled className="w-5 h-5 fill-current" /> :
                <span className="text-xl leading-5">
                  {userReaction === 'wow' ? '😮' : userReaction === 'sad' ? '😢' : '❤️'}
                </span>
              ) : (
                <FiHeart className="w-5 h-5" />
              )}
              {userReaction ? (userReaction === 'like' ? 'Like' : userReaction === 'love' ? 'Love' : userReaction === 'wow' ? 'Wow' : 'Sad') : 'Like'}
            </button>
            <ReactionPicker
              isVisible={showReactions}
              onReact={(type) => { onReaction(post.id, type); setShowReactions(false) }}
              onClose={() => setShowReactions(false)}
            />
          </div>

          <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-2 text-gray-400 hover:text-flicks-secondary transition">
            <FiMessageCircle className="w-5 h-5" /> Comment
          </button>
          
          <button onClick={() => onShare(post)} className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition">
            <FiShare2 className="w-5 h-5" /> Share
          </button>
          
          <button onClick={handleSaveClick} className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition">
            {isSaving ? <FiLoader className="w-5 h-5 animate-spin" /> : <FiBookmark className="w-5 h-5" />}
            Save
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-3 border-t border-white/10">
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <FiSmile className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full bg-white/10 rounded-full pl-10 pr-4 py-2 text-sm outline-none focus:ring-1 focus:ring-flicks-primary"
                />
                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-2 bg-flicks-surface rounded-xl p-2 grid grid-cols-5 gap-1 z-10">
                    {emojis.map(emoji => (
                      <button key={emoji} type="button" onClick={() => addEmoji(emoji)} className="text-xl hover:scale-125 transition">
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" className="p-2 bg-flicks-primary rounded-full">
                <FiSend className="w-4 h-4" />
              </button>
            </form>

            {/* Sample comments - will be replaced with real data */}
            {post.comments?.slice(0, 2).map((comment) => (
              <div key={comment.id} className="mt-3 flex gap-2">
                <img src={comment.user?.avatar} alt="" className="w-6 h-6 rounded-full" />
                <div className="flex-1 bg-white/5 rounded-lg p-2">
                  <p className="text-xs font-semibold">{comment.user?.username}</p>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Main Home Component
const Home = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [newPost, setNewPost] = useState('')
  const [newPostImage, setNewPostImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [posting, setPosting] = useState(false)
  const [postError, setPostError] = useState('')
  const [postSuccess, setPostSuccess] = useState('')
  const fileInputRef = useRef(null)

  const fetchPosts = useCallback(async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(id, username, avatar),
        comments:comments(count),
        user_reaction:post_reactions!inner(reaction_type)
      `)
      .eq('user_reaction.user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching posts:', error)
    } else if (data) {
      // Transform data
      const transformedPosts = data.map(post => ({
        ...post,
        reactions_count: post.reactions_count || 0,
        comments_count: post.comments?.[0]?.count || 0,
        user_reaction: post.user_reaction?.[0]?.reaction_type || null
      }))
      setPosts(transformedPosts)
    }
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    fetchPosts()

    // Subscribe to new posts
    const subscription = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => {
        fetchPosts()
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, () => {
        fetchPosts()
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }, [fetchPosts])

  const handleCreatePost = async () => {
    if (!newPost.trim() && !newPostImage) {
      setPostError('Please write something or add an image')
      return
    }

    setPosting(true)
    setPostError('')
    setPostSuccess('')

    let imageUrl = null
    if (newPostImage) {
      // For demo - in production upload to Supabase storage
      imageUrl = URL.createObjectURL(newPostImage)
    }

    const { error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: newPost.trim(),
        image_url: imageUrl,
        reactions_count: 0,
        comments_count: 0
      })

    if (error) {
      setPostError(error.message)
    } else {
      setPostSuccess('Post created successfully!')
      setNewPost('')
      setNewPostImage(null)
      setImagePreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      fetchPosts()
      setTimeout(() => setPostSuccess(''), 3000)
    }
    setPosting(false)
  }

  const handleLike = async (postId) => {
    const existing = posts.find(p => p.id === postId)?.user_reaction
    const isLiked = existing === 'like'

    if (isLiked) {
      await supabase
        .from('post_reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
    } else {
      await supabase
        .from('post_reactions')
        .upsert({ post_id: postId, user_id: user.id, reaction_type: 'like' })
    }
    fetchPosts()
  }

  const handleReaction = async (postId, type) => {
    await supabase
      .from('post_reactions')
      .upsert({ post_id: postId, user_id: user.id, reaction_type: type })
    fetchPosts()
  }

  const handleComment = async (postId, content) => {
    const { error } = await supabase
      .from('comments')
      .insert({ post_id: postId, user_id: user.id, content })

    if (!error) {
      await supabase.rpc('increment_comments', { post_id: postId })
      fetchPosts()
    }
  }

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await supabase.from('posts').delete().eq('id', postId)
      fetchPosts()
    }
  }

  const handleEditPost = async (postId, newContent) => {
    await supabase
      .from('posts')
      .update({ content: newContent, is_edited: true })
      .eq('id', postId)
    fetchPosts()
  }

  const handleReportPost = async (postId) => {
    const reason = prompt('Why are you reporting this post?')
    if (reason) {
      await supabase
        .from('reports')
        .insert({ post_id: postId, user_id: user.id, reason })
      alert('Thank you for reporting. Our team will review it.')
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
    } else {
      await supabase.from('saved_posts').insert({ post_id: postId, user_id: user.id })
    }
  }

  const handleShare = async (post) => {
    const shareUrl = `${window.location.origin}/post/${post.id}`
    try {
      await navigator.share({ title: 'Check this post', text: post.content, url: shareUrl })
    } catch {
      navigator.clipboard.writeText(shareUrl)
      alert('Link copied to clipboard!')
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setNewPostImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setNewPostImage(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const refreshFeed = async () => {
    setRefreshing(true)
    await fetchPosts()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-20 bg-flicks-surface rounded-2xl mb-4"></div>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      {/* Stories */}
      <Stories />

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

        {imagePreview && (
          <div className="relative mt-3">
            <img src={imagePreview} alt="Preview" className="rounded-xl max-h-48 w-auto" />
            <button onClick={removeImage} className="absolute top-2 right-2 p-1 bg-black/50 rounded-full">
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {postError && (
          <div className="mt-3 p-2 bg-red-500/20 border border-red-500 rounded-xl flex items-center gap-2 text-red-400 text-sm">
            <FiAlertCircle className="w-4 h-4" />
            {postError}
          </div>
        )}

        {postSuccess && (
          <div className="mt-3 p-2 bg-green-500/20 border border-green-500 rounded-xl flex items-center gap-2 text-green-400 text-sm">
            <FiCheck className="w-4 h-4" />
            {postSuccess}
          </div>
        )}

        <div className="flex justify-between mt-3 pt-3 border-t border-white/10">
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-gray-400 hover:text-flicks-primary transition">
            <FiImage /> Photo
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          <button className="flex items-center gap-2 text-gray-400 hover:text-flicks-primary transition">
            <FiVideo /> Video
          </button>
          <button className="flex items-center gap-2 text-gray-400 hover:text-flicks-primary transition">
            <FiLink /> Link
          </button>
          <button
            onClick={handleCreatePost}
            disabled={posting}
            className="px-5 py-1.5 gradient-bg rounded-full text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
          >
            {posting ? <FiLoader className="w-4 h-4 animate-spin" /> : 'Post'}
          </button>
        </div>
      </div>

      {/* Refresh Indicator */}
      {refreshing && (
        <div className="flex justify-center mb-4">
          <div className="bg-flicks-surface rounded-full px-4 py-1 text-sm flex items-center gap-2">
            <FiLoader className="w-4 h-4 animate-spin" />
            Refreshing feed...
          </div>
        </div>
      )}

      {/* Feed Posts */}
      {posts.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
          <p className="text-gray-400">Be the first to share something with your friends!</p>
        </div>
      ) : (
        posts.map((post) => (
          <Post
            key={post.id}
            post={post}
            currentUser={user}
            onLike={handleLike}
            onReaction={handleReaction}
            onComment={handleComment}
            onDelete={handleDeletePost}
            onEdit={handleEditPost}
            onReport={handleReportPost}
            onSave={handleSavePost}
            onShare={handleShare}
          />
        ))
      )}
    </div>
  )
}

export default Home
