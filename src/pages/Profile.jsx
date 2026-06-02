import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { FiSettings, FiShare2, FiMapPin, FiLink } from 'react-icons/fi'

const Profile = () => {
  const { userId } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    fetchProfile()
    fetchUserPosts()
  }, [userId])

  const fetchProfile = async () => {
    const targetId = userId || user?.id
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', targetId)
      .single()
    setProfile(data)
  }

  const fetchUserPosts = async () => {
    const targetId = userId || user?.id
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', targetId)
      .order('created_at', { ascending: false })
    setPosts(data || [])
  }

  if (!profile) return <div className="p-4">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-6">
        <div className="story-ring">
          <img src={profile.avatar} alt="" className="w-20 h-20 rounded-full object-cover" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-xl font-semibold">{profile.username}</h2>
            <FiSettings className="text-gray-400 cursor-pointer" />
          </div>
          <div className="flex gap-4 text-center">
            <div><span className="font-bold">{posts.length}</span><br /><span className="text-xs text-gray-400">Posts</span></div>
            <div><span className="font-bold">0</span><br /><span className="text-xs text-gray-400">Followers</span></div>
            <div><span className="font-bold">0</span><br /><span className="text-xs text-gray-400">Following</span></div>
          </div>
        </div>
      </div>

      {/* Bio */}
      <div className="mb-6">
        <div className="font-semibold">{profile.full_name || profile.username}</div>
        <div className="text-sm text-gray-300">{profile.bio || 'No bio yet'}</div>
        {profile.location && <div className="text-sm text-gray-400 flex items-center gap-1 mt-1"><FiMapPin /> {profile.location}</div>}
        {profile.website && <div className="text-sm text-gray-400 flex items-center gap-1"><FiLink /> {profile.website}</div>}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-6">
        <button className="flex-1 bg-flicks-primary py-2 rounded-lg font-semibold">Edit Profile</button>
        <button className="flex-1 bg-white/10 py-2 rounded-lg font-semibold">Share Profile</button>
      </div>

      {/* Post Grid */}
      <div className="grid grid-cols-3 gap-1">
        {posts.map((post) => (
          <div key={post.id} className="aspect-square bg-flicks-surface rounded-lg flex items-center justify-center overflow-hidden">
            {post.image_url ? (
              <img src={post.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="text-2xl">📝</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Profile
