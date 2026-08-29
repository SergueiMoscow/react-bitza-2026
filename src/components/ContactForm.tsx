import { useState, type FormEvent } from 'react'
import type { ContactFormValues } from '../types/contact'
import { DocumentsSection } from './DocumentsSection'

const DOCUMENT_SUGGESTIONS = [
  'Паспорт РФ',
  'Паспорт другого государства',
  'Удостоверение',
  'Военный билет',
  'Паспорт Таджикистана',
  'Паспорт Узбекистана',
]

type ContactFormProps = {
  initialValues: ContactFormValues
  contactId?: number
  onSubmit: (values: ContactFormValues) => Promise<void>
  onCancel: () => void
}

export function ContactForm({ initialValues, contactId, onSubmit, onCancel }: ContactFormProps) {
  const [values, setValues] = useState<ContactFormValues>(initialValues)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof ContactFormValues>(key: K, value: ContactFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await onSubmit(values)
    } catch {
      setError('Не удалось сохранить — проверьте поля')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>
          Фамилия
          <input value={values.surname ?? ''} onChange={(e) => set('surname', e.target.value)} />
        </label>
        <label>
          Имя
          <input value={values.name ?? ''} onChange={(e) => set('name', e.target.value)} />
        </label>
        <label className="field-narrow">
          Пол
          <select value={values.gender ?? 'M'} onChange={(e) => set('gender', e.target.value as 'M' | 'F')}>
            <option value="M">Мужской</option>
            <option value="F">Женский</option>
          </select>
        </label>
      </div>

      <div className="form-row">
        <label>
          Телефон
          <input value={values.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
        </label>
        <label>
          Email
          <input type="email" value={values.email ?? ''} onChange={(e) => set('email', e.target.value)} />
        </label>
      </div>

      <div className="form-row">
        <label>
          Дата рождения
          <input
            type="date"
            value={values.birth_date ?? ''}
            onChange={(e) => set('birth_date', e.target.value)}
          />
        </label>
        <label>
          Место рождения
          <input value={values.birth_place ?? ''} onChange={(e) => set('birth_place', e.target.value)} />
        </label>
      </div>

      <fieldset className="form-fieldset">
        <legend>Документ</legend>
        <div className="form-row">
          <label>
            Вид документа
            <input
              list="document-suggestions"
              value={values.document_name ?? ''}
              onChange={(e) => set('document_name', e.target.value)}
            />
            <datalist id="document-suggestions">
              {DOCUMENT_SUGGESTIONS.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </label>
          <label className="field-narrow">
            Серия
            <input value={values.doc_series ?? ''} onChange={(e) => set('doc_series', e.target.value)} />
          </label>
          <label className="field-narrow">
            Номер
            <input value={values.doc_number ?? ''} onChange={(e) => set('doc_number', e.target.value)} />
          </label>
        </div>
        <div className="form-row">
          <label>
            Дата выдачи
            <input type="date" value={values.doc_date ?? ''} onChange={(e) => set('doc_date', e.target.value)} />
          </label>
          <label>
            Кем выдан
            <input value={values.doc_issued ?? ''} onChange={(e) => set('doc_issued', e.target.value)} />
          </label>
        </div>
      </fieldset>

      <fieldset className="form-fieldset">
        <legend>Адрес</legend>
        <div className="form-row">
          <label>
            Адрес 1
            <input value={values.address1 ?? ''} onChange={(e) => set('address1', e.target.value)} />
          </label>
          <label>
            Адрес 2
            <input value={values.address2 ?? ''} onChange={(e) => set('address2', e.target.value)} />
          </label>
        </div>
        <div className="form-row">
          <label>
            Город
            <input value={values.city ?? ''} onChange={(e) => set('city', e.target.value)} />
          </label>
          <label>
            Страна
            <input value={values.country ?? ''} onChange={(e) => set('country', e.target.value)} />
          </label>
        </div>
      </fieldset>

      {contactId ? (
        <DocumentsSection contactId={contactId} />
      ) : (
        <p className="hint-text">Копии документов можно будет добавить после сохранения клиента.</p>
      )}

      <label>
        Заметки
        <textarea rows={2} value={values.notes ?? ''} onChange={(e) => set('notes', e.target.value)} />
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
