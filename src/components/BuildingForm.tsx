import { useState, type FormEvent } from 'react'
import type { BuildingFormValues } from '../types/building'

type BuildingFormProps = {
  initialValues: BuildingFormValues
  onSubmit: (values: BuildingFormValues) => Promise<void>
  onCancel: () => void
}

export function BuildingForm({ initialValues, onSubmit, onCancel }: BuildingFormProps) {
  const [values, setValues] = useState<BuildingFormValues>(initialValues)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof BuildingFormValues>(key: K, value: BuildingFormValues[K]) =>
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
          Название
          <input value={values.name} onChange={(e) => set('name', e.target.value)} required />
        </label>
        <label className="field-narrow">
          Статус
          <select value={values.status} onChange={(e) => set('status', e.target.value as 'A' | 'B')}>
            <option value="A">Сдаётся</option>
            <option value="B">Не сдаётся</option>
          </select>
        </label>
      </div>
      <div className="form-row">
        <label>
          Адрес
          <input value={values.address1 ?? ''} onChange={(e) => set('address1', e.target.value)} />
        </label>
        <label>
          Регион
          <input value={values.address2 ?? ''} onChange={(e) => set('address2', e.target.value)} />
        </label>
        <label className="field-narrow">
          Индекс
          <input value={values.zip ?? ''} onChange={(e) => set('zip', e.target.value)} />
        </label>
      </div>
      <label>
        Описание
        <input value={values.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
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
