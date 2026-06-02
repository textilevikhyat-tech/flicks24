import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { FiHeart, FiMessageCircle, FiShare2, FiBookmark, FiMoreHorizontal } from 'react-icons/fi'

const Home = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [newPost, setNewPost] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('*, user:users(username, avatar)')
      .order('created_at', { ascending: false })
    
    if (data) setPosts(data)
    setLoading(false)
  }

  const handleLike = async (postId) => {
    const { error } = await supabase
      .from('post_likes')
      .insert({ post_id: postId, user_id: user.id })
    
    if (!error) fetchPosts()
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
      {/* Create Post */}
      <div className="glass rounded-2xl p-4 mb-6">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-flicks-primary to-flicks-secondary flex items-center justify-center text-white font-bold">
            {user?.user_metadata?.username?.[0]?.toUpperCase() || 'U'}
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
          <button className="flex items-center gap-2 text-gray-400 hover:text-flicks-primary transition">
            🔗 Link
          </button>
        </div>
      </div>

      {/* Feed */}
      {posts.map((post) => (
        <div key={post.id} className="glass rounded-2xl mb-4 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="story-ring">
                  <img src={post.user?.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold">{post.user?.username}</p>
                  <p className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
                </div>
              </div>
              <FiMoreHorizontal className="text-gray-400 cursor-pointer" />
            </div>
            <p className="mb-3">{post.content}</p>
            {post.image_url && (
              <img src={post.image_url} alt="Post" className="rounded-xl mb-3 w-full" />
            )}
            <div className="flex justify-between pt-3 border-t border-white/10">
              <button className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition" onClick={() => handleLike(post.id)}>
                <FiHeart /> Like
              </button>
              <button className="flex items-center gap-2 text-gray-400 hover:text-flicks-secondary transition">
                <FiMessageCircle /> Comment
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
