import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '../api/client'

type RoomDebt = {
  name: string
  debt_month: string
  debt_rur: string
  html_class: 'room_vacant' | 'room_no_debt' | 'room_little_debt' | 'room_big_debt'
  date_begin: string | null
  price: number | null
  last_payment_date: string | null
}

const STATUS_LABEL: Record<RoomDebt['html_class'], string> = {
  room_vacant: 'свободна',
  room_no_debt: 'оплачено',
  room_little_debt: 'небольшой долг',
  room_big_debt: 'долг',
}

function formatDate(value: string | null): string {
  if (!value) return '—'
  // ISO (YYYY-MM-DD) из last_payment_date -> DD.MM.YYYY, для единообразия с date_begin
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (isoMatch) {
    const [, y, m, d] = isoMatch
    return `${d}.${m}.${y}`
  }
  return value
}

export function SummaryPage() {
  const [rooms, setRooms] = useState<RoomDebt[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiClient
      .get<RoomDebt[]>('/api/rent/summary/')
      .then((res) => setRooms(res.data))
      .catch(() => setError('Не удалось загрузить сводку'))
  }, [])

  if (error) return <p className="error">{error}</p>
  if (rooms === null) return <p>Загрузка…</p>
  if (rooms.length === 0) return <p>Нет активных комнат — база пустая.</p>

  return (
    <div className="summary-table-wrap">
      <table className="summary-table">
        <thead>
          <tr>
            <th>Комната</th>
            <th>Статус</th>
            <th>Дата заезда</th>
            <th>Цена</th>
            <th>Последняя оплата</th>
            <th>Долг, мес.</th>
            <th>Долг, ₽</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.name} className={room.html_class}>
              <td className="room-name">
                {room.html_class === 'room_vacant' ? (
                  room.name
                ) : (
                  <Link to={`/payments?room=${encodeURIComponent(room.name)}`} className="table-link">
                    {room.name}
                  </Link>
                )}
              </td>
              <td>
                <span className={`status-badge ${room.html_class}`}>
                  {STATUS_LABEL[room.html_class]}
                </span>
              </td>
              <td>{formatDate(room.date_begin)}</td>
              <td>{typeof room.price === 'number' ? room.price.toLocaleString('ru-RU') : '—'}</td>
              <td>{formatDate(room.last_payment_date)}</td>
              <td>{room.html_class === 'room_vacant' ? '—' : room.debt_month}</td>
              <td>
                {room.html_class === 'room_vacant'
                  ? '—'
                  : Math.round(Number(room.debt_rur)).toLocaleString('ru-RU')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
