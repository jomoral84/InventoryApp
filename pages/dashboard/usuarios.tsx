import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '@/components/layout/Layout'
import { useAuth } from '@/lib/AuthContext'
import { DELEGACIONES } from '@/lib/delegaciones'

const EMPTY = { username:'', password:'', role:'user', delegacion:'', nombre:'', apellido:'', email:'', telefono:'' }

function Modal({ title, onClose, children }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background:'rgba(15,30,80,0.55)', backdropFilter:'blur(2px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-blue-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-100 flex-shrink-0">
          <h2 className="font-bold text-blue-900 text-base">{title}</h2>
          <button onClick={onClose} className="text-blue-300 hover:text-blue-600 text-xl">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

export default function UsuariosPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers]         = useState<any[]>([])
  const [fetching, setFetching]   = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newUser, setNewUser]     = useState(EMPTY)
  const [creating, setCreating]   = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const [editUser, setEditUser]   = useState<any | null>(null)
  const [editData, setEditData]   = useState<any>({})
  const [saving, setSaving]       = useState(false)
  const [editErr, setEditErr]     = useState('')

  const fetchUsers = useCallback(async () => {
    if (!token) return
    const res = await fetch('/api/users', { headers: { Authorization:`Bearer ${token}` } })
    const data = await res.json()
    setUsers(Array.isArray(data) ? data : [])
    setFetching(false)
  }, [token])

  useEffect(() => {
    if (!loading && !user)                  { router.replace('/login'); return }
    if (!loading && user?.role !== 'admin') { router.replace('/inventario/dashboard'); return }
    fetchUsers()
  }, [user, loading])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setSuccess(''); setCreating(true)
    try {
      const res = await fetch('/api/users', {
        method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify(newUser),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setNewUser(EMPTY); setShowCreate(false)
      setSuccess('Usuario creado correctamente')
      setTimeout(() => setSuccess(''), 4000)
      fetchUsers()
    } catch (err: any) { setError(err.message) } finally { setCreating(false) }
  }

  const openEdit = (u: any) => {
    setEditUser(u)
    setEditData({
      nombre: u.nombre||'', apellido: u.apellido||'',
      email: u.email||'', telefono: u.telefono||'',
      role: u.role, delegacion: u.delegacion,
      newPassword: '', confirmPassword: '',
    })
    setEditErr('')
  }

  const handleSave = async () => {
    setEditErr(''); setSaving(true)
    try {
      if (editData.newPassword) {
        if (editData.newPassword !== editData.confirmPassword)
          throw new Error('Las contraseñas no coinciden')
        if (editData.newPassword.length < 6)
          throw new Error('La contraseña debe tener al menos 6 caracteres')
      }
      const body: any = {
        nombre: editData.nombre, apellido: editData.apellido,
        email: editData.email, telefono: editData.telefono,
        role: editData.role, delegacion: editData.delegacion,
      }
      if (editData.newPassword) body.newPassword = editData.newPassword
      const res = await fetch(`/api/users/${editUser.id}`, {
        method:'PATCH', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      setEditUser(null)
      setSuccess('Usuario actualizado correctamente')
      setTimeout(() => setSuccess(''), 4000)
      fetchUsers()
    } catch (err: any) { setEditErr(err.message) } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este usuario?')) return
    await fetch(`/api/users/${id}`, { method:'DELETE', headers:{ Authorization:`Bearer ${token}` } })
    fetchUsers()
  }

  const setN = (k: string) => (e: any) => setNewUser(u => ({ ...u, [k]: e.target.value }))
  const setE = (k: string) => (e: any) => setEditData((d: any) => ({ ...d, [k]: e.target.value }))

  if (loading || !user) return null

  return (
    <>
      <Head><title>Usuarios — Inventario CNRT</title></Head>
      <Layout title="Gestión de Usuarios">
        <div className="w-full">
          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-5 py-3 rounded-xl text-sm font-medium fade-in">✓ {success}</div>
          )}

          <div className="flex items-center justify-between mb-5">
            <p className="text-blue-500 text-sm">{users.length} usuario{users.length!==1?'s':''} registrado{users.length!==1?'s':''}</p>
            <button onClick={() => { setShowCreate(!showCreate); setError('') }} className="btn-primary text-sm px-5 py-2">
              {showCreate ? 'Cancelar' : '+ Nuevo usuario'}
            </button>
          </div>

          {/* Formulario de creación */}
          {showCreate && (
            <div className="bg-white rounded-2xl border border-blue-200 p-6 mb-6 fade-in">
              <h3 className="font-bold text-blue-900 mb-4">Crear nuevo usuario</h3>
              <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
                <div><label className="form-label">Nombre</label><input value={newUser.nombre} onChange={setN('nombre')} placeholder="Nombre" className="form-input" /></div>
                <div><label className="form-label">Apellido</label><input value={newUser.apellido} onChange={setN('apellido')} placeholder="Apellido" className="form-input" /></div>
                <div><label className="form-label">Usuario *</label><input value={newUser.username} onChange={setN('username')} required placeholder="nombre.usuario" className="form-input" /></div>
                <div><label className="form-label">Contraseña *</label><input type="password" value={newUser.password} onChange={setN('password')} required placeholder="••••••••" className="form-input" /></div>
                <div><label className="form-label">Rol *</label>
                  <select value={newUser.role} onChange={setN('role')} className="form-select">
                    <option value="user">Usuario</option><option value="admin">Administrador</option>
                  </select>
                </div>
                <div><label className="form-label">Delegación *</label>
                  <select value={newUser.delegacion} onChange={setN('delegacion')} required className="form-select">
                    <option value="">Seleccionar...</option>
                    {DELEGACIONES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div><label className="form-label">Email</label><input type="email" value={newUser.email} onChange={setN('email')} placeholder="correo@ejemplo.com" className="form-input" /></div>
                <div><label className="form-label">Teléfono</label><input type="tel" value={newUser.telefono} onChange={setN('telefono')} placeholder="011 XXXX-XXXX" className="form-input" /></div>
                {error && <p className="col-span-2 text-red-600 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
                <div className="col-span-2"><button type="submit" disabled={creating} className="btn-primary">{creating?'Creando...':'Crear usuario'}</button></div>
              </form>
            </div>
          )}

          {/* Tabla */}
          <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full" style={{ minWidth: '900px' }}>
              <thead className="bg-blue-50/70 border-b border-blue-100">
                <tr>
                  {['Nombre completo','Usuario','Delegación','Email','Teléfono','Rol','Creado','Acciones'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-blue-400 uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {fetching ? (
                  <tr><td colSpan={8} className="text-center py-10 text-blue-300 text-sm">Cargando...</td></tr>
                ) : users.map(u => {
                  const fullName = [u.nombre, u.apellido].filter(Boolean).join(' ') || '—'
                  return (
                    <tr key={u.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {(u.nombre||u.username)[0].toUpperCase()}
                          </div>
                          <span className="font-medium text-blue-900 text-sm">{fullName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-blue-500 font-mono">{u.username}</td>
                      <td className="px-4 py-3 text-sm text-blue-600">{u.delegacion}</td>
                      <td className="px-4 py-3 text-xs text-blue-500">{u.email||<span className="text-blue-300">—</span>}</td>
                      <td className="px-4 py-3 text-xs text-blue-500">{u.telefono||<span className="text-blue-300">—</span>}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.role==='admin'?'bg-blue-100 text-blue-700':'bg-gray-100 text-gray-600'}`}>
                          {u.role==='admin'?'Administrador':'Usuario'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-blue-400 whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString('es-AR')}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(u)} title="Editar"
                            className="w-7 h-7 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-500 hover:text-blue-700 flex items-center justify-center text-xs transition-colors">✎</button>
                          {u.id !== user.id && (
                            <button onClick={() => handleDelete(u.id)} title="Eliminar"
                              className="w-7 h-7 rounded-md bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center text-xs transition-colors">✕</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de edición */}
        {editUser && (
          <Modal title={`Editar usuario — ${editUser.username}`} onClose={() => setEditUser(null)}>
            <div className="space-y-4">
              {/* Datos personales */}
              <div>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Datos personales</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="form-label">Nombre</label><input value={editData.nombre} onChange={setE('nombre')} placeholder="Nombre" className="form-input" /></div>
                  <div><label className="form-label">Apellido</label><input value={editData.apellido} onChange={setE('apellido')} placeholder="Apellido" className="form-input" /></div>
                  <div><label className="form-label">Email</label><input type="email" value={editData.email} onChange={setE('email')} placeholder="correo@ejemplo.com" className="form-input" /></div>
                  <div><label className="form-label">Teléfono</label><input type="tel" value={editData.telefono} onChange={setE('telefono')} placeholder="011 XXXX-XXXX" className="form-input" /></div>
                </div>
              </div>

              {/* Rol y delegación */}
              <div>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Acceso y delegación</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="form-label">Rol</label>
                    <select value={editData.role} onChange={setE('role')} className="form-select" disabled={editUser.id === user.id}>
                      <option value="user">Usuario</option><option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div><label className="form-label">Delegación</label>
                    <select value={editData.delegacion} onChange={setE('delegacion')} className="form-select">
                      {DELEGACIONES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Cambio de contraseña */}
              <div>
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Cambiar contraseña <span className="font-normal normal-case text-blue-300">(opcional)</span></p>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="form-label">Nueva contraseña</label><input type="password" value={editData.newPassword} onChange={setE('newPassword')} placeholder="••••••••" className="form-input" /></div>
                  <div><label className="form-label">Confirmar contraseña</label><input type="password" value={editData.confirmPassword} onChange={setE('confirmPassword')} placeholder="••••••••" className="form-input" /></div>
                </div>
              </div>

              {editErr && <p className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg border border-red-100">{editErr}</p>}

              <div className="flex gap-3 pt-2 border-t border-blue-50">
                <button onClick={() => setEditUser(null)} className="flex-1 py-2.5 rounded-xl border-2 border-blue-100 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-colors">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary py-2.5">{saving?'Guardando...':'Guardar cambios'}</button>
              </div>
            </div>
          </Modal>
        )}
      </Layout>
    </>
  )
}
