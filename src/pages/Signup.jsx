import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { FiMail, FiLock, FiUser, FiUserPlus } from 'react-icons/fi'

const Signup = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signup(email, password, username)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Signup failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-flicks-primary/20 via-flicks-dark to-flicks-secondary/20 flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text">FLICKS 24</h1>
          <p className="text-gray-400 mt-2">Create your account</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center gap-3 glass rounded-lg p-3">
              <FiUser className="text-gray-400" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-transparent flex-1 outline-none text-white"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 glass rounded-lg p-3">
              <FiMail className="text-gray-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent flex-1 outline-none text-white"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 glass rounded-lg p-3">
              <FiLock className="text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent flex-1 outline-none text-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-flicks-primary to-flicks-secondary py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-50"
          >
            <FiUserPlus />
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-flicks-secondary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
