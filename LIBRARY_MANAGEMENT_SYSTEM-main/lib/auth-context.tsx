'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User } from './types'
import { getCurrentUser, setCurrentUser, authenticateUser, initializeStore } from './store'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializeStore()
    const savedUser = getCurrentUser()
    setUser(savedUser)
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    const authenticatedUser = authenticateUser(email, password)
    if (authenticatedUser) {
      setUser(authenticatedUser)
      setCurrentUser(authenticatedUser)
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
