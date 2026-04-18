import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'

interface AuthUser {
  id: string
  username: string
  role: 'admin' | 'user'
  delegacion: string
  nombre?: string
  apellido?: string
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]   = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('auth')
    if (saved) {
      try {
        const { user, token } = JSON.parse(saved)
        setUser(user)
        setToken(token)
      } catch {}
    }
    setLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Error al iniciar sesión')
    }
    const data = await res.json()
    setUser(data.user)
    setToken(data.token)
    localStorage.setItem('auth', JSON.stringify({ user: data.user, token: data.token }))
    if (data.user.role === 'admin') {
      router.push('/dashboard')
    } else {
      router.push('/inventario/dashboard')
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth')
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
