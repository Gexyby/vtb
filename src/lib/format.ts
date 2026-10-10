export function money(value: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(isoDate: string) {
  if (!isoDate) return '—'
  const d = new Date(isoDate.includes('T') ? isoDate : `${isoDate}T12:00:00`)
  if (Number.isNaN(d.getTime())) return isoDate
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

export function formatDateTime(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatShortDate(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00`)
  if (Number.isNaN(d.getTime())) return isoDate
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
  }).format(d)
}

export function todayISO() {
  const d = new Date()
  const z = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`
}

export function addMonthsISO(from: Date, months: number) {
  const d = new Date(from)
  d.setMonth(d.getMonth() + months)
  return d.toISOString()
}

export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function planDateTime(date: string, time: string) {
  return new Date(`${date}T${time || '00:00'}:00`)
}

export function isPastPlan(date: string, time: string) {
  const dt = planDateTime(date, time)
  if (Number.isNaN(dt.getTime())) return false
  return dt.getTime() < Date.now()
}

export function fullName(first: string, last: string) {
  return `${first} ${last}`.trim() || 'Клиент SafeDay'
}

export function daysUntil(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00`)
  const now = new Date()
  const a = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
  const b = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.round((a - b) / 86400000)
}
