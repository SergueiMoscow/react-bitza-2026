export type GasRecord = {
  id: number
  message_id: number
  date: string | null
  gas_taken_date: string | null
  quantity: number | null
  capacity: number | null
  room: string | null
  payment_date: string | null
  amount: number | null
  receiver: string | null
  comments: string | null
  linked_record: number | null
  sender_user_id: number | null
  sender_name: string | null
}

export type GasRecordFormValues = Omit<GasRecord, 'id' | 'message_id'>

export const EMPTY_GAS_RECORD: GasRecordFormValues = {
  date: null,
  gas_taken_date: new Date().toISOString().slice(0, 10),
  quantity: 1,
  capacity: 27,
  room: '',
  payment_date: null,
  amount: null,
  receiver: null,
  comments: null,
  linked_record: null,
  sender_user_id: null,
  sender_name: null,
}
