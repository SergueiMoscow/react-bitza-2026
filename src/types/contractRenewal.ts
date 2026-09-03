export type ContractPrint = {
  id: number
  contract: string
  date: string
  form: number | null
  created_at: string
  updated_at: string
}

export type ContractRenewalStatus = 'Активный' | 'Завершается' | 'Просрочен'

export type ContractRenewalEntry = {
  number: string
  status: 'A' | 'B'
  date_begin: string
  latest_prints: ContractPrint[]
  status_description: ContractRenewalStatus
  contact: { surname: string | null; name: string | null }
  room: string
  recommended_contract_date: string | null
}
