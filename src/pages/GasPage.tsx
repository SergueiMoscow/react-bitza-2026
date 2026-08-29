import { useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import { Modal } from '../components/Modal'
import { GasForm } from '../components/GasForm'
import type { Room } from '../types/room'
import type { GasRecord, GasRecordFormValues } from '../types/gas'
import { EMPTY_GAS_RECORD } from '../types/gas'

function formatDate(value: string | null): string {
  if (!value) return '—'
  return value.slice(0, 10)
}

export function GasPage() {
  const [records, setRecords] = useState<GasRecord[] | null>(null)
  const [rooms, setRooms] = useState<Room[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<GasRecord | 'new' | null>(null)

  const loadRecords = () =>
    apiClient
      .get<GasRecord[]>('/api/gas/records/')
      .then((res) => setRecords(res.data))
      .catch(() => setError('Не удалось загрузить записи по газу'))

  useEffect(() => {
    loadRecords()
    apiClient.get<Room[]>('/api/rent/rooms/').then((res) => setRooms(res.data))
  }, [])

  const handleSave = async (values: GasRecordFormValues) => {
    if (editing === 'new') {
      await apiClient.post('/api/gas/records/', values)
    } else if (editing) {
      await apiClient.patch(`/api/gas/records/${editing.id}/`, values)
    }
    setEditing(null)
    loadRecords()
  }

  return (
    <div className="page">
      <div className="page-toolbar">
        <div />
        <button onClick={() => setEditing('new')}>+ Добавить запись</button>
      </div>

      {error && <p className="error">{error}</p>}
      {records === null && <p>Загрузка…</p>}
      {records !== null && records.length === 0 && <p>Пока нет записей.</p>}

      {records !== null && records.length > 0 && (
        <div className="summary-table-wrap">
          <table className="summary-table">
            <thead>
              <tr>
                <th>Комната</th>
                <th>Баллонов</th>
                <th>Взято</th>
                <th>Оплачено</th>
                <th>Сумма</th>
                <th>Принял</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="clickable-row" onClick={() => setEditing(r)}>
                  <td className="room-name">{r.room || '—'}</td>
                  <td>{r.quantity ?? '—'}</td>
                  <td>{formatDate(r.gas_taken_date)}</td>
                  <td>{formatDate(r.payment_date)}</td>
                  <td>{r.amount !== null ? r.amount.toLocaleString('ru-RU') : '—'}</td>
                  <td>{r.receiver || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && rooms && (
        <Modal title={editing === 'new' ? 'Новая запись по газу' : 'Редактирование записи'} onClose={() => setEditing(null)}>
          <GasForm
            initialValues={editing === 'new' ? EMPTY_GAS_RECORD : editing}
            rooms={rooms}
            onSubmit={handleSave}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}
    </div>
  )
}
