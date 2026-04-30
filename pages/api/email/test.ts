import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '@/lib/auth'
import { sendNewItemNotification } from '@/lib/email'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const payload = requireAdmin(req, res)
  if (!payload) return

  const adminEmailRaw = process.env.ADMIN_EMAIL

  // Verificar que hay al menos una forma de enviar emails configurada
  const tieneResend = !!process.env.RESEND_API_KEY
  const tieneSMTP = !!(process.env.SMTP_USER && process.env.SMTP_PASS)

  if (!adminEmailRaw) {
    return res.status(400).json({
      error: 'Falta configurar ADMIN_EMAIL en las variables de entorno de Railway.',
    })
  }

  if (!tieneResend && !tieneSMTP) {
    return res.status(400).json({
      error: 'Falta configurar RESEND_API_KEY (recomendado) o SMTP_USER + SMTP_PASS en Railway.',
    })
  }

  const fakeItem = {
    id: 'test-001',
    tipo: 'movil',
    delegacion: 'PRUEBA',
    createdAt: new Date().toISOString(),
    dominio: 'AA 000 BB',
    marca: 'Ford',
    modelo: 'Ranger',
    anio: '2024',
    kilometros: '0',
    estado: 'Operativo',
    matafuegos: 'Si',
    rto: 'Si',
    observaciones: 'Email de prueba del sistema',
  }

  try {
    await sendNewItemNotification(fakeItem, payload.username)
    return res.status(200).json({
      success: true,
      message: `Email de prueba enviado a ${adminEmailRaw}`,
      servicio: tieneResend ? 'Resend' : 'SMTP',
    })
  } catch (err: any) {
    return res.status(500).json({
      error: `Error al enviar: ${err.message}`,
    })
  }
}