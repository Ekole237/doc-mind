import type { ReactNode } from "react"
import { createContext, useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { API_BASE_URL, getSession, login as apiLogin, logoutSession } from "../api/client"
import type { JwtUser } from "@/types"
import { getUser, removeUser, saveUser } from "../utils/storage"

interface AuthContextType {
  user: JwtUser | null
  isLoading: boolean
  loginWithPassword: (email: string, password: string, _hp?: string) => Promise<void>
  loginWithZoho: () => void
  logout: () => void
  handleOAuthCallback: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<JwtUser | null>(() => getUser())
  const [isLoading] = useState(false)
  const navigate = useNavigate()

  // Sécurité: la session est portée par cookie HttpOnly, on synchronise l'état via /auth/session.
  useEffect(() => {
    void getSession()
      .then((sessionUser) => {
        saveUser(sessionUser)
        setUser(sessionUser)
      })
      .catch(() => {
        removeUser()
        setUser(null)
      })

    const handleExpired = () => {
      removeUser()
      setUser(null)
      navigate("/login?error=session_expired", { replace: true })
    }
    
    window.addEventListener('auth:expired', handleExpired)
    return () => window.removeEventListener('auth:expired', handleExpired)
  }, [navigate])

  const loginWithPassword = useCallback(async (email: string, password: string, _hp = "") => {
    const sessionUser = await apiLogin(email, password, _hp)
    saveUser(sessionUser)
    setUser(sessionUser)
    navigate(sessionUser.role === "admin" ? "/admin/dashboard" : "/chat", { replace: true })
  }, [navigate])

  const loginWithZoho = useCallback(() => {
    window.location.href = `${API_BASE_URL}/auth/zoho`
  }, [])

  const handleOAuthCallback = useCallback(async () => {
    try {
      const sessionUser = await getSession()
      saveUser(sessionUser)
      setUser(sessionUser)
      navigate(sessionUser.role === "admin" ? "/admin/dashboard" : "/chat", { replace: true })
    } catch {
      removeUser()
      navigate("/login?error=server", { replace: true })
    }
  }, [navigate])

  const logout = useCallback(() => {
    void logoutSession().finally(() => {
      removeUser()
      setUser(null)
      navigate("/login?error=logged_out", { replace: true })
    })
  }, [navigate])

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithPassword, loginWithZoho, handleOAuthCallback, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
