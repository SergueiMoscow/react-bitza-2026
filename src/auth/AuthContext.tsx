import { createContext, useContext, useState, type ReactNode } from 'react'
import { apiClient, tokenStorage } from '../api/client'

type AuthContextValue = {
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  loginWithToken: (token: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!tokenStorage.getAccess())

  const login = async (username: string, password: string) => {
    const { data } = await apiClient.post('/api/login/', { username, password })
    tokenStorage.setTokens(data.access, data.refresh)
    setIsAuthenticated(true)
  }

  // Вход по постоянной ссылке ?token=... (для клиента без пароля) — тот же токен,
  // что и раньше, привязка к браузеру на бэкенде (см. Tokens.check_user_agent).
  const loginWithToken = async (token: string) => {
    try {
      const { data } = await apiClient.get('/api/token-login/', { params: { token } })
      tokenStorage.setTokens(data.access, data.refresh)
      setIsAuthenticated(true)
      return true
    } catch {
      return false
    }
  }

  const logout = () => {
    tokenStorage.clear()
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
