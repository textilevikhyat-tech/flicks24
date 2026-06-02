import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { Link } from 'react-router-dom'
import { 
  FiSend, FiSmile, FiPaperclip, FiMoreVertical, FiArrowLeft,
  FiSearch, FiUserPlus, FiTrash2, FiFlag, FiCheck, FiCheckCircle,
  FiLoader, FiX, FiImage, FiMic, FiVideo
} from 'react-icons/fi'

// Emoji Picker Component
const EmojiPicker = ({ onSelect, onClose }) => {
  const emojis = ['😊', '😂', '❤️', '👍', '🔥', '🥺', '😍', '🎉', '😭', '👏', '🙏', '✨', '💯', '😎', '🤣', '💔', '🥰', '😘', '😁', '🤔']
  const pickerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div ref={pickerRef} className="absolute bottom-full left-0 mb-2 bg-flicks-surface rounded-xl p-2 grid grid-cols-5 gap-1 z-50 shadow-xl">
      {emojis.map(emoji => (
        <button key={emoji} onClick={() => onSelect(emoji)} className="text-2xl hover:scale-125 transition p-1">
          {emoji}
        </button>
      ))}
    </div>
  )
}

// Conversation List Component
const ConversationList = ({ conversations, currentUserId, onSelect, selectedId, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = conversations.filter(conv =>
    conv.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/10">
        <h1 className="text-xl font-bold gradient-text mb-3">Messages</h1>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 rounded-xl pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-flicks-primary text-sm"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`flex items-center gap-3 p-4 hover:bg-white/5 cursor-pointer transition ${selectedId === conv.id ? 'bg-white/5' : ''}`}
          >
            <div className="relative">
              <div className="story-ring">
                <img src={conv.user?.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
              </div>
              {conv.user?.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-flicks-dark" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p className="font-semibold">{conv.user?.username}</p>
                <p className="text-xs text-gray-500">{conv.last_message_time}</p>
              </div>
              <div className="flex items-center gap-1">
                {conv.unread_count > 0 && <div className="w-2 h-2 bg-flicks-primary rounded-full" />}
                <p className="text-sm text-gray-400 truncate">{conv.last_message}</p>
              </div>
            </div>
            {conv.unread_count > 0 && (
              <div className="w-5 h-5 gradient-bg rounded-full flex items-center justify-center text-xs font-bold">
                {conv.unread_count}
              </div>
            )}
          </div>
        ))}
        {filteredConversations.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-gray-400">No conversations yet</p>
            <p className="text-sm text-gray-500">Start a new chat!</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Chat Window Component
const ChatWindow = ({ conversation, currentUser, onSend, onBack }) => {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [loading, setLoading] = useState(true)
  const [typing, setTyping] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${conversation.user_id}),and(sender_id.eq.${conversation.user_id},receiver_id.eq.${currentUser.id})`)
      .order('created_at', { ascending: true })

    if (data) {
      setMessages(data)
      // Mark messages as read
      const unreadMessages = data.filter(m => m.receiver_id === currentUser.id && !m.is_read)
      if (unreadMessages.length > 0) {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadMessages.map(m => m.id))
      }
    }
    setLoading(false)
  }, [conversation.user_id, currentUser.id])

  useEffect(() => {
    fetchMessages()

    // Subscribe to new messages
    const subscription = supabase
      .channel(`messages:${[currentUser.id, conversation.user_id].sort().join('-')}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `or(and(sender_id.eq.${currentUser.id},receiver_id.eq.${conversation.user_id}),and(sender_id.eq.${conversation.user_id},receiver_id.eq.${currentUser.id}))` }, (payload) => {
        setMessages(prev => [...prev, payload.new])
        if (payload.new.sender_id === conversation.user_id) {
          // Mark as read
          supabase.from('messages').update({ is_read: true }).eq('id', payload.new.id)
        }
      })
      .subscribe()

    // Typing indicator
    const typingChannel = supabase.channel(`typing:${conversation.user_id}`)
    typingChannel.on('broadcast', { event: 'typing' }, () => {
      setIsTyping(true)
      setTimeout(() => setIsTyping(false), 2000)
    }).subscribe()

    return () => {
      subscription.unsubscribe()
      typingChannel.unsubscribe()
    }
  }, [fetchMessages, conversation.user_id, currentUser.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleTyping = () => {
    if (!typing) {
      setTyping(true)
      const channel = supabase.channel(`typing:${conversation.user_id}`)
      channel.send({ type: 'broadcast', event: 'typing', payload: {} })
      setTimeout(() => setTyping(false), 1000)
    }
  }

  const handleSend = async () => {
    if (!newMessage.trim()) return

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUser.id,
        receiver_id: conversation.user_id,
        content: newMessage,
        is_read: false
      })

    if (!error) {
      setNewMessage('')
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <FiLoader className="w-8 h-8 animate-spin text-flicks-primary" />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <button onClick={onBack} className="lg:hidden p-1">
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <Link to={`/profile/${conversation.user_id}`} className="flex items-center gap-3 flex-1">
          <div className="relative">
            <div className="story-ring">
              <img src={conversation.user?.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            </div>
            {conversation.user?.online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-flicks-dark" />}
          </div>
          <div>
            <p className="font-semibold">{conversation.user?.username}</p>
            <p className="text-xs text-gray-500">
              {isTyping ? <span className="text-flicks-primary">Typing...</span> : (conversation.user?.online ? 'Online' : 'Offline')}
            </p>
          </div>
        </Link>
        <button className="p-2 rounded-full hover:bg-white/10">
          <FiMoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, idx) => {
          const isSent = msg.sender_id === currentUser.id
          const showAvatar = !isSent && (idx === 0 || messages[idx - 1]?.sender_id !== msg.sender_id)
          
          return (
            <div key={msg.id} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2 max-w-[75%] ${isSent ? 'flex-row-reverse' : ''}`}>
                {!isSent && showAvatar && (
                  <img src={conversation.user?.avatar} alt="" className="w-8 h-8 rounded-full self-end" />
                )}
                <div className={`p-3 rounded-2xl ${isSent ? 'gradient-bg rounded-br-none' : 'glass rounded-bl-none'}`}>
                  <p className="text-sm break-words">{msg.content}</p>
                  <div className={`flex items-center gap-1 mt-1 ${isSent ? 'justify-end' : 'justify-start'}`}>
                    <p className="text-[10px] opacity-70">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    {isSent && (
                      msg.is_read ? <FiCheckCircle className="w-3 h-3 text-green-400" /> : <FiCheck className="w-3 h-3" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-2 glass rounded-full p-2">
          <div className="relative">
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 rounded-full hover:bg-white/10">
              <FiSmile className="w-5 h-5 text-gray-400" />
            </button>
            {showEmojiPicker && (
              <EmojiPicker onSelect={(emoji) => { setNewMessage(prev => prev + emoji); setShowEmojiPicker(false) }} onClose={() => setShowEmojiPicker(false)} />
            )}
          </div>
          <button className="p-2 rounded-full hover:bg-white/10">
            <FiPaperclip className="w-5 h-5 text-gray-400" />
          </button>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={handleTyping}
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 px-2"
          />
          <button onClick={handleSend} className="p-2 gradient-bg rounded-full">
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Main Messages Component
const Messages = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchConversations = useCallback(async () => {
    // Get all users who have messaged with current user
    const { data: sentMessages, error } = await supabase
      .from('messages')
      .select('receiver_id, sender_id, content, created_at, is_read')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (sentMessages) {
      const userIds = new Set()
      const lastMessageMap = new Map()
      const unreadCountMap = new Map()

      sentMessages.forEach(msg => {
        const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
        userIds.add(otherId)
        
        if (!lastMessageMap.has(otherId)) {
          lastMessageMap.set(otherId, {
            content: msg.content,
            time: msg.created_at
          })
        }
        
        if (msg.receiver_id === user.id && !msg.is_read) {
          unreadCountMap.set(otherId, (unreadCountMap.get(otherId) || 0) + 1)
        }
      })

      // Fetch user details
      const { data: usersData } = await supabase
        .from('users')
        .select('id, username, avatar')
        .in('id', Array.from(userIds))

      const conversationsList = Array.from(userIds).map(id => {
        const userData = usersData?.find(u => u.id === id)
        const lastMsg = lastMessageMap.get(id)
        return {
          id,
          user: userData,
          last_message: lastMsg?.content || '',
          last_message_time: lastMsg?.time ? new Date(lastMsg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
          unread_count: unreadCountMap.get(id) || 0
        }
      }).sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time))

      setConversations(conversationsList)
    }
    setLoading(false)
  }, [user.id])

  useEffect(() => {
    fetchConversations()

    // Subscribe to new messages
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, () => {
        fetchConversations()
      })
      .subscribe()

    return () => subscription.unsubscribe()
  }, [fetchConversations, user.id])

  if (loading) {
    return (
      <div className="h-screen bg-flicks-dark flex items-center justify-center">
        <FiLoader className="w-8 h-8 animate-spin text-flicks-primary" />
      </div>
    )
  }

  return (
    <div className="h-screen bg-flicks-dark flex">
      {/* Conversations Sidebar */}
      <div className={`${selectedConversation ? 'hidden lg:block' : 'w-full lg:w-96'} border-r border-white/10`}>
        <ConversationList
          conversations={conversations}
          currentUserId={user.id}
          onSelect={setSelectedConversation}
          selectedId={selectedConversation?.id}
        />
      </div>

      {/* Chat Area */}
      <div className={`${selectedConversation ? 'flex-1' : 'hidden lg:flex-1 lg:flex'}`}>
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            currentUser={user}
            onSend={() => fetchConversations()}
            onBack={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 rounded-full gradient-bg flex items-center justify-center mb-4">
              <FiMessageCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your Messages</h2>
            <p className="text-gray-400">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages
