import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { 
  FiShield, FiUsers, FiFlag, FiMessageSquare, FiCheckCircle, FiClock,
  FiLoader, FiX, FiCheck, FiEye, FiTrash2, FiUserX, FiUserCheck,
  FiTrendingUp, FiMail, FiDownload, FiFilter
} from 'react-icons/fi'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalReports: 0,
    pendingHelpRequests: 0,
    activeChains: 0
  })
  
  // Data states
  const [users, setUsers] = useState([])
  const [reports, setReports] = useState([])
  const [helpRequests, setHelpRequests] = useState([])
  const [posts, setPosts] = useState([])

  // Admin check
  const isAdmin = user?.email === 'textilevikhyat@gmail.com'

  useEffect(() => {
    if (isAdmin) {
      fetchAllData()
    }
  }, [isAdmin])

  const fetchAllData = async () => {
    setLoading(true)
    
    // Fetch stats
    const [
      { count: userCount },
      { count: postCount },
      { count: reportCount },
      { count: helpCount },
      { count: chainCount }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('posts').select('*', { count: 'exact', head: true }),
      supabase.from('reports').select('*', { count: 'exact', head: true }),
      supabase.from('help_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('chain_posts').select('*', { count: 'exact', head: true })
    ])

    setStats({
      totalUsers: userCount || 0,
      totalPosts: postCount || 0,
      totalReports: reportCount || 0,
      pendingHelpRequests: helpCount || 0,
      activeChains: chainCount || 0
    })

    // Fetch users
    const { data: usersData } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    setUsers(usersData || [])

    // Fetch reports with user details
    const { data: reportsData } = await supabase
      .from('reports')
      .select('*, reporter:users!reporter_id(username, avatar), post:posts(content)')
      .order('created_at', { ascending: false })
    setReports(reportsData || [])

    // Fetch help requests
    const { data: helpData } = await supabase
      .from('help_requests')
      .select('*, reporter:users!reporter_id(username, avatar)')
      .order('created_at', { ascending: false })
    setHelpRequests(helpData || [])

    // Fetch posts
    const { data: postsData } = await supabase
      .from('posts')
      .select('*, user:users(username, avatar)')
      .order('created_at', { ascending: false })
      .limit(50)
    setPosts(postsData || [])

    setLoading(false)
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      await supabase.from('users').delete().eq('id', userId)
      fetchAllData()
    }
  }

  const handleBlockUser = async (userId, isBlocked) => {
    await supabase.from('user_blocks').upsert({ 
      blocker_id: user.id, 
      blocked_id: userId,
      is_permanent: true 
    })
    fetchAllData()
  }

  const handleResolveReport = async (reportId) => {
    await supabase.from('reports').update({ status: 'resolved' }).eq('id', reportId)
    fetchAllData()
  }

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await supabase.from('posts').delete().eq('id', postId)
      fetchAllData()
    }
  }

  const handleApproveHelpRequest = async (requestId) => {
    await supabase.from('help_requests').update({ status: 'approved' }).eq('id', requestId)
    fetchAllData()
  }

  const handleRejectHelpRequest = async (requestId) => {
    const reason = prompt('Reason for rejection:')
    if (reason) {
      await supabase.from('help_requests').update({ 
        status: 'rejected', 
        rejection_reason: reason 
      }).eq('id', requestId)
      fetchAllData()
    }
  }

  const handleMarkDelivered = async (requestId) => {
    await supabase.from('help_requests').update({ 
      status: 'delivered', 
      delivered_at: new Date().toISOString() 
    }).eq('id', requestId)
    fetchAllData()
  }

  const exportData = () => {
    const data = {
      users,
      posts,
      reports,
      helpRequests,
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `flicks24-export-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <div className="glass rounded-2xl p-8">
          <FiShield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-400">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Contact admin at textilevikhyat@gmail.com</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FiLoader className="w-8 h-8 animate-spin text-flicks-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold gradient-text">Admin Dashboard</h1>
        <button onClick={exportData} className="px-3 py-1 bg-white/10 rounded-lg text-sm flex items-center gap-2">
          <FiDownload /> Export
        </button>
      </div>
      <p className="text-gray-400 mb-6">Manage users, reports, and content</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="glass rounded-2xl p-3 text-center">
          <FiUsers className="w-6 h-6 text-flicks-primary mx-auto mb-1" />
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
          <p className="text-xs text-gray-400">Total Users</p>
        </div>
        <div className="glass rounded-2xl p-3 text-center">
          <FiMessageSquare className="w-6 h-6 text-flicks-secondary mx-auto mb-1" />
          <p className="text-2xl font-bold">{stats.totalPosts}</p>
          <p className="text-xs text-gray-400">Total Posts</p>
        </div>
        <div className="glass rounded-2xl p-3 text-center">
          <FiFlag className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
          <p className="text-2xl font-bold">{stats.totalReports}</p>
          <p className="text-xs text-gray-400">Reports</p>
        </div>
        <div className="glass rounded-2xl p-3 text-center">
          <FiCheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
          <p className="text-2xl font-bold">{stats.pendingHelpRequests}</p>
          <p className="text-xs text-gray-400">Pending Help</p>
        </div>
        <div className="glass rounded-2xl p-3 text-center">
          <FiTrendingUp className="w-6 h-6 text-purple-500 mx-auto mb-1" />
          <p className="text-2xl font-bold">{stats.activeChains}</p>
          <p className="text-xs text-gray-400">Active Chains</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-white/10 overflow-x-auto pb-1">
        <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 text-sm ${activeTab === 'overview' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>
          Overview
        </button>
        <button onClick={() => setActiveTab('users')} className={`px-4 py-2 text-sm ${activeTab === 'users' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>
          Users ({users.length})
        </button>
        <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 text-sm ${activeTab === 'reports' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>
          Reports ({reports.length})
        </button>
        <button onClick={() => setActiveTab('help')} className={`px-4 py-2 text-sm ${activeTab === 'help' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>
          Help Requests ({helpRequests.length})
        </button>
        <button onClick={() => setActiveTab('posts')} className={`px-4 py-2 text-sm ${activeTab === 'posts' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>
          Posts ({posts.length})
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="glass rounded-2xl p-4">
          <h2 className="font-semibold mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 glass rounded-xl text-sm">📊 View Analytics</button>
            <button className="p-3 glass rounded-xl text-sm">📧 Send Announcement</button>
            <button className="p-3 glass rounded-xl text-sm">⚙️ System Settings</button>
            <button className="p-3 glass rounded-xl text-sm">📋 View Logs</button>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="glass rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-white/10">
                <tr className="text-left">
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Joined</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(userData => (
                  <tr key={userData.id} className="border-b border-white/5">
                    <td className="p-3 flex items-center gap-2">
                      <img src={userData.avatar} alt="" className="w-8 h-8 rounded-full" />
                      <span>{userData.username}</span>
                    </td>
                    <td className="p-3">{userData.email}</td>
                    <td className="p-3">{new Date(userData.created_at).toLocaleDateString()}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleBlockUser(userData.id)} className="p-1 text-yellow-500 hover:bg-white/10 rounded">
                          <FiUserX className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteUser(userData.id)} className="p-1 text-red-500 hover:bg-white/10 rounded">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-3">
          {reports.map(report => (
            <div key={report.id} className="glass rounded-2xl p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">Report #{report.id}</span>
                    <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded-full">pending</span>
                  </div>
                  <p className="text-sm">Reported by: {report.reporter?.username}</p>
                  <p className="text-sm">Post: "{report.post?.content?.substring(0, 100)}..."</p>
                  <p className="text-sm text-gray-400">Reason: {report.reason}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleDeletePost(report.post_id)} className="px-3 py-1 bg-red-500/20 text-red-500 rounded-lg text-sm">
                    Delete Post
                  </button>
                  <button onClick={() => handleResolveReport(report.id)} className="px-3 py-1 bg-green-500/20 text-green-500 rounded-lg text-sm">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
          {reports.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-gray-400">No reports to review</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'help' && (
        <div className="space-y-3">
          {helpRequests.map(request => (
            <div key={request.id} className="glass rounded-2xl p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{request.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                      request.status === 'approved' ? 'bg-blue-500/20 text-blue-500' :
                      request.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                      'bg-red-500/20 text-red-500'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{request.address}</p>
                  <p className="text-sm mt-1">{request.need}</p>
                  <p className="text-xs text-gray-500 mt-1">Reported by: {request.reporter?.username}</p>
                  <p className="text-xs text-gray-500">Tracking ID: {request.tracking_id}</p>
                </div>
                <div className="flex gap-2">
                  {request.status === 'pending' && (
                    <>
                      <button onClick={() => handleApproveHelpRequest(request.id)} className="px-3 py-1 bg-green-500/20 text-green-500 rounded-lg text-sm">
                        Approve
                      </button>
                      <button onClick={() => handleRejectHelpRequest(request.id)} className="px-3 py-1 bg-red-500/20 text-red-500 rounded-lg text-sm">
                        Reject
                      </button>
                    </>
                  )}
                  {request.status === 'approved' && (
                    <button onClick={() => handleMarkDelivered(request.id)} className="px-3 py-1 bg-flicks-primary rounded-lg text-sm">
                      Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {helpRequests.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-gray-400">No help requests</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="glass rounded-2xl p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <img src={post.user?.avatar} alt="" className="w-6 h-6 rounded-full" />
                    <span className="font-semibold text-sm">{post.user?.username}</span>
                    <span className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm">{post.content}</p>
                  {post.image_url && <img src={post.image_url} alt="" className="w-32 h-32 object-cover rounded-lg mt-2" />}
                </div>
                <button onClick={() => handleDeletePost(post.id)} className="p-1 text-red-500 hover:bg-white/10 rounded">
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center">
              <p className="text-gray-400">No posts found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
