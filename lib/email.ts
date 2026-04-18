import { LOGO_CNRT_B64 } from '@/lib/logoCnrt'

import nodemailer from 'nodemailer'

// ── Tipos ──────────────────────────────────────────────────────────────────

type TipoItem = 'movil' | 'alcoholimetro' | 'pda_celular' | 'informatica'

const TIPO_LABEL: Record<TipoItem, string> = {
  movil:        'Móvil',
  alcoholimetro: 'Alcoholímetro',
  pda_celular:  'PDA / Celular',
  informatica:  'Equipo Informático',
}

const TIPO_ICON: Record<TipoItem, string> = {
  movil:        '🚗',
  alcoholimetro: '🔬',
  pda_celular:  '📱',
  informatica:  '💻',
}

const TIPO_COLOR: Record<TipoItem, string> = {
  movil:        '#1d4ed8',
  alcoholimetro: '#0e7490',
  pda_celular:  '#6d28d9',
  informatica:  '#065f46',
}

// ── Transporter ───────────────────────────────────────────────────────────

function createTransporter() {
  const service = process.env.SMTP_SERVICE || 'gmail'
  const user    = process.env.SMTP_USER
  const pass    = process.env.SMTP_PASS

  if (!user || !pass) {
    console.warn('[Email] SMTP_USER o SMTP_PASS no configurados — el email no se enviará.')
    return null
  }

  // Soporte para servidor SMTP personalizado (SMTP_HOST + SMTP_PORT)
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user, pass },
    })
  }

  return nodemailer.createTransport({
    service,
    auth: { user, pass },
  })
}

// ── Helpers de filas para cada tipo ──────────────────────────────────────

function itemRows(item: any): string {
  const rows: [string, string][] = []

  if (item.tipo === 'movil') {
    rows.push(
      ['Dominio',    item.dominio    || '—'],
      ['Marca',      item.marca      || '—'],
      ['Modelo',     item.modelo     || '—'],
      ['Año',        item.anio       || '—'],
      ['Kilómetros', item.kilometros || '—'],
      ['Estado',     item.estado     || '—'],
      ['Matafuegos', item.matafuegos || '—'],
      ['RTO',        item.rto        || '—'],
    )
  } else if (item.tipo === 'alcoholimetro') {
    rows.push(
      ['N° de Serie',   item.nroSerie        || '—'],
      ['Estado',        item.estado          || '—'],
      ['Vencimiento',   item.fechaVencimiento || '—'],
    )
  } else if (item.tipo === 'pda_celular') {
    rows.push(
      ['Marca',        item.marca       || '—'],
      ['Modelo',       item.modelo      || '—'],
      ['Estado',       item.estado      || '—'],
      ['N° Sistemas',  item.nroSistemas || '—'],
      ['N° Línea',     item.nroLinea    || '—'],
      ['Empresa',      item.empresa     || '—'],
      ['Asignada a',   item.asignadaA   || '—'],
    )
  } else if (item.tipo === 'informatica') {
    rows.push(
      ['Dispositivo',  item.dispositivo || '—'],
      ['Marca',        item.marca       || '—'],
      ['Modelo',       item.modelo      || '—'],
      ['Estado',       item.estado      || '—'],
      ['N° Sistemas',  item.nroSistemas || '—'],
    )
  }

  if (item.observaciones) {
    rows.push(['Observaciones', item.observaciones])
  }

  return rows.map(([label, value]) => `
    <tr>
      <td style="padding:8px 12px;font-size:12px;color:#64748b;font-weight:600;width:140px;border-bottom:1px solid #f1f5f9;white-space:nowrap">${label}</td>
      <td style="padding:8px 12px;font-size:12px;color:#1e293b;border-bottom:1px solid #f1f5f9">${value}</td>
    </tr>`).join('')
}

// ── Template HTML principal ───────────────────────────────────────────────

