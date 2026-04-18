import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { requireAdmin, requireAuth } from '@/lib/auth'

const SELECT = {
  id: true, username: true, role: true,
  delegacion: true, nombre: true, apellido: true,
  email: true, telefono: true, createdAt: true,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'ID requerido' })

  if (req.method === 'PATCH') {
    const payload = requireAuth(req, res)
    if (!payload) return

    // Un usuario solo puede editar su propio perfil; admin puede editar cualquiera
    const isSelf  = payload.userId === id
    const isAdmin = payload.role === 'admin'
    if (!isSelf && !isAdmin) return res.status(403).json({ error: 'Sin permisos' })

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })

    const { role, delegacion, nombre, apellido, email, telefono, password, newPassword } = req.body
    const data: any = {}

    // Campos de perfil — cualquiera puede editar los suyos; admin puede editar cualquiera
    if (nombre     !== undefined) data.nombre     = nombre     || null
    if (apellido   !== undefined) data.apellido   = apellido   || null
    if (email      !== undefined) data.email      = email      || null
    if (telefono   !== undefined) data.telefono   = telefono   || null

    // Campos solo para admin
    if (isAdmin) {
      if (role && ['admin', 'user'].includes(role)) data.role = role
      if (delegacion !== undefined) data.delegacion = delegacion
    }

    // Cambio de contraseña
    if (newPassword) {
      if (isSelf && !isAdmin) {
        // Usuario cambiando su propia: debe confirmar la actual
        if (!password) return res.status(400).json({ error: 'Ingresá tu contraseña actual' })
        const valid = bcrypt.compareSync(password, user.passwordHash)
        if (!valid) return res.status(400).json({ error: 'La contraseña actual es incorrecta' })
      }
      // Admin puede cambiar sin confirmar la actual
      if (newPassword.length < 6)
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' })
      data.passwordHash = bcrypt.hashSync(newPassword, 10)
    }

    if (Object.keys(data).length === 0)
      return res.status(400).json({ error: 'No hay cambios para guardar' })

    const updated = await prisma.user.update({ where: { id }, data, select: SELECT })
    return res.status(200).json(updated)
  }

  if (req.method === 'DELETE') {
    const payload = requireAdmin(req, res)
    if (!payload) return
    if (id === payload.userId)
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' })
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })
    await prisma.user.delete({ where: { id } })
    return res.status(200).json({ success: true })
  }

  return res.status(405).end()
}
