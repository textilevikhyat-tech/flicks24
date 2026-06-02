import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { FiUsers, FiFileText, FiFlag, FiCheckCircle, FiClock, FiXCircle, FiMessageSquare } from 'react-icons/fi'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('reports')
  
  // Mock data
  const [helpRequests] = useState([
    { id: 1, name: 'Ramesh Kumar', need: 'Food and clothes', status: 'pending', date: '2024-01-15' },
    { id: 2, name: 'Sunita Devi', need: 'Medical help', status: 'approved', date: '2024-01-14' },
    { id: 3, name: 'Rajesh Singh', need: 'Educational support', status: 'delivered', date: '2024-01-10' },
  ])
  
  const [reports] = useState([
    { id: 1, type: 'post', reportedBy: 'user123', reason: 'Spam', status: 'pending' },
    { id: 2, type: 'user', reportedBy: 'user456', reason: 'Harassment', status: 'reviewed' },
  ])

  const stats = {
    totalUsers: 1243,
    totalPosts: 5678,
    pendingReports: 3,
    helpRequestsPending: 5,
    chainPostsActive: 12
  }

  return (
    <div className="min-h-screen bg-flicks-dark p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold gradient-text mb-2">Admin Dashboard</h1>
        <p className="text-gray-400 mb-6">Manage users, reports, and help requests</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="glass rounded-2xl p-3 text-center">
            <FiUsers className="w-6 h-6 text-flicks-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
            <p className="text-xs text-gray-400">Total Users</p>
          </div>
          <div className="glass rounded-2xl p-3 text-center">
            <FiFileText className="w-6 h-6 text-flicks-secondary mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.totalPosts}</p>
            <p className="text-xs text-gray-400">Total Posts</p>
          </div>
          <div className="glass rounded-2xl p-3 text-center">
            <FiFlag className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.pendingReports}</p>
            <p className="text-xs text-gray-400">Pending Reports</p>
          </div>
          <div className="glass rounded-2xl p-3 text-center">
            <FiMessageSquare className="w-6 h-6 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{stats.helpRequestsPending}</p>
            <p className="text-xs text-gray-400">Help Requests</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10 overflow-x-auto">
          <button onClick={() => setActiveTab('reports')} className={`px-4 py-2 ${activeTab === 'reports' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>
            🚨 Reports ({reports.length})
          </button>
          <button onClick={() => setActiveTab('help')} className={`px-4 py-2 ${activeTab === 'help' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>
            ❤️ Help Requests ({helpRequests.length})
          </button>
          <button onClick={() => setActiveTab('users')} className={`px-4 py-2 ${activeTab === 'users' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>
            👥 Users
          </button>
          <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 ${activeTab === 'settings' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}>
            ⚙️ Settings
          </button>
        </div>

        {activeTab === 'reports' && (
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="glass rounded-2xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold">Report #{report.id}</span>
                      <span className="text-xs text-gray-500">Type: {report.type}</span>
                    </div>
                    <p className="text-sm">Reported by: {report.reportedBy}</p>
                    <p className="text-sm">Reason: {report.reason}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-red-500/20 text-red-500 rounded-lg text-sm">Dismiss</button>
                    <button className="px-3 py-1 bg-flicks-primary rounded-lg text-sm">Review</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'help' && (
          <div className="space-y-3">
            {helpRequests.map((request) => (
              <div key={request.id} className="glass rounded-2xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{request.name}</h3>
                      {request.status === 'pending' && <FiClock className="w-4 h-4 text-yellow-500" />}
                      {request.status === 'approved' && <FiCheckCircle className="w-4 h-4 text-blue-500" />}
                      {request.status === 'delivered' && <FiCheckCircle className="w-4 h-4 text-green-500" />}
                    </div>
                    <p className="text-sm text-gray-300">{request.need}</p>
                    <p className="text-xs text-gray-500 mt-1">{request.date}</p>
                  </div>
                  <div className="flex gap-2">
                    {request.status === 'pending' && (
                      <>
                        <button className="px-3 py-1 bg-green-500/20 text-green-500 rounded-lg text-sm">Approve</button>
                        <button className="px-3 py-1 bg-red-500/20 text-red-500 rounded-lg text-sm">Reject</button>
                      </>
                    )}
                    {request.status === 'approved' && (
                      <button className="px-3 py-1 bg-flicks-primary rounded-lg text-sm">Mark Delivered</button>
                    )}
                    {request.status === 'delivered' && (
                      <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-lg text-sm flex items-center gap-1"><FiCheckCircle /> Delivered</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="glass rounded-2xl p-6 text-center">
            <FiUsers className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">User management coming soon</p>
            <p className="text-sm text-gray-500">View, block, or delete users</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Admin Settings</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Maintenance Mode</span>
                <button className="px-3 py-1 bg-red-500/20 text-red-500 rounded-lg text-sm">Off</button>
              </div>
              <div className="flex justify-between items-center">
                <span>Allow New Signups</span>
                <button className="px-3 py-1 bg-green-500/20 text-green-500 rounded-lg text-sm">Enabled</button>
              </div>
              <div className="pt-3 border-t border-white/10">
                <p className="text-sm text-gray-400">Admin Email: textilevikhyat@gmail.com</p>
                <p className="text-sm text-gray-400">Support Email: flicks24vikhyatg@gmail.com</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
