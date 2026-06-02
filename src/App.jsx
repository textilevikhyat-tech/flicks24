import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Auth Pages
import Login from './pages/Login'
import Signup from './pages/Signup'

// Main Pages
import Home from './pages/Home'
import Profile from './pages/Profile'
import Reels from './pages/Reels'
import Circles from './pages/Circles'
import Hooks from './pages/Hooks'
import Messages from './pages/Messages'
import Notifications from './pages/Notifications'
import Search from './pages/Search'

// Custom Features
import RandomCall from './pages/RandomCall'
import HelpDesk from './pages/HelpDesk'
import ChainPost from './pages/ChainPost'
import QuoteMaker from './pages/QuoteMaker'

// Legal Pages
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsConditions from './pages/TermsConditions'
import AboutUs from './pages/AboutUs'
import ContactUs from './pages/ContactUs'
import HelpSupport from './pages/HelpSupport'

// Admin
import AdminDashboard from './pages/AdminDashboard'

// Components
import BottomNav from './components/BottomNav'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function AppContent() {
  const { user, loading } = useAuth()
  const [showBottomNav, setShowBottomNav] = useState(true)

  if (loading) {
    return (
      <div className="min-h-screen bg-flicks-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-flicks-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading FLICKS 24...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen bg-flicks-dark pb-20">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile/:userId?" element={<Profile />} />
        <Route path="/reels" element={<Reels />} />
        <Route path="/circles" element={<Circles />} />
        <Route path="/hooks" element={<Hooks />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/search" element={<Search />} />
        <Route path="/random-call" element={<RandomCall />} />
        <Route path="/helpdesk" element={<HelpDesk />} />
        <Route path="/chain-post/:id?" element={<ChainPost />} />
        <Route path="/quote-maker" element={<QuoteMaker />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/help" element={<HelpSupport />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <BottomNav />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
