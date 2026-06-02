import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FiMail, FiLock, FiLogIn, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation
    if (!email.trim()) {
      setError('Email is required')
      setLoading(false)
      return
    }
    if (!password) {
      setError('Password is required')
      setLoading(false)
      return
    }

    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      if (err.message === 'Invalid login credentials') {
        setError('Invalid email or password')
      } else if (err.message.includes('Email not confirmed')) {
        setError('Please verify your email before logging in')
      } else {
        setError('Something went wrong. Please try again.')
      }
    }
    setLoading(false)
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    try {
      await signIn('demo@flicks24.com', 'demo123456')
      navigate('/')
    } catch (err) {
      setError('Demo login failed. Please sign up first.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-flicks-primary/20 via-flicks-dark to-flicks-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-flicks-primary to-flicks-secondary rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <span className="text-5xl">🎬</span>
          </div>
          <h1 className="text-4xl font-bold gradient-text">FLICKS 24</h1>
          <p className="text-gray-400 mt-2">Connect. Create. Care.</p>
        </div>

        {/* Login Card */}
        <div className="glass rounded-2xl p-8 animate-slide-up">
          <h2 className="text-2xl font-semibold mb-6">Welcome Back</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-xl flex items-center gap-2 text-red-400 text-sm animate-fade-in">
              <FiAlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/10 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-flicks-primary transition-all"
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 rounded-xl pl-10 pr-12 py-3 outline-none focus:ring-2 focus:ring-flicks-primary transition-all"
                  placeholder="Enter your password"
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
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-flicks-secondary hover:underline">
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-bg py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <FiLogIn className="w-5 h-5" />
                  Login
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-flicks-surface text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full bg-white/10 py-3 rounded-xl font-semibold hover:bg-white/20 transition disabled:opacity-50"
          >
            Demo Account
          </button>

          <p className="text-center text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-flicks-secondary hover:underline font-semibold">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
