import { useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import type { Contact } from '../types/contact'

type ContactPickerProps = {
  value: number | null
  valueLabel?: string | null
  onChange: (id: number | null, label: string | null) => void
}

export function ContactPicker({ value, valueLabel, onChange }: ContactPickerProps) {
  const [editing, setEditing] = useState(!value)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Contact[]>([])

  useEffect(() => {
    if (!editing) return
    const timeout = setTimeout(() => {
      if (!query) {
        setResults([])
        return
      }
      apiClient
        .get<Contact[]>('/api/rent/contacts/', { params: { q: query } })
        .then((res) => setResults(res.data.slice(0, 15)))
        .catch(() => setResults([]))
    }, 250)
    return () => clearTimeout(timeout)
  }, [query, editing])

  if (!editing && value) {
    return (
      <div className="contact-picker-selected">
        <span>{valueLabel || `Клиент #${value}`}</span>
        <button type="button" className="button-secondary" onClick={() => setEditing(true)}>
          Изменить
        </button>
      </div>
    )
  }

  return (
    <div className="contact-picker">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Начните вводить фамилию или имя…"
        autoFocus
      />
      {results.length > 0 && (
        <div className="contact-picker-results">
          {results.map((c) => (
            <button
              type="button"
              key={c.id}
              className="contact-picker-item"
              onClick={() => {
                onChange(c.id, `${c.surname || ''} ${c.name || ''}`.trim() || `Клиент #${c.id}`)
                setEditing(false)
                setQuery('')
                setResults([])
              }}
            >
              {c.surname} {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
