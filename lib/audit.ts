import { prisma } from '@/lib/prisma'

// ── Identificador legible de un item ─────────────────────────────────────

export function itemRef(item: any): string {
  if (item.tipo === 'movil')        return item.dominio    || 'sin dominio'
  if (item.tipo === 'alcoholimetro') return item.nroSerie  || 'sin N° serie'
  if (item.tipo === 'pda_celular')  return item.marca && item.modelo
    ? `${item.marca} ${item.modelo}` : (item.nroSistemas || 'sin referencia')
  if (item.tipo === 'informatica')  return item.dispositivo && item.marca
    ? `${item.dispositivo} ${item.marca} ${item.modelo || ''}`.trim()
    : (item.nroSistemas || 'sin referencia')
  return 'elemento'
}

export const TIPO_LABEL_MAP: Record<string, string> = {
  movil: 'móvil', alcoholimetro: 'alcoholímetro',
  pda_celular: 'PDA/celular', informatica: 'equipo informático',
}

const TIPO_LABEL: Record<string, string> = {
  movil: 'móvil', alcoholimetro: 'alcoholímetro',
  pda_celular: 'PDA/celular', informatica: 'equipo informático',
}

// ── Detectar qué campos cambiaron ────────────────────────────────────────

const FIELD_LABEL: Record<string, string> = {
  estado: 'estado',
  kilometros: 'kilómetros',
  matafuegos: 'matafuegos',
  rto: 'RTO',
  fotoUrl: 'foto',
  dominio: 'dominio',
  marca: 'marca',
  modelo: 'modelo',
  anio: 'año',
  nroSerie: 'N° serie',
  fechaVencimiento: 'fecha de vencimiento',
  nroSistemas: 'N° sistemas',
  nroLinea: 'N° línea',
  empresa: 'empresa',
  asignadaA: 'asignada a',
  dispositivo: 'dispositivo',
  observaciones: 'observaciones',
  delegacion: 'delegación',
}

export function buildEditDescriptions(before: any, after: any): string[] {
  const changes: string[] = []
  const ref  = itemRef(before)
  const tipo = TIPO_LABEL[before.tipo] || before.tipo

  for (const [field, label] of Object.entries(FIELD_LABEL)) {
    const oldVal = before[field]
    const newVal = after[field]
    if (oldVal === newVal) continue
    if (!oldVal && !newVal) continue

    if (field === 'fotoUrl') {
      if (!oldVal && newVal) changes.push(`Se agregó foto al ${tipo} "${ref}"`)
      else if (oldVal && !newVal) changes.push(`Se eliminó la foto del ${tipo} "${ref}"`)
      else changes.push(`Se actualizó la foto del ${tipo} "${ref}"`)
    } else if (field === 'estado') {
      changes.push(`Se modificó el estado del ${tipo} "${ref}" a "${newVal}"`)
    } else {
      const oldStr = oldVal ? `"${oldVal}"` : 'vacío'
      const newStr = newVal ? `"${newVal}"` : 'vacío'
      changes.push(`Se modificó ${label} del ${tipo} "${ref}" de ${oldStr} a ${newStr}`)
    }
  }

  return changes
}

// ── Persistir logs ───────────────────────────────────────────────────────

interface LogParams {
  accion: 'alta' | 'edicion' | 'eliminacion'
  descripcion: string
  delegacion: string
  itemId?: string
  itemTipo?: string
  itemRef?: string
  userId: string
  username: string
}

export async function createAuditLog(params: LogParams) {
  try {
    await prisma.auditLog.create({ data: params })
  } catch (err) {
    console.error('[Audit] Error al guardar log:', err)
  }
}

export async function createAuditLogs(logs: LogParams[]) {
  for (const log of logs) {
    await createAuditLog(log)
  }
}
