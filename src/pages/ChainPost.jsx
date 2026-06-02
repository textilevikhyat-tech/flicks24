import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  FiShare2, FiUsers, FiLink, FiCopy, FiCheck, FiSend, 
  FiLoader, FiAlertCircle, FiEye, FiUserPlus, FiCheckCircle,
  FiX, FiTrendingUp, FiAward
} from 'react-icons/fi'

// Chain Card Component
const ChainCard = ({ chain, currentUserId, onJoin, onShare }) => {
  const [joined, setJoined] = useState(false)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    setJoined(chain.is_joined || false)
  }, [chain.is_joined])

  const handleJoin = async () => {
    setJoining(true)
    await onJoin(chain.id)
    setJoined(true)
    setJoining(false)
  }

  const getChainStrength = () => {
    const count = chain.member_count || 0
    if (count < 10) return { label: 'Starting', color: 'text-gray-400', icon: '🌱' }
    if (count < 50) return { label: 'Growing', color: 'text-blue-400', icon: '📈' }
    if (count < 100) return { label: 'Trending', color: 'text-yellow-400', icon: '🔥' }
    return { label: 'Viral', color: 'text-red-400', icon: '💎' }
  }

  const strength = getChainStrength()

  return (
    <div className="glass rounded-2xl p-4 hover:bg-white/5 transition">
      <div className="flex gap-3">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-flicks-primary to-flicks-secondary flex items-center justify-center text-2xl flex-shrink-0">
          🔗
        </div>
        <div className="flex-1 min-w-0">
          <Link to={`/chain-post/${chain.id}`}>
            <h3 className="font-semibold hover:text-flicks-primary line-clamp-1">{chain.title}</h3>
          </Link>
          <p className="text-sm text-gray-400 line-clamp-2 mt-1">{chain.description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className="flex items-center gap-1 text-gray-500"><FiUsers className="w-3 h-3" /> {chain.member_count || 0} joined</span>
            <span className="flex items-center gap-1 text-gray-500"><FiEye className="w-3 h-3" /> {chain.view_count || 0} views</span>
            <span className={`flex items-center gap-1 ${strength.color}`}>
              <span>{strength.icon}</span> {strength.label}
            </span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-white/10 rounded-full h-1">
              <div className="gradient-bg h-1 rounded-full" style={{ width: `${Math.min(100, (chain.member_count || 0) * 2)}%` }} />
            </div>
          </div>
        </div>
        <div>
          {!joined ? (
            <button
              onClick={handleJoin}
              disabled={joining}
              className="px-4 py-1.5 gradient-bg rounded-full text-xs font-semibold flex items-center gap-1"
            >
              {joining ? <FiLoader className="w-3 h-3 animate-spin" /> : <FiUserPlus className="w-3 h-3" />} Join Chain
            </button>
          ) : (
            <button className="px-4 py-1.5 bg-green-500/20 text-green-500 rounded-full text-xs font-semibold flex items-center gap-1">
              <FiCheckCircle className="w-3 h-3" /> Joined
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Chain Detail Component
const ChainDetail = ({ chain, currentUserId, onJoin, onShare, onClose }) => {
  const [joined, setJoined] = useState(false)
  const [joining, setJoining] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setJoined(chain.is_joined || false)
  }, [chain.is_joined])

  const handleJoin = async () => {
    setJoining(true)
    await onJoin(chain.id)
    setJoined(true)
    setJoining(false)
  }

  const copyLink = () => {
    const link = `${window.location.origin}/chain-post/${chain.id}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sendMessage = async () => {
    if (!messageText.trim()) return
    // In production: send notification to all members
    alert(`Message sent to ${chain.member_count} members!`)
    setMessageText('')
  }

  const memberList = chain.members || []

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur z-50 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 pb-20">
        <button onClick={onClose} className="p-2 bg-white/10 rounded-full mb-4">
          <FiX className="w-5 h-5" />
        </button>

        {/* Chain Header */}
        <div className="glass rounded-2xl p-6 text-center mb-4">
          <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4 text-4xl">
            🔗
          </div>
          <h1 className="text-2xl font-bold">{chain.title}</h1>
          <p className="text-gray-400 mt-2">{chain.description}</p>
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{chain.member_count || 0}</div>
              <div className="text-xs text-gray-500">Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{chain.view_count || 0}</div>
              <div className="text-xs text-gray-500">Views</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{chain.share_count || 0}</div>
              <div className="text-xs text-gray-500">Shares</div>
            </div>
          </div>
        </div>

        {/* Join Section */}
        {!joined ? (
          <div className="glass rounded-2xl p-6 text-center mb-4">
            <p className="text-gray-400 mb-4">Join this chain to see the full content and invite others!</p>
            <button onClick={handleJoin} disabled={joining} className="gradient-bg px-8 py-3 rounded-full font-semibold">
              {joining ? <FiLoader className="w-5 h-5 animate-spin mx-auto" /> : 'Join Chain'}
            </button>
          </div>
        ) : (
          <>
            {/* Chain Content */}
            <div className="glass rounded-2xl p-6 mb-4">
              <h3 className="font-semibold mb-3">Chain Content</h3>
              <p className="text-gray-300">{chain.content}</p>
              {chain.image_url && (
                <img src={chain.image_url} alt="Chain" className="rounded-xl mt-3 w-full" />
              )}
            </div>

            {/* Owner Message */}
            {chain.owner_id === currentUserId && (
              <div className="glass rounded-2xl p-4 mb-4 border-l-4 border-flicks-primary">
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <FiSend className="w-4 h-4" /> Send Update to All Members
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Message to all members..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm outline-none"
                  />
                  <button onClick={sendMessage} className="px-4 py-2 gradient-bg rounded-full text-sm">
                    Send
                  </button>
                </div>
              </div>
            )}

            {/* Invite Section */}
            <div className="glass rounded-2xl p-4 mb-4">
              <button onClick={() => setShowInvite(!showInvite)} className="w-full flex items-center justify-between">
                <span className="font-semibold flex items-center gap-2"><FiShare2 /> Invite Friends</span>
                <span>{showInvite ? '▲' : '▼'}</span>
              </button>
              {showInvite && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/chain-post/${chain.id}`}
                      className="flex-1 bg-white/10 rounded-full px-4 py-2 text-sm outline-none text-gray-400"
                    />
                    <button onClick={copyLink} className="px-4 py-2 gradient-bg rounded-full text-sm flex items-center gap-1">
                      {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />} Copy
                    </button>
                  </div>
                  <button onClick={() => onShare(chain)} className="w-full mt-2 bg-white/10 rounded-full py-2 text-sm">
                    Share on Feed
                  </button>
                </div>
              )}
            </div>

            {/* Members List */}
            <div className="glass rounded-2xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FiUsers /> Members ({memberList.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {memberList.map((member) => (
                  <Link key={member.user_id} to={`/profile/${member.user_id}`} className="flex items-center gap-2 glass rounded-full px-3 py-1 text-sm hover:bg-white/10">
                    <img src={member.avatar} alt="" className="w-5 h-5 rounded-full" />
                    <span>{member.username}</span>
                    {member.user_id === chain.owner_id && <FiAward className="w-3 h-3 text-yellow-500" />}
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Create Chain Modal
const CreateChainModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    visibility: 'public'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }
    setLoading(true)
    await onCreate(formData)
    setLoading(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl w-full max-w-md">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Create Chain Post</h2>
          <button onClick={onClose} className="p-1"><FiX className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full bg-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-flicks-primary"
              placeholder="e.g., Save the Environment"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Short Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-white/10 rounded-xl px-4 py-2 outline-none"
              placeholder="What is this chain about?"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full bg-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-flicks-primary resize-none"
              rows="4"
              placeholder="What message do you want to spread?"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Visibility</label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value }))}
              className="w-full bg-white/10 rounded-xl px-4 py-2 outline-none"
            >
              <option value="public">🌍 Public - Anyone can see</option>
              <option value="friends">👥 Friends only</option>
              <option value="private">🔒 Private - Invite only</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full gradient-bg py-2 rounded-xl font-semibold">
            {loading ? <FiLoader className="w-5 h-5 animate-spin mx-auto" /> : 'Create Chain'}
          </button>
        </form>
      </div>
    </div>
  )
}

