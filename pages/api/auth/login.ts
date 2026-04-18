import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { username, password } = req.body
  if (!username || !password)
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' })

  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' })

  const valid = bcrypt.compareSync(password, user.passwordHash)
  if (!valid) return res.status(401).json({ error: 'Credenciales incorrectas' })

  const token = signToken({
    userId: user.id,
    username: user.username,
    role: user.role,
    delegacion: user.delegacion,
  })

  return res.status(200).json({
    token,
    user: {
      id:        user.id,
      username:  user.username,
      role:      user.role,
      delegacion: user.delegacion,
      nombre:    user.nombre   ?? undefined,
      apellido:  user.apellido ?? undefined,
    },
  })
}
