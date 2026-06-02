import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { FiSend, FiSmile, FiPaperclip, FiMoreVertical, FiArrowLeft } from 'react-icons/fi'

const Messages = () => {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  // Mock conversations
  const mockConversations = [
    { id: 1, name: 'Alex Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', lastMessage: 'Hey! How are you?', time: '10:42 AM', unread: 2, online: true },
    { id: 2, name: 'Emily Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', lastMessage: 'See you tomorrow!', time: 'Yesterday', unread: 0, online: false },
    { id: 3, name: 'Mike Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', lastMessage: 'Thanks for the update', time: 'Yesterday', unread: 0, online: true },
    { id: 4, name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', lastMessage: '📸 Check this out', time: '2 days ago', unread: 0, online: false },
  ]

  useEffect(() => {
    setConversations(mockConversations)
    setLoading(false)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    const newMsg = {
      id: messages.length + 1,
      text: newMessage,
      sent: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    setMessages([...messages, newMsg])
    setNewMessage('')
  }

  const openChat = (chat) => {
    setSelectedChat(chat)
    setMessages([
      { id: 1, text: 'Hey there! How are you doing?', sent: false, time: '10:30 AM', avatar: chat.avatar },
      { id: 2, text: 'I am good! What about you?', sent: true, time: '10:32 AM' },
      { id: 3, text: 'Doing great! Want to catch up?', sent: false, time: '10:33 AM' },
    ])
  }

  if (loading) return <div className="p-4 text-center">Loading...</div>

  return (
    <div className="h-screen flex flex-col bg-flicks-dark">
      {!selectedChat ? (
        <>
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <h1 className="text-xl font-bold gradient-text">Messages</h1>
            <p className="text-sm text-gray-400">{conversations.length} conversations</p>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <div key={conv.id} onClick={() => openChat(conv)} className="flex items-center gap-3 p-4 hover:bg-white/5 cursor-pointer transition">
                <div className="relative">
                  <div className="story-ring">
                    <img src={conv.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                  </div>
                  {conv.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-flicks-dark"></div>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{conv.name}</span>
                    <span className="text-xs text-gray-500">{conv.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {conv.unread > 0 && <span className="w-2 h-2 bg-flicks-primary rounded-full"></span>}
                    <span className="text-sm text-gray-400 truncate">{conv.lastMessage}</span>
                  </div>
                </div>
                {conv.unread > 0 && (
                  <div className="w-5 h-5 bg-flicks-primary rounded-full flex items-center justify-center text-xs font-bold">
                    {conv.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Chat Header */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3">
            <button onClick={() => setSelectedChat(null)} className="text-gray-400 hover:text-white">
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div className="story-ring">
              <img src={selectedChat.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold">{selectedChat.name}</h2>
              <p className="text-xs text-green-500">{selectedChat.online ? 'Online' : 'Offline'}</p>
            </div>
            <FiMoreVertical className="text-gray-400 cursor-pointer" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}>
                {!msg.sent && (
                  <img src={msg.avatar} alt="" className="w-8 h-8 rounded-full object-cover mr-2" />
                )}
                <div className={`max-w-[70%] p-3 rounded-2xl ${msg.sent ? 'bg-flicks-primary rounded-br-none' : 'bg-flicks-surface rounded-bl-none'}`}>
                  <p className="text-sm">{msg.text}</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">{msg.time}</span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-2 glass rounded-full p-2">
              <FiSmile className="text-gray-400 cursor-pointer ml-2" />
              <FiPaperclip className="text-gray-400 cursor-pointer" />
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 px-2"
              />
              <button onClick={handleSendMessage} className="p-2 bg-flicks-primary rounded-full">
                <FiSend className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Messages
