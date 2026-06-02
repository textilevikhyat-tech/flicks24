import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { Link } from 'react-router-dom'
import { FiHeart, FiMessageCircle, FiUserPlus, FiShare2, FiCheckCircle, FiClock } from 'react-icons/fi'

const Notifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  // Mock notifications
  const mockNotifications = [
    { id: 1, type: 'like', from: 'Alex Chen', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', message: 'liked your post', time: '5 minutes ago', read: false, postId: 1 },
    { id: 2, type: 'comment', from: 'Emily Wilson', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', message: 'commented on your post', time: '1 hour ago', read: false, postId: 2 },
    { id: 3, type: 'follow', from: 'Mike Johnson', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', message: 'started following you', time: '3 hours ago', read: true },
    { id: 4, type: 'share', from: 'Sarah Chen', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', message: 'shared your post', time: 'Yesterday', read: true, postId: 3 },
    { id: 5, type: 'circle', from: 'Tech Circle', fromAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tech', message: 'accepted your join request', time: '2 days ago', read: true },
  ]

  useEffect(() => {
    setNotifications(mockNotifications)
    setLoading(false)
  }, [])

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const getIcon = (type) => {
    switch(type) {
      case 'like': return <FiHeart className="text-red-500" />
      case 'comment': return <FiMessageCircle className="text-flicks-secondary" />
      case 'follow': return <FiUserPlus className="text-green-500" />
      case 'share': return <FiShare2 className="text-purple-500" />
      default: return <FiCheckCircle className="text-yellow-500" />
    }
  }

  if (loading) return <div className="p-4 text-center">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold gradient-text">Notifications</h1>
        <button onClick={markAllAsRead} className="text-sm text-gray-400 hover:text-white">Mark all as read</button>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <Link 
            key={notif.id} 
            to={notif.postId ? `/post/${notif.postId}` : `/profile/${notif.from}`}
            onClick={() => markAsRead(notif.id)}
            className={`glass rounded-2xl p-4 flex items-center gap-3 transition ${!notif.read ? 'border-l-4 border-l-flicks-primary' : ''}`}
          >
            <div className="story-ring">
              <img src={notif.fromAvatar} alt="" className="w-12 h-12 rounded-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{notif.from}</span>
                <span className="text-sm text-gray-400">{notif.message}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <FiClock className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">{notif.time}</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              {getIcon(notif.type)}
            </div>
          </Link>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="w-10 h-10 text-gray-500" />
          </div>
          <p className="text-gray-400">No notifications yet</p>
          <p className="text-sm text-gray-500">When someone interacts with you, it will show here</p>
        </div>
      )}
    </div>
  )
}

export default Notifications
