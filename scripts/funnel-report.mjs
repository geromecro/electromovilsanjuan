import fs from 'node:fs'
import path from 'node:path'

const defaultCsv = path.resolve(process.cwd(), 'seo-tracking/funnel-semanal.csv')
const csvPath = process.argv[2] ? path.resolve(process.cwd(), process.argv[2]) : defaultCsv

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map((h) => h.trim())
  return lines.slice(1).filter(Boolean).map((line) => {
    const cols = line.split(',').map((c) => c.trim())
    const row = {}
    headers.forEach((header, i) => { row[header] = cols[i] || '' })
    return row
  })
}

function toNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function pct(numerator, denominator) {
  if (!denominator) return 0
  return (numerator / denominator) * 100
}

function formatPct(value) {
  return `${value.toFixed(1)}%`
}

function printAlerts(row) {
  const alerts = []

  const adsClicks = toNumber(row.ads_clicks)
  const waStarted = toNumber(row.wa_iniciados)
  const waQualified = toNumber(row.wa_calificados)
  const visits = toNumber(row.visitas_local)
  const sales = toNumber(row.ventas)
  const reviews = toNumber(row.resenas_obtenidas)

  const waRate = pct(waStarted, adsClicks)
  const qualifyRate = pct(waQualified, waStarted)
  const closeRate = pct(sales, visits)
  const reviewRate = pct(reviews, sales)

  if (waRate < 8) alerts.push('WA iniciado bajo: revisar keywords negativas y copy del anuncio.')
  if (qualifyRate < 50) alerts.push('Calificación baja: ajustar guion inicial en WhatsApp.')
  if (closeRate < 35) alerts.push('Cierre bajo en local: revisar oferta, objeciones y tiempos de atención.')
  if (reviewRate < 40) alerts.push('Pocas reseñas: pedir reseña en el mismo día de la venta.')

  if (!alerts.length) {
    console.log('\nAlertas: OK (sin alertas críticas esta semana).')
    return
  }

  console.log('\nAlertas:')
  alerts.forEach((alert) => console.log(`- ${alert}`))
}

if (!fs.existsSync(csvPath)) {
  console.error(`No se encontró el archivo: ${csvPath}`)
  process.exit(1)
}

const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'))
if (!rows.length) {
  console.error('No hay filas de datos en el CSV.')
  process.exit(1)
}

console.log(`\nReporte de embudo: ${path.relative(process.cwd(), csvPath)}\n`)
console.log('Semana | Ads->WA | WA calificado | Visita->Venta | Reseñas/Ventas')
console.log('------ | ------- | ------------ | ------------ | --------------')

rows.forEach((row) => {
  const adsClicks = toNumber(row.ads_clicks)
  const waStarted = toNumber(row.wa_iniciados)
  const waQualified = toNumber(row.wa_calificados)
  const visits = toNumber(row.visitas_local)
  const sales = toNumber(row.ventas)
  const reviews = toNumber(row.resenas_obtenidas)

  const adsToWa = pct(waStarted, adsClicks)
  const waQualify = pct(waQualified, waStarted)
  const visitToSale = pct(sales, visits)
  const reviewToSale = pct(reviews, sales)

  console.log(
    `${row.semana} | ${formatPct(adsToWa)} | ${formatPct(waQualify)} | ${formatPct(visitToSale)} | ${formatPct(reviewToSale)}`
  )
})

printAlerts(rows[rows.length - 1])
