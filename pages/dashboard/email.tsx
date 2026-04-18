import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '@/components/layout/Layout'
import { useAuth } from '@/lib/AuthContext'

export default function EmailConfigPage() {
  const { user, token, loading } = useAuth()
  const router = useRouter()
  const [emails, setEmails]       = useState<string[]>([])
  const [newEmail, setNewEmail]   = useState('')
  const [saving, setSaving]       = useState(false)
  const [testing, setTesting]     = useState(false)
  const [result, setResult]       = useState<{ ok: boolean; msg: string } | null>(null)
  const [fetching, setFetching]   = useState(true)

  useEffect(() => {
    if (!loading && !user)                  { router.replace('/login');               return }
    if (!loading && user?.role !== 'admin') { router.replace('/inventario/dashboard'); return }
  }, [user, loading])

  const fetchEmails = useCallback(async () => {
    if (!token) return
    const res  = await fetch('/api/email/recipients', { headers: { Authorization: `Bearer ${token}` } })
    const data = await res.json()
    setEmails(data.emails || [])
    setFetching(false)
  }, [token])

  useEffect(() => { fetchEmails() }, [fetchEmails])

  const saveEmails = async (list: string[]) => {
    setSaving(true); setResult(null)
    try {
      const res = await fetch('/api/email/recipients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ emails: list }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEmails(data.emails)
      setResult({ ok: true, msg: data.message })
      setTimeout(() => setResult(null), 4000)
    } catch (err: any) {
      setResult({ ok: false, msg: err.message })
    } finally { setSaving(false) }
  }

  const addEmail = () => {
    const e = newEmail.trim().toLowerCase()
    if (!e) return
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
      setResult({ ok: false, msg: 'El email ingresado no es válido' }); return
    }
    if (emails.includes(e)) {
      setResult({ ok: false, msg: 'Ese email ya está en la lista' }); return
    }
    const updated = [...emails, e]
    setNewEmail('')
    saveEmails(updated)
  }

  const removeEmail = (email: string) => {
    saveEmails(emails.filter(e => e !== email))
  }

  const handleTest = async () => {
    setTesting(true); setResult(null)
    try {
      const res  = await fetch('/api/email/test', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setResult(res.ok ? { ok: true, msg: data.message } : { ok: false, msg: data.error })
    } catch {
      setResult({ ok: false, msg: 'Error de red al intentar enviar el email de prueba.' })
    } finally { setTesting(false) }
  }

  if (loading || !user) return null

  return (
    <>
      <Head><title>Notificaciones — Inventario CNRT</title></Head>
      <Layout title="Configuración de Notificaciones">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Destinatarios */}
          <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
            <h2 className="text-base font-bold text-blue-900 mb-1">Destinatarios de notificaciones</h2>
            <p className="text-sm text-blue-400 mb-5">
              Cuando un usuario registra un nuevo elemento, se envía un email automático a todos los destinatarios de esta lista.
            </p>

            {/* Lista de emails actuales */}
            {fetching ? (
              <div className="text-sm text-blue-300 py-4">Cargando...</div>
            ) : emails.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl text-sm mb-4">
                ⚠ No hay destinatarios configurados. Las notificaciones no se enviarán hasta agregar al menos uno.
              </div>
            ) : (
              <div className="space-y-2 mb-5">
                {emails.map(email => (
                  <div key={email} className="flex items-center justify-between px-4 py-2.5 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-400 text-sm">✉</span>
                      <span className="text-sm font-medium text-blue-800">{email}</span>
                    </div>
                    <button
                      onClick={() => removeEmail(email)}
                      disabled={saving}
                      className="w-6 h-6 rounded-md bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-600 flex items-center justify-center text-xs transition-colors"
                      title="Quitar este destinatario"
                    >✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Agregar email */}
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="form-label">Agregar destinatario</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addEmail()}
                  placeholder="correo@ejemplo.com"
                  className="form-input"
                />
              </div>
              <button onClick={addEmail} disabled={saving || !newEmail.trim()} className="btn-primary px-5 py-2.5">
                {saving ? '...' : 'Agregar'}
              </button>
            </div>

            {result && (
              <div className={`mt-4 flex items-start gap-3 px-4 py-3 rounded-xl text-sm border fade-in ${result.ok ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                <span className="text-lg leading-none mt-0.5">{result.ok ? '✓' : '✕'}</span>
                <span>{result.msg}</span>
              </div>
            )}
          </div>

          {/* Probar */}
          <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
            <h2 className="text-base font-bold text-blue-900 mb-1">Probar configuración</h2>
            <p className="text-sm text-blue-400 mb-4">
              Envía un email de prueba a todos los destinatarios configurados para verificar que el envío funciona correctamente.
            </p>
            <button onClick={handleTest} disabled={testing || emails.length === 0} className="btn-primary gap-2">
              {testing ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" /> Enviando...</>
              ) : '✉ Enviar email de prueba'}
            </button>
            {emails.length === 0 && <p className="text-xs text-blue-300 mt-2">Agregá al menos un destinatario para poder probar.</p>}
          </div>

          {/* Instrucciones SMTP */}
          <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
            <h2 className="text-base font-bold text-blue-900 mb-4">Configuración del servidor de envío</h2>
            <p className="text-sm text-blue-500 mb-3">
              Editá el archivo <code className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs">.env</code> con las credenciales del servidor SMTP:
            </p>
            <div className="bg-slate-900 rounded-xl p-4 text-xs font-mono overflow-x-auto">
              <div className="text-slate-400 mb-2"># Servidor de envío</div>
              {[
                ['SMTP_SERVICE', '"gmail"         # gmail | outlook | yahoo'],
                ['SMTP_USER',    '"tu@gmail.com"  # cuenta remitente'],
                ['SMTP_PASS',    '"xxxx xxxx xxxx xxxx"  # App Password'],
                ['EMAIL_FROM_NAME', '"CNRT - Sistema de Inventario"'],
              ].map(([k,v]) => (
                <div key={k}><span className="text-blue-400">{k}</span><span className="text-slate-400">=</span><span className="text-green-400">{v}</span></div>
              ))}
            </div>
            <p className="text-xs text-blue-400 mt-3">
              Para Gmail: usá una <strong>App Password</strong> generada en <code className="bg-blue-50 text-blue-700 px-1 rounded">myaccount.google.com/apppasswords</code>. Requiere verificación en 2 pasos activada.
            </p>
          </div>
        </div>
      </Layout>
    </>
  )
}
