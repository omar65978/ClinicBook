import { createContext, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken } from '../api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }
    api
      .me()
      .then((data) => setUser(data.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (payload) => {
    const data = await api.login(payload)
    setToken(data.token)
    setUser(data.user)
  }

  const register = async (payload) => {
    const data = await api.register(payload)
    setToken(data.token)
    setUser(data.user)
  }

  const logout = async () => {
    try {
      await api.logout()
    } catch {
      // token may already be invalid — clear it anyway
    }
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
