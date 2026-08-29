import { useEffect, useRef, useState } from 'react'
import { apiClient } from '../api/client'
import type { ContactDocument } from '../types/document'

export function DocumentsSection({ contactId }: { contactId: number }) {
  const [documents, setDocuments] = useState<ContactDocument[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = () => {
    apiClient
      .get<ContactDocument[]>(`/api/rent/contacts/${contactId}/documents/`)
      .then((res) => setDocuments(res.data))
      .catch(() => setError('Не удалось загрузить документы'))
  }

  useEffect(load, [contactId])

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    const formData = new FormData()
    formData.append('image_file', file)
    if (description) formData.append('description', description)
    try {
      await apiClient.post(`/api/rent/contacts/${contactId}/documents/`, formData)
      setDescription('')
      if (fileInputRef.current) fileInputRef.current.value = ''
      load()
    } catch {
      setError('Не удалось загрузить файл')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (docId: number) => {
    if (!confirm('Удалить документ?')) return
    try {
      await apiClient.delete(`/api/rent/documents/${docId}/`)
      load()
    } catch {
      setError('Не удалось удалить документ')
    }
  }

  return (
    <fieldset className="form-fieldset">
      <legend>Копии документов</legend>

      {error && <p className="error">{error}</p>}

      {documents === null && <p className="hint-text">Загрузка…</p>}
      {documents !== null && documents.length === 0 && (
        <p className="hint-text">Пока ничего не загружено.</p>
      )}

      {documents !== null && documents.length > 0 && (
        <div className="document-grid">
          {documents.map((doc) => (
            <div key={doc.id} className="document-tile">
              <a href={doc.image_file} target="_blank" rel="noreferrer">
                <img src={doc.image_file} alt={doc.description ?? 'Документ'} />
              </a>
              <div className="document-caption">{doc.description || '—'}</div>
              <button
                type="button"
                className="document-delete"
                onClick={() => handleDelete(doc.id)}
                aria-label="Удалить документ"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="document-upload">
        <input type="file" accept="image/*" ref={fileInputRef} />
        <input
          type="text"
          placeholder="Описание (например «паспорт стр. 1»)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button type="button" onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Загружаем…' : 'Загрузить'}
        </button>
      </div>
    </fieldset>
  )
}
