import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { Link } from 'react-router-dom'
import { 
  FiUsers, FiPlus, FiSettings, FiTrash2, FiEdit2, FiX, 
  FiLoader, FiSearch, FiTrendingUp, FiHeart, FiMessageCircle,
  FiCheckCircle
} from 'react-icons/fi'

// Hook Card Component
const HookCard = ({ hook, currentUserId, onFollow, onUnfollow, onDelete, onEdit }) => {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    setIsFollowing(hook.is_following || false)
  }, [hook.is_following])

  const handleFollow = async () => {
    setIsToggling(true)
    if (isFollowing) {
      await onUnfollow(hook.id)
      setIsFollowing(false)
    } else {
      await onFollow(hook.id)
      setIsFollowing(true)
    }
    setIsToggling(false)
  }

  const isAdmin = hook.admin_id === currentUserId

  return (
    <div className="glass rounded-2xl p-4 hover:bg-white/5 transition">
      <div className="flex gap-3">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-flicks-primary to-flicks-secondary flex items-center justify-center text-2xl flex-shrink-0">
          {hook.logo || '🔗'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <Link to={`/hook/${hook.id}`}>
              <h3 className="font-semibold hover:text-flicks-primary">{hook.name}</h3>
            </Link>
            {(isAdmin) && (
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="p-1">
                  <FiSettings className="w-4 h-4 text-gray-400" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-6 bg-flicks-surface rounded-xl shadow-lg w-32 z-10">
                    <button onClick={() => onEdit(hook)} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 flex items-center gap-2">
                      <FiEdit2 className="w-3 h-3" /> Edit
                    </button>
                    <button onClick={() => onDelete(hook.id)} className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-white/10 flex items-center gap-2">
                      <FiTrash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-400 line-clamp-1">{hook.description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><FiUsers className="w-3 h-3" /> {hook.follower_count || 0} followers</span>
            <span className="flex items-center gap-1"><FiTrendingUp className="w-3 h-3" /> {hook.post_count || 0} posts</span>
            {hook.verified && <span className="flex items-center gap-1 text-flicks-primary"><FiCheckCircle className="w-3 h-3" /> Verified</span>}
          </div>
        </div>
        <div>
          <button
            onClick={handleFollow}
            disabled={isToggling}
            className={`px-3 py-1 rounded-full text-xs ${isFollowing ? 'bg-white/10' : 'gradient-bg'}`}
          >
            {isToggling ? <FiLoader className="w-3 h-3 animate-spin" /> : (isFollowing ? 'Following' : 'Follow')}
          </button>
        </div>
      </div>
    </div>
  )
}

// Create/Edit Hook Modal
const HookModal = ({ isOpen, onClose, onSave, hook }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    logo: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const categories = ['Technology', 'Food', 'Travel', 'Fashion', 'Music', 'Sports', 'Art', 'Business', 'Entertainment', 'Other']

  useEffect(() => {
    if (hook) {
      setFormData({
        name: hook.name || '',
        description: hook.description || '',
        category: hook.category || '',
        logo: hook.logo || ''
      })
    } else {
      setFormData({ name: '', description: '', category: '', logo: '' })
    }
  }, [hook])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Hook name is required')
      return
    }
    setLoading(true)
    setError('')
    await onSave(formData)
    setLoading(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl w-full max-w-md">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-semibold">{hook ? 'Edit Hook' : 'Create New Hook'}</h2>
          <button onClick={onClose} className="p-1"><FiX className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Hook Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-flicks-primary"
              placeholder="e.g., Tech News Daily"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full bg-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-flicks-primary"
            >
              <option value="">Select category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-flicks-primary resize-none"
              rows="3"
              placeholder="What is this hook about?"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full gradient-bg py-2 rounded-xl font-semibold">
            {loading ? <FiLoader className="w-5 h-5 animate-spin mx-auto" /> : (hook ? 'Save Changes' : 'Create Hook')}
          </button>
        </form>
      </div>
    </div>
  )
}

// Main Hooks Component
const Hooks = () => {
  const { user } = useAuth()
  const [hooks, setHooks] = useState([])
  const [myHooks, setMyHooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingHook, setEditingHook] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const fetchHooks = useCallback(async () => {
    let query = supabase
      .from('hooks')
      .select(`
        *,
        followers:hook_followers(count),
        posts:hook_posts(count)
      `)

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`)
    }
    if (selectedCategory) {
      query = query.eq('category', selectedCategory)
    }

    const { data, error } = await query.order('follower_count', { ascending: false }).limit(50)

    if (data) {
      // Check if user follows each hook
      const { data: follows } = await supabase
        .from('hook_followers')
        .select('hook_id')
        .eq('user_id', user?.id)

      const followedIds = new Set(follows?.map(f => f.hook_id) || [])

      const transformed = data.map(hook => ({
        ...hook,
        follower_count: hook.followers?.[0]?.count || 0,
        post_count: hook.posts?.[0]?.count || 0,
        is_following: followedIds.has(hook.id)
      }))
      setHooks(transformed)
    }
    setLoading(false)
  }, [searchQuery, selectedCategory, user?.id])

  const fetchMyHooks = useCallback(async () => {
    const { data, error } = await supabase
      .from('hooks')
      .select('*')
      .eq('admin_id', user?.id)

    if (data) {
      setMyHooks(data)
    }
  }, [user?.id])

  useEffect(() => {
    fetchHooks()
    fetchMyHooks()
  }, [fetchHooks, fetchMyHooks])

  const handleCreateHook = async (formData) => {
    const { data, error } = await supabase
      .from('hooks')
      .insert({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        admin_id: user.id,
        logo: formData.logo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`
      })
      .select()
      .single()

    if (!error && data) {
      await supabase.from('hook_followers').insert({
        hook_id: data.id,
        user_id: user.id
      })
      fetchHooks()
      fetchMyHooks()
    }
  }

  const handleUpdateHook = async (formData) => {
    const { error } = await supabase
      .from('hooks')
      .update({
        name: formData.name,
        description: formData.description,
        category: formData.category
      })
      .eq('id', editingHook.id)

    if (!error) {
      fetchHooks()
      fetchMyHooks()
      setEditingHook(null)
    }
  }

  const handleDeleteHook = async (hookId) => {
    if (window.confirm('Are you sure you want to delete this hook? This action cannot be undone.')) {
      const { error } = await supabase.from('hooks').delete().eq('id', hookId)
      if (!error) {
        fetchHooks()
        fetchMyHooks()
      }
    }
  }

  const handleFollowHook = async (hookId) => {
    await supabase.from('hook_followers').insert({ hook_id: hookId, user_id: user.id })
    fetchHooks()
  }

  const handleUnfollowHook = async (hookId) => {
    await supabase.from('hook_followers').delete().eq('hook_id', hookId).eq('user_id', user.id)
    fetchHooks()
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-10 bg-flicks-surface rounded-2xl mb-4"></div>
          <div className="h-20 bg-flicks-surface rounded-2xl mb-3"></div>
          <div className="h-20 bg-flicks-surface rounded-2xl mb-3"></div>
        </div>
      </div>
    )
  }

  const displayHooks = activeTab === 'all' ? hooks : myHooks

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold gradient-text">Hooks</h1>
        <button onClick={() => setShowCreateModal(true)} className="gradient-bg p-2 rounded-full">
          <FiPlus className="w-5 h-5" />
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search hooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 rounded-xl pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-flicks-primary text-sm"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-flicks-primary text-sm"
        >
          <option value="">All Categories</option>
          <option value="Technology">Technology</option>
          <option value="Food">Food</option>
          <option value="Travel">Travel</option>
          <option value="Fashion">Fashion</option>
          <option value="Music">Music</option>
          <option value="Sports">Sports</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-white/10">
        <button onClick={() => setActiveTab('all')} className={`pb-2 ${activeTab === 'all' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>
          Discover
        </button>
        <button onClick={() => setActiveTab('my')} className={`pb-2 ${activeTab === 'my' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>
          My Hooks ({myHooks.length})
        </button>
      </div>

      {/* Hooks List */}
      <div className="space-y-3">
        {displayHooks.map((hook) => (
          <HookCard
            key={hook.id}
            hook={hook}
            currentUserId={user?.id}
            onFollow={handleFollowHook}
            onUnfollow={handleUnfollowHook}
            onDelete={handleDeleteHook}
            onEdit={setEditingHook}
          />
        ))}
      </div>

      {displayHooks.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-5xl mb-3">🔗</div>
          <h3 className="text-lg font-semibold mb-1">No hooks found</h3>
          <p className="text-gray-400 text-sm">
            {activeTab === 'all' ? 'Try different search terms' : 'You haven\'t created any hooks yet'}
          </p>
          {activeTab === 'all' && (
            <button onClick={() => setShowCreateModal(true)} className="mt-4 gradient-bg px-4 py-2 rounded-full text-sm">
              Create a Hook
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <HookModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateHook}
      />

      <HookModal
        isOpen={!!editingHook}
        onClose={() => setEditingHook(null)}
        onSave={handleUpdateHook}
        hook={editingHook}
      />
    </div>
  )
}

export default Hooks
