import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { apiClient } from '../api/client'
import { AllPaymentsView } from '../components/AllPaymentsView'
import type { Room } from '../types/room'
import type { FieldSuggestions, RoomPaymentsResponse } from '../types/payment'

const today = () => new Date().toISOString().slice(0, 10)

export function PaymentsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const roomFromUrl = searchParams.get('room')

  const [rooms, setRooms] = useState<Room[] | null>(null)
  const [suggestions, setSuggestions] = useState<FieldSuggestions | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<string>(roomFromUrl ?? '')
  const [data, setData] = useState<RoomPaymentsResponse | null>(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)

  const [date, setDate] = useState(today())
  const [amount, setAmount] = useState<number | ''>('')
  const [discount, setDiscount] = useState<number>(0)
  const [bankAccount, setBankAccount] = useState('')
  const [saving, setSaving] = useState(false)

  const total = amount === '' ? 0 : amount - discount

  useEffect(() => {
    apiClient.get<Room[]>('/api/rent/rooms/').then((res) => {
      const active = res.data.filter((r) => r.status === 'A').sort((a, b) => a.shortname.localeCompare(b.shortname))
      setRooms(active)
      // Без явной комнаты в ссылке (переход из меню) — открываем список всех оплат, без фильтра.
    })
    apiClient.get<FieldSuggestions>('/api/rent/payments/field-suggestions/').then((res) => setSuggestions(res.data))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRoomChange = (room: string) => {
    setSelectedRoom(room)
    setPage(1)
    setSearchParams(room ? { room } : {}, { replace: true })
  }

  const loadPayments = (room: string, pageNumber: number) => {
    if (!room) return
    setData(null)
    setError(null)
    apiClient
      .get<RoomPaymentsResponse>(`/api/rent/rooms/${room}/payments/`, { params: { page: pageNumber } })
      .then((res) => setData(res.data))
      .catch(() => setError('Не удалось загрузить оплаты'))
  }

  useEffect(() => {
    if (selectedRoom) {
      loadPayments(selectedRoom, page)
    } else {
      setData(null)
      setError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom, page])

  const handleSubmit = async () => {
    if (!selectedRoom || amount === '') return
    setSaving(true)
    setError(null)
    try {
      await apiClient.post(`/api/rent/rooms/${selectedRoom}/payments/`, {
        date,
        amount,
        discount,
        bank_account: bankAccount || null,
        // Оплаты этой формой — всегда аренда, статья не спрашивается у пользователя.
        book_account: 'Приход',
      })
      setAmount('')
      setDiscount(0)
      setPage(1)
      loadPayments(selectedRoom, 1)
    } catch {
      setError('Не удалось сохранить оплату — проверьте поля')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <div className="page-toolbar">
        <label className="field-narrow" style={{ flex: '0 0 180px' }}>
          Помещение
          <select value={selectedRoom} onChange={(e) => handleRoomChange(e.target.value)}>
            <option value="">— Все оплаты —</option>
            {selectedRoom && !rooms?.some((r) => r.shortname === selectedRoom) && (
              <option value={selectedRoom}>{selectedRoom}</option>
            )}
            {rooms?.map((r) => (
              <option key={r.shortname} value={r.shortname}>
                {r.shortname}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!selectedRoom && <AllPaymentsView />}

      {error && <p className="error">{error}</p>}

      {data && !data.contract && (
        <p className="hint-text">Для этого помещения нет активного договора — оплату внести нельзя.</p>
      )}

      {data && (
        <>
          {data.contract && (
            <p className="hint-text">
              Договор {data.contract.number} — цена {data.contract.price.toLocaleString('ru-RU')} ₽
              {data.contract.discount ? `, скидка ${data.contract.discount.toLocaleString('ru-RU')} ₽` : ''}
            </p>
          )}

          <div className="summary-table-wrap" style={{ marginBottom: '1rem' }}>
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Клиент</th>
                  <th>Сумма</th>
                  <th>Скидка</th>
                  <th>Итого</th>
                  <th>Счёт</th>
                  <th>Статья</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.results.length === 0 && (
                  <tr>
                    <td colSpan={7}>Пока нет оплат.</td>
                  </tr>
                )}
                {data.payments.results.map((p, i) => (
                  <tr key={i}>
                    <td>{p.date}</td>
                    <td>{p.contact_name || '—'}</td>
                    <td>{p.amount.toLocaleString('ru-RU')}</td>
                    <td>{p.discount ? p.discount.toLocaleString('ru-RU') : '—'}</td>
                    <td>{p.total.toLocaleString('ru-RU')}</td>
                    <td>{p.bank_account || '—'}</td>
                    <td>{p.book_account || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(data.payments.previous || data.payments.next) && (
            <div className="pagination">
              <button disabled={!data.payments.previous} onClick={() => setPage((p) => p - 1)}>
                ← Назад
              </button>
              <span className="hint-text">Всего: {data.payments.count}</span>
              <button disabled={!data.payments.next} onClick={() => setPage((p) => p + 1)}>
                Вперёд →
              </button>
            </div>
          )}

          {data.contract && (
            <div className="payment-form">
              <div className="payment-form-title">Новая оплата</div>
              <div className="payment-form-grid">
                <label className="payment-field">
                  <span>Дата</span>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </label>
                <label className="payment-field">
                  <span>Сумма</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  />
                </label>
                <label className="payment-field">
                  <span>Скидка</span>
                  <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
                </label>
                <div className="payment-field payment-total">
                  <span>Итого</span>
                  <strong>{total.toLocaleString('ru-RU')} ₽</strong>
                </div>
                <label className="payment-field payment-field-wide">
                  <span>Счёт</span>
                  <input
                    list="bank-account-suggestions"
                    placeholder="Cash, Сбер, Тинькофф…"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                  />
                  <datalist id="bank-account-suggestions">
                    {suggestions?.bank_accounts.map((v) => <option key={v} value={v} />)}
                  </datalist>
                </label>
              </div>
              <button
                type="button"
                className="payment-submit"
                onClick={handleSubmit}
                disabled={saving || amount === ''}
              >
                {saving ? 'Сохраняем…' : 'Добавить оплату'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
