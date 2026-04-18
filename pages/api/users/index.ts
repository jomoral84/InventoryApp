import type { NextApiRequest, NextApiResponse } from 'next'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

const SELECT = {
  id: true, username: true, role: true,
  delegacion: true, nombre: true, apellido: true,
  email: true, telefono: true, createdAt: true,
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const payload = requireAdmin(req, res)
    if (!payload) return
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' }, select: SELECT })
    return res.status(200).json(users)
  }

  if (req.method === 'POST') {
    const payload = requireAdmin(req, res)
    if (!payload) return
    const { username, password, role, delegacion, nombre, apellido, email, telefono } = req.body
    if (!username || !password || !role || !delegacion)
      return res.status(400).json({ error: 'Usuario, contraseña, rol y delegación son obligatorios' })
    if (!['admin', 'user'].includes(role))
      return res.status(400).json({ error: 'Rol inválido' })
    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing)
      return res.status(400).json({ error: 'El nombre de usuario ya existe' })
    const newUser = await prisma.user.create({
      data: {
        username,
        passwordHash: bcrypt.hashSync(password, 10),
        role,
        delegacion,
        nombre:   nombre   || null,
        apellido: apellido || null,
        email:    email    || null,
        telefono: telefono || null,
      },
      select: SELECT,
    })
    return res.status(201).json(newUser)
  }

  return res.status(405).end()
}
