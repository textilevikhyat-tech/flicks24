import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { 
  FiSettings, FiShare2, FiMapPin, FiLink, FiCalendar, FiEdit2,
  FiGrid, FiBookmark, FiHeart, FiUsers, FiUserPlus, FiUserCheck,
  FiMessageCircle, FiMoreHorizontal, FiFlag, FiLock, FiUnlock,
  FiLoader, FiCheck, FiX, FiCamera, FiImage, FiLogOut
} from 'react-icons/fi'

// Profile Header Skeleton
const ProfileSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-32 bg-flicks-surface rounded-2xl mb-16"></div>
    <div className="flex justify-center -mt-12 mb-4">
      <div className="w-24 h-24 rounded-full bg-flicks-surface border-4 border-flicks-dark"></div>
    </div>
    <div className="h-6 w-32 bg-flicks-surface rounded mx-auto mb-2"></div>
    <div className="h-4 w-48 bg-flicks-surface rounded mx-auto mb-4"></div>
    <div className="flex justify-center gap-8 mb-6">
      <div className="text-center"><div className="h-6 w-12 bg-flicks-surface rounded mb-1"></div><div className="h-3 w-8 bg-flicks-surface rounded"></div></div>
      <div className="text-center"><div className="h-6 w-12 bg-flicks-surface rounded mb-1"></div><div className="h-3 w-8 bg-flicks-surface rounded"></div></div>
      <div className="text-center"><div className="h-6 w-12 bg-flicks-surface rounded mb-1"></div><div className="h-3 w-8 bg-flicks-surface rounded"></div></div>
    </div>
    <div className="h-10 w-40 bg-flicks-surface rounded-full mx-auto"></div>
  </div>
)

