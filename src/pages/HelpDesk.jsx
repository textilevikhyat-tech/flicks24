import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { FiUpload, FiCheckCircle, FiClock, FiMapPin, FiPhone, FiUser, FiFileText, FiSend } from 'react-icons/fi'

const HelpDesk = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    need: '',
    photo: null
  })
  const [submitted, setSubmitted] = useState(false)
  const [trackingId, setTrackingId] = useState(null)
  const [myReports, setMyReports] = useState([])
  const [activeTab, setActiveTab] = useState('report')
  const [loading, setLoading] = useState(false)

  // Mock reports data
  const mockReports = [
    { id: 1, name: 'Ramesh Kumar', address: 'Old Delhi, Near Jama Masjid', need: 'Food and clothes', status: 'pending', trackingId: 'FLICKS-001', date: '2024-01-15' },
    { id: 2, name: 'Sunita Devi', address: 'South Extension, New Delhi', need: 'Medical help', status: 'approved', trackingId: 'FLICKS-002', date: '2024-01-10' },
    { id: 3, name: 'Rajesh Singh', address: 'Ghaziabad, UP', need: 'Educational support', status: 'delivered', trackingId: 'FLICKS-003', date: '2024-01-05' },
  ]

  useEffect(() => {
    setMyReports(mockReports)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      const newTrackingId = `FLICKS-${Math.floor(Math.random() * 10000)}`
      setTrackingId(newTrackingId)
      setSubmitted(true)
      setLoading(false)
      
      // Add to reports
      setMyReports([{
        id: myReports.length + 1,
        name: formData.name,
        address: formData.address,
        need: formData.need,
        status: 'pending',
        trackingId: newTrackingId,
        date: new Date().toISOString().split('T')[0]
      }, ...myReports])
      
      setFormData({ name: '', address: '', phone: '', need: '', photo: null })
    }, 2000)
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full text-xs">Pending</span>
      case 'approved': return <span className="bg-blue-500/20 text-blue-500 px-2 py-1 rounded-full text-xs">Approved</span>
      case 'delivered': return <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded-full text-xs">Delivered ✓</span>
      default: return <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full text-xs">{status}</span>
    }
  }

  return (
    <div className="min-h-screen bg-flicks-dark p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold gradient-text mb-2">HelpDesk</h1>
        <p className="text-gray-400 mb-6">Report people in need and help them get assistance</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 ${activeTab === 'report' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}
          >
            📝 Report
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 ${activeTab === 'reports' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}
          >
            📋 My Reports ({myReports.length})
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`px-4 py-2 ${activeTab === 'track' ? 'border-b-2 border-flicks-primary text-flicks-primary' : 'text-gray-400'}`}
          >
            🔍 Track
          </button>
        </div>

        {activeTab === 'report' && (
          <>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
                <div>
                  <label className="text-sm text-gray-400 flex items-center gap-2 mb-1"><FiUser /> Person's Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-flicks-primary"
                    placeholder="e.g., Ramesh Kumar"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 flex items-center gap-2 mb-1"><FiMapPin /> Complete Address</label>
                  <textarea
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-flicks-primary"
                    rows="2"
                    placeholder="Street, area, city, landmark"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 flex items-center gap-2 mb-1"><FiPhone /> Contact Number (if available)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-flicks-primary"
                    placeholder="Phone number"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 flex items-center gap-2 mb-1"><FiFileText /> What help is needed?</label>
                  <textarea
                    required
                    value={formData.need}
                    onChange={(e) => setFormData({...formData, need: e.target.value})}
                    className="w-full bg-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-flicks-primary"
                    rows="3"
                    placeholder="Describe the situation and what kind of help is required"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-400 flex items-center gap-2 mb-1"><FiUpload /> Upload Photo (optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({...formData, photo: e.target.files[0]})}
                    className="w-full bg-white/10 rounded-lg p-2 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-flicks-primary to-flicks-secondary py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><FiSend /> Submit Report</>}
                </button>
              </form>
            ) : (
              <div className="glass rounded-2xl p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <FiCheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-xl font-bold mb-2">Thank You for Reporting! 🙏</h2>
                <p className="text-gray-400 mb-4">Your report has been submitted. Our team will review it shortly.</p>
                <div className="bg-white/10 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-400">Your Tracking ID</p>
                  <p className="text-2xl font-mono font-bold text-flicks-primary">{trackingId}</p>
                </div>
                <button onClick={() => setSubmitted(false)} className="px-6 py-2 bg-flicks-primary rounded-full text-sm">
                  Report Another
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-3">
            {myReports.map((report) => (
              <div key={report.id} className="glass rounded-2xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{report.name}</h3>
                  {getStatusBadge(report.status)}
                </div>
                <p className="text-sm text-gray-400 flex items-center gap-1"><FiMapPin className="w-3 h-3" /> {report.address}</p>
                <p className="text-sm text-gray-300 mt-2">{report.need}</p>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/10">
                  <span className="text-xs text-gray-500">ID: {report.trackingId}</span>
                  <span className="text-xs text-gray-500">{report.date}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'track' && (
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold mb-3">Track Your Report</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Tracking ID (e.g., FLICKS-XXXX)"
                className="flex-1 bg-white/10 rounded-lg p-3 outline-none focus:ring-1 focus:ring-flicks-primary"
              />
              <button className="px-4 bg-flicks-primary rounded-lg">Track</button>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center"><FiCheckCircle className="w-4 h-4 text-green-500" /></div>
                <div><p className="font-semibold">Report Submitted</p><p className="text-xs text-gray-500">We received your report</p></div>
              </div>
              <div className="border-l-2 border-dashed border-gray-600 ml-4 h-6"></div>
              <div className="flex items-center gap-3 opacity-50">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"><FiClock className="w-4 h-4" /></div>
                <div><p className="font-semibold">Under Review</p><p className="text-xs text-gray-500">Admin is reviewing</p></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HelpDesk
