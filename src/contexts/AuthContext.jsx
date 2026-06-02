import React, { createContext, useState, useContext, useEffect } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }
    
    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null)
        setLoading(false)
      }
    )

    return () => {
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  const signup = async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { 
        data: { 
          username, 
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}` 
        } 
      }
    })
    if (error) throw error
    return data
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = { user, loading, login, signup, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
