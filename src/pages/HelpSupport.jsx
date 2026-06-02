// src/pages/HelpSupport.jsx
import React, { useState } from 'react'
import { FiHelpCircle, FiMail, FiMessageCircle, FiBookOpen, FiChevronDown, FiChevronUp } from 'react-icons/fi'

const HelpSupport = () => {
  const [openFaq, setOpenFaq] = useState(null)

  const faqs = [
    { q: "How do I create a post?", a: "Tap the 'What's on your mind?' box on your home feed, write your content, add photos if you like, then tap 'Post'." },
    { q: "How do I start a random video call?", a: "Go to the Random Call page from the bottom navigation, tap 'Start Call', and we'll connect you with a random user." },
    { q: "How does HelpDesk work?", a: "Report people in need by filling out the form with their details and photo. Our team reviews and coordinates help." },
    { q: "How do I create a quote?", a: "Go to Quote Maker, write or select a quote, customize colors and fonts, then download or share!" },
    { q: "What are Chain Posts?", a: "Chain posts are viral posts that spread through connections. Join a chain to see content and invite others." },
    { q: "How do I report inappropriate content?", a: "Tap the three dots menu on any post and select 'Report'. Our team will review it." },
    { q: "Can I delete my account?", a: "Yes, go to Settings → Account → Delete Account. This action is permanent." }
  ]

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <div className="glass rounded-2xl p-6">
        <h1 className="text-2xl font-bold gradient-text mb-2">Help & Support</h1>
        <p className="text-gray-400 mb-6">Find answers to common questions</p>
        
        {/* Quick Contact */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <a href="mailto:flicks24vikhyatg@gmail.com" className="glass p-3 rounded-xl text-center hover:bg-white/5 transition">
            <FiMail className="w-6 h-6 mx-auto mb-1 text-flicks-primary" />
            <p className="text-sm font-semibold">Email Us</p>
            <p className="text-xs text-gray-500">Support</p>
          </a>
          <div className="glass p-3 rounded-xl text-center">
            <FiMessageCircle className="w-6 h-6 mx-auto mb-1 text-flicks-primary" />
            <p className="text-sm font-semibold">Live Chat</p>
            <p className="text-xs text-gray-500">Coming Soon</p>
          </div>
        </div>
        
        {/* FAQ Section */}
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><FiBookOpen /> Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-4 py-3 flex justify-between items-center hover:bg-white/5 transition"
              >
                <span className="text-sm font-medium">{faq.q}</span>
                {openFaq === idx ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-3 text-sm text-gray-400 border-t border-white/10">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Contact Info Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-sm text-gray-500">
          <p>Still need help? Contact us at <span className="text-flicks-primary">flicks24vikhyatg@gmail.com</span></p>
          <p className="mt-1">Admin: textilevikhyat@gmail.com</p>
        </div>
      </div>
    </div>
  )
}

export default HelpSupport
