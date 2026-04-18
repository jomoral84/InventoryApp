import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/lib/AuthContext'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) router.replace('/login')
      else if (user.role === 'admin') router.replace('/dashboard')
      else router.replace('/inventario/dashboard')
    }
  }, [user, loading])

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
