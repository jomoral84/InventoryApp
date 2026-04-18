import { LOGO_CNRT_B64 } from '@/lib/logoCnrt'

// Generador de PDF sin dependencias externas, usando HTML + window.print()
// Produce un documento estético con la información de los elementos

export type TipoItem = 'movil' | 'alcoholimetro' | 'pda_celular' | 'informatica'

const LABEL: Record<TipoItem, string> = {
  movil: 'Móviles',
  alcoholimetro: 'Alcoholímetros',
  pda_celular: 'PDA / Celulares',
  informatica: 'Informática',
}

function estadoColor(estado: string): string {
  const map: Record<string, string> = {
    'Operativo': '#16a34a', 'Funciona': '#16a34a',
    'No Operativo': '#dc2626', 'No funciona': '#dc2626',
    'A reparar': '#ea580c', 'A calibrar': '#ca8a04',
    'Trizada': '#ea580c', 'Sin chip': '#6b7280',
    'Requiere Mantenimiento': '#ca8a04', 'Falta Toner': '#9333ea',
  }
  return map[estado] || '#2563eb'
}

function buildMovilRows(items: any[]): string {
  return items.map(i => `
    <tr>
      <td>${i.delegacion}</td>
      <td>${i.username}</td>
      <td><strong>${i.dominio || '—'}</strong></td>
      <td>${i.marca || ''} ${i.modelo || ''}</td>
      <td>${i.anio || '—'}</td>
      <td>${i.kilometros || '—'}</td>
      <td><span style="color:${estadoColor(i.estado)};font-weight:600">${i.estado || '—'}</span></td>
      <td style="text-align:center">${i.matafuegos === 'Si' ? '✓' : '✗'}</td>
      <td style="text-align:center">${i.rto === 'Si' ? '✓' : '✗'}</td>
      <td class="obs">${i.observaciones || '—'}</td>
    </tr>`).join('')
}

function buildAlcoRows(items: any[]): string {
  return items.map(i => `
    <tr>
      <td>${i.delegacion}</td>
      <td>${i.username}</td>
      <td><strong>${i.nroSerie || '—'}</strong></td>
      <td><span style="color:${estadoColor(i.estado)};font-weight:600">${i.estado || '—'}</span></td>
      <td>${i.fechaVencimiento || '—'}</td>
      <td class="obs">${i.observaciones || '—'}</td>
    </tr>`).join('')
}

function buildPdaRows(items: any[]): string {
  return items.map(i => `
    <tr>
      <td>${i.delegacion}</td>
      <td>${i.username}</td>
      <td><span style="color:${estadoColor(i.estado)};font-weight:600">${i.estado || '—'}</span></td>
      <td>${i.marca || ''} ${i.modelo || ''}</td>
      <td>${i.nroSistemas || '—'}</td>
      <td>${i.nroLinea || '—'}</td>
      <td>${i.empresa || '—'}</td>
      <td>${i.asignadaA || '—'}</td>
      <td class="obs">${i.observaciones || '—'}</td>
    </tr>`).join('')
}

function buildInfRows(items: any[]): string {
  return items.map(i => `
    <tr>
      <td>${i.delegacion}</td>
      <td>${i.username}</td>
      <td><strong>${i.dispositivo || '—'}</strong></td>
      <td><span style="color:${estadoColor(i.estado)};font-weight:600">${i.estado || '—'}</span></td>
      <td>${i.marca || ''} ${i.modelo || ''}</td>
      <td>${i.nroSistemas || '—'}</td>
      <td class="obs">${i.observaciones || '—'}</td>
    </tr>`).join('')
}

function section(tipo: TipoItem, items: any[], filterDelegacion: string): string {
  const filtered = filterDelegacion ? items.filter(i => i.delegacion === filterDelegacion) : items
  const typeItems = filtered.filter(i => i.tipo === tipo)
  if (typeItems.length === 0) return ''

  const icons: Record<TipoItem, string> = {
    movil: '🚗', alcoholimetro: '🔬', pda_celular: '📱', informatica: '💻',
  }

  let thead = ''
  let tbody = ''

  if (tipo === 'movil') {
    thead = '<tr><th>Delegación</th><th>Usuario</th><th>Dominio</th><th>Marca/Modelo</th><th>Año</th><th>Km</th><th>Estado</th><th>Mat.</th><th>RTO</th><th>Observaciones</th></tr>'
    tbody = buildMovilRows(typeItems)
  } else if (tipo === 'alcoholimetro') {
    thead = '<tr><th>Delegación</th><th>Usuario</th><th>N° Serie</th><th>Estado</th><th>Vencimiento</th><th>Observaciones</th></tr>'
    tbody = buildAlcoRows(typeItems)
  } else if (tipo === 'pda_celular') {
    thead = '<tr><th>Delegación</th><th>Usuario</th><th>Estado</th><th>Marca/Modelo</th><th>N° Sistemas</th><th>N° Línea</th><th>Empresa</th><th>Asignada a</th><th>Observaciones</th></tr>'
    tbody = buildPdaRows(typeItems)
  } else {
    thead = '<tr><th>Delegación</th><th>Usuario</th><th>Dispositivo</th><th>Estado</th><th>Marca/Modelo</th><th>N° Sistemas</th><th>Observaciones</th></tr>'
    tbody = buildInfRows(typeItems)
  }

  return `
    <div class="section">
      <div class="section-header">
        <span class="section-icon">${icons[tipo]}</span>
        <h2>${LABEL[tipo]}</h2>
        <span class="section-count">${typeItems.length} elemento${typeItems.length !== 1 ? 's' : ''}</span>
      </div>
      <table>
        <thead>${thead}</thead>
        <tbody>${tbody}</tbody>
      </table>
    </div>`
}

