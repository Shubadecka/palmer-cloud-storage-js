import { createContext, useState, useEffect } from 'react'
import { login as apiLogin, register as apiRegister, logout as apiLogout, getCurrentUser } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is already logged in on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const data = await getCurrentUser()
        setUser(data.user)
      } catch {
        // Not logged in or session expired
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    const data = await apiLogin(email, password)
    setUser(data.user)
    return data
  }

  const register = async (email, username, password) => {
    const data = await apiRegister(email, username, password)
    setUser(data.user)
    return data
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch {
      // Ignore logout errors
    }
    setUser(null)
  }

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
