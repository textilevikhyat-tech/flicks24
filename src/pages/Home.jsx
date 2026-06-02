import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiMoreHorizontal, FiSend, FiSmile } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const Home = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [newPost, setNewPost] = useState('')
  const [newPostImage, setNewPostImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stories] = useState([
    { id: 1, username: 'Your Story', avatar: user?.user_metadata?.avatar, isAdd: true },
    { id: 2, username: 'alex_chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', isLive: true },
    { id: 3, username: 'emily_wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', isLive: false },
    { id: 4, username: 'mike_johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', isLive: false },
    { id: 5, username: 'sarah_chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', isLive: true },
  ])

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, user:users(username, avatar, id)')
      .order('created_at', { ascending: false })
    
    if (data) setPosts(data)
    setLoading(false)
  }

  const handleCreatePost = async () => {
    if (!newPost.trim()) return
    
    const { data, error } = await supabase
      .from('posts')
      .insert([{
        user_id: user.id,
        content: newPost,
        image_url: newPostImage,
        likes_count: 0,
        comments_count: 0
      }])
      .select()
    
    if (data) {
      setNewPost('')
      setNewPostImage(null)
      fetchPosts()
    }
  }

  const handleLike = async (postId) => {
    const { error } = await supabase
      .from('post_likes')
      .insert({ post_id: postId, user_id: user.id })
    
    if (!error) {
      await supabase.rpc('increment_likes', { post_id: postId })
      fetchPosts()
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
          <button className="flex items-center gap-2 text-gray-400 hover:text-flicks-primary transition">
            📷 Photo
          </button>
          <button className="flex items-center gap-2 text-gray-400 hover:text-flicks-primary transition">
            🎥 Video
          </button>
          <button onClick={handleCreatePost} className="px-4 py-1 bg-flicks-primary rounded-full text-sm font-semibold">
            Post
          </button>
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

            {/* Post Actions */}
            <div className="flex justify-between pt-3 border-t border-white/10">
              <button onClick={() => handleLike(post.id)} className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition">
                <FiHeart /> {post.likes_count || 0}
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-flicks-secondary transition">
                <FiMessageCircle /> {post.comments_count || 0}
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition">
                <FiShare2 /> Share
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-yellow-500 transition">
                <FiBookmark /> Save
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Home
