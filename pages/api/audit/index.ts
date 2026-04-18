import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const payload = requireAuth(req, res)
  if (!payload) return

  const where: any = {}
  if (payload.role !== 'admin') {
    // Usuario: solo ve su delegación
    where.delegacion = payload.delegacion
  }

  // Filtros opcionales
  const { tipo, delegacion, accion } = req.query
  if (tipo)       where.itemTipo  = tipo
  if (delegacion && payload.role === 'admin') where.delegacion = delegacion
  if (accion)     where.accion    = accion

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return res.status(200).json(logs)
}
