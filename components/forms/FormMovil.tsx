import { useState } from 'react'
import { DELEGACIONES } from '@/lib/delegaciones'
import { useAuth } from '@/lib/AuthContext'

interface Props {
  onSuccess: () => void
  delegacionFija?: string
}

export default function FormMovil({ onSuccess, delegacionFija }: Props) {
  const { token } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [foto, setFoto] = useState<string>('')
  const [form, setForm] = useState({
    delegacion: delegacionFija || '',
    dominio: '',
    marca: '',
    modelo: '',
    anio: '',
    kilometros: '',
    estado: 'Operativo',
    matafuegos: 'Si',
    rto: 'Si',
    observaciones: '',
  })

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setFoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tipo: 'movil', ...form, fotoUrl: foto }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error)
      }
      setForm({ delegacion: delegacionFija || '', dominio: '', marca: '', modelo: '', anio: '', kilometros: '', estado: 'Operativo', matafuegos: 'Si', rto: 'Si', observaciones: '' })
      setFoto('')
      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
          <label className="form-label">Dominio *</label>
          <input value={form.dominio} onChange={e => set('dominio', e.target.value)} required placeholder="AB 123 CD" className="form-input" />
        </div>
        <div>
          <label className="form-label">Marca *</label>
          <input value={form.marca} onChange={e => set('marca', e.target.value)} required placeholder="Ford, Toyota..." className="form-input" />
        </div>
        <div>
          <label className="form-label">Modelo *</label>
          <input value={form.modelo} onChange={e => set('modelo', e.target.value)} required placeholder="Ranger, Hilux..." className="form-input" />
        </div>
        <div>
          <label className="form-label">Año *</label>
          <input value={form.anio} onChange={e => set('anio', e.target.value)} required placeholder="2022" className="form-input" />
        </div>
        <div>
          <label className="form-label">Kilómetros *</label>
          <input value={form.kilometros} onChange={e => set('kilometros', e.target.value)} required placeholder="50000" className="form-input" />
        </div>
        <div>
          <label className="form-label">Estado actual *</label>
          <select value={form.estado} onChange={e => set('estado', e.target.value)} className="form-select">
            <option>Operativo</option>
            <option>No Operativo</option>
          </select>
        </div>
        <div>
          <label className="form-label">Matafuegos disponible *</label>
          <select value={form.matafuegos} onChange={e => set('matafuegos', e.target.value)} className="form-select">
            <option>Si</option>
            <option>No</option>
          </select>
        </div>
        <div>
          <label className="form-label">RTO *</label>
          <select value={form.rto} onChange={e => set('rto', e.target.value)} className="form-select">
            <option>Si</option>
            <option>No</option>
          </select>
        </div>
      </div>

      <div>
        <label className="form-label">Observaciones</label>
        <textarea value={form.observaciones} onChange={e => set('observaciones', e.target.value)} rows={3} placeholder="Información adicional..." className="form-input resize-none" />
      </div>

      <div>
        <label className="form-label">Foto del vehículo</label>
        <input type="file" accept="image/*" onChange={handlePhoto} className="block w-full text-sm text-blue-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer" />
        {foto && (
          <div className="mt-3">
            <img src={foto} alt="Preview" className="h-40 rounded-xl border-2 border-blue-200 object-cover" />
          </div>
        )}
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? 'Guardando...' : 'Guardar Móvil'}
      </button>
    </form>
  )
}
