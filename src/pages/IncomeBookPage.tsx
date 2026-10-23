import { useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import type { Payment } from '../types/payment'

type IncomeBookResponse = {
  results: Payment[]
  total: number
}

// Последний завершённый квартал относительно сегодняшней даты.
function defaultQuarter(): { year: number; quarter: number } {
  const now = new Date()
  const currentQuarter = Math.floor(now.getMonth() / 3) + 1
  let quarter = currentQuarter - 1
  let year = now.getFullYear()
  if (quarter < 1) {
    quarter = 4
    year -= 1
  }
  return { year, quarter }
}

export function IncomeBookPage() {
  const initial = defaultQuarter()
  const [year, setYear] = useState(initial.year)
  const [quarter, setQuarter] = useState(initial.quarter)
  const [data, setData] = useState<IncomeBookResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setData(null)
    setError(null)
    apiClient
      .get<IncomeBookResponse>('/api/rent/income-book/', { params: { year, quarter } })
      .then((res) => setData(res.data))
      .catch(() => setError('Не удалось загрузить книгу доходов'))
  }, [year, quarter])

  return (
    <div className="page">
      <div className="page-toolbar">
        <label className="field-narrow" style={{ flex: '0 0 160px' }}>
          Квартал
          <select value={quarter} onChange={(e) => setQuarter(Number(e.target.value))}>
            <option value={1}>I квартал</option>
            <option value={2}>II квартал</option>
            <option value={3}>III квартал</option>
            <option value={4}>IV квартал</option>
          </select>
        </label>
        <label className="field-narrow" style={{ flex: '0 0 110px' }}>
          Год
          <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
        </label>
      </div>

      {error && <p className="error">{error}</p>}
      {data === null && !error && <p>Загрузка…</p>}
      {data !== null && data.results.length === 0 && <p>Нет оплат за этот период.</p>}

      {data !== null && data.results.length > 0 && (
        <div className="summary-table-wrap">
          <table className="summary-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Помещение</th>
                <th>Сумма</th>
                <th>Скидка</th>
                <th>Итого</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((p, i) => (
                <tr key={i}>
                  <td>{p.date}</td>
                  <td className="room-name">{p.room}</td>
                  <td>{p.amount.toLocaleString('ru-RU')}</td>
                  <td>{p.discount ? p.discount.toLocaleString('ru-RU') : '—'}</td>
                  <td>{p.total.toLocaleString('ru-RU')}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={{ textAlign: 'right', fontWeight: 600 }}>
                  Итого за квартал:
                </td>
                <td style={{ fontWeight: 700 }}>{data.total.toLocaleString('ru-RU')} ₽</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  )
}
