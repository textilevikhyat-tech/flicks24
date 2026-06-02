import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { 
  FiUpload, FiCheckCircle, FiClock, FiMapPin, FiPhone, FiUser, 
  FiFileText, FiSend, FiLoader, FiAlertCircle, FiEye, FiCheck,
  FiX, FiSearch, FiFilter, FiTrash2, FiEdit2
} from 'react-icons/fi'
import { Link } from 'react-router-dom'

// Help Request Card Component
const HelpRequestCard = ({ request, showStatus, onViewDetails }) => {
  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full text-xs flex items-center gap-1"><FiClock className="w-3 h-3" /> Pending</span>
      case 'approved': return <span className="bg-blue-500/20 text-blue-500 px-2 py-1 rounded-full text-xs flex items-center gap-1"><FiEye className="w-3 h-3" /> Approved</span>
      case 'assigned': return <span className="bg-purple-500/20 text-purple-500 px-2 py-1 rounded-full text-xs flex items-center gap-1"><FiUser className="w-3 h-3" /> Team Assigned</span>
      case 'delivered': return <span className="bg-green-500/20 text-green-500 px-2 py-1 rounded-full text-xs flex items-center gap-1"><FiCheckCircle className="w-3 h-3" /> Delivered ✓</span>
      case 'rejected': return <span className="bg-red-500/20 text-red-500 px-2 py-1 rounded-full text-xs flex items-center gap-1"><FiX className="w-3 h-3" /> Rejected</span>
      default: return <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full text-xs">{status}</span>
    }
  }

  return (
    <div className="glass rounded-2xl p-4 hover:bg-white/5 transition cursor-pointer" onClick={() => onViewDetails(request)}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold">{request.name}</h3>
        {showStatus && getStatusBadge(request.status)}
      </div>
      <p className="text-sm text-gray-400 flex items-center gap-1"><FiMapPin className="w-3 h-3" /> {request.address}</p>
      <p className="text-sm text-gray-300 mt-2 line-clamp-2">{request.need}</p>
      <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/10 text-xs text-gray-500">
        <span>ID: {request.tracking_id}</span>
        <span>{new Date(request.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  )
}

// Report Form Component
const ReportForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    need: '',
    photo: null
  })
  const [photoPreview, setPhotoPreview] = useState(null)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.address.trim()) newErrors.address = 'Address is required'
    if (!formData.need.trim()) newErrors.need = 'Need description is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }))
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm text-gray-400 flex items-center gap-2 mb-1"><FiUser /> Person's Full Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className={`w-full bg-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-flicks-primary ${errors.name ? 'border border-red-500' : ''}`}
          placeholder="e.g., Ramesh Kumar"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="text-sm text-gray-400 flex items-center gap-2 mb-1"><FiMapPin /> Complete Address *</label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          className={`w-full bg-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-flicks-primary resize-none ${errors.address ? 'border border-red-500' : ''}`}
          rows="2"
          placeholder="Street, area, city, landmark"
        />
        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
      </div>

      <div>
        <label className="text-sm text-gray-400 flex items-center gap-2 mb-1"><FiPhone /> Contact Number (if available)</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          className="w-full bg-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-flicks-primary"
          placeholder="Phone number"
        />
      </div>

      <div>
        <label className="text-sm text-gray-400 flex items-center gap-2 mb-1"><FiFileText /> What help is needed? *</label>
        <textarea
          value={formData.need}
          onChange={(e) => setFormData(prev => ({ ...prev, need: e.target.value }))}
          className={`w-full bg-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-flicks-primary resize-none ${errors.need ? 'border border-red-500' : ''}`}
          rows="3"
          placeholder="Describe the situation and what kind of help is required"
        />
        {errors.need && <p className="text-red-500 text-xs mt-1">{errors.need}</p>}
      </div>

      <div>
        <label className="text-sm text-gray-400 flex items-center gap-2 mb-1"><FiUpload /> Upload Photo (optional)</label>
        <div className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center cursor-pointer hover:border-flicks-primary transition">
          <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" id="photo-upload" />
          <label htmlFor="photo-upload" className="cursor-pointer">
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="max-h-32 mx-auto rounded-lg" />
            ) : (
              <div className="text-gray-400">
                <FiUpload className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Click to upload photo</p>
              </div>
            )}
          </label>
        </div>
      </div>

      <button type="submit" disabled={loading} className="w-full gradient-bg py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
        {loading ? <FiLoader className="w-5 h-5 animate-spin" /> : <><FiSend /> Submit Report</>}
      </button>
    </form>
  )
}

