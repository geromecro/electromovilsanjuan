import fs from 'node:fs'
import path from 'node:path'

const defaultCsv = path.resolve(process.cwd(), 'seo-tracking/postventa-clientes.csv')
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

function normalizePhone(rawPhone) {
  const digits = (rawPhone || '').replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('549')) return digits
  if (digits.startsWith('54')) return `9${digits}`
  if (digits.startsWith('0')) return `549${digits.slice(1)}`
  return `549${digits}`
}

function isDue(dateString) {
  if (!dateString) return false
  const today = new Date()
  const date = new Date(`${dateString}T00:00:00`)
  if (Number.isNaN(date.getTime())) return false
  return date <= new Date(today.getFullYear(), today.getMonth(), today.getDate())
}

function buildMessage(row) {
  const cliente = row.cliente || '¿cómo estás?'
  const producto = row.producto || 'el producto'
  const resenaLink = row.resena_link || 'COMPARTIR_LINK_RESEÑA'
  return `Hola ${cliente}, soy de Electromóvil San Juan. ¿Cómo te fue con ${producto}? Si todo está bien, ¿nos dejás una reseña? ${resenaLink}`
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

const dueRows = rows.filter((row) => {
  const estado = (row.estado || '').toLowerCase()
  return estado !== 'cerrado' && isDue(row.proximo_contacto)
})

console.log(`\nSeguimientos postventa pendientes: ${dueRows.length}\n`)

if (!dueRows.length) {
  console.log('No hay seguimientos pendientes para hoy.')
  process.exit(0)
}

dueRows.forEach((row, index) => {
  const phone = normalizePhone(row.telefono)
  const text = buildMessage(row)
  const url = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
    : '(telefono invalido)'

  console.log(`${index + 1}. ${row.cliente || 'Cliente sin nombre'} | ${row.producto || '-'} | ${row.proximo_contacto || '-'}`)
  console.log(`   WhatsApp: ${url}`)
})
