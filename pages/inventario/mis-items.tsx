import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '@/components/layout/Layout'
import EditItemModal from '@/components/forms/EditItemModal'
import { useAuth } from '@/lib/AuthContext'

const TIPOS: Record<string, string> = {
  movil: '🚗 Móvil',
  alcoholimetro: '🔬 Alcoholímetro',
  pda_celular: '📱 PDA/Celular',
  informatica: '💻 Informática',
}

function estadoBadge(estado: string) {
  const map: Record<string, string> = {
    'Operativo': 'bg-green-100 text-green-700',
    'Funciona': 'bg-green-100 text-green-700',
    'No Operativo': 'bg-red-100 text-red-700',
    'No funciona': 'bg-red-100 text-red-700',
    'A reparar': 'bg-orange-100 text-orange-700',
    'A calibrar': 'bg-yellow-100 text-yellow-700',
    'Trizada': 'bg-orange-100 text-orange-700',
    'Sin chip': 'bg-gray-100 text-gray-600',
    'Requiere Mantenimiento': 'bg-yellow-100 text-yellow-700',
    'Falta Toner': 'bg-purple-100 text-purple-700',
  }
  return map[estado] || 'bg-blue-100 text-blue-700'
}

export default function MisItemsPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [fetching, setFetching] = useState(true)
  const [imgModal, setImgModal] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<any | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  const fetchItems = useCallback(async () => {
    if (!token) return
    setFetching(true)
    const res = await fetch('/api/items', { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setItems(Array.isArray(data) ? data : [])
    setFetching(false)
  }, [token])

  useEffect(() => {
    if (!loading && !user) { router.replace('/login'); return }
    if (!loading && user?.role === 'admin') { router.replace('/dashboard'); return }
    fetchItems()
  }, [user, loading])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este elemento?')) return
    await fetch(`/api/items?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    fetchItems()
  }

  const handleSaved = () => {
    fetchItems()
    setSuccessMsg('¡Elemento actualizado correctamente!')
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  if (loading || !user) return null

  return (
    <>
      <Head><title>Mis Elementos — Inventario</title></Head>
      <Layout title="Mis Elementos">
        <div className="max-w-4xl mx-auto">
          {successMsg && (
            <div className="mb-5 bg-green-50 border border-green-200 text-green-700 px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2 fade-in">
              <span>✓</span> {successMsg}
            </div>
          )}

          <div className="flex items-center justify-between mb-5">
            <p className="text-blue-500 text-sm">
              {items.length} elemento{items.length !== 1 ? 's' : ''} registrado{items.length !== 1 ? 's' : ''}
            </p>
          </div>

          {fetching ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-blue-100">
              <div className="text-5xl mb-4">📋</div>
              <p className="text-blue-400 font-medium">Aún no registraste ningún elemento</p>
              <button onClick={() => router.push('/inventario')} className="mt-4 btn-primary text-sm px-6 py-2 inline-block">
                Cargar primer elemento
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="bg-white rounded-xl border border-blue-100 p-5 flex gap-4 items-start fade-in hover:border-blue-200 transition-colors">
                  {item.fotoUrl && (
                    <img
                      src={item.fotoUrl}
                      alt="foto"
                      className="w-20 h-16 rounded-lg object-cover flex-shrink-0 cursor-pointer border border-blue-100"
                      onClick={() => setImgModal(item.fotoUrl)}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-sm font-bold text-blue-900">{TIPOS[item.tipo]}</span>
                      {item.estado && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${estadoBadge(item.estado)}`}>{item.estado}</span>
                      )}
                      <span className="text-xs text-blue-300 ml-auto">{new Date(item.createdAt).toLocaleDateString('es-AR')}</span>
                    </div>
                    <ItemDetails item={item} />
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => setEditItem(item)}
                      title="Editar"
                      className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-500 hover:text-blue-700 flex items-center justify-center transition-colors text-sm"
                    >✎</button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      title="Eliminar"
                      className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center transition-colors text-sm"
                    >✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {imgModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setImgModal(null)}>
            <img src={imgModal} className="max-w-[90vw] max-h-[90vh] rounded-2xl" />
          </div>
        )}

        {editItem && (
          <EditItemModal
            item={editItem}
            onClose={() => setEditItem(null)}
            onSaved={handleSaved}
            isAdmin={false}
          />
        )}
      </Layout>
    </>
  )
}

function ItemDetails({ item }: { item: any }) {
  const fields: [string, string][] = []
  if (item.tipo === 'movil') {
    fields.push(['Dominio', item.dominio], ['Marca/Modelo', `${item.marca} ${item.modelo}`], ['Año', item.anio], ['Km', item.kilometros], ['Matafuegos', item.matafuegos], ['RTO', item.rto])
  } else if (item.tipo === 'alcoholimetro') {
    fields.push(['N° Serie', item.nroSerie], ['Vencimiento', item.fechaVencimiento])
  } else if (item.tipo === 'pda_celular') {
    fields.push(['Marca/Modelo', `${item.marca} ${item.modelo}`], ['N° Línea', item.nroLinea], ['Empresa', item.empresa], ['Asignada a', item.asignadaA])
  } else if (item.tipo === 'informatica') {
    fields.push(['Dispositivo', item.dispositivo], ['Marca/Modelo', `${item.marca} ${item.modelo}`], ['N° Sistemas', item.nroSistemas])
  }
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {fields.filter(([, v]) => v && v.trim()).map(([k, v]) => (
        <span key={k} className="text-xs text-blue-600"><span className="text-blue-400">{k}:</span> {v}</span>
      ))}
      {item.observaciones && <span className="text-xs text-blue-400 w-full truncate">Obs: {item.observaciones}</span>}
    </div>
  )
}
