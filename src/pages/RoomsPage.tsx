import { useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import { Modal } from '../components/Modal'
import { RoomForm } from '../components/RoomForm'
import { BuildingForm } from '../components/BuildingForm'
import type { Room } from '../types/room'
import { emptyRoom, toRoomPayload, type RoomFormValues } from '../types/room'
import type { Building, BuildingFormValues } from '../types/building'
import { EMPTY_BUILDING } from '../types/building'

const STATUS_LABEL: Record<'A' | 'B', string> = { A: 'Сдаётся', B: 'Не сдаётся' }

export function RoomsPage() {
  const [tab, setTab] = useState<'rooms' | 'buildings'>('rooms')
  const [rooms, setRooms] = useState<Room[] | null>(null)
  const [buildings, setBuildings] = useState<Building[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editingRoom, setEditingRoom] = useState<Room | 'new' | null>(null)
  const [editingBuilding, setEditingBuilding] = useState<Building | 'new' | null>(null)

  const loadRooms = () =>
    apiClient
      .get<Room[]>('/api/rent/rooms/')
      .then((res) => setRooms(res.data))
      .catch(() => setError('Не удалось загрузить помещения'))

  const loadBuildings = () =>
    apiClient
      .get<Building[]>('/api/rent/buildings/')
      .then((res) => setBuildings(res.data))
      .catch(() => setError('Не удалось загрузить здания'))

  useEffect(() => {
    loadRooms()
    loadBuildings()
  }, [])

  const buildingName = (id: number | null) => buildings?.find((b) => b.id === id)?.name ?? '—'

  const handleSaveRoom = async (values: RoomFormValues) => {
    const payload = toRoomPayload(values)
    if (editingRoom === 'new') {
      await apiClient.post('/api/rent/rooms/', payload)
    } else if (editingRoom) {
      await apiClient.patch(`/api/rent/rooms/${editingRoom.shortname}/`, payload)
    }
    setEditingRoom(null)
    loadRooms()
  }

  const handleSaveBuilding = async (values: BuildingFormValues) => {
    if (editingBuilding === 'new') {
      await apiClient.post('/api/rent/buildings/', values)
    } else if (editingBuilding) {
      await apiClient.patch(`/api/rent/buildings/${editingBuilding.id}/`, values)
    }
    setEditingBuilding(null)
    loadBuildings()
  }

  return (
    <div className="page">
      <div className="tabs">
        <button className={tab === 'rooms' ? 'active' : ''} onClick={() => setTab('rooms')}>
          Помещения
        </button>
        <button className={tab === 'buildings' ? 'active' : ''} onClick={() => setTab('buildings')}>
          Здания
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {tab === 'rooms' && (
        <>
          <div className="page-toolbar">
            <div />
            <button onClick={() => setEditingRoom('new')}>+ Добавить помещение</button>
          </div>
          {rooms === null && <p>Загрузка…</p>}
          {rooms !== null && (
            <div className="summary-table-wrap">
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>Номер</th>
                    <th>Название</th>
                    <th>Здание</th>
                    <th>Этаж</th>
                    <th>Площадь</th>
                    <th>Цена 1</th>
                    <th>Статус</th>
                    <th>Счётчик</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((r) => (
                    <tr key={r.shortname} className="clickable-row" onClick={() => setEditingRoom(r)}>
                      <td className="room-name">{r.shortname}</td>
                      <td>{r.name || '—'}</td>
                      <td>{buildingName(r.building)}</td>
                      <td>{r.floor ?? '—'}</td>
                      <td>{r.square ?? '—'}</td>
                      <td>{r.price1 !== null ? r.price1.toLocaleString('ru-RU') : '—'}</td>
                      <td>
                        <span className={`status-badge ${r.status === 'A' ? 'room_no_debt' : 'room_vacant'}`}>
                          {STATUS_LABEL[r.status]}
                        </span>
                      </td>
                      <td>
                        {r.type_watt_counter === 'A' ? '⚡ авто' : r.type_watt_counter === 'M' ? '⚡ ручной' : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'buildings' && (
        <>
          <div className="page-toolbar">
            <div />
            <button onClick={() => setEditingBuilding('new')}>+ Добавить здание</button>
          </div>
          {buildings === null && <p>Загрузка…</p>}
          {buildings !== null && (
            <div className="summary-table-wrap">
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>Название</th>
                    <th>Адрес</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {buildings.map((b) => (
                    <tr key={b.id} className="clickable-row" onClick={() => setEditingBuilding(b)}>
                      <td className="room-name">{b.name}</td>
                      <td>{b.address1 || '—'}</td>
                      <td>
                        <span className={`status-badge ${b.status === 'A' ? 'room_no_debt' : 'room_vacant'}`}>
                          {STATUS_LABEL[b.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {editingRoom && (
        <Modal title={editingRoom === 'new' ? 'Новое помещение' : 'Редактирование помещения'} onClose={() => setEditingRoom(null)}>
          <RoomForm
            initialValues={editingRoom === 'new' ? emptyRoom(buildings?.[0]?.id ?? null) : editingRoom}
            buildings={buildings ?? []}
            isNew={editingRoom === 'new'}
            onSubmit={handleSaveRoom}
            onCancel={() => setEditingRoom(null)}
          />
        </Modal>
      )}

      {editingBuilding && (
        <Modal title={editingBuilding === 'new' ? 'Новое здание' : 'Редактирование здания'} onClose={() => setEditingBuilding(null)}>
          <BuildingForm
            initialValues={editingBuilding === 'new' ? EMPTY_BUILDING : editingBuilding}
            onSubmit={handleSaveBuilding}
            onCancel={() => setEditingBuilding(null)}
          />
        </Modal>
      )}
    </div>
  )
}
