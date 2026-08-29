import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '../api/client'
import { Modal } from '../components/Modal'
import { ContractForm } from '../components/ContractForm'
import type { Contract } from '../types/contract'
import type { Room } from '../types/room'

const STATUS_LABEL: Record<'A' | 'B', string> = { A: 'Активный', B: 'Закрыт' }

export function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[] | null>(null)
  const [rooms, setRooms] = useState<Room[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [onlyActive, setOnlyActive] = useState(true)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Contract | 'new' | null>(null)

  const loadContracts = () =>
    apiClient
      .get<Contract[]>('/api/rent/contracts/')
      .then((res) => setContracts(res.data))
      .catch(() => setError('Не удалось загрузить договоры'))

  useEffect(() => {
    loadContracts()
    apiClient
      .get<Room[]>('/api/rent/rooms/')
      .then((res) => setRooms(res.data))
      .catch(() => setError('Не удалось загрузить помещения'))
  }, [])

  const handleSave = async (payload: Record<string, unknown>) => {
    if (editing === 'new') {
      await apiClient.post('/api/rent/contracts/', payload)
    } else if (editing) {
      await apiClient.patch(`/api/rent/contracts/${editing.number}/`, payload)
    }
    setEditing(null)
    loadContracts()
  }

  const q = search.trim().toLowerCase()
  const visibleContracts =
    contracts?.filter((c) => {
      if (onlyActive && c.status !== 'A') return false
      if (!q) return true
      return c.room.toLowerCase().includes(q) || (c.contact_name ?? '').toLowerCase().includes(q)
    }) ?? null

  return (
    <div className="page">
      <div className="page-toolbar">
        <input
          className="search-input"
          placeholder="Поиск по комнате или фамилии…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <label className="checkbox-label">
          <input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />
          Только активные
        </label>
        <button onClick={() => setEditing('new')} disabled={!rooms || rooms.length === 0}>
          + Добавить договор
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {visibleContracts === null && <p>Загрузка…</p>}
      {visibleContracts !== null && visibleContracts.length === 0 && <p>Ничего не найдено.</p>}

      {visibleContracts !== null && visibleContracts.length > 0 && (
        <div className="summary-table-wrap">
          <table className="summary-table">
            <thead>
              <tr>
                <th>№</th>
                <th>Помещение</th>
                <th>Клиент</th>
                <th>Цена</th>
                <th>Заезд</th>
                <th>Окончание</th>
                <th>Статус</th>
                <th>Оплаты</th>
              </tr>
            </thead>
            <tbody>
              {visibleContracts.map((c) => (
                <tr key={c.number} className="clickable-row" onClick={() => setEditing(c)}>
                  <td>{c.number}</td>
                  <td className="room-name">{c.room}</td>
                  <td>{c.contact_name || '—'}</td>
                  <td>{c.price.toLocaleString('ru-RU')}</td>
                  <td>{c.date_begin}</td>
                  <td>{c.date_end}</td>
                  <td>
                    <span className={`status-badge ${c.status === 'A' ? 'room_no_debt' : 'room_vacant'}`}>
                      {STATUS_LABEL[c.status]}
                    </span>
                  </td>
                  <td>
                    <Link
                      to={`/payments?room=${encodeURIComponent(c.room)}`}
                      className="table-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Оплаты →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && rooms && (
        <Modal title={editing === 'new' ? 'Новый договор' : 'Редактирование договора'} onClose={() => setEditing(null)}>
          <ContractForm
            initialValues={editing === 'new' ? null : editing}
            rooms={rooms}
            onSubmit={handleSave}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  )
}
