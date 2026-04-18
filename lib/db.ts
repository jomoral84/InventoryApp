import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export type Role = 'admin' | 'user'

export interface User {
  id: string
  username: string
  passwordHash: string
  role: Role
  delegacion: string
  createdAt: string
}

export interface ItemBase {
  id: string
  userId: string
  username: string
  delegacion: string
  createdAt: string
  tipo: 'movil' | 'alcoholimetro' | 'pda_celular' | 'informatica'
  fotoUrl?: string
}

export interface Movil extends ItemBase {
  tipo: 'movil'
  dominio: string
  marca: string
  modelo: string
  anio: string
  kilometros: string
  estado: 'Operativo' | 'No Operativo'
  matafuegos: 'Si' | 'No'
  rto: 'Si' | 'No'
  observaciones: string
}

export interface Alcoholimetro extends ItemBase {
  tipo: 'alcoholimetro'
  nroSerie: string
  estado: 'Funciona' | 'A reparar' | 'A calibrar'
  fechaVencimiento: string
  observaciones: string
}

export interface PdaCelular extends ItemBase {
  tipo: 'pda_celular'
  estado: 'Funciona' | 'Trizada' | 'No funciona' | 'Sin chip'
  marca: string
  modelo: string
  nroSistemas: string
  nroLinea: string
  empresa: 'Personal' | 'Movistar' | 'Claro'
  asignadaA: string
  observaciones: string
}

export interface Informatica extends ItemBase {
  tipo: 'informatica'
  dispositivo: 'PC' | 'Monitor' | 'Impresora'
  estado: 'Funciona' | 'No funciona' | 'Requiere Mantenimiento' | 'Falta Toner'
  marca: string
  modelo: string
  nroSistemas: string
  observaciones: string
}

export type Item = Movil | Alcoholimetro | PdaCelular | Informatica

// ---- In-memory "database" ----
const adminHash = bcrypt.hashSync('admin123', 10)
const userHash = bcrypt.hashSync('user123', 10)

export const db: {
  users: User[]
  items: Item[]
} = {
  users: [
    {
      id: uuidv4(),
      username: 'admin',
      passwordHash: adminHash,
      role: 'admin',
      delegacion: 'CENTRAL',
      createdAt: new Date().toISOString(),
    },
    {
      id: uuidv4(),
      username: 'usuario1',
      passwordHash: userHash,
      role: 'user',
      delegacion: 'ROSARIO',
      createdAt: new Date().toISOString(),
    },
  ],
  items: [],
}
