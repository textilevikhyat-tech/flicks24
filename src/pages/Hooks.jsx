
import React, { useState } from 'react'
import { FiPlus, FiUsers, FiSettings, FiHeart, FiMessageCircle } from 'react-icons/fi'

const Hooks = () => {
  const [hooks, setHooks] = useState([
    { id: 1, name: 'Tech News', followers: 1234, category: 'Technology', avatar: '📱', verified: true },
    { id: 2, name: 'Food Diary', followers: 5678, category: 'Food', avatar: '🍔', verified: false },
    { id: 3, name: 'Travel World', followers: 9012, category: 'Travel', avatar: '✈️', verified: true },
  ])
  const [showCreate, setShowCreate] = useState(false)
  const [newHook, setNewHook] = useState({ name: '', category: '', description: '' })

  const handleCreateHook = () => {
    if (newHook.name) {
      setHooks([...hooks, { 
        id: hooks.length + 1, 
        ...newHook, 
        followers: 1, 
        avatar: '⭐', 
        verified: false 
      }])
      setShowCreate(false)
      setNewHook({ name: '', category: '', description: '' })
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold gradient-text">Hooks</h1>
        <button onClick={() => setShowCreate(true)} className="bg-flicks-primary p-2 rounded-full">
          <FiPlus className="w-5 h-5" />
        </button>
      </div>

      {/* Create Hook Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Hook</h2>
            <input
              type="text"
              placeholder="Page Name"
              value={newHook.name}
              onChange={(e) => setNewHook({...newHook, name: e.target.value})}
              className="w-full bg-white/10 rounded-lg p-3 mb-3 outline-none focus:ring-1 focus:ring-flicks-primary"
            />
            <input
              type="text"
              placeholder="Category (e.g., Technology, Food, Travel)"
              value={newHook.category}
              onChange={(e) => setNewHook({...newHook, category: e.target.value})}
              className="w-full bg-white/10 rounded-lg p-3 mb-3 outline-none focus:ring-1 focus:ring-flicks-primary"
            />
            <textarea
              placeholder="Description"
              value={newHook.description}
              onChange={(e) => setNewHook({...newHook, description: e.target.value})}
              className="w-full bg-white/10 rounded-lg p-3 mb-4 outline-none focus:ring-1 focus:ring-flicks-primary"
              rows="3"
            />
            <div className="flex gap-3">
              <button onClick={handleCreateHook} className="flex-1 bg-flicks-primary py-2 rounded-lg font-semibold">Create</button>
              <button onClick={() => setShowCreate(false)} className="flex-1 bg-white/10 py-2 rounded-lg font-semibold">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Hooks List */}
      <div className="space-y-3">
        {hooks.map((hook) => (
          <div key={hook.id} className="glass rounded-2xl p-4">
            <div className="flex gap-3">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-flicks-primary to-flicks-secondary flex items-center justify-center text-3xl">
                {hook.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{hook.name}</h3>
                  {hook.verified && <span className="text-flicks-primary text-xs">✓ Verified</span>}
                </div>
                <p className="text-xs text-gray-500">{hook.category}</p>
                <p className="text-sm text-gray-400 mt-1">{hook.description || 'No description yet'}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-gray-500 flex items-center gap-1"><FiUsers className="w-3 h-3" /> {hook.followers} followers</span>
                  <button className="text-xs text-flicks-primary">Follow</button>
                </div>
              </div>
              <FiSettings className="text-gray-400 cursor-pointer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Hooks
