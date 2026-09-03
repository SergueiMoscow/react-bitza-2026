import { useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import { diffDays } from '../types/contract'
import type { ContractRenewalEntry, ContractRenewalStatus } from '../types/contractRenewal'

const today = () => new Date().toISOString().slice(0, 10)

const STATUS_BADGE_CLASS: Record<ContractRenewalStatus, string> = {
  'Активный': 'room_no_debt',
  'Завершается': 'room_little_debt',
  'Просрочен': 'room_big_debt',
}

const ROW_CLASS: Record<ContractRenewalStatus, string> = {
  'Активный': '',
  'Завершается': 'room_little_debt',
  'Просрочен': 'room_big_debt',
}

export function ContractRenewalPage() {
  const [contracts, setContracts] = useState<ContractRenewalEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [printing, setPrinting] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  const load = () =>
    apiClient
      .get<ContractRenewalEntry[]>('/api/rent/print-contracts/')
      .then((res) => {
        setContracts(res.data)
        setDrafts(
          Object.fromEntries(res.data.map((c) => [c.number, c.recommended_contract_date ?? ''])),
        )
      })
      .catch(() => setError('Не удалось загрузить договоры'))

  useEffect(() => {
    load()
  }, [])

  const handlePrint = async (number: string) => {
    setError(null)
    setPrinting(number)
    // Открываем вкладку синхронно (до await), иначе браузер блокирует её как всплывающее окно.
    const win = window.open('', '_blank')
    try {
      const res = await apiClient.post('/api/rent/generate-contract-pdf/', { contract_id: number }, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      if (win) {
        win.location.href = url
      } else {
        window.open(url, '_blank')
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    } catch {
      win?.close()
      setError('Не удалось сформировать PDF')
    } finally {
      setPrinting(null)
    }
  }

  const handleUpdateDate = async (number: string) => {
    const date = drafts[number]
    if (!date) return
    setError(null)
    setSaving(number)
    try {
      await apiClient.post('/api/rent/print-contracts/add/', { contract: number, date })
      await load()
    } catch {
      setError('Не удалось обновить дату')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="page">
      <p className="hint-text">Отслеживание актуальности договоров — когда пора перезаключать.</p>

      {error && <p className="error">{error}</p>}
      {contracts === null && <p>Загрузка…</p>}
      {contracts !== null && contracts.length === 0 && <p>Нет активных договоров.</p>}

      {contracts !== null && contracts.length > 0 && (
        <div className="summary-table-wrap">
          <table className="summary-table">
            <thead>
              <tr>
                <th>Помещение</th>
                <th>Клиент</th>
                <th>Дата печати</th>
                <th>Статус</th>
                <th>Действие</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((c) => {
                const latestPrintDate = c.latest_prints[0]?.date ?? c.date_begin
                const isActive = c.status_description === 'Активный'
                return (
                  <tr key={c.number} className={ROW_CLASS[c.status_description]}>
                    <td className="room-name">{c.room}</td>
                    <td>
                      {c.contact.surname} {c.contact.name}
                    </td>
                    <td>{latestPrintDate}</td>
                    <td>
                      <span className={`status-badge ${STATUS_BADGE_CLASS[c.status_description]}`}>
                        {c.status_description}
                      </span>
                    </td>
                    <td>
                      {isActive ? (
                        <div className="renewal-action">
                          <span className="hint-text">Дней действия: {diffDays(latestPrintDate, today())}</span>
                          <button type="button" onClick={() => handlePrint(c.number)} disabled={printing === c.number}>
                            {printing === c.number ? 'Формируем…' : 'Печать'}
                          </button>
                        </div>
                      ) : (
                        <div className="renewal-action">
                          <input
                            type="date"
                            value={drafts[c.number] ?? ''}
                            onChange={(e) => setDrafts((d) => ({ ...d, [c.number]: e.target.value }))}
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateDate(c.number)}
                            disabled={saving === c.number || !drafts[c.number]}
                          >
                            {saving === c.number ? 'Сохраняем…' : 'Обновить'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
