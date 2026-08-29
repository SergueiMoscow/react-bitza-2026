import { useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import type { ConsumptionResponse, LatestReading } from '../types/electricity'
import { daysAgo, today } from '../types/electricity'

function isToday(dateStr: string | null): boolean {
  return dateStr === today()
}

function ReadingsTab() {
  const [readings, setReadings] = useState<LatestReading[] | null>(null)
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState<string | null>(null)

  const load = () =>
    apiClient
      .get<LatestReading[]>('/api/electricity/latest/')
      .then((res) => setReadings(res.data.sort((a, b) => a.shortname.localeCompare(b.shortname))))
      .catch(() => setError('Не удалось загрузить показания'))

  useEffect(() => {
    load()
  }, [])

  const setInput = (shortname: string, value: string) =>
    setInputs((v) => ({ ...v, [shortname]: value }))

  const handleSave = async () => {
    const payload = Object.entries(inputs)
      .filter(([, v]) => v !== '')
      .map(([room, kwt_count]) => ({ room, kwt_count }))
    if (payload.length === 0) return
    setSaving(true)
    setError(null)
    setSavedMsg(null)
    try {
      await apiClient.post('/api/electricity/add/', payload)
      setSavedMsg(`Сохранено показаний: ${payload.length}`)
      setInputs({})
      load()
    } catch {
      setError('Не удалось сохранить показания — проверьте значения')
    } finally {
      setSaving(false)
    }
  }

  if (error) return <p className="error">{error}</p>
  if (readings === null) return <p>Загрузка…</p>
  if (readings.length === 0) return <p>Нет помещений со счётчиками.</p>

  return (
    <>
      {savedMsg && <p className="hint-text">{savedMsg}</p>}
      <div className="summary-table-wrap">
        <table className="summary-table">
          <thead>
            <tr>
              <th>Комната</th>
              <th>Последние показания</th>
              <th>Дата</th>
              <th>Новые показания</th>
            </tr>
          </thead>
          <tbody>
            {readings.map((r) => (
              <tr key={r.shortname} className={isToday(r.date) ? 'room_no_debt' : undefined}>
                <td className="room-name">{r.shortname}</td>
                <td>{r.kwt_count}</td>
                <td>{r.date ?? '—'}{isToday(r.date) && ' (сегодня)'}</td>
                <td>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={r.kwt_count}
                    value={inputs[r.shortname] ?? ''}
                    onChange={(e) => setInput(r.shortname, e.target.value)}
                    style={{ width: '110px' }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="form-actions" style={{ justifyContent: 'flex-start', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving || Object.values(inputs).every((v) => v === '')}
        >
          {saving ? 'Сохраняем…' : 'Сохранить показания'}
        </button>
      </div>
    </>
  )
}

function ConsumptionTab() {
  const [dateBegin, setDateBegin] = useState(daysAgo(30))
  const [dateEnd, setDateEnd] = useState(today())
  const [data, setData] = useState<ConsumptionResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const load = () => {
    setLoading(true)
    setError(null)
    apiClient
      .get<ConsumptionResponse>('/api/electricity/consumption/', {
        params: { date_begin: dateBegin, date_end: dateEnd },
      })
      .then((res) => setData(res.data))
      .catch(() => setError('Не удалось загрузить потребление'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  return (
    <>
      <div className="page-toolbar">
        <label className="field-narrow">
          С
          <input type="date" value={dateBegin} onChange={(e) => setDateBegin(e.target.value)} />
        </label>
        <label className="field-narrow">
          По
          <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
        </label>
        <button onClick={load} disabled={loading}>
          {loading ? 'Считаем…' : 'Показать'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {data && (
        <div className="bar-chart">
          {data.results.length === 0 && <p>Нет данных за этот период.</p>}
          {data.results.length > 0 &&
            (() => {
              const sorted = [...data.results].sort((a, b) => b.consumption - a.consumption)
              const max = Math.max(...sorted.map((r) => r.consumption), 1)
              return sorted.map((r) => (
                <div className="bar-chart-row" key={r.room}>
                  <div className="bar-chart-label">{r.room}</div>
                  <div className="bar-chart-track">
                    <div
                      className="bar-chart-fill"
                      style={{ width: `${Math.max((r.consumption / max) * 100, 2)}%`, background: r.color }}
                    />
                  </div>
                  <div className="bar-chart-value">
                    {r.consumption.toFixed(1)} <span className="bar-chart-value-room">{r.room}</span>
                  </div>
                </div>
              ))
            })()}
        </div>
      )}
    </>
  )
}

export function ElectricityPage() {
  const [tab, setTab] = useState<'readings' | 'consumption'>('readings')

  return (
    <div className="page">
      <div className="tabs">
        <button className={tab === 'readings' ? 'active' : ''} onClick={() => setTab('readings')}>
          Показания
        </button>
        <button className={tab === 'consumption' ? 'active' : ''} onClick={() => setTab('consumption')}>
          Потребление
        </button>
      </div>

      {tab === 'readings' && <ReadingsTab />}
      {tab === 'consumption' && <ConsumptionTab />}
    </div>
  )
}
