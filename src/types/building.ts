export type Building = {
  id: number
  name: string
  address1: string | null
  address2: string | null
  zip: string | null
  notes: string | null
  status: 'A' | 'B'
}

export type BuildingFormValues = Omit<Building, 'id'>

export const EMPTY_BUILDING: BuildingFormValues = {
  name: '',
  address1: '',
  address2: '',
  zip: '',
  notes: '',
  status: 'A',
}
