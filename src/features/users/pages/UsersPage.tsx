import { useEffect, useMemo, useState } from 'react'
import { navigateTo } from '../../../lib/navigation'
import {
  getBranchesApi,
  getRolesApi,
  getUserRolesApi,
  getUsersApi,
  updateUserRolesApi,
  updateUserStatusApi,
} from '../api'
import type { BranchDto, RoleDto, UserDto, UserRoleDto } from '../types'

type RolesMap = Record<number, UserRoleDto[]>

export function UsersPage() {
  const [users, setUsers] = useState<UserDto[]>([])
  const [rolesMap, setRolesMap] = useState<RolesMap>({})
  const [roles, setRoles] = useState<RoleDto[]>([])
  const [branches, setBranches] = useState<BranchDto[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [branchFilter, setBranchFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assignUserId, setAssignUserId] = useState<number | null>(null)
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])

  const assignUser = useMemo(
    () => (assignUserId ? users.find((user) => user.id === assignUserId) ?? null : null),
    [assignUserId, users],
  )

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [usersPage, allRoles, allBranches] = await Promise.all([
        getUsersApi({ search: search.trim(), branchId: branchFilter ? Number(branchFilter) : undefined }),
        getRolesApi(),
        getBranchesApi(),
      ])

      setUsers(usersPage.items)
      setRoles(allRoles)
      setBranches(allBranches)

      const rolesEntries = await Promise.all(
        usersPage.items.map(async (user) => [user.id, await getUserRolesApi(user.id)] as const),
      )

      setRolesMap(Object.fromEntries(rolesEntries))
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const filteredUsers = users.filter((user) => {
    if (!roleFilter) return true
    const userRoles = rolesMap[user.id] ?? []
    return userRoles.some((role) => String(role.roleId) === roleFilter)
  })

  const handleToggleStatus = async (user: UserDto) => {
    const nextStatus = user.status.toLowerCase() === 'active' ? 'inactive' : 'active'

    try {
      await updateUserStatusApi(user.id, nextStatus)
      await loadData()
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Failed to update status')
    }
  }

  const openAssignRoles = (user: UserDto) => {
    const userRoles = rolesMap[user.id] ?? []
    setAssignUserId(user.id)
    setSelectedRoleIds(userRoles.map((role) => role.roleId))
  }

  const handleSaveRoles = async () => {
    if (!assignUserId) return

    try {
      const updated = await updateUserRolesApi(assignUserId, selectedRoleIds)
      setRolesMap((prev) => ({ ...prev, [assignUserId]: updated }))
      setAssignUserId(null)
    } catch (assignError) {
      setError(assignError instanceof Error ? assignError.message : 'Failed to assign roles')
    }
  }

  return (
    <>
      <div className="users-toolbar">
        <div className="users-filters">
          <input
            className="toolbar-input"
            type="text"
            placeholder="Search by name, email, phone"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select className="toolbar-select" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="">All roles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>

          <select className="toolbar-select" value={branchFilter} onChange={(event) => setBranchFilter(event.target.value)}>
            <option value="">All branches</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>

          <button className="ms-button ms-button--secondary" type="button" onClick={() => void loadData()}>
            Apply filters
          </button>
        </div>

        <button className="ms-button" type="button" onClick={() => navigateTo('/users/create')}>
          Create user
        </button>
      </div>

      {error ? <p className="auth-error">{error}</p> : null}
      {loading ? <p>Loading users...</p> : null}

      <table className="ms-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Branch</th>
            <th>Roles</th>
            <th>Status</th>
            <th>Last Login</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => {
            const userRoles = rolesMap[user.id] ?? []
            const isActive = user.status.toLowerCase() === 'active'

            return (
              <tr key={user.id}>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.phone || '-'}</td>
                <td>{user.branchName || '-'}</td>
                <td>{userRoles.length ? userRoles.map((role) => role.roleName).join(', ') : '-'}</td>
                <td>
                  <span className={`status-badge ${isActive ? 'status-active' : 'status-inactive'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>{user.lastLoginAtUtc ? new Date(user.lastLoginAtUtc).toLocaleString() : '-'}</td>
                <td>
                  <div className="table-actions">
                    <button className="table-action-btn" type="button" onClick={() => navigateTo(`/users/${user.id}/edit`)}>
                      Edit
                    </button>
                    <button className="table-action-btn" type="button" onClick={() => openAssignRoles(user)}>
                      Assign roles
                    </button>
                    <button className="table-action-btn" type="button" onClick={() => void handleToggleStatus(user)}>
                      {isActive ? 'Lock' : 'Unlock'}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {assignUser ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Assign Roles: {assignUser.fullName}</h3>
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

            <div className="modal-actions">
              <button className="ms-button ms-button--secondary" type="button" onClick={() => setAssignUserId(null)}>
                Cancel
              </button>
              <button className="ms-button" type="button" onClick={() => void handleSaveRoles()}>
                Save roles
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
