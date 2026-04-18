import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Layout from '@/components/layout/Layout'
import FormMovil from '@/components/forms/FormMovil'
import FormAlcoholimetro from '@/components/forms/FormAlcoholimetro'
import FormPdaCelular from '@/components/forms/FormPdaCelular'
import FormInformatica from '@/components/forms/FormInformatica'
import { useAuth } from '@/lib/AuthContext'

const TABS = [
  { key: 'movil', label: 'Móvil', icon: '🚗' },
  { key: 'alcoholimetro', label: 'Alcoholímetro', icon: '🔬' },
  { key: 'pda_celular', label: 'PDA/Celular', icon: '📱' },
  { key: 'informatica', label: 'Informática', icon: '💻' },
]

export default function InventarioPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('movil')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
    if (!loading && user?.role === 'admin') router.replace('/dashboard')
  }, [user, loading])

  if (loading || !user) return null

  const handleSuccess = () => {
    setSuccessMsg('¡Elemento guardado correctamente!')
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  return (
    <>
      <Head><title>Cargar Elemento — Inventario</title></Head>
      <Layout title="Cargar Elemento">
        <div className="max-w-2xl mx-auto">
          {successMsg && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2 fade-in">
              <span>✓</span> {successMsg}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
            {/* Tab selector */}
            <div className="flex border-b border-blue-100 bg-blue-50/50">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 py-3.5 px-2 text-sm font-semibold transition-all relative ${
                    activeTab === tab.key
                      ? 'text-blue-700 bg-white tab-active'
                      : 'text-blue-400 hover:text-blue-600'
                  }`}
                >
                  <span className="block text-lg mb-0.5">{tab.icon}</span>
                  <span className="hidden sm:block text-xs">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Form */}
            <div className="p-6 fade-in" key={activeTab}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-xl">
                  {TABS.find(t => t.key === activeTab)?.icon}
                </div>
                <div>
                  <h2 className="font-bold text-blue-900 text-lg">
                    Registrar {TABS.find(t => t.key === activeTab)?.label}
                  </h2>
                  <p className="text-blue-400 text-xs">Delegación: {user.delegacion}</p>
                </div>
              </div>

              {activeTab === 'movil' && <FormMovil onSuccess={handleSuccess} delegacionFija={user.delegacion} />}
              {activeTab === 'alcoholimetro' && <FormAlcoholimetro onSuccess={handleSuccess} delegacionFija={user.delegacion} />}
              {activeTab === 'pda_celular' && <FormPdaCelular onSuccess={handleSuccess} delegacionFija={user.delegacion} />}
              {activeTab === 'informatica' && <FormInformatica onSuccess={handleSuccess} delegacionFija={user.delegacion} />}
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
