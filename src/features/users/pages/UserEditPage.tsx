import { useEffect, useState } from 'react'
import { navigateTo } from '../../../lib/navigation'
import { getBranchesApi, getUserApi, updateUserApi } from '../api'
import type { BranchDto } from '../types'

type UserEditPageProps = {
  userId: string
}

export function UserEditPage({ userId }: UserEditPageProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [branchId, setBranchId] = useState('')
  const [password, setPassword] = useState('')
  const [branches, setBranches] = useState<BranchDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const id = Number(userId)
        const [user, allBranches] = await Promise.all([getUserApi(id), getBranchesApi()])
        setFullName(user.fullName)
        setEmail(user.email)
        setPhone(user.phone ?? '')
        setBranchId(user.branchId ? String(user.branchId) : '')
        setBranches(allBranches)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load user')
      }
    }

    void load()
  }, [userId])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await updateUserApi(Number(userId), {
        fullName,
        email,
        phone,
        branchId: branchId ? Number(branchId) : null,
        passwordHash: password || undefined,
      })

      navigateTo('/users', true)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to update user')
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
        <input className="toolbar-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
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
        <span>New password (optional)</span>
        <input
          className="toolbar-input"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>

      <div className="form-actions">
        <button className="ms-button ms-button--secondary" type="button" onClick={() => navigateTo('/users')}>
          Cancel
        </button>
        <button className="ms-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
