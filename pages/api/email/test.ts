import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '@/lib/auth'
import { sendNewItemNotification } from '@/lib/email'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const payload = requireAdmin(req, res)
  if (!payload) return

  const adminEmail = process.env.ADMIN_EMAIL
  const smtpUser   = process.env.SMTP_USER
  const smtpPass   = process.env.SMTP_PASS

  if (!adminEmail || !smtpUser || !smtpPass) {
    return res.status(400).json({
      error: 'Configuración incompleta. Verificá ADMIN_EMAIL, SMTP_USER y SMTP_PASS en el archivo .env',
    })
  }

  // Enviar un email de prueba con un item ficticio
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
      message: `Email de prueba enviado a ${adminEmail}`,
    })
  } catch (err: any) {
    return res.status(500).json({
      error: `Error al enviar: ${err.message}`,
    })
  }
}
