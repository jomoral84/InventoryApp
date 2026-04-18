import { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useAuth } from '@/lib/AuthContext'
import { useTheme } from '@/lib/ThemeContext'

interface LayoutProps { children: ReactNode; title?: string }

const adminNav = [
  { href: '/dashboard',           label: 'Dashboard',  icon: '▦' },
  { href: '/dashboard/usuarios',  label: 'Usuarios',     icon: '◉' },
  { href: '/dashboard/email',      label: 'Notificaciones', icon: '✉' },
  { href: '/seguimiento',            label: 'Seguimiento',    icon: '📋' },
]
const userNav = [
  { href: '/inventario/dashboard', label: 'Mi Delegación',  icon: '▦' },
  { href: '/inventario',           label: 'Cargar Elemento', icon: '＋' },
  { href: '/inventario/mis-items', label: 'Mis Elementos',   icon: '☰' },
  { href: '/seguimiento',            label: 'Seguimiento',    icon: '📋' },
]

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

export default function Layout({ children, title }: LayoutProps) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  if (!user) return null
  const nav = user.role === 'admin' ? adminNav : userNav

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-main)' }}>
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col" style={{ background: 'linear-gradient(180deg, var(--bg-sidebar-from) 0%, var(--bg-sidebar-to) 100%)' }}>
        {/* Logo CNRT */}
        <div className="px-5 py-4 border-b border-blue-700/50">
          <Image src="/logoCnrtBlanco.png" alt="CNRT" width={160} height={40} style={{ objectFit: 'contain' }} priority />
        </div>

        {/* User info */}
        <div className="px-5 py-3 border-b border-blue-700/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {(user.nombre || user.username)[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user.nombre && user.apellido
                  ? `${user.nombre} ${user.apellido}`
                  : user.nombre || user.username}
              </p>
              <p className="text-blue-400 text-xs truncate font-mono">{user.username}</p>
              <p className="text-blue-300 text-xs">{user.role === 'admin' ? 'Administrador' : 'Usuario'}</p>
            </div>
          </div>
          {user.role === 'user' && (
            <p className="mt-1.5 text-blue-400 text-xs truncate">📍 {user.delegacion}</p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 sidebar-nav">
          {nav.map(item => {
            const active = router.pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                    : 'text-blue-200 hover:bg-blue-700/40 hover:text-white'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-blue-700/30">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-blue-300 hover:bg-red-900/30 hover:text-red-300 transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="border-b border-blue-100 px-8 py-4 flex items-center justify-between flex-shrink-0" style={{ background: 'var(--topbar-bg)' }}>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{title || 'Sistema de Inventario'}</h1>
          <div className="flex items-center gap-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all border"
              style={{
                background: theme === 'dark' ? '#1e3a8a' : '#eff6ff',
                borderColor: theme === 'dark' ? '#2563eb' : '#dbeafe',
                color: theme === 'dark' ? '#93c5fd' : '#2563eb',
              }}
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
              En línea
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
