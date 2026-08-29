export type Contact = {
  id: number
  surname: string | null
  name: string | null
  birth_date: string | null
  birth_place: string | null
  gender: 'M' | 'F' | null
  document_name: string | null
  doc_series: string | null
  doc_number: string | null
  doc_date: string | null
  doc_issued: string | null
  address1: string | null
  address2: string | null
  city: string | null
  country: string | null
  email: string | null
  phone: string | null
  notes: string | null
}

export type ContactFormValues = Omit<Contact, 'id'>

export const EMPTY_CONTACT: ContactFormValues = {
  surname: '',
  name: '',
  birth_date: '',
  birth_place: '',
  gender: 'M',
  document_name: '',
  doc_series: '',
  doc_number: '',
  doc_date: '',
  doc_issued: '',
  address1: '',
  address2: '',
  city: '',
  country: '',
  email: '',
  phone: '',
  notes: '',
}

const NULLABLE_KEYS: (keyof ContactFormValues)[] = [
  'surname', 'name', 'birth_date', 'birth_place', 'document_name', 'doc_series',
  'doc_number', 'doc_date', 'doc_issued', 'address1', 'address2', 'city', 'country',
  'email', 'phone', 'notes',
]

// DRF-поля даты/строк не принимают '' как null — переводим пустые строки в null перед отправкой.
export function toPayload(values: ContactFormValues): Record<string, unknown> {
  const payload: Record<string, unknown> = { ...values }
  for (const key of NULLABLE_KEYS) {
    if (payload[key] === '') {
      payload[key] = null
    }
  }
  return payload
}

export function contactToFormValues(contact: Contact): ContactFormValues {
  const { id: _id, ...rest } = contact
  const values = { ...rest } as ContactFormValues
  for (const key of NULLABLE_KEYS) {
    if (values[key] === null) {
      // @ts-expect-error -- сужаем null до '' для controlled input
      values[key] = ''
    }
  }
  return values
}
