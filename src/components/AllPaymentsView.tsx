import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '../api/client'
import type { PaginatedPayments } from '../types/payment'

export function AllPaymentsView() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState<PaginatedPayments | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setData(null)
      setError(null)
      apiClient
        .get<PaginatedPayments>('/api/rent/payments/', { params: { page, q: search || undefined } })
        .then((res) => setData(res.data))
        .catch(() => setError('Не удалось загрузить оплаты'))
    }, 250)
    return () => clearTimeout(timeout)
  }, [search, page])

  // сброс на первую страницу при новом поиске
  useEffect(() => {
    setPage(1)
  }, [search])

  return (
    <div>
      <div className="page-toolbar">
        <input
          className="search-input"
          placeholder="Поиск по комнате, номеру договора или счёту…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <p className="error">{error}</p>}
      {data === null && !error && <p>Загрузка…</p>}
      {data !== null && data.results.length === 0 && <p>Ничего не найдено.</p>}

      {data !== null && data.results.length > 0 && (
        <>
          <div className="summary-table-wrap">
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Помещение</th>
                  <th>Дата</th>
                  <th>Сумма</th>
                  <th>Скидка</th>
                  <th>Итого</th>
                  <th>Счёт</th>
                  <th>Статья</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((p, i) => (
                  <tr key={i}>
                    <td className="room-name">
                      <Link to={`/payments?room=${encodeURIComponent(p.room)}`} className="table-link">
                        {p.room}
                      </Link>
                    </td>
                    <td>{p.date}</td>
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

          <div className="pagination">
            <button disabled={!data.previous} onClick={() => setPage((p) => p - 1)}>
              ← Назад
            </button>
            <span className="hint-text">
              Всего: {data.count}
            </span>
            <button disabled={!data.next} onClick={() => setPage((p) => p + 1)}>
              Вперёд →
            </button>
          </div>
        </>
      )}
    </div>
  )
}
