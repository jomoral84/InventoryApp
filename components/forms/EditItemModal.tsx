import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { DELEGACIONES } from '@/lib/delegaciones'

interface Props {
  item: any
  onClose: () => void
  onSaved: () => void
  isAdmin?: boolean
}

export default function EditItemModal({ item, onClose, onSaved, isAdmin }: Props) {
  const { token } = useAuth()
  const [form, setForm] = useState<any>({})
  const [foto, setFoto] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Inicializar el formulario con los valores actuales del item
  useEffect(() => {
    setForm({ ...item })
    setFoto(item.fotoUrl || '')
  }, [item])

  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }))

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setFoto(result)
      set('fotoUrl', result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`/api/items/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, fotoUrl: foto || form.fotoUrl }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Error al guardar')
      }
      onSaved()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,30,80,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col border border-blue-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-lg">
              {{ movil: '🚗', alcoholimetro: '🔬', pda_celular: '📱', informatica: '💻' }[item.tipo as string]}
            </div>
            <div>
              <h2 className="font-bold text-blue-900 text-base">Editar elemento</h2>
              <p className="text-blue-400 text-xs">{item.delegacion} · Cargado por {item.username}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-blue-300 hover:text-blue-600 text-xl font-light transition-colors">✕</button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-6 py-5 space-y-4">

          {/* Delegación — solo admin puede cambiarla */}
          {isAdmin && (
            <div>
              <label className="form-label">Delegación *</label>
              <select value={form.delegacion || ''} onChange={e => set('delegacion', e.target.value)} required className="form-select">
                {DELEGACIONES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}

          {/* ── MÓVIL ── */}
          {item.tipo === 'movil' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Dominio *</label>
                  <input value={form.dominio || ''} onChange={e => set('dominio', e.target.value)} required className="form-input" placeholder="AB 123 CD" />
                </div>
                <div>
                  <label className="form-label">Marca *</label>
                  <input value={form.marca || ''} onChange={e => set('marca', e.target.value)} required className="form-input" placeholder="Ford, Toyota..." />
                </div>
                <div>
                  <label className="form-label">Modelo *</label>
                  <input value={form.modelo || ''} onChange={e => set('modelo', e.target.value)} required className="form-input" placeholder="Ranger, Hilux..." />
                </div>
                <div>
                  <label className="form-label">Año *</label>
                  <input value={form.anio || ''} onChange={e => set('anio', e.target.value)} required className="form-input" placeholder="2022" />
                </div>
                <div>
                  <label className="form-label">Kilómetros *</label>
                  <input value={form.kilometros || ''} onChange={e => set('kilometros', e.target.value)} required className="form-input" placeholder="50000" />
                </div>
                <div>
                  <label className="form-label">Estado *</label>
                  <select value={form.estado || 'Operativo'} onChange={e => set('estado', e.target.value)} className="form-select">
                    <option>Operativo</option>
                    <option>No Operativo</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Matafuegos *</label>
                  <select value={form.matafuegos || 'Si'} onChange={e => set('matafuegos', e.target.value)} className="form-select">
                    <option>Si</option>
                    <option>No</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">RTO *</label>
                  <select value={form.rto || 'Si'} onChange={e => set('rto', e.target.value)} className="form-select">
                    <option>Si</option>
                    <option>No</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Observaciones</label>
                <textarea value={form.observaciones || ''} onChange={e => set('observaciones', e.target.value)} rows={3} className="form-input resize-none" placeholder="Información adicional..." />
              </div>
              <div>
                <label className="form-label">Foto del vehículo</label>
                <input type="file" accept="image/*" onChange={handlePhoto} className="block w-full text-sm text-blue-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer" />
                {(foto || form.fotoUrl) && (
                  <img src={foto || form.fotoUrl} alt="Preview" className="mt-3 h-32 rounded-xl border-2 border-blue-200 object-cover" />
                )}
              </div>
            </>
          )}

          {/* ── ALCOHOLÍMETRO ── */}
          {item.tipo === 'alcoholimetro' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Número de serie *</label>
                  <input value={form.nroSerie || ''} onChange={e => set('nroSerie', e.target.value)} required className="form-input" placeholder="SN-XXXXXXXX" />
                </div>
                <div>
                  <label className="form-label">Estado *</label>
                  <select value={form.estado || 'Funciona'} onChange={e => set('estado', e.target.value)} className="form-select">
                    <option>Funciona</option>
                    <option>A reparar</option>
                    <option>A calibrar</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="form-label">Fecha de vencimiento *</label>
                  <input type="date" value={form.fechaVencimiento || ''} onChange={e => set('fechaVencimiento', e.target.value)} required className="form-input" />
                </div>
              </div>
              <div>
                <label className="form-label">Observaciones</label>
                <textarea value={form.observaciones || ''} onChange={e => set('observaciones', e.target.value)} rows={3} className="form-input resize-none" placeholder="Información adicional..." />
              </div>
            </>
          )}

          {/* ── PDA/CELULAR ── */}
          {item.tipo === 'pda_celular' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Estado *</label>
                  <select value={form.estado || 'Funciona'} onChange={e => set('estado', e.target.value)} className="form-select">
                    <option>Funciona</option>
                    <option>Trizada</option>
                    <option>No funciona</option>
                    <option>Sin chip</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Marca *</label>
                  <input value={form.marca || ''} onChange={e => set('marca', e.target.value)} required className="form-input" placeholder="Samsung, Motorola..." />
                </div>
                <div>
                  <label className="form-label">Modelo *</label>
                  <input value={form.modelo || ''} onChange={e => set('modelo', e.target.value)} required className="form-input" placeholder="Galaxy A54..." />
                </div>
                <div>
                  <label className="form-label">N° de sistemas</label>
                  <input value={form.nroSistemas || ''} onChange={e => set('nroSistemas', e.target.value)} className="form-input" placeholder="Nro. inventario" />
                </div>
                <div>
                  <label className="form-label">N° de línea</label>
                  <input value={form.nroLinea || ''} onChange={e => set('nroLinea', e.target.value)} className="form-input" placeholder="011 XXXX-XXXX" />
                </div>
                <div>
                  <label className="form-label">Empresa *</label>
                  <select value={form.empresa || 'Personal'} onChange={e => set('empresa', e.target.value)} className="form-select">
                    <option>Personal</option>
                    <option>Movistar</option>
                    <option>Claro</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="form-label">Asignada a</label>
                  <input value={form.asignadaA || ''} onChange={e => set('asignadaA', e.target.value)} className="form-input" placeholder="Nombre del agente" />
                </div>
              </div>
              <div>
                <label className="form-label">Observaciones</label>
                <textarea value={form.observaciones || ''} onChange={e => set('observaciones', e.target.value)} rows={3} className="form-input resize-none" placeholder="Información adicional..." />
              </div>
            </>
          )}

          {/* ── INFORMÁTICA ── */}
          {item.tipo === 'informatica' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Dispositivo *</label>
                  <select value={form.dispositivo || 'PC'} onChange={e => set('dispositivo', e.target.value)} className="form-select">
                    <option>PC</option>
                    <option>Monitor</option>
                    <option>Impresora</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Estado *</label>
                  <select value={form.estado || 'Funciona'} onChange={e => set('estado', e.target.value)} className="form-select">
                    <option>Funciona</option>
                    <option>No funciona</option>
                    <option>Requiere Mantenimiento</option>
                    <option>Falta Toner</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Marca *</label>
                  <input value={form.marca || ''} onChange={e => set('marca', e.target.value)} required className="form-input" placeholder="HP, Dell, Lenovo..." />
                </div>
                <div>
                  <label className="form-label">Modelo *</label>
                  <input value={form.modelo || ''} onChange={e => set('modelo', e.target.value)} required className="form-input" placeholder="Modelo del equipo" />
                </div>
                <div className="col-span-2">
                  <label className="form-label">N° de sistemas</label>
                  <input value={form.nroSistemas || ''} onChange={e => set('nroSistemas', e.target.value)} className="form-input" placeholder="Número de inventario" />
                </div>
              </div>
              <div>
                <label className="form-label">Observaciones</label>
                <textarea value={form.observaciones || ''} onChange={e => set('observaciones', e.target.value)} rows={3} className="form-input resize-none" placeholder="Información adicional..." />
              </div>
            </>
          )}

          {error && (
            <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg border border-red-100">{error}</p>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-blue-100 flex gap-3 flex-shrink-0">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border-2 border-blue-100 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSubmit as any}
            disabled={loading}
            className="flex-1 btn-primary py-2.5"
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
