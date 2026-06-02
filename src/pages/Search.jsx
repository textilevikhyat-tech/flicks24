import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { Link } from 'react-router-dom'
import { FiSearch, FiUsers, FiHash, FiClock, FiX, FiLoader } from 'react-icons/fi'

const Search = () => {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [users, setUsers] = useState([])
  const [posts, setPosts] = useState([])
  const [hashtags, setHashtags] = useState([])
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])

  useEffect(() => {
    loadRecentSearches()
  }, [])

  const loadRecentSearches = async () => {
    const { data } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(5)
    setRecentSearches(data || [])
  }

  const saveSearch = async (term, type) => {
    await supabase.from('search_history').insert({
      user_id: user.id,
      term,
      type
    })
    loadRecentSearches()
  }

  const clearRecentSearches = async () => {
    await supabase.from('search_history').delete().eq('user_id', user.id)
    setRecentSearches([])
  }

  const performSearch = useCallback(async () => {
    if (!query.trim()) {
      setUsers([])
      setPosts([])
      setHashtags([])
      return
    }

    setLoading(true)

    // Search users
    const { data: usersData } = await supabase
      .from('users')
      .select('*')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .limit(10)

    // Search posts
    const { data: postsData } = await supabase
      .from('posts')
      .select('*, user:users(username, avatar)')
      .ilike('content', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(10)

    // Extract hashtags
    const hashtagRegex = /#[\w\u0600-\u06FF]+/g
    const foundHashtags = new Set()
    postsData?.forEach(post => {
      const matches = post.content.match(hashtagRegex)
      if (matches) {
        matches.forEach(tag => foundHashtags.add(tag.toLowerCase()))
      }
    })

    setUsers(usersData || [])
    setPosts(postsData || [])
    setHashtags(Array.from(foundHashtags).map(tag => ({ name: tag, count: Math.floor(Math.random() * 1000) + 1 })))

    setLoading(false)

    if (query.trim()) {
      saveSearch(query, 'search')
    }
  }, [query])

  useEffect(() => {
    const delay = setTimeout(() => {
      performSearch()
    }, 500)
    return () => clearTimeout(delay)
  }, [performSearch])

  const handleFollow = async (userId, isFollowing) => {
    if (isFollowing) {
      await supabase.from('user_followers').delete().eq('follower_id', user.id).eq('following_id', userId)
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_following: false } : u))
    } else {
      await supabase.from('user_followers').insert({ follower_id: user.id, following_id: userId })
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_following: true } : u))
    }
  }

  // Check follow status for users
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (users.length === 0) return
      const { data } = await supabase
        .from('user_followers')
        .select('following_id')
        .eq('follower_id', user.id)
        .in('following_id', users.map(u => u.id))

      const followingIds = new Set(data?.map(d => d.following_id) || [])
      setUsers(prev => prev.map(u => ({ ...u, is_following: followingIds.has(u.id) })))
    }
    checkFollowStatus()
  }, [users, user.id])

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      {/* Search Bar */}
      <div className="glass rounded-full p-2 flex items-center mb-6">
        <FiSearch className="text-gray-400 ml-3" />
        <input
          type="text"
          placeholder="Search users, posts, hashtags..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-white px-3 py-2"
          autoFocus
        />
        {query && (
          <button onClick={() => setQuery('')} className="p-1 mr-2">
            <FiX className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-white/10">
        <button onClick={() => setActiveTab('all')} className={`pb-2 ${activeTab === 'all' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>
          All
        </button>
        <button onClick={() => setActiveTab('users')} className={`pb-2 ${activeTab === 'users' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>
          Users ({users.length})
        </button>
        <button onClick={() => setActiveTab('posts')} className={`pb-2 ${activeTab === 'posts' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>
          Posts ({posts.length})
        </button>
        <button onClick={() => setActiveTab('hashtags')} className={`pb-2 ${activeTab === 'hashtags' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>
          Hashtags ({hashtags.length})
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <FiLoader className="w-8 h-8 animate-spin text-flicks-primary" />
        </div>
      )}

      {!loading && !query && recentSearches.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm text-gray-400 flex items-center gap-2"><FiClock /> Recent Searches</h3>
            <button onClick={clearRecentSearches} className="text-xs text-gray-500 hover:text-white">Clear</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search) => (
              <button key={search.id} onClick={() => setQuery(search.term)} className="glass px-3 py-1 rounded-full text-sm">
                {search.term}
              </button>
            ))}
          </div>
        </div>
      )}

      {!loading && query && (
        <>
          {/* Users Tab */}
          {(activeTab === 'all' || activeTab === 'users') && users.length > 0 && (
            <div className={activeTab === 'all' ? 'mb-6' : ''}>
              {activeTab === 'all' && <h3 className="text-sm text-gray-400 mb-3 flex items-center gap-2"><FiUsers /> Users</h3>}
              <div className="space-y-2">
                {users.slice(0, activeTab === 'all' ? 3 : undefined).map((userResult) => (
                  <div key={userResult.id} className="flex items-center justify-between p-3 glass rounded-2xl">
                    <Link to={`/profile/${userResult.id}`} className="flex items-center gap-3 flex-1">
                      <div className="story-ring">
                        <img src={userResult.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold">{userResult.username}</p>
                        <p className="text-xs text-gray-500">{userResult.full_name || ''}</p>
                      </div>
                    </Link>
                    <button onClick={() => handleFollow(userResult.id, userResult.is_following)} className={`px-4 py-1 rounded-full text-sm ${userResult.is_following ? 'bg-white/10' : 'gradient-bg'}`}>
                      {userResult.is_following ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hashtags Tab */}
          {(activeTab === 'all' || activeTab === 'hashtags') && hashtags.length > 0 && (
            <div className={activeTab === 'all' ? 'mb-6' : ''}>
              {activeTab === 'all' && <h3 className="text-sm text-gray-400 mb-3 flex items-center gap-2"><FiHash /> Hashtags</h3>}
              <div className="flex flex-wrap gap-2">
                {hashtags.slice(0, activeTab === 'all' ? 5 : undefined).map((tag) => (
                  <button key={tag.name} className="glass px-3 py-2 rounded-xl text-sm flex items-center gap-2">
                    <FiHash className="w-4 h-4 text-flicks-primary" />
                    {tag.name}
                    <span className="text-xs text-gray-500">{tag.count} posts</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Posts Tab */}
          {(activeTab === 'all' || activeTab === 'posts') && posts.length > 0 && (
            <div>
              {activeTab === 'all' && <h3 className="text-sm text-gray-400 mb-3">Posts</h3>}
              <div className="space-y-3">
                {posts.slice(0, activeTab === 'all' ? 5 : undefined).map((post) => (
                  <Link key={post.id} to={`/post/${post.id}`} className="glass rounded-2xl p-4 block">
                    <div className="flex items-center gap-2 mb-2">
                      <img src={post.user?.avatar} alt="" className="w-6 h-6 rounded-full" />
                      <span className="text-sm font-semibold">{post.user?.username}</span>
                      <span className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm line-clamp-2">{post.content}</p>
                    {post.image_url && <img src={post.image_url} alt="" className="w-full h-32 object-cover rounded-lg mt-2" />}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {users.length === 0 && posts.length === 0 && hashtags.length === 0 && (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="text-5xl mb-3">🔍</div>
              <h3 className="text-lg font-semibold mb-1">No results found</h3>
              <p className="text-gray-400 text-sm">Try searching for something else</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Search
