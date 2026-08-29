import { useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import { Modal } from '../components/Modal'
import { ContactForm } from '../components/ContactForm'
import {
  EMPTY_CONTACT,
  contactToFormValues,
  toPayload,
  type Contact,
  type ContactFormValues,
} from '../types/contact'

export function ClientsPage() {
  const [contacts, setContacts] = useState<Contact[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Contact | 'new' | null>(null)

  const load = (q: string) => {
    apiClient
      .get<Contact[]>('/api/rent/contacts/', { params: q ? { q } : {} })
      .then((res) => setContacts(res.data))
      .catch(() => setError('Не удалось загрузить клиентов'))
  }

  useEffect(() => {
    const timeout = setTimeout(() => load(search), 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const handleSave = async (values: ContactFormValues) => {
    if (editing === 'new') {
      await apiClient.post('/api/rent/contacts/', toPayload(values))
    } else if (editing) {
      await apiClient.patch(`/api/rent/contacts/${editing.id}/`, toPayload(values))
    }
    setEditing(null)
    load(search)
  }

  return (
    <div className="page">
      <div className="page-toolbar">
        <input
          className="search-input"
          placeholder="Поиск по имени или фамилии…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => setEditing('new')}>+ Добавить клиента</button>
      </div>

      {error && <p className="error">{error}</p>}
      {contacts === null && !error && <p>Загрузка…</p>}
      {contacts !== null && contacts.length === 0 && <p>Ничего не найдено.</p>}

      {contacts !== null && contacts.length > 0 && (
        <div className="summary-table-wrap">
          <table className="summary-table">
            <thead>
              <tr>
                <th>Фамилия</th>
                <th>Имя</th>
                <th>Телефон</th>
                <th>Email</th>
                <th>Город</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="clickable-row" onClick={() => setEditing(c)}>
                  <td className="room-name">{c.surname || '—'}</td>
                  <td>{c.name || '—'}</td>
                  <td>{c.phone || '—'}</td>
                  <td>{c.email || '—'}</td>
                  <td>{c.city || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal
          title={editing === 'new' ? 'Новый клиент' : 'Редактирование клиента'}
          onClose={() => setEditing(null)}
        >
          <ContactForm
            initialValues={editing === 'new' ? EMPTY_CONTACT : contactToFormValues(editing)}
            contactId={editing === 'new' ? undefined : editing.id}
            onSubmit={handleSave}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  )
}
