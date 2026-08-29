export type Payment = {
  room: string
  date: string
  amount: number
  discount: number
  total: number
  bank_account: string | null
  book_account: string | null
}

export type RoomPaymentsResponse = {
  contract: {
    number: string
    room: string
    price: number
    discount: number
  }
  payments: Payment[]
  bank_accounts: unknown[]
}

export type FieldSuggestions = {
  bank_accounts: string[]
  book_accounts: string[]
}

export type PaginatedPayments = {
  count: number
  next: string | null
  previous: string | null
  results: Payment[]
}
