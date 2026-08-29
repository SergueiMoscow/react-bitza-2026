export type LatestReading = {
  shortname: string
  name: string
  date: string | null
  kwt_count: string
}

export type RoomConsumption = {
  room: string
  consumption: number
  color: string
}

export type ConsumptionResponse = {
  date_begin: string
  date_end: string
  results: RoomConsumption[]
}

export const today = () => new Date().toISOString().slice(0, 10)

export function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().slice(0, 10)
}