// Edit Profile Modal
const EditProfileModal = ({ isOpen, onClose, profile, onUpdate }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    location: '',
    website: ''
  })
  const [avatarFile, setAvatarFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const avatarInputRef = useRef(null)
  const coverInputRef = useRef(null)

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || ''
      })
      setAvatarPreview(profile.avatar)
      setCoverPreview(profile.cover_image)
    }
  }, [profile])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  const handleCoverChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    let avatarUrl = profile?.avatar
    let coverUrl = profile?.cover_image

    // In production, upload to Supabase storage here
    if (avatarFile) {
      avatarUrl = URL.createObjectURL(avatarFile)
    }
    if (coverFile) {
      coverUrl = URL.createObjectURL(coverFile)
    }

    await onUpdate({
      full_name: formData.full_name,
      bio: formData.bio,
      location: formData.location,
      website: formData.website,
      avatar: avatarUrl,
      cover_image: coverUrl
    })
    
    setLoading(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 glass p-4 flex justify-between items-center border-b border-white/10">
          <h2 className="text-xl font-semibold">Edit Profile</h2>
          <button onClick={onClose} className="p-1"><FiX className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Cover Photo */}
          <div>
            <label className="text-sm text-gray-400 block mb-1">Cover Photo</label>
            <div 
              className="relative h-32 bg-flicks-surface rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => coverInputRef.current?.click()}
            >
              {coverPreview && <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <FiCamera className="w-6 h-6" />
              </div>
            </div>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
          </div>

          {/* Profile Photo */}
          <div>
            <label className="text-sm text-gray-400 block mb-1">Profile Photo</label>
            <div 
              className="relative w-24 h-24 rounded-full bg-flicks-surface overflow-hidden cursor-pointer group mx-auto"
              onClick={() => avatarInputRef.current?.click()}
            >
              {avatarPreview && <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <FiCamera className="w-6 h-6" />
              </div>
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* Full Name */}
          <div>
            <label className="text-sm text-gray-400 block mb-1">Full Name</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
              className="w-full bg-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-flicks-primary"
              placeholder="Your full name"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="text-sm text-gray-400 block mb-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full bg-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-flicks-primary resize-none"
              rows="3"
              placeholder="Tell something about yourself"
            />
          </div>

          {/* Location */}
          <div>
            <label className="text-sm text-gray-400 block mb-1">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full bg-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-flicks-primary"
              placeholder="City, Country"
            />
          </div>

          {/* Website */}
          <div>
            <label className="text-sm text-gray-400 block mb-1">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              className="w-full bg-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-flicks-primary"
              placeholder="https://..."
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="flex-1 gradient-bg py-2 rounded-xl font-semibold">
              {loading ? <FiLoader className="w-5 h-5 animate-spin mx-auto" /> : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-white/10 py-2 rounded-xl font-semibold">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Followers/Following Modal
const FollowListModal = ({ isOpen, onClose, title, users, type, currentUserId, onFollow }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="p-1"><FiX className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {users.map((user) => (
            <div key={user.id} className="flex items-center gap-3">
              <Link to={`/profile/${user.id}`} className="flex items-center gap-3 flex-1">
                <img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.full_name}</p>
                </div>
              </Link>
              {user.id !== currentUserId && (
                <button
                  onClick={() => onFollow(user.id, type === 'followers' ? 'following' : 'follower')}
                  className={`px-4 py-1 rounded-full text-sm ${user.is_following ? 'bg-white/10' : 'gradient-bg'}`}
                >
                  {user.is_following ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Main Profile Component
const Profile = () => {
  const { userId } = useParams()
  const { user, profile: currentProfile, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [savedPosts, setSavedPosts] = useState([])
  const [activeTab, setActiveTab] = useState('posts')
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followersCount, setFollowersCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [followersList, setFollowersList] = useState([])
  const [followingList, setFollowingList] = useState([])
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [showFollowingModal, setShowFollowingModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [reporting, setReporting] = useState(false)
  const menuRef = useRef(null)

  const targetId = userId || user?.id
  const isOwnProfile = !userId || userId === user?.id

  useEffect(() => {
    if (targetId) {
      fetchProfile()
      fetchUserPosts()
      if (!isOwnProfile) {
        checkFollowStatus()
        checkBlockStatus()
      }
    }
  }, [targetId, isOwnProfile])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', targetId)
      .single()

    if (data) {
      setProfile(data)
      await fetchFollowCounts(targetId)
    }
    setLoading(false)
  }

  const fetchFollowCounts = async (userId) => {
    const { count: followers } = await supabase
      .from('user_followers')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)
    
    const { count: following } = await supabase
      .from('user_followers')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId)

    setFollowersCount(followers || 0)
    setFollowingCount(following || 0)
  }

  const fetchUserPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', targetId)
      .order('created_at', { ascending: false })
    setPosts(data || [])
  }

  const fetchSavedPosts = async () => {
    const { data } = await supabase
      .from('saved_posts')
      .select('posts(*)')
      .eq('user_id', user?.id)
    setSavedPosts(data?.map(s => s.posts) || [])
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

  const checkBlockStatus = async () => {
    const { data } = await supabase
      .from('user_blocks')
      .select('*')
      .eq('blocker_id', user.id)
      .eq('blocked_id', targetId)
      .single()
    setIsBlocked(!!data)
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
        message: `${currentProfile?.username} started following you`
      })
    }
  }

  const handleBlock = async () => {
    if (window.confirm(`Are you sure you want to block ${profile?.username}? They won't be able to see your posts or interact with you.`)) {
      if (isBlocked) {
        await supabase
          .from('user_blocks')
          .delete()
          .eq('blocker_id', user.id)
          .eq('blocked_id', targetId)
        setIsBlocked(false)
      } else {
        await supabase
          .from('user_blocks')
          .insert({ blocker_id: user.id, blocked_id: targetId })
        setIsBlocked(true)
        // Unfollow if following
        if (isFollowing) {
          await supabase
            .from('user_followers')
            .delete()
            .eq('follower_id', user.id)
            .eq('following_id', targetId)
          setIsFollowing(false)
        }
      }
      setShowMenu(false)
    }
  }

  const handleReportUser = async () => {
    const reason = prompt('Why are you reporting this user?')
    if (reason) {
      setReporting(true)
      await supabase.from('user_reports').insert({
        reported_id: targetId,
        reporter_id: user.id,
        reason
      })
      alert('Thank you for reporting. Our team will review this.')
      setReporting(false)
    }
    setShowMenu(false)
  }

  const handleUpdateProfile = async (updates) => {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
    
    if (!error) {
      setProfile(prev => ({ ...prev, ...updates }))
      await updateProfile(updates)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'saved') fetchSavedPosts()
  }

  const shareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${targetId}`
    try {
      await navigator.share({ title: `${profile?.username}'s profile`, url: profileUrl })
    } catch {
      navigator.clipboard.writeText(profileUrl)
      alert('Profile link copied!')
    }
  }

  if (loading) return <ProfileSkeleton />
  if (!profile) return <div className="p-4 text-center">User not found</div>

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      {/* Cover Photo */}
      <div className="relative mb-16">
        <div className="h-48 rounded-2xl overflow-hidden bg-gradient-to-r from-flicks-primary/30 to-flicks-secondary/30">
          {profile.cover_image && <img src={profile.cover_image} alt="Cover" className="w-full h-full object-cover" />}
        </div>
        
        {/* Profile Picture */}
        <div className="absolute -bottom-12 left-4">
          <div className="story-ring">
            <img src={profile.avatar} alt="" className="w-24 h-24 rounded-full object-cover border-4 border-flicks-dark" />
          </div>
        </div>

        {/* Menu Button */}
        {!isOwnProfile && (
          <div className="absolute top-4 right-4" ref={menuRef}>
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 bg-black/50 rounded-full">
              <FiMoreHorizontal className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 bg-flicks-surface rounded-xl shadow-lg w-48 overflow-hidden z-20">
                <button onClick={handleBlock} className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 flex items-center gap-2">
                  {isBlocked ? <FiUnlock className="w-4 h-4" /> : <FiLock className="w-4 h-4" />}
                  {isBlocked ? 'Unblock User' : 'Block User'}
                </button>
                <button onClick={handleReportUser} disabled={reporting} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-white/10 flex items-center gap-2">
                  <FiFlag className="w-4 h-4" /> Report User
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="mt-2">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-xl font-semibold">{profile.username}</h2>
            {profile.full_name && <p className="text-gray-400">{profile.full_name}</p>}
          </div>
          
          {isOwnProfile ? (
            <div className="flex gap-2">
              <button onClick={() => setShowEditModal(true)} className="px-4 py-1.5 bg-white/10 rounded-full text-sm font-semibold flex items-center gap-2">
                <FiEdit2 className="w-4 h-4" /> Edit Profile
              </button>
              <button onClick={shareProfile} className="p-1.5 bg-white/10 rounded-full">
                <FiShare2 className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/settings')} className="p-1.5 bg-white/10 rounded-full">
                <FiSettings className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              {!isBlocked ? (
                <>
                  <button
                    onClick={handleFollow}
                    className={`px-6 py-1.5 rounded-full text-sm font-semibold ${isFollowing ? 'bg-white/10' : 'gradient-bg'}`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button className="p-1.5 bg-white/10 rounded-full">
                    <FiMessageCircle className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button className="px-6 py-1.5 bg-red-500/20 text-red-500 rounded-full text-sm font-semibold" disabled>
                  Blocked
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bio */}
        {profile.bio && <p className="text-sm text-gray-300 mt-2">{profile.bio}</p>}
        
        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
          {profile.location && <span className="flex items-center gap-1"><FiMapPin className="w-3 h-3" /> {profile.location}</span>}
          {profile.website && <span className="flex items-center gap-1"><FiLink className="w-3 h-3" /> <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-flicks-secondary">{profile.website}</a></span>}
          <span className="flex items-center gap-1"><FiCalendar className="w-3 h-3" /> Joined {new Date(profile.created_at).toLocaleDateString()}</span>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-4">
          <button onClick={() => setShowFollowersModal(true)} className="text-center">
            <span className="font-bold">{followersCount}</span>
            <span className="text-xs text-gray-400 block">Followers</span>
          </button>
          <button onClick={() => setShowFollowingModal(true)} className="text-center">
            <span className="font-bold">{followingCount}</span>
            <span className="text-xs text-gray-400 block">Following</span>
          </button>
          <div className="text-center">
            <span className="font-bold">{posts.length}</span>
            <span className="text-xs text-gray-400 block">Posts</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 mt-6">
        <button onClick={() => handleTabChange('posts')} className={`flex-1 py-3 flex items-center justify-center gap-2 ${activeTab === 'posts' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>
          <FiGrid className="w-4 h-4" /> Posts
        </button>
        <button onClick={() => handleTabChange('saved')} className={`flex-1 py-3 flex items-center justify-center gap-2 ${activeTab === 'saved' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>
          <FiBookmark className="w-4 h-4" /> Saved
        </button>
        <button className="flex-1 py-3 flex items-center justify-center gap-2 text-gray-400">
          <FiHeart className="w-4 h-4" /> Liked
        </button>
      </div>

      {/* Post Grid */}
      <div className="grid grid-cols-3 gap-1 mt-2">
        {(activeTab === 'posts' ? posts : savedPosts).map((post) => (
          <Link key={post.id} to={`/post/${post.id}`} className="aspect-square bg-flicks-surface rounded-lg overflow-hidden">
            {post.image_url ? (
              <img src={post.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-flicks-primary/20 to-flicks-secondary/20">
                📝
              </div>
            )}
          </Link>
        ))}
      </div>

      {(activeTab === 'posts' ? posts : savedPosts).length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-gray-400">No {activeTab === 'posts' ? 'posts' : 'saved posts'} yet</p>
        </div>
      )}

      {/* Modals */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        profile={profile}
        onUpdate={handleUpdateProfile}
      />

      <FollowListModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        title="Followers"
        users={followersList}
        type="followers"
        currentUserId={user?.id}
        onFollow={handleFollow}
      />

      <FollowListModal
        isOpen={showFollowingModal}
        onClose={() => setShowFollowingModal(false)}
        title="Following"
        users={followingList}
        type="following"
        currentUserId={user?.id}
        onFollow={handleFollow}
      />
    </div>
  )
}

export default Profile
