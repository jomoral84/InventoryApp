import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { sendNewItemNotification } from '@/lib/email'
import { createAuditLog, itemRef, TIPO_LABEL_MAP } from '@/lib/audit'

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const payload = requireAuth(req, res)
    if (!payload) return
    const where: any = {}
    if (payload.role !== 'admin') where.userId = payload.userId
    const tipo = req.query.tipo as string | undefined
    if (tipo) where.tipo = tipo
    const items = await prisma.item.findMany({ where, orderBy: { createdAt: 'desc' } })
    return res.status(200).json(items)
  }

  if (req.method === 'POST') {
    const payload = requireAuth(req, res)
    if (!payload) return
    const body = req.body
    if (!body.tipo)      return res.status(400).json({ error: 'Tipo requerido' })
    if (!body.delegacion) return res.status(400).json({ error: 'Delegación requerida' })

    const item = await prisma.item.create({
      data: {
        tipo: body.tipo, delegacion: body.delegacion,
        userId: payload.userId, username: payload.username,
        dominio: body.dominio ?? null, marca: body.marca ?? null,
        modelo: body.modelo ?? null, anio: body.anio ?? null,
        kilometros: body.kilometros ?? null, matafuegos: body.matafuegos ?? null,
        rto: body.rto ?? null, fotoUrl: body.fotoUrl ?? null,
        nroSerie: body.nroSerie ?? null, fechaVencimiento: body.fechaVencimiento ?? null,
        nroSistemas: body.nroSistemas ?? null, nroLinea: body.nroLinea ?? null,
        empresa: body.empresa ?? null, asignadaA: body.asignadaA ?? null,
        dispositivo: body.dispositivo ?? null, estado: body.estado ?? null,
        observaciones: body.observaciones ?? null,
      },
    })

    // Auditoría de alta
    const ref = itemRef(item)
    const tipoLabel = TIPO_LABEL_MAP[item.tipo] || item.tipo
    await createAuditLog({
      accion: 'alta',
      descripcion: `Se registró el ${tipoLabel} "${ref}"`,
      delegacion: item.delegacion,
      itemId: item.id, itemTipo: item.tipo, itemRef: ref,
      userId: payload.userId, username: payload.username,
    })

    sendNewItemNotification(item, payload.username).catch(() => {})
    return res.status(201).json(item)
  }

  if (req.method === 'DELETE') {
    const payload = requireAuth(req, res)
    if (!payload) return
    const { id } = req.query
    if (!id || typeof id !== 'string') return res.status(400).json({ error: 'ID requerido' })
    const item = await prisma.item.findUnique({ where: { id } })
    if (!item) return res.status(404).json({ error: 'Elemento no encontrado' })
    if (payload.role !== 'admin' && item.userId !== payload.userId)
      return res.status(403).json({ error: 'Sin permisos' })

    const ref = itemRef(item)
    const tipoLabel = TIPO_LABEL_MAP[item.tipo] || item.tipo
    await createAuditLog({
      accion: 'eliminacion',
      descripcion: `Se eliminó el ${tipoLabel} "${ref}"`,
      delegacion: item.delegacion,
      itemId: item.id, itemTipo: item.tipo, itemRef: ref,
      userId: payload.userId, username: payload.username,
    })

    await prisma.item.delete({ where: { id } })
    return res.status(200).json({ success: true })
  }

  return res.status(405).end()
}
