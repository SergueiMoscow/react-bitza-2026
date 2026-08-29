import { useState, type FormEvent } from 'react'
import type { CounterType, RoomFormValues } from '../types/room'
import { COUNTER_TYPE_LABEL } from '../types/room'
import type { Building } from '../types/building'

type RoomFormProps = {
  initialValues: RoomFormValues
  buildings: Building[]
  isNew: boolean
  onSubmit: (values: RoomFormValues) => Promise<void>
  onCancel: () => void
}

function toNullableNumber(raw: string): number | null {
  if (raw === '') return null
  const n = Number(raw)
  return Number.isNaN(n) ? null : n
}

export function RoomForm({ initialValues, buildings, isNew, onSubmit, onCancel }: RoomFormProps) {
  const [values, setValues] = useState<RoomFormValues>(initialValues)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof RoomFormValues>(key: K, value: RoomFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await onSubmit(values)
    } catch {
      setError('Не удалось сохранить — проверьте поля (номер комнаты должен быть уникальным)')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label className="field-narrow">
          Номер
          <input
            value={values.shortname}
            onChange={(e) => set('shortname', e.target.value)}
            disabled={!isNew}
            required
          />
        </label>
        <label>
          Название
          <input value={values.name} onChange={(e) => set('name', e.target.value)} />
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
          Здание
          <select
            value={values.building ?? ''}
            onChange={(e) => set('building', e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">—</option>
            {buildings.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field-narrow">
          Этаж
          <input
            type="number"
            value={values.floor ?? ''}
            onChange={(e) => set('floor', toNullableNumber(e.target.value))}
          />
        </label>
        <label className="field-narrow">
          Площадь, м²
          <input
            type="number"
            step="0.1"
            value={values.square ?? ''}
            onChange={(e) => set('square', e.target.value)}
          />
        </label>
      </div>

      <div className="form-row">
        <label>
          Цена 1
          <input
            type="number"
            value={values.price1 ?? ''}
            onChange={(e) => set('price1', toNullableNumber(e.target.value))}
          />
        </label>
        <label>
          Цена 2
          <input
            type="number"
            value={values.price2 ?? ''}
            onChange={(e) => set('price2', toNullableNumber(e.target.value))}
          />
        </label>
      </div>

      <div className="form-row">
        <label className="field-narrow">
          Электросчётчик
          <select
            value={values.type_watt_counter}
            onChange={(e) => set('type_watt_counter', e.target.value as CounterType)}
          >
            {Object.entries(COUNTER_TYPE_LABEL).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="field-narrow">
          Счётчик ГВС
          <select
            value={values.type_hot_water_counter}
            onChange={(e) => set('type_hot_water_counter', e.target.value as CounterType)}
          >
            {Object.entries(COUNTER_TYPE_LABEL).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="field-narrow">
          Счётчик ХВС
          <select
            value={values.type_cold_water_counter}
            onChange={(e) => set('type_cold_water_counter', e.target.value as CounterType)}
          >
            {Object.entries(COUNTER_TYPE_LABEL).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Описание
        <input value={values.description ?? ''} onChange={(e) => set('description', e.target.value)} />
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
