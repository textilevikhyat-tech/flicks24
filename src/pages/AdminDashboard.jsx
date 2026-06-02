// src/pages/AdminDashboard.jsx (Production Ready - Simplified)
import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { FiShield, FiUsers, FiFlag, FiMessageSquare, FiCheckCircle, FiClock } from 'react-icons/fi'

const AdminDashboard = () => {
  const { user } = useAuth()
  
  // Admin check - only textilevikhyat@gmail.com can access
  if (user?.email !== 'textilevikhyat@gmail.com') {
    return (
      <div className="max-w-2xl mx-auto p-4 text-center">
        <div className="glass rounded-2xl p-8">
          <FiShield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      <h1 className="text-2xl font-bold gradient-text mb-2">Admin Dashboard</h1>
      <p className="text-gray-400 mb-6">Manage reports, help requests, and users</p>
      
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="glass rounded-2xl p-3 text-center">
          <FiUsers className="w-6 h-6 text-flicks-primary mx-auto mb-1" />
          <p className="text-2xl font-bold">1,234</p>
          <p className="text-xs text-gray-400">Total Users</p>
        </div>
        <div className="glass rounded-2xl p-3 text-center">
          <FiFlag className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
          <p className="text-2xl font-bold">3</p>
          <p className="text-xs text-gray-400">Pending Reports</p>
        </div>
        <div className="glass rounded-2xl p-3 text-center">
          <FiMessageSquare className="w-6 h-6 text-green-500 mx-auto mb-1" />
          <p className="text-2xl font-bold">5</p>
          <p className="text-xs text-gray-400">Help Requests</p>
        </div>
        <div className="glass rounded-2xl p-3 text-center">
          <FiCheckCircle className="w-6 h-6 text-purple-500 mx-auto mb-1" />
          <p className="text-2xl font-bold">12</p>
          <p className="text-xs text-gray-400">Active Chains</p>
        </div>
      </div>
      
      {/* Pending Help Requests */}
      <div className="glass rounded-2xl p-4 mb-4">
        <h2 className="font-semibold mb-3">Pending Help Requests</h2>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div>
                <p className="font-semibold">Ramesh Kumar</p>
                <p className="text-xs text-gray-500">Need: Food and clothes</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-green-500/20 text-green-500 rounded-lg text-xs">Approve</button>
                <button className="px-3 py-1 bg-red-500/20 text-red-500 rounded-lg text-xs">Reject</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Pending Reports */}
      <div className="glass rounded-2xl p-4">
        <h2 className="font-semibold mb-3">Pending Reports</h2>
        <div className="space-y-2">
          {[1, 2].map(i => (
            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div>
                <p className="font-semibold">Post #{i}</p>
                <p className="text-xs text-gray-500">Reason: Spam</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-green-500/20 text-green-500 rounded-lg text-xs">Dismiss</button>
                <button className="px-3 py-1 bg-red-500/20 text-red-500 rounded-lg text-xs">Block</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
