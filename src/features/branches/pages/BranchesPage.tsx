import { useEffect, useState } from 'react'
import {
  createBranchApi,
  deleteBranchApi,
  getBranchApi,
  getBranchesApi,
  updateBranchApi,
} from '../api'
import type { BranchDto, BranchPayload } from '../types'

type FormState = {
  name: string
  address: string
  phone: string
  email: string
  isActive: boolean
}

const initialFormState: FormState = {
  name: '',
  address: '',
  phone: '',
  email: '',
  isActive: true,
}

export function BranchesPage() {
  const [branches, setBranches] = useState<BranchDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingBranchId, setEditingBranchId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(initialFormState)
  const [isSaving, setIsSaving] = useState(false)

  const loadBranches = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getBranchesApi()
      setBranches(data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load branches')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadBranches()
  }, [])

  const mapFormToPayload = (state: FormState): BranchPayload => ({
    name: state.name,
    address: state.address,
    phone: state.phone,
    email: state.email,
    isActive: state.isActive,
  })

  const openCreateModal = () => {
    setForm(initialFormState)
    setEditingBranchId(null)
    setIsCreateOpen(true)
  }

  const openEditModal = async (id: number) => {
    setError(null)

    try {
      const branch = await getBranchApi(id)
      setForm({
        name: branch.name,
        address: branch.address ?? '',
        phone: branch.phone ?? '',
        email: branch.email ?? '',
        isActive: branch.isActive,
      })
      setEditingBranchId(id)
      setIsCreateOpen(true)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load branch')
    }
  }

  const closeModal = () => {
    setIsCreateOpen(false)
    setEditingBranchId(null)
    setForm(initialFormState)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      if (editingBranchId) {
        await updateBranchApi(editingBranchId, mapFormToPayload(form))
      } else {
        await createBranchApi(mapFormToPayload(form))
      }

      closeModal()
      await loadBranches()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save branch')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleActive = async (branch: BranchDto) => {
    try {
      await updateBranchApi(branch.id, {
        name: branch.name,
        address: branch.address ?? '',
        phone: branch.phone ?? '',
        email: branch.email ?? '',
        isActive: !branch.isActive,
      })

      await loadBranches()
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : 'Failed to update branch status')
    }
  }

  const handleDelete = async (branch: BranchDto) => {
    const confirmed = window.confirm(`Delete branch "${branch.name}"?`)
    if (!confirmed) return

    try {
      await deleteBranchApi(branch.id)
      await loadBranches()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete branch')
    }
  }

  return (
    <>
      <div className="users-toolbar">
        <div />
        <button className="ms-button" type="button" onClick={openCreateModal}>
          Create branch
        </button>
      </div>

      {error ? <p className="auth-error">{error}</p> : null}
      {loading ? <p>Loading branches...</p> : null}

      <table className="ms-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {branches.map((branch) => (
            <tr key={branch.id}>
              <td>{branch.name}</td>
              <td>{branch.address || '-'}</td>
              <td>{branch.phone || '-'}</td>
              <td>{branch.email || '-'}</td>
              <td>
                <button
                  className={`status-switch ${branch.isActive ? 'active' : 'inactive'}`}
                  type="button"
                  onClick={() => void handleToggleActive(branch)}
                >
                  {branch.isActive ? 'Active' : 'Inactive'}
                </button>
              </td>
              <td>
                <div className="table-actions">
                  <button className="table-action-btn" type="button" onClick={() => void openEditModal(branch.id)}>
                    Edit
                  </button>
                  <button className="table-action-btn" type="button" onClick={() => void handleDelete(branch)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isCreateOpen ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>{editingBranchId ? 'Edit branch' : 'Create branch'}</h3>

            <form className="branch-form" onSubmit={handleSubmit}>
              <label className="form-field">
                <span>Name</span>
                <input
                  className="toolbar-input"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  required
                />
              </label>

              <label className="form-field">
                <span>Address</span>
                <input
                  className="toolbar-input"
                  value={form.address}
                  onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                />
              </label>

              <label className="form-field">
                <span>Phone</span>
                <input
                  className="toolbar-input"
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                />
              </label>

              <label className="form-field">
                <span>Email</span>
                <input
                  className="toolbar-input"
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
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
                  {isSaving ? 'Saving...' : editingBranchId ? 'Save changes' : 'Create branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
