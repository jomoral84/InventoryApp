import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '@/components/layout/Layout'
import { useAuth } from '@/lib/AuthContext'

const ACCION_META: Record<string, { label: string; color: string; icon: string }> = {
  alta:        { label: 'Alta',       color: 'bg-green-100 text-green-700',  icon: '✚' },
  edicion:     { label: 'Edición',    color: 'bg-blue-100 text-blue-700',    icon: '✎' },
  eliminacion: { label: 'Eliminación',color: 'bg-red-100 text-red-700',      icon: '✕' },
}

const TIPO_LABEL: Record<string, string> = {
  movil: '🚗 Móvil', alcoholimetro: '🔬 Alcoholímetro',
  pda_celular: '📱 PDA/Celular', informatica: '💻 Informática',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function SeguimientoPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  const [logs, setLogs]           = useState<any[]>([])
  const [fetching, setFetching]   = useState(true)
  const [filterTipo, setFilterTipo]     = useState('')
  const [filterAccion, setFilterAccion] = useState('')
  const [filterDeleg, setFilterDeleg]   = useState('')
  const [search, setSearch]             = useState('')

  const fetchLogs = useCallback(async () => {
    if (!token) return
    setFetching(true)
    const params = new URLSearchParams()
    if (filterTipo)  params.set('tipo',  filterTipo)
    if (filterAccion) params.set('accion', filterAccion)
    if (filterDeleg && user?.role === 'admin') params.set('delegacion', filterDeleg)
    const res = await fetch(`/api/audit?${params}`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setLogs(Array.isArray(data) ? data : [])
    setFetching(false)
  }, [token, filterTipo, filterAccion, filterDeleg])

  useEffect(() => {
    if (!loading && !user) { router.replace('/login'); return }
    fetchLogs()
  }, [user, loading, filterTipo, filterAccion, filterDeleg])

  if (loading || !user) return null

  const delegaciones = [...new Set(logs.map(l => l.delegacion))].sort()

  const filtered = logs.filter(l =>
    !search || l.descripcion.toLowerCase().includes(search.toLowerCase()) ||
    l.username.toLowerCase().includes(search.toLowerCase()) ||
    (l.itemRef || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Head><title>Seguimiento — Inventario CNRT</title></Head>
      <Layout title="Historial de Seguimiento">
        <div className="w-full">

          {/* Filtros */}
          <div className="bg-white rounded-2xl border border-blue-100 p-4 mb-5 flex flex-wrap gap-3 items-end shadow-sm">
            <div className="flex-1 min-w-[180px]">
              <label className="form-label text-xs">Buscar</label>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por descripción, usuario o referencia..."
                className="form-input text-xs py-2" />
            </div>
            <div>
              <label className="form-label text-xs">Categoría</label>
              <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} className="form-select text-xs py-2">
                <option value="">Todas</option>
                <option value="movil">Móviles</option>
                <option value="alcoholimetro">Alcoholímetros</option>
                <option value="pda_celular">PDA/Celulares</option>
                <option value="informatica">Informática</option>
              </select>
            </div>
            <div>
              <label className="form-label text-xs">Acción</label>
              <select value={filterAccion} onChange={e => setFilterAccion(e.target.value)} className="form-select text-xs py-2">
                <option value="">Todas</option>
                <option value="alta">Alta</option>
                <option value="edicion">Edición</option>
                <option value="eliminacion">Eliminación</option>
              </select>
            </div>
            {user.role === 'admin' && (
              <div>
                <label className="form-label text-xs">Delegación</label>
                <select value={filterDeleg} onChange={e => setFilterDeleg(e.target.value)} className="form-select text-xs py-2">
                  <option value="">Todas</option>
                  {delegaciones.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}
            <button onClick={fetchLogs} className="btn-primary text-xs px-4 py-2">Actualizar</button>
          </div>

          {/* Contador */}
          <div className="flex items-center gap-3 mb-4">
            <p className="text-sm text-blue-500">
              {filtered.length} evento{filtered.length !== 1 ? 's' : ''}
              {search ? ` para "${search}"` : ''}
            </p>
          </div>

          {/* Timeline */}
          {fetching ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-blue-100">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-blue-400 font-medium">Sin eventos registrados</p>
              <p className="text-blue-300 text-sm mt-1">Los eventos se registran automáticamente al dar de alta, editar o eliminar elementos.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-blue-50/70 border-b border-blue-100">
                  <tr>
                    {['Fecha y hora', 'Acción', user.role === 'admin' ? 'Delegación' : null, 'Categoría', 'Descripción', 'Usuario']
                      .filter(Boolean).map(h => (
                      <th key={h!} className="text-left text-xs font-semibold text-blue-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                  {filtered.map(log => {
                    const meta = ACCION_META[log.accion] || { label: log.accion, color: 'bg-gray-100 text-gray-600', icon: '•' }
                    return (
                      <tr key={log.id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="px-4 py-3 text-xs text-blue-400 whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold ${meta.color}`}>
                            <span>{meta.icon}</span> {meta.label}
                          </span>
                        </td>
                        {user.role === 'admin' && (
                          <td className="px-4 py-3 text-xs font-semibold text-blue-700">{log.delegacion}</td>
                        )}
                        <td className="px-4 py-3 text-xs text-blue-500">
                          {log.itemTipo ? TIPO_LABEL[log.itemTipo] || log.itemTipo : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-blue-800 max-w-sm">{log.descripcion}</td>
                        <td className="px-4 py-3 text-xs font-mono text-blue-500">{log.username}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Layout>
    </>
  )
}
