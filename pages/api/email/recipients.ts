import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const CONFIG_KEY = 'admin_emails'

async function getEmails(): Promise<string[]> {
  // Primero busca en la DB, si no hay nada usa la variable de entorno como fallback
  const config = await prisma.config.findUnique({ where: { key: CONFIG_KEY } }).catch(() => null)
  if (config?.value) {
    return config.value.split(',').map(e => e.trim()).filter(Boolean)
  }
  const envVal = process.env.ADMIN_EMAIL || ''
  return envVal.split(',').map(e => e.trim()).filter(Boolean)
}

async function setEmails(emails: string[]): Promise<void> {
  const value = emails.join(',')
  await prisma.config.upsert({
    where:  { key: CONFIG_KEY },
    update: { value },
    create: { id: `config_${CONFIG_KEY}`, key: CONFIG_KEY, value },
  })
  // Actualizar también en memoria para el proceso actual
  process.env.ADMIN_EMAIL = value
}

export async function getAdminEmails(): Promise<string> {
  const emails = await getEmails()
  return emails.join(',')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const payload = requireAdmin(req, res)
  if (!payload) return

  if (req.method === 'GET') {
    const emails = await getEmails()
    return res.status(200).json({ emails })
  }

  if (req.method === 'PUT') {
    const { emails } = req.body
    if (!Array.isArray(emails))
      return res.status(400).json({ error: 'Se esperaba un array de emails' })
    const valid = emails
      .map((e: string) => e.trim())
      .filter((e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
    await setEmails(valid)
    return res.status(200).json({ emails: valid, message: 'Destinatarios actualizados correctamente' })
  }

  return res.status(405).end()
}
