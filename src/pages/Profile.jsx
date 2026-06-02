import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { FiSettings, FiShare2, FiMapPin, FiLink, FiGrid, FiBookmark, FiHeart, FiMessageCircle, FiUsers, FiUserPlus, FiUserCheck } from 'react-icons/fi'

const Profile = () => {
  const { userId } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [savedPosts, setSavedPosts] = useState([])
  const [activeTab, setActiveTab] = useState('posts')
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const targetId = userId || user?.id
  const isOwnProfile = !userId || userId === user?.id

  useEffect(() => {
    if (targetId) {
      fetchProfile()
      fetchUserPosts()
      if (!isOwnProfile) checkFollowStatus()
    }
  }, [targetId])

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', targetId)
      .single()
    setProfile(data)
    
    // Get followers count
    const { count: followers } = await supabase
      .from('user_followers')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', targetId)
    setFollowersCount(followers || 0)
    
    const { count: following } = await supabase
      .from('user_followers')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', targetId)
    setFollowingCount(following || 0)
    
    setLoading(false)
  }

  const fetchUserPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', targetId)
      .order('created_at', { ascending: false })
    setPosts(data || [])
  }

  const checkFollowStatus = async () => {
    const { data } = await supabase
      .from('user_followers')
      .select('*')
      .eq('follower_id', user.id)
      .eq('following_id', targetId)
      .single()
    setIsFollowing(!!data)
  }

  const handleFollow = async () => {
    if (isFollowing) {
      await supabase
        .from('user_followers')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetId)
      setIsFollowing(false)
      setFollowersCount(prev => prev - 1)
    } else {
      await supabase
        .from('user_followers')
        .insert({ follower_id: user.id, following_id: targetId })
      setIsFollowing(true)
      setFollowersCount(prev => prev + 1)
      // Create notification
      await supabase.from('notifications').insert({
        user_id: targetId,
        from_user_id: user.id,
        type: 'follow',
        message: `${profile?.username} started following you`
      })
    }
  }

  if (loading) return <div className="p-4 text-center">Loading...</div>
  if (!profile) return <div className="p-4 text-center">User not found</div>

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
            {!isOwnProfile && (
              <button onClick={handleFollow} className="px-4 py-1 bg-flicks-primary rounded-full text-sm">
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
            {isOwnProfile && <FiSettings className="text-gray-400 cursor-pointer" />}
          </div>
          <div className="flex gap-6 text-center">
            <div><span className="font-bold">{posts.length}</span><br /><span className="text-xs text-gray-400">Posts</span></div>
            <div><span className="font-bold">{followersCount}</span><br /><span className="text-xs text-gray-400">Followers</span></div>
            <div><span className="font-bold">{followingCount}</span><br /><span className="text-xs text-gray-400">Following</span></div>
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

      {/* Tabs */}
      <div className="flex border-b border-white/10 mb-4">
        <button onClick={() => setActiveTab('posts')} className={`flex-1 py-2 flex items-center justify-center gap-2 ${activeTab === 'posts' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>
          <FiGrid /> Posts
        </button>
        <button onClick={() => setActiveTab('saved')} className={`flex-1 py-2 flex items-center justify-center gap-2 ${activeTab === 'saved' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>
          <FiBookmark /> Saved
        </button>
        <button className="flex-1 py-2 flex items-center justify-center gap-2 text-gray-400">
          <FiHeart /> Liked
        </button>
      </div>

      {/* Post Grid */}
      {activeTab === 'posts' && (
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
      )}
    </div>
  )
}

export default Profile
