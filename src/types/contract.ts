export type Contract = {
  number: string
  date_begin: string
  date_end: string
  room: string
  pay_day: number
  price: number
  deposit: number
  discount: number
  contact: number | null
  contact_name?: string | null
  status: 'A' | 'B'
  close_date: string | null
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export function diffDays(fromIso: string, toIso: string): number {
  const from = new Date(fromIso + 'T00:00:00')
  const to = new Date(toIso + 'T00:00:00')
  return Math.round((to.getTime() - from.getTime()) / 86400000)
}

export const DEFAULT_CONTRACT_DURATION_DAYS = 90