// Track Request Component
const TrackRequest = () => {
  const [trackingId, setTrackingId] = useState('')
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTrack = async () => {
    if (!trackingId.trim()) return
    setLoading(true)
    setError('')
    
    const { data, error } = await supabase
      .from('help_requests')
      .select('*')
      .eq('tracking_id', trackingId)
      .single()

    if (data) {
      setRequest(data)
    } else {
      setError('No request found with this tracking ID')
    }
    setLoading(false)
  }

  const getStatusStep = (status) => {
    const steps = [
      { key: 'pending', label: 'Report Submitted', icon: '📝' },
      { key: 'approved', label: 'Under Review', icon: '🔍' },
      { key: 'assigned', label: 'Team Assigned', icon: '👥' },
      { key: 'delivered', label: 'Help Delivered', icon: '🎉' }
    ]
    
    const currentIndex = steps.findIndex(s => s.key === status)
    
    return (
      <div className="mt-4">
        <div className="flex justify-between mb-2">
          {steps.map((step, idx) => (
            <div key={step.key} className="text-center flex-1">
              <div className={`text-2xl mb-1 ${idx <= currentIndex ? 'opacity-100' : 'opacity-30'}`}>{step.icon}</div>
              <p className={`text-xs ${idx <= currentIndex ? 'text-flicks-primary' : 'text-gray-500'}`}>{step.label}</p>
            </div>
          ))}
        </div>
        <div className="relative h-1 bg-white/10 rounded-full mt-2">
          <div className="absolute h-full gradient-bg rounded-full transition-all" style={{ width: `${(currentIndex + 1) * 25}%` }} />
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-6">
      <h3 className="font-semibold mb-3">Track Your Report</h3>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter Tracking ID (e.g., FLICKS-XXXXX)"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          className="flex-1 bg-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-flicks-primary text-sm"
        />
        <button onClick={handleTrack} disabled={loading} className="px-4 gradient-bg rounded-xl">
          {loading ? <FiLoader className="w-5 h-5 animate-spin" /> : 'Track'}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      
      {request && (
        <div className="mt-6 p-4 glass rounded-xl">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-semibold">{request.name}</p>
              <p className="text-sm text-gray-400">{request.address}</p>
            </div>
            <span className="text-xs text-gray-500">ID: {request.tracking_id}</span>
          </div>
          <p className="text-sm text-gray-300 mb-3">{request.need}</p>
          {getStatusStep(request.status)}
          {request.status === 'delivered' && request.delivered_by && (
            <div className="mt-4 p-3 bg-green-500/10 rounded-xl text-center">
              <p className="text-sm text-green-400">✓ Help delivered successfully!</p>
              <p className="text-xs text-gray-400 mt-1">Thanks to our team for making this possible</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Main HelpDesk Component
const HelpDesk = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('report')
  const [myReports, setMyReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [trackingId, setTrackingId] = useState(null)
  const [selectedRequest, setSelectedRequest] = useState(null)

  const fetchMyReports = useCallback(async () => {
    const { data } = await supabase
      .from('help_requests')
      .select('*')
      .eq('reporter_id', user?.id)
      .order('created_at', { ascending: false })
    
    if (data) setMyReports(data)
  }, [user?.id])

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchMyReports()
    }
  }, [activeTab, fetchMyReports])

  const handleSubmitReport = async (formData) => {
    setLoading(true)
    
    // Generate unique tracking ID
    const trackingId = `FLICKS-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    
    let imageUrl = null
    if (formData.photo) {
      // In production: upload to Supabase storage
      imageUrl = URL.createObjectURL(formData.photo)
    }

    const { error } = await supabase
      .from('help_requests')
      .insert({
        reporter_id: user.id,
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        need: formData.need,
        photo_url: imageUrl,
        tracking_id: trackingId,
        status: 'pending'
      })

    if (!error) {
      setTrackingId(trackingId)
      setSubmitted(true)
      fetchMyReports()
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-flicks-dark p-4">
        <div className="max-w-2xl mx-auto">
          <div className="glass rounded-2xl p-8 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Thank You for Reporting! 🙏</h2>
            <p className="text-gray-400 mb-4">Your report has been submitted. Our team will review it shortly.</p>
            <div className="bg-white/10 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-400">Your Tracking ID</p>
              <p className="text-2xl font-mono font-bold text-flicks-primary">{trackingId}</p>
              <p className="text-xs text-gray-500 mt-1">Save this ID to track your report</p>
            </div>
            <button
              onClick={() => { setSubmitted(false); setActiveTab('report') }}
              className="gradient-bg px-6 py-2 rounded-full"
            >
              Report Another
            </button>
          </div>
        </div>
      </div>
    )
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
          <div className="glass rounded-2xl p-6">
            <ReportForm onSubmit={handleSubmitReport} loading={loading} />
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-3">
            {myReports.map((report) => (
              <HelpRequestCard
                key={report.id}
                request={report}
                showStatus={true}
                onViewDetails={setSelectedRequest}
              />
            ))}
            {myReports.length === 0 && (
              <div className="glass rounded-2xl p-12 text-center">
                <div className="text-5xl mb-3">📭</div>
                <p className="text-gray-400">No reports yet</p>
                <p className="text-sm text-gray-500">When you report someone in need, it will appear here</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'track' && <TrackRequest />}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 glass p-4 flex justify-between items-center border-b border-white/10">
              <h2 className="text-lg font-semibold">Report Details</h2>
              <button onClick={() => setSelectedRequest(null)} className="p-1"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500">Person's Name</p>
                <p className="font-semibold">{selectedRequest.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Address</p>
                <p className="text-sm">{selectedRequest.address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Need</p>
                <p className="text-sm">{selectedRequest.need}</p>
              </div>
              {selectedRequest.photo_url && (
                <div>
                  <p className="text-xs text-gray-500">Photo</p>
                  <img src={selectedRequest.photo_url} alt="Report" className="rounded-xl mt-1 max-h-48" />
                </div>
              )}
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-gray-500">Status</p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs mt-1 ${
                  selectedRequest.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                  selectedRequest.status === 'approved' ? 'bg-blue-500/20 text-blue-500' :
                  selectedRequest.status === 'assigned' ? 'bg-purple-500/20 text-purple-500' :
                  selectedRequest.status === 'delivered' ? 'bg-green-500/20 text-green-500' :
                  'bg-red-500/20 text-red-500'
                }`}>
                  {selectedRequest.status.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tracking ID</p>
                <p className="text-sm font-mono">{selectedRequest.tracking_id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Submitted On</p>
                <p className="text-sm">{new Date(selectedRequest.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HelpDesk
