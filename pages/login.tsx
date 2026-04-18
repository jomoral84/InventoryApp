import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import { useAuth } from '@/lib/AuthContext'
import { useTheme } from '@/lib/ThemeContext'

function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

export default function LoginPage() {
  const { login, user, loading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user)
      router.push(user.role === 'admin' ? '/dashboard' : '/inventario/dashboard')
  }, [user, loading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try { await login(username, password) }
    catch (err: any) { setError(err.message) }
    finally { setSubmitting(false) }
  }

  const isDark = theme === 'dark'

  return (
    <>
      <Head><title>CNRT — Sistema de Inventario</title></Head>
      <div
        className="min-h-screen flex flex-col"
        style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)' : 'linear-gradient(135deg, #172554 0%, #1e40af 50%, #1d4ed8 100%)' }}
      >
        {/* Top bar with logo + theme toggle */}
        <div className="flex items-center justify-between px-8 py-4 border-b border-white/10">
          <Image src="/logoCnrtBlanco.png" alt="CNRT" width={180} height={44} style={{ objectFit: 'contain' }} priority />
          <button
            onClick={toggleTheme}
            title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/20 text-blue-200 hover:bg-white/10 transition-all"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

        {/* Main login area */}
        <div className="flex flex-1">
          {/* Left panel */}
          <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16">
            <div />
            <div>
              <h1
                className="text-5xl font-bold text-white leading-tight mb-6"
                style={{ fontFamily: 'IBM Plex Sans Condensed, sans-serif' }}
              >
                Control de<br />Activos<br />Institucionales
              </h1>
              <p className="text-blue-200 text-lg leading-relaxed max-w-sm">
                Gestión centralizada de móviles, alcoholímetros, dispositivos móviles e informática de todas las delegaciones.
              </p>
            </div>
            <div className="flex gap-8">
              {['Móviles', 'Alcoholímetros', 'PDA/Cel', 'Informática'].map(cat => (
                <div key={cat} className="text-center">
                  <div className="text-blue-300 text-xs font-medium tracking-wider uppercase">{cat}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div
            className="w-full lg:w-1/2 flex items-center justify-center p-8"
            style={{ background: isDark ? 'rgba(15,23,42,0.95)' : 'rgba(239,246,255,0.97)' }}
          >
            <div className="w-full max-w-md">
              <div className="mb-8">
                <h2
                  className="text-3xl font-bold mb-2"
                  style={{ color: isDark ? '#e2e8f0' : '#1e3a8a' }}
                >
                  Bienvenido
                </h2>
                <p style={{ color: isDark ? '#60a5fa' : '#93c5fd', fontSize: '0.875rem' }}>
                  Ingresá tus credenciales para continuar
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: isDark ? '#93c5fd' : '#1e40af' }}
                  >
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Nombre de usuario"
                    required
                    className="w-full px-4 py-3 rounded-xl text-sm transition-colors focus:outline-none"
                    style={{
                      border: `2px solid ${isDark ? '#1e3a8a' : '#dbeafe'}`,
                      background: isDark ? '#0f172a' : 'white',
                      color: isDark ? '#e2e8f0' : '#1e3a8a',
                    }}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: isDark ? '#93c5fd' : '#1e40af' }}
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 pr-11 rounded-xl text-sm transition-colors focus:outline-none"
                      style={{
                        border: `2px solid ${isDark ? '#1e3a8a' : '#dbeafe'}`,
                        background: isDark ? '#0f172a' : 'white',
                        color: isDark ? '#e2e8f0' : '#1e3a8a',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                      style={{ color: isDark ? '#60a5fa' : '#93c5fd' }}
                      tabIndex={-1}
                    >
                      <EyeIcon open={showPass} />
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-6 rounded-xl font-semibold text-white text-sm tracking-wide transition-all disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e40af)' }}
                >
                  {submitting ? 'Ingresando...' : 'Iniciar sesión'}
                </button>
              </form>

              <div
                className="mt-8 p-4 rounded-xl border"
                style={{
                  background: isDark ? '#0f172a' : '#eff6ff',
                  borderColor: isDark ? '#1e3a8a' : '#dbeafe',
                }}
              >
                <p
                  className="text-xs font-semibold mb-2 uppercase tracking-wider"
                  style={{ color: isDark ? '#60a5fa' : '#60a5fa' }}
                >
                  Credenciales de prueba
                </p>
                <div className="space-y-1 text-xs" style={{ color: isDark ? '#93c5fd' : '#1e40af' }}>
                  <p><span className="font-medium">Admin:</span> admin / admin123</p>
                  <p><span className="font-medium">Usuario:</span> usuario1 / user123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
