import { useState } from 'react'
import { DELEGACIONES } from '@/lib/delegaciones'
import { useAuth } from '@/lib/AuthContext'

interface Props { onSuccess: () => void; delegacionFija?: string }

export default function FormAlcoholimetro({ onSuccess, delegacionFija }: Props) {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    delegacion: delegacionFija || '',
    nroSerie: '',
    estado: 'Funciona',
    fechaVencimiento: '',
    observaciones: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tipo: 'alcoholimetro', ...form }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setForm({ delegacion: delegacionFija || '', nroSerie: '', estado: 'Funciona', fechaVencimiento: '', observaciones: '' })
      onSuccess()
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!delegacionFija && (
        <div>
          <label className="form-label">Delegación *</label>
          <select value={form.delegacion} onChange={e => set('delegacion', e.target.value)} required className="form-select">
            <option value="">Seleccionar delegación...</option>
            {DELEGACIONES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label">Número de serie *</label>
          <input value={form.nroSerie} onChange={e => set('nroSerie', e.target.value)} required placeholder="SN-XXXXXXXX" className="form-input" />
        </div>
        <div>
          <label className="form-label">Estado actual *</label>
          <select value={form.estado} onChange={e => set('estado', e.target.value)} className="form-select">
            <option>Funciona</option>
            <option>A reparar</option>
            <option>A calibrar</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="form-label">Fecha de vencimiento *</label>
          <input type="date" value={form.fechaVencimiento} onChange={e => set('fechaVencimiento', e.target.value)} required className="form-input" />
        </div>
      </div>
      <div>
        <label className="form-label">Observaciones</label>
        <textarea value={form.observaciones} onChange={e => set('observaciones', e.target.value)} rows={3} placeholder="Información adicional..." className="form-input resize-none" />
      </div>
      {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Guardando...' : 'Guardar Alcoholímetro'}</button>
    </form>
  )
}
