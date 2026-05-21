import { useEffect, useMemo, useState } from 'react'
import {
  Input,
  Badge,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Field,
  MessageBar,
  MessageBarBody,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  SearchBox,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import { Add24Regular, MoreHorizontalRegular } from '@fluentui/react-icons'
import { navigateTo } from '../../../lib/navigation'
import { Pagination } from '../../../components/ui/Pagination'
import { EmptyState, FilterGroup, FilterItem, PageStack, PageToolbar, TableActions, TableCard } from '../../../components/ui/FluentPage'
import {
  updateUserApi,
  getBranchesApi,
  getRolesApi,
  getUserRolesApi,
  getUsersApi,
  updateUserRolesApi,
  updateUserStatusApi,
} from '../api'
import type { BranchDto, RoleDto, UserDto, UserRoleDto } from '../types'

type RolesMap = Record<number, UserRoleDto[]>
const pageSize = 20

const useStyles = makeStyles({
  roleList: {
    display: 'grid',
    gap: tokens.spacingVerticalS,
    maxHeight: '280px',
    overflowY: 'auto',
  },
  noWrap: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  actionsCenter: {
    textAlign: 'center',
  },
})

export function UsersPage() {
  const styles = useStyles()
  const [users, setUsers] = useState<UserDto[]>([])
  const [rolesMap, setRolesMap] = useState<RolesMap>({})
  const [roles, setRoles] = useState<RoleDto[]>([])
  const [branches, setBranches] = useState<BranchDto[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [branchFilter, setBranchFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assignUserId, setAssignUserId] = useState<number | null>(null)
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([])
  const [editUserId, setEditUserId] = useState<number | null>(null)
  const [editFullName, setEditFullName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editBranchId, setEditBranchId] = useState('')
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active')

  const assignUser = useMemo(
    () => (assignUserId ? users.find((user) => user.id === assignUserId) ?? null : null),
    [assignUserId, users],
  )
  const editUser = useMemo(
    () => (editUserId ? users.find((user) => user.id === editUserId) ?? null : null),
    [editUserId, users],
  )

  const loadData = async (nextPage = page) => {
    setLoading(true)
    setError(null)

    try {
      const [usersPage, allRoles, allBranches] = await Promise.all([
        getUsersApi({
          search: search.trim(),
          branchId: branchFilter ? Number(branchFilter) : undefined,
          page: nextPage,
          pageSize,
        }),
        getRolesApi(),
        getBranchesApi(),
      ])

      setUsers(usersPage.items)
      setPage(usersPage.pageNumber)
      setTotalPages(usersPage.totalPages || 1)
      setTotalCount(usersPage.totalCount)
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
    void loadData(1)
  }, [])

  const applyFilters = async () => {
    await loadData(1)
  }

  const goToPage = async (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return
    await loadData(nextPage)
  }

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

  const openEditDialog = (user: UserDto) => {
    setEditUserId(user.id)
    setEditFullName(user.fullName)
    setEditEmail(user.email)
    setEditPhone(user.phone ?? '')
    setEditBranchId(user.branchId ? String(user.branchId) : '')
    setEditStatus(user.status.toLowerCase() === 'active' ? 'active' : 'inactive')
  }

  const closeEditDialog = () => {
    setEditUserId(null)
    setEditFullName('')
    setEditEmail('')
    setEditPhone('')
    setEditBranchId('')
    setEditStatus('active')
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

  const handleSaveEditUser = async () => {
    if (!editUser) return
    if (!editFullName.trim()) {
      setError('Full name is required')
      return
    }
    if (!editEmail.trim()) {
      setError('Email is required')
      return
    }

    try {
      await updateUserApi(editUser.id, {
        fullName: editFullName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim(),
        branchId: editBranchId ? Number(editBranchId) : null,
      })
      const currentStatus = editUser.status.toLowerCase() === 'active' ? 'active' : 'inactive'
      if (currentStatus !== editStatus) {
        await updateUserStatusApi(editUser.id, editStatus)
      }
      closeEditDialog()
      await loadData()
    } catch (editError) {
      setError(editError instanceof Error ? editError.message : 'Failed to update user')
    }
  }

  return (
    <PageStack>
      <PageToolbar>
        <FilterGroup>
          <FilterItem>
            <Field label="Search">
              <SearchBox
                placeholder="Name, email, phone"
                value={search}
                onChange={(_, data) => setSearch(data.value)}
              />
            </Field>
          </FilterItem>

          <FilterItem>
            <Field label="Role">
              <Select value={roleFilter} onChange={(event) => setRoleFilter(event.currentTarget.value)}>
                <option value="">All roles</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </Select>
            </Field>
          </FilterItem>

          <FilterItem>
            <Field label="Branch">
              <Select value={branchFilter} onChange={(event) => setBranchFilter(event.currentTarget.value)}>
                <option value="">All branches</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </Select>
            </Field>
          </FilterItem>

          <Button appearance="secondary" disabled={loading} onClick={() => void applyFilters()}>
            Apply filters
          </Button>
        </FilterGroup>

        <Button appearance="primary" icon={<Add24Regular />} onClick={() => navigateTo('/users/create')}>
          Create user
        </Button>
      </PageToolbar>

      {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}

      <TableCard
        title="System users"
        subtitle={`Showing ${filteredUsers.length} of ${totalCount} users`}
        footer={<Pagination page={page} pageSize={pageSize} totalCount={totalCount} onPageChange={(p) => void goToPage(p)} />}
      >
        {filteredUsers.length === 0 ? (
          <EmptyState title={loading ? 'Loading users' : 'No users found'} description={loading ? undefined : 'Adjust filters or create a new user.'} />
        ) : (
          <Table aria-label="Users table">
            <colgroup>
              <col style={{ width: '6%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '24%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '6%' }} />
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>ID</TableHeaderCell>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Phone</TableHeaderCell>
                <TableHeaderCell>Branch</TableHeaderCell>
                <TableHeaderCell>Roles</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className={styles.actionsCenter}>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const userRoles = rolesMap[user.id] ?? []
                const isActive = user.status.toLowerCase() === 'active'

                return (
                  <TableRow key={user.id}>
                    <TableCell className={styles.noWrap}>{user.id}</TableCell>
                    <TableCell className={styles.noWrap}>{user.fullName}</TableCell>
                    <TableCell className={styles.noWrap}>{user.email}</TableCell>
                    <TableCell className={styles.noWrap}>{user.phone || '-'}</TableCell>
                    <TableCell className={styles.noWrap}>{user.branchName || '-'}</TableCell>
                    <TableCell className={styles.noWrap}>{userRoles.length ? userRoles.map((role) => role.roleName).join(', ') : '-'}</TableCell>
                    <TableCell>
                      <Badge appearance="filled" color={isActive ? 'success' : 'danger'}>
                        {isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className={styles.actionsCenter}>
                      <TableActions>
                        <Menu positioning="below-end">
                          <MenuTrigger disableButtonEnhancement>
                            <Button size="small" appearance="subtle" icon={<MoreHorizontalRegular />} aria-label="More actions" />
                          </MenuTrigger>
                          <MenuPopover>
                            <MenuList>
                              <MenuItem onClick={() => openEditDialog(user)}>Edit</MenuItem>
                              <MenuItem onClick={() => openAssignRoles(user)}>Assign roles</MenuItem>
                              <MenuItem onClick={() => void handleToggleStatus(user)}>{isActive ? 'Lock' : 'Unlock'}</MenuItem>
                            </MenuList>
                          </MenuPopover>
                        </Menu>
                      </TableActions>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </TableCard>

      <Dialog open={Boolean(assignUser)} onOpenChange={(_, data) => !data.open && setAssignUserId(null)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Assign Roles: {assignUser?.fullName}</DialogTitle>
            <DialogContent>
              <div className={styles.roleList}>
                {roles.map((role) => (
                  <Checkbox
                    key={role.id}
                    label={role.name}
                    checked={selectedRoleIds.includes(role.id)}
                    onChange={(_, data) => {
                      setSelectedRoleIds((prev) =>
                        data.checked ? [...prev, role.id] : prev.filter((id) => id !== role.id),
                      )
                    }}
                  />
                ))}
              </div>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Cancel</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={() => void handleSaveRoles()}>
                Save roles
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog open={Boolean(editUser)} onOpenChange={(_, data) => !data.open && closeEditDialog()}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Edit User: {editUser?.fullName}</DialogTitle>
            <DialogContent>
              <Field label="Full name" required>
                <Input value={editFullName} onChange={(_, data) => setEditFullName(data.value)} />
              </Field>
              <Field label="Email" required>
                <Input value={editEmail} onChange={(_, data) => setEditEmail(data.value)} />
              </Field>
              <Field label="Phone">
                <Input value={editPhone} onChange={(_, data) => setEditPhone(data.value)} />
              </Field>
              <Field label="Branch">
                <Select value={editBranchId} onChange={(event) => setEditBranchId(event.currentTarget.value)}>
                  <option value="">No branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Status">
                <Select
                  value={editStatus}
                  onChange={(event) => setEditStatus(event.currentTarget.value === 'inactive' ? 'inactive' : 'active')}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </Field>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={closeEditDialog}>
                Cancel
              </Button>
              <Button appearance="primary" onClick={() => void handleSaveEditUser()}>
                Save
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </PageStack>
  )
}
