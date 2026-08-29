import { useState, type FormEvent } from 'react'
import type { Room } from '../types/room'
import { addDays, diffDays, DEFAULT_CONTRACT_DURATION_DAYS, type Contract } from '../types/contract'
import { ContactPicker } from './ContactPicker'

const today = () => new Date().toISOString().slice(0, 10)

type ContractFormProps = {
  initialValues: Contract | null
  rooms: Room[]
  onSubmit: (payload: Record<string, unknown>) => Promise<void>
  onCancel: () => void
}

export function ContractForm({ initialValues, rooms, onSubmit, onCancel }: ContractFormProps) {
  const isNew = initialValues === null

  const [dateBegin, setDateBegin] = useState(initialValues?.date_begin ?? today())
  const [dateEnd, setDateEnd] = useState(
    initialValues?.date_end ?? addDays(today(), DEFAULT_CONTRACT_DURATION_DAYS),
  )
  const [durationDays, setDurationDays] = useState(
    initialValues ? diffDays(initialValues.date_begin, initialValues.date_end) : DEFAULT_CONTRACT_DURATION_DAYS,
  )
  const [room, setRoom] = useState(initialValues?.room ?? rooms[0]?.shortname ?? '')
  const [payDay, setPayDay] = useState(initialValues?.pay_day ?? new Date().getDate())
  const [price, setPrice] = useState(initialValues?.price ?? 0)
  const [deposit, setDeposit] = useState(initialValues?.deposit ?? 0)
  const [discount, setDiscount] = useState(initialValues?.discount ?? 0)
  const [contact, setContact] = useState<number | null>(initialValues?.contact ?? null)
  const [contactName, setContactName] = useState<string | null>(initialValues?.contact_name ?? null)
  const [contractStatus, setContractStatus] = useState<'A' | 'B'>(initialValues?.status ?? 'A')
  const [closeDate, setCloseDate] = useState(initialValues?.close_date ?? today())

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDateBeginChange = (value: string) => {
    setDateBegin(value)
    setDateEnd(addDays(value, durationDays))
  }

  const onDurationChange = (value: number) => {
    setDurationDays(value)
    setDateEnd(addDays(dateBegin, value))
  }

  const onDateEndChange = (value: string) => {
    setDateEnd(value)
    setDurationDays(diffDays(dateBegin, value))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const payload: Record<string, unknown> = {
        date_begin: dateBegin,
        date_end: dateEnd,
        room,
        pay_day: payDay,
        price,
        deposit,
        discount,
        contact,
      }
      if (!isNew) {
        payload.status = contractStatus
        payload.close_date = contractStatus === 'B' ? closeDate : null
      }
      await onSubmit(payload)
    } catch {
      setError('Не удалось сохранить договор — проверьте поля')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      {!isNew && (
        <p className="hint-text">
          № {initialValues!.number}
        </p>
      )}

      <label>
        Клиент
        <ContactPicker
          value={contact}
          valueLabel={contactName}
          onChange={(id, label) => {
            setContact(id)
            setContactName(label)
          }}
        />
      </label>

      <div className="form-row">
        <label>
          Помещение
          <select value={room} onChange={(e) => setRoom(e.target.value)} disabled={!isNew} required>
            {rooms.map((r) => (
              <option key={r.shortname} value={r.shortname}>
                {r.shortname}
              </option>
            ))}
          </select>
        </label>
        <label className="field-narrow">
          День оплаты
          <input
            type="number"
            min={1}
            max={30}
            value={payDay}
            onChange={(e) => setPayDay(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="form-row">
        <label>
          Дата заезда
          <input type="date" value={dateBegin} onChange={(e) => onDateBeginChange(e.target.value)} />
        </label>
        <label className="field-narrow">
          Дней
          <input
            type="number"
            value={durationDays}
            onChange={(e) => onDurationChange(Number(e.target.value))}
          />
        </label>
        <label>
          Дата окончания
          <input type="date" value={dateEnd} onChange={(e) => onDateEndChange(e.target.value)} />
        </label>
      </div>

      <div className="form-row">
        <label>
          Цена
          <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
        </label>
        <label>
          Депозит
          <input type="number" value={deposit} onChange={(e) => setDeposit(Number(e.target.value))} />
        </label>
        <label>
          Скидка
          <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
        </label>
      </div>

      {!isNew && (
        <div className="form-row">
          <label className="field-narrow">
            Статус
            <select value={contractStatus} onChange={(e) => setContractStatus(e.target.value as 'A' | 'B')}>
              <option value="A">Активный</option>
              <option value="B">Закрыт</option>
            </select>
          </label>
          {contractStatus === 'B' && (
            <label>
              Дата закрытия
              <input type="date" value={closeDate ?? ''} onChange={(e) => setCloseDate(e.target.value)} />
            </label>
          )}
        </div>
      )}

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
