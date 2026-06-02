// src/pages/TermsConditions.jsx
import React from 'react'
import { Helmet } from 'react-helmet-async'

const TermsConditions = () => {
  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <Helmet>
        <title>Terms & Conditions - FLICKS 24</title>
      </Helmet>
      <div className="glass rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-4">Terms & Conditions</h1>
        <p className="text-gray-400 text-sm mb-4">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-4 text-sm text-gray-300">
          <p>By using FLICKS 24, you agree to these Terms & Conditions. If you do not agree, please do not use our services.</p>
          
          <h2 className="text-lg font-semibold text-white mt-4">1. Eligibility</h2>
          <p>You must be at least 13 years old to use FLICKS 24. By using our services, you represent that you meet this requirement.</p>
          
          <h2 className="text-lg font-semibold text-white mt-4">2. User Conduct</h2>
          <p>You agree not to:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Post illegal, harmful, or offensive content</li>
            <li>Harass, bully, or threaten other users</li>
            <li>Impersonate others or provide false information</li>
            <li>Use bots or automated tools</li>
            <li>Attempt to hack or disrupt the platform</li>
            <li>Share explicit or inappropriate content</li>
          </ul>
          
          <h2 className="text-lg font-semibold text-white mt-4">3. Content Ownership</h2>
          <p>You retain ownership of the content you post. By posting, you grant FLICKS 24 a license to display and distribute your content on our platform.</p>
          
          <h2 className="text-lg font-semibold text-white mt-4">4. Account Termination</h2>
          <p>We reserve the right to suspend or terminate accounts that violate these terms or engage in harmful behavior.</p>
          
          <h2 className="text-lg font-semibold text-white mt-4">5. Intellectual Property</h2>
          <p>The FLICKS 24 name, logo, and design are our intellectual property. You may not use them without permission.</p>
          
          <h2 className="text-lg font-semibold text-white mt-4">6. Disclaimer of Warranties</h2>
          <p>The platform is provided "as is" without warranties of any kind. We do not guarantee uninterrupted service.</p>
          
          <h2 className="text-lg font-semibold text-white mt-4">7. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law, FLICKS 24 shall not be liable for any indirect, incidental, or consequential damages.</p>
          
          <h2 className="text-lg font-semibold text-white mt-4">8. Contact Us</h2>
          <p>For questions about these Terms, contact: <span className="text-flicks-primary">textilevikhyat@gmail.com</span></p>
        </div>
      </div>
    </div>
  )
}

export default TermsConditions
