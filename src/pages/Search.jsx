import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiSearch, FiUsers, FiHash, FiClock } from 'react-icons/fi'

const Search = () => {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  
  const mockResults = {
    users: [
      { id: 1, username: 'alex_chen', name: 'Alex Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', followers: 1234 },
      { id: 2, username: 'emily_wilson', name: 'Emily Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', followers: 5678 },
    ],
    hashtags: [
      { name: 'trending', posts: 1234 },
      { name: 'viral', posts: 5678 },
      { name: 'flicks24', posts: 890 },
    ],
    recent: ['technology', 'food', 'travel', 'music']
  }

  return (
    <div className="min-h-screen bg-flicks-dark p-4">
      <div className="max-w-2xl mx-auto">
        {/* Search Bar */}
        <div className="glass rounded-full p-2 flex items-center mb-6">
          <FiSearch className="text-gray-400 ml-3" />
          <input
            type="text"
            placeholder="Search users, posts, hashtags..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-white px-3 py-2"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-white/10">
          <button onClick={() => setActiveTab('all')} className={`pb-2 ${activeTab === 'all' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>All</button>
          <button onClick={() => setActiveTab('users')} className={`pb-2 ${activeTab === 'users' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>Users</button>
          <button onClick={() => setActiveTab('hashtags')} className={`pb-2 ${activeTab === 'hashtags' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>Hashtags</button>
        </div>

        {activeTab === 'all' && (
          <>
            {/* Recent Searches */}
            <div className="mb-6">
              <h3 className="text-sm text-gray-400 mb-3 flex items-center gap-2"><FiClock /> Recent Searches</h3>
              <div className="flex flex-wrap gap-2">
                {mockResults.recent.map(item => (
                  <button key={item} className="glass px-3 py-1 rounded-full text-sm">{item}</button>
                ))}
              </div>
            </div>

            {/* Suggested Users */}
            <div>
              <h3 className="text-sm text-gray-400 mb-3 flex items-center gap-2"><FiUsers /> Suggested for you</h3>
              {mockResults.users.map(user => (
                <Link key={user.id} to={`/profile/${user.id}`} className="flex items-center gap-3 p-3 glass rounded-2xl mb-2">
                  <div className="story-ring"><img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" /></div>
                  <div className="flex-1"><p className="font-semibold">{user.username}</p><p className="text-xs text-gray-500">{user.followers} followers</p></div>
                  <button className="px-4 py-1 bg-flicks-primary rounded-full text-sm">Follow</button>
                </Link>
              ))}
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div>
            {mockResults.users.map(user => (
              <Link key={user.id} to={`/profile/${user.id}`} className="flex items-center gap-3 p-3 glass rounded-2xl mb-2">
                <div className="story-ring"><img src={user.avatar} alt="" className="w-10 h-10 rounded-full object-cover" /></div>
                <div className="flex-1"><p className="font-semibold">{user.username}</p><p className="text-xs text-gray-500">{user.followers} followers</p></div>
                <button className="px-4 py-1 bg-flicks-primary rounded-full text-sm">Follow</button>
              </Link>
            ))}
          </div>
        )}

        {activeTab === 'hashtags' && (
          <div className="flex flex-wrap gap-3">
            {mockResults.hashtags.map(tag => (
              <div key={tag.name} className="glass rounded-2xl p-4 text-center flex-1 min-w-[120px]">
                <FiHash className="w-6 h-6 text-flicks-primary mx-auto mb-1" />
                <p className="font-semibold">#{tag.name}</p>
                <p className="text-xs text-gray-500">{tag.posts} posts</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Search
