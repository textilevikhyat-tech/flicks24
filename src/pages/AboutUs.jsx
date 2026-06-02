// src/pages/AboutUs.jsx
import React from 'react'
import { Helmet } from 'react-helmet-async'

const AboutUs = () => {
  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <Helmet>
        <title>About Us - FLICKS 24</title>
      </Helmet>
      <div className="glass rounded-2xl p-6 text-center">
        <div className="w-24 h-24 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4 text-4xl">
          🎬
        </div>
        <h1 className="text-2xl font-bold gradient-text mb-2">FLICKS 24</h1>
        <p className="text-gray-400 mb-6">Connect. Create. Care.</p>
        
        <div className="space-y-4 text-left text-sm text-gray-300">
          <p>FLICKS 24 is a social media platform that brings together the best of Facebook, Instagram, and unique features to create a truly connected experience.</p>
          
          <h2 className="text-lg font-semibold text-white mt-4">Our Mission</h2>
          <p>To empower people to connect authentically, express themselves creatively, and help those in need through our unique HelpDesk feature.</p>
          
          <h2 className="text-lg font-semibold text-white mt-4">What Makes Us Different</h2>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>⚡ Random Video Call - Connect with strangers worldwide</li>
            <li>❤️ HelpDesk - Report and help people in need</li>
            <li>🔗 Chain Posts - Make your content go viral</li>
            <li>✨ Quote Maker - Create beautiful quotes</li>
            <li>🎥 Reels & Stories - Share your moments</li>
            <li>⭕ Circles - Create and join communities</li>
            <li>🔗 Hooks - Build your brand with pages</li>
          </ul>
          
          <h2 className="text-lg font-semibold text-white mt-4">Contact Information</h2>
          <p>📧 Admin: <span className="text-flicks-primary">textilevikhyat@gmail.com</span></p>
          <p>🛟 Support: <span className="text-flicks-primary">flicks24vikhyatg@gmail.com</span></p>
          
          <h2 className="text-lg font-semibold text-white mt-4">Follow Us</h2>
          <p>Stay updated with our latest features and announcements.</p>
        </div>
      </div>
    </div>
  )
}

export default AboutUs
