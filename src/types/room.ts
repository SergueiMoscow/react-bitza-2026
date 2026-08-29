export type CounterType = 'N' | 'M' | 'A'

export const COUNTER_TYPE_LABEL: Record<CounterType, string> = {
  N: 'Нет',
  M: 'Ручной',
  A: 'Автоматический',
}

export type Room = {
  shortname: string
  name: string
  building: number | null
  floor: number | null
  square: string | null
  price1: number | null
  price2: number | null
  description: string | null
  status: 'A' | 'B'
  type_watt_counter: CounterType
  type_hot_water_counter: CounterType
  type_cold_water_counter: CounterType
}

export type RoomFormValues = Room

export function toRoomPayload(values: RoomFormValues): Record<string, unknown> {
  return {
    ...values,
    square: values.square === '' ? null : values.square,
    description: values.description === '' ? null : values.description,
  }
}

export function emptyRoom(buildingId: number | null): RoomFormValues {
  return {
    shortname: '',
    name: '',
    building: buildingId,
    floor: null,
    square: null,
    price1: null,
    price2: null,
    description: null,
    status: 'A',
    type_watt_counter: 'N',
    type_hot_water_counter: 'N',
    type_cold_water_counter: 'N',
  }
}
