import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { buildEditDescriptions, createAuditLogs, itemRef } from '@/lib/audit'

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'ID requerido' })
  if (req.method !== 'PATCH') return res.status(405).end()

  const payload = requireAuth(req, res)
  if (!payload) return

  const before = await prisma.item.findUnique({ where: { id } })
  if (!before) return res.status(404).json({ error: 'Elemento no encontrado' })
  if (payload.role !== 'admin' && before.userId !== payload.userId)
    return res.status(403).json({ error: 'Sin permisos para editar este elemento' })

  const body = req.body
  const updated = await prisma.item.update({
    where: { id },
    data: {
      delegacion:      body.delegacion      ?? before.delegacion,
      dominio:         body.dominio         !== undefined ? body.dominio         : before.dominio,
      marca:           body.marca           !== undefined ? body.marca           : before.marca,
      modelo:          body.modelo          !== undefined ? body.modelo          : before.modelo,
      anio:            body.anio            !== undefined ? body.anio            : before.anio,
      kilometros:      body.kilometros      !== undefined ? body.kilometros      : before.kilometros,
      matafuegos:      body.matafuegos      !== undefined ? body.matafuegos      : before.matafuegos,
      rto:             body.rto             !== undefined ? body.rto             : before.rto,
      fotoUrl:         body.fotoUrl         !== undefined ? body.fotoUrl         : before.fotoUrl,
      nroSerie:        body.nroSerie        !== undefined ? body.nroSerie        : before.nroSerie,
      fechaVencimiento: body.fechaVencimiento !== undefined ? body.fechaVencimiento : before.fechaVencimiento,
      nroSistemas:     body.nroSistemas     !== undefined ? body.nroSistemas     : before.nroSistemas,
      nroLinea:        body.nroLinea        !== undefined ? body.nroLinea        : before.nroLinea,
      empresa:         body.empresa         !== undefined ? body.empresa         : before.empresa,
      asignadaA:       body.asignadaA       !== undefined ? body.asignadaA       : before.asignadaA,
      dispositivo:     body.dispositivo     !== undefined ? body.dispositivo     : before.dispositivo,
      estado:          body.estado          !== undefined ? body.estado          : before.estado,
      observaciones:   body.observaciones   !== undefined ? body.observaciones   : before.observaciones,
    },
  })

  // Registrar cada cambio en auditoría
  const descriptions = buildEditDescriptions(before, updated)
  if (descriptions.length > 0) {
    await createAuditLogs(descriptions.map(descripcion => ({
      accion: 'edicion' as const,
      descripcion,
      delegacion: updated.delegacion,
      itemId: updated.id,
      itemTipo: updated.tipo,
      itemRef: itemRef(updated),
      userId: payload.userId,
      username: payload.username,
    })))
  }

  return res.status(200).json(updated)
}
