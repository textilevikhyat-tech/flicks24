// src/pages/ContactUs.jsx
import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabase'
import { FiMail, FiSend, FiLoader, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'

const ContactUs = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.username || '',
    email: user?.email || '',
    subject: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill all required fields')
      return
    }
    
    setSubmitting(true)
    setError('')
    
    const { error: dbError } = await supabase
      .from('contact_messages')
      .insert({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        user_id: user?.id
      })
    
    if (dbError) {
      setError('Failed to send message. Please try again.')
    } else {
      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-4 pb-20">
        <div className="glass rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Message Sent!</h2>
          <p className="text-gray-400">Thank you for contacting us. We'll get back to you within 24-48 hours.</p>
          <button onClick={() => setSubmitted(false)} className="mt-4 gradient-bg px-6 py-2 rounded-full">
            Send Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <div className="glass rounded-2xl p-6">
        <h1 className="text-2xl font-bold gradient-text mb-2">Contact Us</h1>
        <p className="text-gray-400 mb-6">Have questions or feedback? We'd love to hear from you.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-flicks-primary"
              required
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-400 block mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full bg-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-flicks-primary"
              required
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-400 block mb-1">Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full bg-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-flicks-primary"
              placeholder="Optional"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-400 block mb-1">Message *</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className="w-full bg-white/10 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-flicks-primary resize-none"
              rows="5"
              placeholder="Your message here..."
              required
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500 rounded-xl flex items-center gap-2 text-red-400 text-sm">
              <FiAlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
          
          <button type="submit" disabled={submitting} className="w-full gradient-bg py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
            {submitting ? <FiLoader className="w-5 h-5 animate-spin" /> : <><FiSend /> Send Message</>}
          </button>
        </form>
        
        <div className="mt-6 pt-4 border-t border-white/10">
          <h3 className="font-semibold mb-2">Direct Contact</h3>
          <p className="text-sm text-gray-400">📧 Admin: <span className="text-flicks-primary">textilevikhyat@gmail.com</span></p>
          <p className="text-sm text-gray-400">🛟 Support: <span className="text-flicks-primary">flicks24vikhyatg@gmail.com</span></p>
        </div>
      </div>
    </div>
  )
}

export default ContactUs
