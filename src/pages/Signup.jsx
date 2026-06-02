import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FiMail, FiLock, FiUser, FiUserPlus, FiAlertCircle, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi'

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors = {}

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscore'
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      await signUp(formData.email, formData.password, formData.username, formData.fullName)
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err) {
      if (err.message.includes('User already registered')) {
        setErrors({ email: 'Email already registered. Please login instead.' })
      } else if (err.message.includes('Username already taken')) {
        setErrors({ username: 'Username already taken' })
      } else {
        setErrors({ general: err.message || 'Signup failed. Please try again.' })
      }
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-flicks-primary/20 via-flicks-dark to-flicks-secondary/20 flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 text-center max-w-md w-full animate-fade-in">
          <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
            <FiCheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Account Created! 🎉</h2>
          <p className="text-gray-400 mb-4">
            Your account has been successfully created. Please check your email to verify your account.
          </p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
          <div className="w-full bg-white/10 rounded-full h-1 mt-4 overflow-hidden">
            <div className="h-full bg-flicks-primary rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-flicks-primary/20 via-flicks-dark to-flicks-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-flicks-primary to-flicks-secondary rounded-2xl flex items-center justify-center mb-3 shadow-lg">
            <span className="text-4xl">🎬</span>
          </div>
          <h1 className="text-3xl font-bold gradient-text">FLICKS 24</h1>
          <p className="text-gray-400 text-sm mt-1">Create your account</p>
        </div>

        {/* Signup Card */}
        <div className="glass rounded-2xl p-6 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-3">
            {errors.general && (
              <div className="p-2 bg-red-500/20 border border-red-500 rounded-xl flex items-center gap-2 text-red-400 text-xs">
                <FiAlertCircle className="w-4 h-4" />
                <span>{errors.general}</span>
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-400 mb-1">Username</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full bg-white/10 rounded-xl pl-10 pr-4 py-2 outline-none focus:ring-2 transition-all text-sm ${errors.username ? 'focus:ring-red-500 border border-red-500' : 'focus:ring-flicks-primary'}`}
                  placeholder="e.g., john_doe"
                  disabled={loading}
                />
              </div>
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username}</p>}
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full bg-white/10 rounded-xl pl-10 pr-4 py-2 outline-none focus:ring-2 transition-all text-sm ${errors.fullName ? 'focus:ring-red-500 border border-red-500' : 'focus:ring-flicks-primary'}`}
                  placeholder="John Doe"
                  disabled={loading}
                />
              </div>
              {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-white/10 rounded-xl pl-10 pr-4 py-2 outline-none focus:ring-2 transition-all text-sm ${errors.email ? 'focus:ring-red-500 border border-red-500' : 'focus:ring-flicks-primary'}`}
                  placeholder="john@example.com"
                  disabled={loading}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full bg-white/10 rounded-xl pl-10 pr-12 py-2 outline-none focus:ring-2 transition-all text-sm ${errors.password ? 'focus:ring-red-500 border border-red-500' : 'focus:ring-flicks-primary'}`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full bg-white/10 rounded-xl pl-10 pr-12 py-2 outline-none focus:ring-2 transition-all text-sm ${errors.confirmPassword ? 'focus:ring-red-500 border border-red-500' : 'focus:ring-flicks-primary'}`}
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                >
                  {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-bg py-2 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50 text-sm mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <FiUserPlus className="w-4 h-4" />
                  Sign Up
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 text-xs mt-4">
            By signing up, you agree to our{' '}
            <Link to="/terms" className="text-flicks-secondary hover:underline">Terms</Link> and{' '}
            <Link to="/privacy" className="text-flicks-secondary hover:underline">Privacy Policy</Link>
          </p>

          <p className="text-center text-gray-400 text-sm mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-flicks-secondary hover:underline font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
