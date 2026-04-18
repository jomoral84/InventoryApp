import jwt from 'jsonwebtoken'
import { NextApiRequest, NextApiResponse } from 'next'

const JWT_SECRET = process.env.JWT_SECRET || 'inventario-secret-key-2024'

export interface JWTPayload {
  userId: string
  username: string
  role: string
  delegacion: string
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export function getTokenFromRequest(req: NextApiRequest): string | null {
  const auth = req.headers.authorization
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice(7)
  }
  return null
}

export function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse
): JWTPayload | null {
  const token = getTokenFromRequest(req)
  if (!token) {
    res.status(401).json({ error: 'No autenticado' })
    return null
  }
  const payload = verifyToken(token)
  if (!payload) {
    res.status(401).json({ error: 'Token inválido' })
    return null
  }
  return payload
}

export function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse
): JWTPayload | null {
  const payload = requireAuth(req, res)
  if (!payload) return null
  if (payload.role !== 'admin') {
    res.status(403).json({ error: 'Acceso denegado. Se requiere rol administrador.' })
    return null
  }
  return payload
}
