
import React, { useState } from 'react'
import { FiPlus, FiUsers, FiLock, FiGlobe, FiUserPlus, FiSettings } from 'react-icons/fi'

const Circles = () => {
  const [circles, setCircles] = useState([
    { id: 1, name: 'Tech Enthusiasts', members: 234, type: 'public', avatar: '💻', description: 'Discuss latest tech trends' },
    { id: 2, name: 'Food Lovers', members: 567, type: 'private', avatar: '🍕', description: 'Share your recipes' },
    { id: 3, name: 'Fitness Freaks', members: 890, type: 'public', avatar: '💪', description: 'Stay fit together' },
  ])
  const [showCreate, setShowCreate] = useState(false)
  const [newCircle, setNewCircle] = useState({ name: '', description: '', type: 'public' })

  const handleCreateCircle = () => {
    if (newCircle.name) {
      setCircles([...circles, { 
        id: circles.length + 1, 
        ...newCircle, 
        members: 1, 
        avatar: '🌟' 
      }])
      setShowCreate(false)
      setNewCircle({ name: '', description: '', type: 'public' })
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold gradient-text">Circles</h1>
        <button onClick={() => setShowCreate(true)} className="bg-flicks-primary p-2 rounded-full">
          <FiPlus className="w-5 h-5" />
        </button>
      </div>

      {/* Create Circle Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Circle</h2>
            <input
              type="text"
              placeholder="Circle Name"
              value={newCircle.name}
              onChange={(e) => setNewCircle({...newCircle, name: e.target.value})}
              className="w-full bg-white/10 rounded-lg p-3 mb-3 outline-none focus:ring-1 focus:ring-flicks-primary"
            />
            <textarea
              placeholder="Description"
              value={newCircle.description}
              onChange={(e) => setNewCircle({...newCircle, description: e.target.value})}
              className="w-full bg-white/10 rounded-lg p-3 mb-3 outline-none focus:ring-1 focus:ring-flicks-primary"
              rows="3"
            />
            <select
              value={newCircle.type}
              onChange={(e) => setNewCircle({...newCircle, type: e.target.value})}
              className="w-full bg-white/10 rounded-lg p-3 mb-4 outline-none"
            >
              <option value="public">🌍 Public - Anyone can join</option>
              <option value="private">🔒 Private - Request to join</option>
              <option value="secret">🤫 Secret - Hidden from search</option>
            </select>
            <div className="flex gap-3">
              <button onClick={handleCreateCircle} className="flex-1 bg-flicks-primary py-2 rounded-lg font-semibold">Create</button>
              <button onClick={() => setShowCreate(false)} className="flex-1 bg-white/10 py-2 rounded-lg font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Circles List */}
      <div className="space-y-3">
        {circles.map((circle) => (
          <div key={circle.id} className="glass rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-flicks-primary to-flicks-secondary flex items-center justify-center text-2xl">
                {circle.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{circle.name}</h3>
                  {circle.type === 'public' ? <FiGlobe className="w-3 h-3 text-green-500" /> : <FiLock className="w-3 h-3 text-yellow-500" />}
                </div>
                <p className="text-sm text-gray-400">{circle.description}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500 flex items-center gap-1"><FiUsers className="w-3 h-3" /> {circle.members} members</span>
                </div>
              </div>
              <button className="px-4 py-1 bg-flicks-primary rounded-full text-sm">
                {circle.type === 'public' ? 'Join' : 'Request'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Circles
