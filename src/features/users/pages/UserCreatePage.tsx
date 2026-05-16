import { useEffect, useState } from 'react'
import { navigateTo } from '../../../lib/navigation'
import { createUserApi, getBranchesApi, getRolesApi, updateUserRolesApi } from '../api'
import type { BranchDto, RoleDto } from '../types'

export function UserCreatePage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [branchId, setBranchId] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('active')
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])
  const [roles, setRoles] = useState<RoleDto[]>([])
  const [branches, setBranches] = useState<BranchDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [allRoles, allBranches] = await Promise.all([getRolesApi(), getBranchesApi()])
        setRoles(allRoles)
        setBranches(allBranches)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load form options')
      }
    }

    void loadOptions()
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const user = await createUserApi({
        fullName,
        email,
        phone,
        branchId: branchId ? Number(branchId) : null,
        passwordHash: password,
        status,
      })

      if (selectedRoleIds.length) {
        await updateUserRolesApi(user.id, selectedRoleIds)
      }

      navigateTo('/users', true)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to create user')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="user-form" onSubmit={handleSubmit}>
      {error ? <p className="auth-error">{error}</p> : null}

      <label className="form-field">
        <span>Full name</span>
        <input className="toolbar-input" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
      </label>

      <label className="form-field">
        <span>Email</span>
        <input
          className="toolbar-input"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label className="form-field">
        <span>Phone</span>
        <input className="toolbar-input" value={phone} onChange={(event) => setPhone(event.target.value)} />
      </label>

      <label className="form-field">
        <span>Branch</span>
        <select className="toolbar-select" value={branchId} onChange={(event) => setBranchId(event.target.value)}>
          <option value="">No branch</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.name}
            </option>
          ))}
        </select>
      </label>

      <label className="form-field">
        <span>Password</span>
        <input
          className="toolbar-input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>

      <label className="form-field">
        <span>Status</span>
        <select className="toolbar-select" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </label>

      <fieldset className="form-fieldset">
        <legend>Roles</legend>
        <div className="role-list">
          {roles.map((role) => (
            <label key={role.id} className="role-item">
              <input
                type="checkbox"
                checked={selectedRoleIds.includes(role.id)}
                onChange={(event) => {
                  setSelectedRoleIds((prev) =>
                    event.target.checked ? [...prev, role.id] : prev.filter((id) => id !== role.id),
                  )
                }}
              />
              {role.name}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="form-actions">
        <button className="ms-button ms-button--secondary" type="button" onClick={() => navigateTo('/users')}>
          Cancel
        </button>
        <button className="ms-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create user'}
        </button>
      </div>
    </form>
  )
}