function buildEmailHTML(item: any, username: string): string {
  const tipo      = item.tipo as TipoItem
  const label     = TIPO_LABEL[tipo] || tipo
  const icon      = TIPO_ICON[tipo]  || '📋'
  const color     = TIPO_COLOR[tipo] || '#1d4ed8'
  const fecha     = new Date(item.createdAt).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Nuevo elemento registrado — CNRT Inventario</title>
</head>
<body style="margin:0;padding:0;background:#f0f6ff;font-family:'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f6ff;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">

        <!-- Header CNRT -->
        <tr>
          <td style="background:linear-gradient(135deg,#172554 0%,#1e40af 100%);border-radius:14px 14px 0 0;padding:20px 32px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <img src="${LOGO_CNRT_B64}" alt="CNRT" style="height:38px;width:auto;display:block;" />
                </td>
                <td align="right">
                  <div style="font-size:11px;color:#93c5fd;line-height:1.6">Sistema de Inventario<br/>${fecha}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Alerta de nuevo registro -->
        <tr>
          <td style="background:${color};padding:16px 32px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="font-size:24px;vertical-align:middle">${icon}</span>
                  <span style="font-size:15px;font-weight:700;color:white;vertical-align:middle;margin-left:10px">
                    Nuevo ${label} registrado
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:28px 32px">

            <!-- Intro -->
            <p style="margin:0 0 20px;font-size:14px;color:#334155;line-height:1.6">
              El usuario <strong style="color:#1e40af">${username}</strong> registró un nuevo elemento 
              en la delegación <strong style="color:#1e40af">${item.delegacion}</strong>.
            </p>

            <!-- Info card -->
            <div style="background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;overflow:hidden;margin-bottom:24px">
              <div style="background:#f1f5f9;padding:10px 16px;border-bottom:1px solid #e2e8f0">
                <span style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">
                  Datos del elemento
                </span>
              </div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 12px;font-size:12px;color:#64748b;font-weight:600;width:140px;border-bottom:1px solid #f1f5f9">Tipo</td>
                  <td style="padding:8px 12px;font-size:12px;color:#1e293b;border-bottom:1px solid #f1f5f9">
                    <span style="background:${color}1a;color:${color};padding:2px 8px;border-radius:20px;font-weight:700;font-size:11px">${icon} ${label}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 12px;font-size:12px;color:#64748b;font-weight:600;width:140px;border-bottom:1px solid #f1f5f9">Delegación</td>
                  <td style="padding:8px 12px;font-size:12px;color:#1e293b;font-weight:600;border-bottom:1px solid #f1f5f9">${item.delegacion}</td>
                </tr>
                ${itemRows(item)}
              </table>
            </div>

            <!-- Nota -->
            <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5">
              Este es un mensaje automático del Sistema de Inventario CNRT.<br/>
              Podés ver el registro completo iniciando sesión en el sistema.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#1e3a8a;border-radius:0 0 14px 14px;padding:14px 32px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="font-size:11px;color:#93c5fd">
                  <img src="${LOGO_CNRT_B64}" alt="CNRT" style="height:22px;width:auto;opacity:0.7;vertical-align:middle;" />
                  &nbsp; Sistema de Inventario Institucional
                </td>
                <td align="right" style="font-size:11px;color:#60a5fa">${fecha}</td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── Función principal exportada ───────────────────────────────────────────

export async function sendNewItemNotification(item: any, username: string): Promise<void> {
  // Leer destinatarios desde la DB (con fallback a variable de entorno)
  let adminEmail: string
  try {
    const { getAdminEmails } = await import('@/pages/api/email/recipients')
    adminEmail = await getAdminEmails()
  } catch {
    adminEmail = process.env.ADMIN_EMAIL || ''
  }
  if (!adminEmail) {
    console.warn('[Email] Sin destinatarios configurados — la notificación no se enviará.')
    return
  }

  const transporter = createTransporter()
  if (!transporter) return

  const tipo  = item.tipo as TipoItem
  const label = TIPO_LABEL[tipo] || tipo
  const icon  = TIPO_ICON[tipo]  || '📋'

  // Texto plano como fallback
  const textBody = [
    `CNRT — Nuevo ${label} registrado`,
    `Usuario: ${username}`,
    `Delegación: ${item.delegacion}`,
    `Fecha: ${new Date(item.createdAt).toLocaleString('es-AR')}`,
    '',
    item.tipo === 'movil'
      ? `Dominio: ${item.dominio || '—'} | Marca/Modelo: ${item.marca} ${item.modelo} | Estado: ${item.estado}`
      : item.tipo === 'alcoholimetro'
      ? `N° Serie: ${item.nroSerie || '—'} | Estado: ${item.estado} | Venc: ${item.fechaVencimiento || '—'}`
      : item.tipo === 'pda_celular'
      ? `Marca/Modelo: ${item.marca} ${item.modelo} | Estado: ${item.estado} | Empresa: ${item.empresa}`
      : `Dispositivo: ${item.dispositivo} | Marca/Modelo: ${item.marca} ${item.modelo} | Estado: ${item.estado}`,
    '',
    item.observaciones ? `Observaciones: ${item.observaciones}` : '',
  ].filter(Boolean).join('\n')

  try {
    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'CNRT Inventario'}" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `${icon} Nuevo ${label} — ${item.delegacion} (${username})`,
      text: textBody,
      html: buildEmailHTML(item, username),
    })
    console.log(`[Email] Notificación enviada a ${adminEmail} — ${label} por ${username}`)
  } catch (err) {
    // El error de email NO debe bloquear la respuesta al usuario
    console.error('[Email] Error al enviar notificación:', err)
  }
}