// Main ChainPost Component
const ChainPost = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [chains, setChains] = useState([])
  const [selectedChain, setSelectedChain] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('trending')

  const fetchChains = useCallback(async () => {
    let query = supabase
      .from('chain_posts')
      .select(`
        *,
        owner:users!owner_id(username, avatar),
        members:chain_members(count),
        user_joined:chain_members!inner(user_id)
      `)

    if (activeTab === 'joined') {
      query = query.eq('user_joined.user_id', user?.id)
    } else {
      query = query.order('member_count', { ascending: false })
    }

    const { data, error } = await query.limit(50)

    if (data) {
      const transformed = data.map(chain => ({
        ...chain,
        member_count: chain.members?.[0]?.count || 0,
        is_joined: chain.user_joined?.some(j => j.user_id === user?.id) || false
      }))
      setChains(transformed)

      // If ID param, open that chain
      if (id) {
        const found = transformed.find(c => c.id === parseInt(id))
        if (found) setSelectedChain(found)
      }
    }
    setLoading(false)
  }, [activeTab, user?.id, id])

  useEffect(() => {
    fetchChains()
  }, [fetchChains])

  const handleCreateChain = async (formData) => {
    const { data, error } = await supabase
      .from('chain_posts')
      .insert({
        title: formData.title,
        description: formData.description,
        content: formData.content,
        visibility: formData.visibility,
        owner_id: user.id,
        member_count: 1
      })
      .select()
      .single()

    if (!error && data) {
      await supabase.from('chain_members').insert({
        chain_id: data.id,
        user_id: user.id
      })
      fetchChains()
    }
  }

  const handleJoinChain = async (chainId) => {
    const { error } = await supabase
      .from('chain_members')
      .insert({ chain_id: chainId, user_id: user.id })

    if (!error) {
      await supabase.rpc('increment_chain_members', { chain_id: chainId })
      fetchChains()
    }
  }

  const handleShareChain = async (chain) => {
    // Share to feed
    const { error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: `Check out this chain: ${chain.title}\nJoin here: ${window.location.origin}/chain-post/${chain.id}`,
        type: 'chain_share'
      })
    
    if (!error) {
      alert('Shared to your feed!')
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-10 bg-flicks-surface rounded-2xl mb-4"></div>
          <div className="h-24 bg-flicks-surface rounded-2xl mb-3"></div>
          <div className="h-24 bg-flicks-surface rounded-2xl mb-3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
          <FiTrendingUp /> Chain Posts
        </h1>
        <button onClick={() => setShowCreateModal(true)} className="gradient-bg p-2 rounded-full">
          <FiLink className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-white/10">
        <button onClick={() => setActiveTab('trending')} className={`pb-2 ${activeTab === 'trending' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>
          🔥 Trending
        </button>
        <button onClick={() => setActiveTab('joined')} className={`pb-2 ${activeTab === 'joined' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>
          ⛓️ My Chains
        </button>
      </div>

      {/* Chains List */}
      <div className="space-y-3">
        {chains.map((chain) => (
          <ChainCard
            key={chain.id}
            chain={chain}
            currentUserId={user?.id}
            onJoin={handleJoinChain}
            onShare={handleShareChain}
          />
        ))}
      </div>

      {chains.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-5xl mb-3">🔗</div>
          <h3 className="text-lg font-semibold mb-1">No chains yet</h3>
          <p className="text-gray-400 text-sm">
            {activeTab === 'trending' ? 'Be the first to create a chain!' : 'You haven\'t joined any chains yet'}
          </p>
          {activeTab === 'trending' && (
            <button onClick={() => setShowCreateModal(true)} className="mt-4 gradient-bg px-4 py-2 rounded-full text-sm">
              Create Chain
            </button>
          )}
        </div>
      )}

      {/* Chain Detail Modal */}
      {selectedChain && (
        <ChainDetail
          chain={selectedChain}
          currentUserId={user?.id}
          onJoin={handleJoinChain}
          onShare={handleShareChain}
          onClose={() => {
            setSelectedChain(null)
            navigate('/chain-post')
          }}
        />
      )}

      {/* Create Modal */}
      <CreateChainModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateChain}
      />
    </div>
  )
}

export default ChainPost