export function exportToPDF(allItems: any[], filterDelegacion: string, date: string) {
  const title = filterDelegacion
    ? `Inventario — ${filterDelegacion}`
    : 'Inventario General — Todas las Delegaciones'

  const tipos: TipoItem[] = ['movil', 'alcoholimetro', 'pda_celular', 'informatica']
  const totalItems = filterDelegacion
    ? allItems.filter(i => i.delegacion === filterDelegacion).length
    : allItems.length

  const summaryRows = tipos.map(t => {
    const count = filterDelegacion
      ? allItems.filter(i => i.tipo === t && i.delegacion === filterDelegacion).length
      : allItems.filter(i => i.tipo === t).length
    const icons: Record<TipoItem, string> = { movil: '🚗', alcoholimetro: '🔬', pda_celular: '📱', informatica: '💻' }
    return `<div class="summary-card"><div class="sum-icon">${icons[t]}</div><div class="sum-count">${count}</div><div class="sum-label">${LABEL[t]}</div></div>`
  }).join('')

  const sectionsHTML = tipos.map(t => section(t, allItems, filterDelegacion)).join('')

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>${title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'IBM Plex Sans', sans-serif; color: #1e3a8a; background: white; font-size: 11px; }

  /* Header */
  .header { background: linear-gradient(135deg, #172554 0%, #1e40af 100%); color: white; padding: 20px 32px; display: flex; align-items: center; justify-content: space-between; }
  .header-logo img { height: 40px; width: auto; }
  .header-left h1 { font-size: 18px; font-weight: 700; margin: 6px 0 2px; }
  .header-left p  { font-size: 11px; opacity: 0.7; }
  .header-right   { text-align: right; font-size: 11px; opacity: 0.8; line-height: 1.6; }

  /* Summary */
  .summary { display: flex; gap: 16px; padding: 20px 32px; background: #eff6ff; border-bottom: 1px solid #dbeafe; }
  .summary-card { flex: 1; background: white; border: 1px solid #dbeafe; border-radius: 10px; padding: 12px; text-align: center; }
  .sum-icon { font-size: 22px; margin-bottom: 4px; }
  .sum-count { font-size: 22px; font-weight: 700; color: #1e40af; line-height: 1; }
  .sum-label { font-size: 9px; color: #60a5fa; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }

  /* Content */
  .content { padding: 24px 32px; }

  /* Section */
  .section { margin-bottom: 32px; }
  .section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 2px solid #2563eb; }
  .section-icon { font-size: 18px; }
  .section-header h2 { font-size: 14px; font-weight: 700; color: #1e3a8a; flex: 1; }
  .section-count { font-size: 10px; background: #dbeafe; color: #1d4ed8; padding: 2px 8px; border-radius: 20px; font-weight: 600; }

  /* Table */
  table { width: 100%; border-collapse: collapse; }
  thead tr { background: #1e3a8a; color: white; }
  thead th { padding: 7px 8px; text-align: left; font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; }
  tbody tr:nth-child(even) { background: #f8fbff; }
  tbody tr:hover { background: #eff6ff; }
  tbody td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; color: #1e3a8a; vertical-align: top; }
  .obs { max-width: 120px; color: #64748b !important; font-size: 10px; }

  /* Footer */
  .footer { margin-top: 32px; padding: 16px 32px; border-top: 1px solid #dbeafe; display: flex; justify-content: space-between; font-size: 10px; color: #93c5fd; }

  /* Print */
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .section { page-break-inside: avoid; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <div class="header-logo"><img src="${LOGO_CNRT_B64}" alt="CNRT" /></div>
      <h1>${title}</h1>
      <p>Sistema de Inventario Institucional</p>
    </div>
    <div class="header-right">
      <div>Fecha: ${date}</div>
      <div>Total de elementos: <strong>${totalItems}</strong></div>
      ${filterDelegacion ? `<div>Delegación: <strong>${filterDelegacion}</strong></div>` : '<div>Todas las delegaciones</div>'}
    </div>
  </div>

  <div class="summary">${summaryRows}</div>

  <div class="content">
    ${sectionsHTML || '<p style="color:#93c5fd;padding:20px 0">Sin elementos registrados.</p>'}
  </div>

  <div class="footer">
    <span>CNRT — Control del Transporte</span>
    <span>Generado el ${date}</span>
  </div>

  <script>window.onload = function(){ window.print(); }<\/script>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (win) win.focus()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
