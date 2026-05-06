import { createContext, useContext, useState, type ReactNode } from "react"

import { configureAuth } from "@/shared/api/httpClient"

import { authApi } from "../api/authApi"
import { tokenStore } from "./tokenStore"
import type { User } from "./types"

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const useAuthContext = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider")
  return ctx
}

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)

  const setAuth = (u: User, token: string) => {
    tokenStore.set(token)
    setUser(u)
  }

  const clearAuth = () => {
    tokenStore.set(null)
    setUser(null)
  }

  configureAuth({
    getToken: tokenStore.get,
    refresh: () =>
      authApi.refresh().then((r) => {
        tokenStore.set(r.accessToken)
        return r.accessToken
      }),
    clearAuth,
  })

  return <AuthContext.Provider value={{ user, isAuthenticated: user !== null, setAuth, clearAuth }}>{children}</AuthContext.Provider>
}

export default AuthProvider
