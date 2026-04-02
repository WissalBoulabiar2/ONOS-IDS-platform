"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  clearAuthSession,
  hasAuthSession,
  persistAuthSession,
  sdnApi,
  type AuthUser,
} from "@/services/api"

interface LoginParams {
  identifier: string
  password: string
  rememberMe?: boolean
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (params: LoginParams) => Promise<AuthUser>
  logout: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshProfile = useCallback(async () => {
    try {
      const response = await sdnApi.getCurrentUser()
      setUser(response.user)
    } catch {
      clearAuthSession()
      setUser(null)
    }
  }, [])

  useEffect(() => {
    if (!hasAuthSession()) {
      setIsLoading(false)
      return
    }

    refreshProfile().finally(() => {
      setIsLoading(false)
    })
  }, [refreshProfile])

  const login = useCallback(async ({ identifier, password, rememberMe = false }: LoginParams) => {
    const response = await sdnApi.login(identifier, password)
    persistAuthSession(response.token, response.user.role, rememberMe)
    setUser(response.user)
    return response.user
  }, [])

  const logout = useCallback(() => {
    // Notify backend of logout
    fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).catch(() => {
      // Ignore errors, still logout locally
    })

    // Clear local session
    clearAuthSession()
    setUser(null)
    router.push("/login")
  }, [router])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      logout,
      refreshProfile,
    }),
    [user, isLoading, login, logout, refreshProfile]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
