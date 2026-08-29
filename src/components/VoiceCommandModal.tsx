import { useRef, useState } from 'react'
import { apiClient } from '../api/client'
import { Modal } from './Modal'

type PaymentIntent = {
  room: string
  amount: number
  discount?: number
  date: string
  bank_account?: string
}

type Stage =
  | { type: 'idle' }
  | { type: 'recording' }
  | { type: 'transcribing' }
  | { type: 'processing'; text: string }
  | { type: 'clarify'; text: string; message: string }
  | { type: 'confirm'; intent: PaymentIntent; bankAccounts: string[] }
  | { type: 'saving' }
  | { type: 'done' }
  | { type: 'error'; message: string }

export function VoiceCommandModal({ onClose }: { onClose: () => void }) {
  const [stage, setStage] = useState<Stage>({ type: 'idle' })
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const supported = typeof navigator.mediaDevices?.getUserMedia === 'function' && typeof MediaRecorder !== 'undefined'

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        handleRecordingDone(blob)
      }
      mediaRecorderRef.current = recorder
      recorder.start()
      setStage({ type: 'recording' })
    } catch {
      setStage({ type: 'error', message: 'Не удалось получить доступ к микрофону.' })
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
  }

  const handleRecordingDone = async (blob: Blob) => {
    setStage({ type: 'transcribing' })
    try {
      const formData = new FormData()
      formData.append('audio', blob, 'command.webm')
      const res = await apiClient.post('/api/rent/voice-transcribe/', formData)
      const text: string = res.data.text
      if (!text) {
        setStage({ type: 'error', message: 'Не удалось распознать речь — попробуйте ещё раз.' })
        return
      }
      await handleTranscript(text)
    } catch {
      setStage({ type: 'error', message: 'Не удалось распознать речь — попробуйте ещё раз.' })
    }
  }

  const handleTranscript = async (text: string) => {
    setStage({ type: 'processing', text })
    try {
      const res = await apiClient.post('/api/rent/voice-command/', { text })
      if (res.data.status === 'confirm') {
        setStage({ type: 'confirm', intent: res.data.intent, bankAccounts: res.data.bank_accounts ?? [] })
      } else {
        setStage({ type: 'clarify', text, message: res.data.message })
      }
    } catch {
      setStage({ type: 'error', message: 'Не удалось разобрать команду — попробуйте ещё раз.' })
    }
  }

  const handleSave = async (intent: PaymentIntent) => {
    setStage({ type: 'saving' })
    try {
      await apiClient.post(`/api/rent/rooms/${intent.room}/payments/`, {
        date: intent.date,
        amount: intent.amount,
        discount: intent.discount ?? 0,
        bank_account: intent.bank_account ?? null,
        book_account: 'Приход',
      })
      setStage({ type: 'done' })
    } catch {
      setStage({ type: 'error', message: 'Не удалось сохранить оплату — проверьте данные.' })
    }
  }

  return (
    <Modal title="Голосовая команда" onClose={onClose}>
      {!supported && (
        <p className="error">Ваш браузер не поддерживает запись с микрофона.</p>
      )}

      {supported && stage.type === 'idle' && (
        <div className="voice-stage">
          <p className="hint-text">Например: «комната два ноль семь оплатила пятнадцать тысяч»</p>
          <button type="button" className="voice-mic-button" onClick={startRecording}>
            🎤 Нажмите и говорите
          </button>
        </div>
      )}

      {stage.type === 'recording' && (
        <div className="voice-stage">
          <button type="button" className="voice-mic-button voice-mic-active" onClick={stopRecording}>
            🎤 Идёт запись — нажмите, чтобы остановить
          </button>
        </div>
      )}

      {stage.type === 'transcribing' && (
        <div className="voice-stage">
          <p>Распознаю речь…</p>
        </div>
      )}

      {stage.type === 'processing' && (
        <div className="voice-stage">
          <p className="hint-text">«{stage.text}»</p>
          <p>Разбираю команду…</p>
        </div>
      )}

      {stage.type === 'clarify' && (
        <div className="voice-stage">
          <p className="hint-text">«{stage.text}»</p>
          <p>{stage.message}</p>
          <button type="button" onClick={startRecording}>
            🎤 Повторить
          </button>
        </div>
      )}

      {stage.type === 'confirm' && (
        <VoiceConfirmForm
          intent={stage.intent}
          bankAccounts={stage.bankAccounts}
          onSave={handleSave}
          onCancel={() => setStage({ type: 'idle' })}
        />
      )}

      {stage.type === 'saving' && <p>Сохраняем…</p>}

      {stage.type === 'done' && (
        <div className="voice-stage">
          <p>Оплата сохранена.</p>
          <button type="button" onClick={onClose}>
            Закрыть
          </button>
        </div>
      )}

      {stage.type === 'error' && (
        <div className="voice-stage">
          <p className="error">{stage.message}</p>
          <button type="button" onClick={startRecording}>
            🎤 Попробовать снова
          </button>
        </div>
      )}
    </Modal>
  )
}

function VoiceConfirmForm({
  intent,
  bankAccounts,
  onSave,
  onCancel,
}: {
  intent: PaymentIntent
  bankAccounts: string[]
  onSave: (intent: PaymentIntent) => void
  onCancel: () => void
}) {
  const [room, setRoom] = useState(intent.room)
  const [amount, setAmount] = useState(intent.amount)
  const [discount, setDiscount] = useState(intent.discount ?? 0)
  const [date, setDate] = useState(intent.date)
  const [bankAccount, setBankAccount] = useState(intent.bank_account ?? '')

  return (
    <div className="voice-stage">
      <p className="hint-text">Проверьте перед сохранением:</p>
      <div className="form-row">
        <label className="field-narrow">
          Комната
          <input value={room} onChange={(e) => setRoom(e.target.value)} />
        </label>
        <label className="field-narrow">
          Сумма
          <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        </label>
        <label className="field-narrow">
          Скидка
          <input type="number" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
        </label>
      </div>
      <div className="form-row">
        <label className="field-narrow">
          Дата
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          Счёт
          <select value={bankAccount} onChange={(e) => setBankAccount(e.target.value)}>
            <option value="">—</option>
            {bankAccount && !bankAccounts.includes(bankAccount) && (
              <option value={bankAccount}>{bankAccount}</option>
            )}
            {bankAccounts.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="form-actions">
        <button type="button" className="button-secondary" onClick={onCancel}>
          Отмена
        </button>
        <button type="button" onClick={() => onSave({ room, amount, discount, date, bank_account: bankAccount })}>
          Сохранить
        </button>
      </div>
    </div>
  )
}
