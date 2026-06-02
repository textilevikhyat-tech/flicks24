import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { Link } from 'react-router-dom'
import { 
  FiUsers, FiPlus, FiLock, FiGlobe, FiUserPlus, FiSettings, 
  FiTrash2, FiEdit2, FiX, FiLoader, FiCheck, FiAlertCircle,
  FiSearch, FiFilter, FiMessageCircle, FiShare2
} from 'react-icons/fi'

// Circle Card Component
const CircleCard = ({ circle, currentUserId, onJoin, onLeave, onDelete, onEdit }) => {
  const [isJoining, setIsJoining] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const isMember = circle.members?.some(m => m.user_id === currentUserId)
  const isAdmin = circle.admin_id === currentUserId
  const isModerator = circle.moderators?.includes(currentUserId)

  const handleJoin = async () => {
    setIsJoining(true)
    await onJoin(circle.id)
    setIsJoining(false)
  }

  const handleLeave = async () => {
    if (window.confirm(`Are you sure you want to leave ${circle.name}?`)) {
      setIsJoining(true)
      await onLeave(circle.id)
      setIsJoining(false)
    }
  }

  const getIcon = () => {
    switch(circle.type) {
      case 'public': return <FiGlobe className="w-3 h-3 text-green-500" />
      case 'private': return <FiLock className="w-3 h-3 text-yellow-500" />
      default: return <FiLock className="w-3 h-3 text-red-500" />
    }
  }

  return (
    <div className="glass rounded-2xl p-4 hover:bg-white/5 transition">
      <div className="flex gap-3">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-flicks-primary to-flicks-secondary flex items-center justify-center text-2xl flex-shrink-0">
          {circle.avatar || '⭕'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link to={`/circle/${circle.id}`}>
                <h3 className="font-semibold hover:text-flicks-primary">{circle.name}</h3>
              </Link>
              {getIcon()}
            </div>
            {(isAdmin || isModerator) && (
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="p-1">
                  <FiSettings className="w-4 h-4 text-gray-400" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 top-6 bg-flicks-surface rounded-xl shadow-lg w-36 z-10">
                    {isAdmin && (
                      <button onClick={() => onEdit(circle)} className="w-full text-left px-3 py-2 text-xs hover:bg-white/10 flex items-center gap-2">
                        <FiEdit2 className="w-3 h-3" /> Edit
                      </button>
                    )}
                    {isAdmin && (
                      <button onClick={() => onDelete(circle.id)} className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-white/10 flex items-center gap-2">
                        <FiTrash2 className="w-3 h-3" /> Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-400 line-clamp-1">{circle.description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><FiUsers className="w-3 h-3" /> {circle.member_count || 0} members</span>
            <span>{circle.post_count || 0} posts</span>
          </div>
        </div>
        <div>
          {isMember ? (
            <button
              onClick={handleLeave}
              disabled={isJoining}
              className="px-3 py-1 bg-white/10 rounded-full text-xs hover:bg-red-500/20 hover:text-red-400 transition"
            >
              {isJoining ? <FiLoader className="w-3 h-3 animate-spin" /> : 'Leave'}
            </button>
          ) : (
            <button
              onClick={handleJoin}
              disabled={isJoining}
              className="px-3 py-1 gradient-bg rounded-full text-xs"
            >
              {isJoining ? <FiLoader className="w-3 h-3 animate-spin" /> : circle.type === 'public' ? 'Join' : 'Request'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Create/Edit Circle Modal
const CircleModal = ({ isOpen, onClose, onSave, circle }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'public',
    avatar: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (circle) {
      setFormData({
        name: circle.name || '',
        description: circle.description || '',
        type: circle.type || 'public',
        avatar: circle.avatar || ''
      })
    } else {
      setFormData({ name: '', description: '', type: 'public', avatar: '' })
    }
  }, [circle])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Circle name is required')
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
          <h2 className="text-xl font-semibold">{circle ? 'Edit Circle' : 'Create New Circle'}</h2>
          <button onClick={onClose} className="p-1"><FiX className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Circle Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-flicks-primary"
              placeholder="e.g., Tech Enthusiasts"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-flicks-primary resize-none"
              rows="3"
              placeholder="What is this circle about?"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Privacy Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full bg-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-flicks-primary"
            >
              <option value="public">🌍 Public - Anyone can join</option>
              <option value="private">🔒 Private - Request to join</option>
              <option value="secret">🤫 Secret - Hidden from search</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full gradient-bg py-2 rounded-xl font-semibold">
            {loading ? <FiLoader className="w-5 h-5 animate-spin mx-auto" /> : (circle ? 'Save Changes' : 'Create Circle')}
          </button>
        </form>
      </div>
    </div>
  )
}

// Main Circles Component
const Circles = () => {
  const { user } = useAuth()
  const [circles, setCircles] = useState([])
  const [myCircles, setMyCircles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCircle, setEditingCircle] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')

  const fetchCircles = useCallback(async () => {
    let query = supabase
      .from('circles')
      .select(`
        *,
        members:circle_members(count),
        posts:circle_posts(count),
        admin:users!admin_id(username, avatar)
      `)

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`)
    }
    if (filterType !== 'all') {
      query = query.eq('type', filterType)
    }

    const { data, error } = await query.order('member_count', { ascending: false }).limit(50)

    if (data) {
      const transformed = data.map(circle => ({
        ...circle,
        member_count: circle.members?.[0]?.count || 0,
        post_count: circle.posts?.[0]?.count || 0
      }))
      setCircles(transformed)
    }
    setLoading(false)
  }, [searchQuery, filterType])

  const fetchMyCircles = useCallback(async () => {
    const { data, error } = await supabase
      .from('circle_members')
      .select('circle:circles(*)')
      .eq('user_id', user?.id)

    if (data) {
      setMyCircles(data.map(m => m.circle))
    }
  }, [user?.id])

  useEffect(() => {
    fetchCircles()
    fetchMyCircles()
  }, [fetchCircles, fetchMyCircles])

  const handleCreateCircle = async (formData) => {
    const { data, error } = await supabase
      .from('circles')
      .insert({
        name: formData.name,
        description: formData.description,
        type: formData.type,
        admin_id: user.id,
        avatar: formData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`
      })
      .select()
      .single()

    if (!error && data) {
      await supabase.from('circle_members').insert({
        circle_id: data.id,
        user_id: user.id,
        role: 'admin'
      })
      fetchCircles()
      fetchMyCircles()
    }
  }

  const handleUpdateCircle = async (formData) => {
    const { error } = await supabase
      .from('circles')
      .update({
        name: formData.name,
        description: formData.description,
        type: formData.type
      })
      .eq('id', editingCircle.id)

    if (!error) {
      fetchCircles()
      fetchMyCircles()
      setEditingCircle(null)
    }
  }

  const handleDeleteCircle = async (circleId) => {
    if (window.confirm('Are you sure you want to delete this circle? This action cannot be undone.')) {
      const { error } = await supabase.from('circles').delete().eq('id', circleId)
      if (!error) {
        fetchCircles()
        fetchMyCircles()
      }
    }
  }

  const handleJoinCircle = async (circleId) => {
    const circle = circles.find(c => c.id === circleId)
    if (circle.type === 'public') {
      await supabase.from('circle_members').insert({ circle_id: circleId, user_id: user.id })
    } else {
      await supabase.from('circle_requests').insert({ circle_id: circleId, user_id: user.id })
    }
    fetchCircles()
    fetchMyCircles()
  }

  const handleLeaveCircle = async (circleId) => {
    await supabase.from('circle_members').delete().eq('circle_id', circleId).eq('user_id', user.id)
    fetchCircles()
    fetchMyCircles()
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-10 bg-flicks-surface rounded-2xl mb-4"></div>
          <div className="h-20 bg-flicks-surface rounded-2xl mb-3"></div>
          <div className="h-20 bg-flicks-surface rounded-2xl mb-3"></div>
          <div className="h-20 bg-flicks-surface rounded-2xl"></div>
        </div>
      </div>
    )
  }

  const displayCircles = activeTab === 'all' ? circles : myCircles

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold gradient-text">Circles</h1>
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
            placeholder="Search circles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 rounded-xl pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-flicks-primary text-sm"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-white/10 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-flicks-primary text-sm"
        >
          <option value="all">All</option>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-white/10">
        <button onClick={() => setActiveTab('all')} className={`pb-2 ${activeTab === 'all' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>
          Discover
        </button>
        <button onClick={() => setActiveTab('my')} className={`pb-2 ${activeTab === 'my' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>
          My Circles ({myCircles.length})
        </button>
      </div>

      {/* Circles List */}
      <div className="space-y-3">
        {displayCircles.map((circle) => (
          <CircleCard
            key={circle.id}
            circle={circle}
            currentUserId={user?.id}
            onJoin={handleJoinCircle}
            onLeave={handleLeaveCircle}
            onDelete={handleDeleteCircle}
            onEdit={setEditingCircle}
          />
        ))}
      </div>

      {displayCircles.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-5xl mb-3">⭕</div>
          <h3 className="text-lg font-semibold mb-1">No circles found</h3>
          <p className="text-gray-400 text-sm">
            {activeTab === 'all' ? 'Try different search terms' : 'You haven\'t joined any circles yet'}
          </p>
          {activeTab === 'all' && (
            <button onClick={() => setShowCreateModal(true)} className="mt-4 gradient-bg px-4 py-2 rounded-full text-sm">
              Create a Circle
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <CircleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateCircle}
      />

      <CircleModal
        isOpen={!!editingCircle}
        onClose={() => setEditingCircle(null)}
        onSave={handleUpdateCircle}
        circle={editingCircle}
      />
    </div>
  )
}

export default Circles
