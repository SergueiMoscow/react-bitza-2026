export type Payment = {
  room: string
  date: string
  amount: number
  discount: number
  total: number
  bank_account: string | null
  book_account: string | null
}

export type RoomPayment = Payment & {
  contact_name: string | null
}

export type RoomPaymentsResponse = {
  contract: {
    number: string
    room: string
    price: number
    discount: number
  } | null
  payments: PaginatedPayments<RoomPayment>
}

export type FieldSuggestions = {
  bank_accounts: string[]
  book_accounts: string[]
}

export type PaginatedPayments<T = Payment> = {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
