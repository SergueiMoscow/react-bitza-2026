import { useState, type FormEvent } from 'react'
import type { Room } from '../types/room'
import type { GasRecordFormValues } from '../types/gas'

type GasFormProps = {
  initialValues: GasRecordFormValues
  rooms: Room[]
  onSubmit: (values: GasRecordFormValues) => Promise<void>
  onCancel: () => void
}

export function GasForm({ initialValues, rooms, onSubmit, onCancel }: GasFormProps) {
  const [values, setValues] = useState<GasRecordFormValues>(initialValues)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof GasRecordFormValues>(key: K, value: GasRecordFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await onSubmit(values)
    } catch {
      setError('Не удалось сохранить')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>
          Комната
          <select value={values.room ?? ''} onChange={(e) => set('room', e.target.value)}>
            <option value="">—</option>
            {rooms.map((r) => (
              <option key={r.shortname} value={r.shortname}>
                {r.shortname}
              </option>
            ))}
          </select>
        </label>
        <label className="field-narrow">
          Баллонов
          <input
            type="number"
            value={values.quantity ?? ''}
            onChange={(e) => set('quantity', e.target.value === '' ? null : Number(e.target.value))}
          />
        </label>
        <label className="field-narrow">
          Объём, л
          <input
            type="number"
            value={values.capacity ?? ''}
            onChange={(e) => set('capacity', e.target.value === '' ? null : Number(e.target.value))}
          />
        </label>
      </div>

      <div className="form-row">
        <label>
          Дата взятия газа
          <input
            type="date"
            value={values.gas_taken_date?.slice(0, 10) ?? ''}
            onChange={(e) => set('gas_taken_date', e.target.value || null)}
          />
        </label>
        <label>
          Дата оплаты
          <input
            type="date"
            value={values.payment_date?.slice(0, 10) ?? ''}
            onChange={(e) => set('payment_date', e.target.value || null)}
          />
        </label>
        <label className="field-narrow">
          Сумма
          <input
            type="number"
            value={values.amount ?? ''}
            onChange={(e) => set('amount', e.target.value === '' ? null : Number(e.target.value))}
          />
        </label>
      </div>

      <label>
        Кто принял/выдал
        <input value={values.receiver ?? ''} onChange={(e) => set('receiver', e.target.value || null)} />
      </label>

      <label>
        Комментарий
        <textarea rows={2} value={values.comments ?? ''} onChange={(e) => set('comments', e.target.value || null)} />
      </label>

      {error && <p className="error">{error}</p>}

      <div className="form-actions">
        <button type="button" className="button-secondary" onClick={onCancel}>
          Отмена
        </button>
        <button type="submit" disabled={saving}>
          {saving ? 'Сохраняем…' : 'Сохранить'}
        </button>
      </div>
    </form>
  )
}
