import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { useParams, Link } from 'react-router-dom'
import { FiShare2, FiUsers, FiLink, FiCopy, FiCheck, FiSend } from 'react-icons/fi'

const ChainPost = () => {
  const { user } = useAuth()
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [chainCount, setChainCount] = useState(0)
  const [joined, setJoined] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [copied, setCopied] = useState(false)

  // Mock chain post
  const mockPost = {
    id: 1,
    content: "🌍 Climate change is real! Let's take action together. Join this chain to spread awareness! #ClimateAction",
    user: { username: 'eco_warrior', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eco', id: 'user1' },
    created_at: new Date().toISOString(),
    type: 'chain',
    visibility: 'public'
  }

  useEffect(() => {
    setPost(mockPost)
    setChainCount(47)
    
    // Check if user already joined
    const checkJoined = async () => {
      // Mock check
      setJoined(false)
    }
    checkJoined()
  }, [id])

  const handleJoinChain = async () => {
    setJoined(true)
    setChainCount(prev => prev + 1)
    
    // Create notification for chain owner
    await supabase.from('notifications').insert({
      user_id: mockPost.user.id,
      from_user_id: user.id,
      type: 'chain_join',
      message: `${user?.user_metadata?.username} joined your chain post`
    })
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/chain-post/${mockPost.id}`
    try {
      await navigator.share({
        title: 'Join my chain!',
        text: mockPost.content,
        url: shareUrl
      })
    } catch (err) {
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getChainMessage = () => {
    if (chainCount < 10) return "🤝 Be the first to join!"
    if (chainCount < 50) return "🔥 This chain is growing!"
    if (chainCount < 100) return "🚀 Going viral! Join now!"
    return "💎 Legendary chain! You're part of history!"
  }

  return (
    <div className="min-h-screen bg-flicks-dark p-4">
      <div className="max-w-2xl mx-auto">
        {/* Chain Header */}
        <div className="glass rounded-2xl p-6 mb-4 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-flicks-primary to-flicks-secondary flex items-center justify-center mx-auto mb-4 text-4xl">
            🔗
          </div>
          <h2 className="text-xl font-bold gradient-text mb-2">Chain Post</h2>
          <p className="text-sm text-gray-400">Viral connection network</p>
        </div>

        {/* Chain Stats */}
        <div className="glass rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-flicks-primary to-flicks-secondary flex items-center justify-center">
                <FiUsers className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{chainCount}</p>
                <p className="text-xs text-gray-400">People Connected</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-flicks-secondary">{getChainMessage()}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex justify-between text-xs text-gray-500">
              <span>🔗 Chain Strength: {Math.min(100, Math.floor(chainCount / 2))}%</span>
              <span>⭐ Viral Score: {Math.min(100, chainCount)}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1 mt-1">
              <div className="bg-flicks-primary h-1 rounded-full" style={{ width: `${Math.min(100, chainCount)}%` }}></div>
            </div>
          </div>
        </div>

        {/* Chain Post */}
        <div className="glass rounded-2xl overflow-hidden mb-4">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="story-ring">
                <img src={post?.user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
              </div>
              <div>
                <p className="font-semibold">{post?.user.username}</p>
                <p className="text-xs text-gray-500">{new Date(post?.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <p className="mb-4">{post?.content}</p>
            
            {/* Chain Warning Banner */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-500 flex items-center gap-2">
                <span>⚠️</span> Help this post go viral! Join the chain and share with your friends.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {!joined ? (
                <button onClick={handleJoinChain} className="flex-1 bg-flicks-primary py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
                  <FiLink /> Join Chain
                </button>
              ) : (
                <button className="flex-1 bg-green-500/20 text-green-500 py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
                  <FiCheck /> Joined ✓
                </button>
              )}
              <button onClick={handleShare} className="flex-1 bg-white/10 py-2 rounded-lg font-semibold flex items-center justify-center gap-2">
                {copied ? <FiCheck /> : <FiShare2 />} {copied ? 'Copied!' : 'Share'}
              </button>
            </div>
          </div>
        </div>

        {/* Chain Members Preview */}
        <div className="glass rounded-2xl p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><FiUsers /> Recently Joined</h3>
          <div className="flex flex-wrap gap-2">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="story-ring">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} alt="" className="w-8 h-8 rounded-full object-cover" />
              </div>
            ))}
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
              +{chainCount - 8}
            </div>
          </div>
        </div>

        {/* Owner Message Box */}
        {user?.id === post?.user.id && (
          <div className="glass rounded-2xl p-4 mt-4">
            <h3 className="font-semibold mb-2 flex items-center gap-2"><FiSend /> Send Request to All</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Message to all chain members..."
                className="flex-1 bg-white/10 rounded-lg p-2 text-sm outline-none"
              />
              <button className="px-3 py-2 bg-flicks-primary rounded-lg text-sm">Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChainPost
