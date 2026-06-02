import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { Link } from 'react-router-dom'
import { 
  FiHeart, FiMessageCircle, FiUserPlus, FiShare2, FiCheckCircle,
  FiClock, FiMoreHorizontal, FiCheck, FiX, FiLoader
} from 'react-icons/fi'

const Notifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const fetchNotifications = useCallback(async () => {
    let query = supabase
      .from('notifications')
      .select(`
        *,
        from_user:users!from_user_id(username, avatar)
      `)
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('type', filter)
    }

    const { data, error } = await query.limit(100)

    if (data) {
      const transformed = data.map(notif => ({
        ...notif,
        time_ago: getTimeAgo(notif.created_at)
      }))
      setNotifications(transformed)
    }
    setLoading(false)
  }, [user?.id, filter])

  useEffect(() => {
    fetchNotifications()

    // Subscribe to new notifications
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user?.id}` }, () => {
        fetchNotifications()
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }, [fetchNotifications, user?.id])

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  const getIcon = (type) => {
    switch(type) {
      case 'like': return <FiHeart className="w-5 h-5 text-red-500" />
      case 'comment': return <FiMessageCircle className="w-5 h-5 text-flicks-secondary" />
      case 'follow': return <FiUserPlus className="w-5 h-5 text-green-500" />
      case 'share': return <FiShare2 className="w-5 h-5 text-purple-500" />
      case 'chain_join': return <FiCheckCircle className="w-5 h-5 text-yellow-500" />
      default: return <FiCheckCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getMessage = (notif) => {
    switch(notif.type) {
      case 'like': return `${notif.from_user?.username} liked your post`
      case 'comment': return `${notif.from_user?.username} commented: "${notif.content?.substring(0, 50)}${notif.content?.length > 50 ? '...' : ''}"`
      case 'follow': return `${notif.from_user?.username} started following you`
      case 'share': return `${notif.from_user?.username} shared your post`
      case 'chain_join': return `${notif.from_user?.username} joined your chain`
      default: return notif.message
    }
  }

  const markAsRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const markAllAsRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user?.id)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const deleteNotification = async (id) => {
    await supabase.from('notifications').delete().eq('id', id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

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

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold gradient-text">Notifications</h1>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-sm text-gray-400 hover:text-white">
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'gradient-bg' : 'bg-white/10'}`}>
          All
        </button>
        <button onClick={() => setFilter('like')} className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${filter === 'like' ? 'gradient-bg' : 'bg-white/10'}`}>
          <FiHeart className="w-3 h-3" /> Likes
        </button>
        <button onClick={() => setFilter('comment')} className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${filter === 'comment' ? 'gradient-bg' : 'bg-white/10'}`}>
          <FiMessageCircle className="w-3 h-3" /> Comments
        </button>
        <button onClick={() => setFilter('follow')} className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${filter === 'follow' ? 'gradient-bg' : 'bg-white/10'}`}>
          <FiUserPlus className="w-3 h-3" /> Follows
        </button>
        <button onClick={() => setFilter('chain_join')} className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${filter === 'chain_join' ? 'gradient-bg' : 'bg-white/10'}`}>
          🔗 Chains
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`glass rounded-2xl p-4 transition ${!notif.is_read ? 'border-l-4 border-l-flicks-primary' : ''}`}
            onClick={() => !notif.is_read && markAsRead(notif.id)}
          >
            <div className="flex gap-3">
              <Link to={`/profile/${notif.from_user?.id}`} className="flex-shrink-0">
                <div className="story-ring">
                  <img src={notif.from_user?.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                </div>
              </Link>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm">
                      <Link to={`/profile/${notif.from_user?.id}`} className="font-semibold hover:underline">
                        {notif.from_user?.username}
                      </Link>
                      {' '}
                      <span className="text-gray-400">{getMessage(notif)}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <FiClock className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-500">{notif.time_ago}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      {getIcon(notif.type)}
                    </div>
                    <button onClick={() => deleteNotification(notif.id)} className="p-1 hover:bg-white/10 rounded-full">
                      <FiX className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-5xl mb-3">🔔</div>
          <h3 className="text-lg font-semibold mb-1">No notifications yet</h3>
          <p className="text-gray-400 text-sm">When someone interacts with you, it will show here</p>
        </div>
      )}
    </div>
  )
}

export default Notifications
