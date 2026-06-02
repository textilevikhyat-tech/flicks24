// src/pages/PrivacyPolicy.jsx
import React from 'react'
import { Helmet } from 'react-helmet-async'

const PrivacyPolicy = () => {
  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <Helmet>
        <title>Privacy Policy - FLICKS 24</title>
      </Helmet>
      <div className="glass rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-4 text-sm text-gray-300">
          <p>Welcome to FLICKS 24. Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information.</p>
          
          <h2 className="text-lg font-semibold text-white mt-4">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, post content, send messages, or use our features. This includes:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Account information (username, email, password)</li>
            <li>Profile information (name, bio, profile picture, cover photo)</li>
            <li>Content you post (text, photos, videos)</li>
            <li>Messages and communications</li>
            <li>Usage data and preferences</li>
          </ul>
          
          <h2 className="text-lg font-semibold text-white mt-4">2. How We Use Your Information</h2>
          <p>We use your information to provide, improve, and personalize our services, including:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Operating and maintaining the platform</li>
            <li>Connecting you with other users</li>
            <li>Sending notifications and updates</li>
            <li>Analyzing usage patterns to improve features</li>
            <li>Ensuring safety and security</li>
          </ul>
          
          <h2 className="text-lg font-semibold text-white mt-4">3. Information Sharing</h2>
          <p>We do not sell your personal information. We may share information:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>With other users as part of the platform (your posts, profile, etc.)</li>
            <li>With service providers who assist us</li>
            <li>When required by law</li>
            <li>To protect the rights and safety of our users</li>
          </ul>
          
          <h2 className="text-lg font-semibold text-white mt-4">4. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your information. However, no method of transmission over the internet is 100% secure.</p>
          
          <h2 className="text-lg font-semibold text-white mt-4">5. Your Rights</h2>
          <p>You have the right to access, update, or delete your personal information. You can do this through your account settings or by contacting us.</p>
          
          <h2 className="text-lg font-semibold text-white mt-4">6. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us at: <span className="text-flicks-primary">textilevikhyat@gmail.com</span></p>
          
          <h2 className="text-lg font-semibold text-white mt-4">7. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
