import { useEffect, useMemo, useState } from 'react'
import {
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
import { Add24Regular } from '@fluentui/react-icons'
import { navigateTo } from '../../../lib/navigation'
import { Pagination } from '../../../components/ui/Pagination'
import { EmptyState, FilterGroup, FilterItem, PageStack, PageToolbar, TableActions, TableCard } from '../../../components/ui/FluentPage'
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
const pageSize = 20

const useStyles = makeStyles({
  roleList: {
    display: 'grid',
    gap: tokens.spacingVerticalS,
    maxHeight: '280px',
    overflowY: 'auto',
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

  const assignUser = useMemo(
    () => (assignUserId ? users.find((user) => user.id === assignUserId) ?? null : null),
    [assignUserId, users],
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
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Phone</TableHeaderCell>
                <TableHeaderCell>Branch</TableHeaderCell>
                <TableHeaderCell>Roles</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const userRoles = rolesMap[user.id] ?? []
                const isActive = user.status.toLowerCase() === 'active'

                return (
                  <TableRow key={user.id}>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>{user.branchName || '-'}</TableCell>
                    <TableCell>{userRoles.length ? userRoles.map((role) => role.roleName).join(', ') : '-'}</TableCell>
                    <TableCell>
                      <Badge appearance="filled" color={isActive ? 'success' : 'danger'}>
                        {isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <TableActions>
                        <Button size="small" appearance="subtle" onClick={() => navigateTo(`/users/${user.id}/edit`)}>Edit</Button>
                        <Button size="small" appearance="subtle" onClick={() => openAssignRoles(user)}>Assign roles</Button>
                        <Button size="small" appearance="subtle" onClick={() => void handleToggleStatus(user)}>{isActive ? 'Lock' : 'Unlock'}</Button>
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
    </PageStack>
  )
}
