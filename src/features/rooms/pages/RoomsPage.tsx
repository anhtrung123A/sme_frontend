import { useEffect, useMemo, useState } from 'react'
import {
  createRoomApi,
  deleteRoomApi,
  getBranchesApi,
  getRoomApi,
  getRoomsApi,
  updateRoomApi,
} from '../api'
import type { BranchDto, RoomDto, RoomPayload } from '../types'

type FormState = {
  branchId: string
  name: string
  capacity: string
  isActive: boolean
}

const initialForm: FormState = {
  branchId: '',
  name: '',
  capacity: '',
  isActive: true,
}

export function RoomsPage() {
  const [rooms, setRooms] = useState<RoomDto[]>([])
  const [branches, setBranches] = useState<BranchDto[]>([])
  const [branchFilter, setBranchFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(initialForm)
  const [isSaving, setIsSaving] = useState(false)

  const selectedBranchId = useMemo(() => (branchFilter ? Number(branchFilter) : undefined), [branchFilter])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [roomsData, branchesData] = await Promise.all([
        getRoomsApi(selectedBranchId),
        getBranchesApi(),
      ])

      setRooms(roomsData)
      setBranches(branchesData)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load rooms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [selectedBranchId])

  const openCreate = () => {
    setEditingRoomId(null)
    setForm(initialForm)
    setIsModalOpen(true)
  }

  const openEdit = async (id: number) => {
    setError(null)

    try {
      const room = await getRoomApi(id)
      setEditingRoomId(id)
      setForm({
        branchId: String(room.branchId),
        name: room.name,
        capacity: room.capacity ? String(room.capacity) : '',
        isActive: room.isActive,
      })
      setIsModalOpen(true)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load room')
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingRoomId(null)
    setForm(initialForm)
  }

  const mapPayload = (): RoomPayload => ({
    branchId: Number(form.branchId),
    name: form.name,
    capacity: form.capacity ? Number(form.capacity) : null,
    isActive: form.isActive,
  })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSaving(true)

    try {
      if (editingRoomId) {
        await updateRoomApi(editingRoomId, mapPayload())
      } else {
        await createRoomApi(mapPayload())
      }

      closeModal()
      await loadData()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save room')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (room: RoomDto) => {
    const confirmed = window.confirm(`Delete room \"${room.name}\"?`)
    if (!confirmed) return

    try {
      await deleteRoomApi(room.id)
      await loadData()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete room')
    }
  }

  return (
    <>
      <div className="users-toolbar">
        <div className="users-filters">
          <select className="toolbar-select" value={branchFilter} onChange={(event) => setBranchFilter(event.target.value)}>
            <option value="">All branches</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>

        <button className="ms-button" type="button" onClick={openCreate}>
          Create room
        </button>
      </div>

      {error ? <p className="auth-error">{error}</p> : null}
      {loading ? <p>Loading rooms...</p> : null}

      <table className="ms-table">
        <thead>
          <tr>
            <th>Room Name</th>
            <th>Branch</th>
            <th>Capacity</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room) => (
            <tr key={room.id}>
              <td>{room.name}</td>
              <td>{room.branchName}</td>
              <td>{room.capacity ?? '-'}</td>
              <td>
                <span className={`status-badge ${room.isActive ? 'status-active' : 'status-inactive'}`}>
                  {room.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <div className="table-actions">
                  <button className="table-action-btn" type="button" onClick={() => void openEdit(room.id)}>
                    Edit
                  </button>
                  <button className="table-action-btn" type="button" onClick={() => void handleDelete(room)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>{editingRoomId ? 'Edit room' : 'Create room'}</h3>

            <form className="branch-form" onSubmit={handleSubmit}>
              <label className="form-field">
                <span>Room name</span>
                <input
                  className="toolbar-input"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </label>

              <label className="form-field">
                <span>Branch</span>
                <select
                  className="toolbar-select"
                  value={form.branchId}
                  onChange={(event) => setForm((prev) => ({ ...prev, branchId: event.target.value }))}
                  required
                >
                  <option value="">Select branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-field">
                <span>Capacity</span>
                <input
                  className="toolbar-input"
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(event) => setForm((prev) => ({ ...prev, capacity: event.target.value }))}
                />
              </label>

              <label className="switch-field">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                />
                <span>Active</span>
              </label>

              <div className="modal-actions">
                <button className="ms-button ms-button--secondary" type="button" onClick={closeModal}>
                  Cancel
                </button>
                <button className="ms-button" type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : editingRoomId ? 'Save changes' : 'Create room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
