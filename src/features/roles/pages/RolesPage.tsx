import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Field,
  Input,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  MessageBar,
  MessageBarBody,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@fluentui/react-components'
import { Add24Regular, MoreHorizontalRegular } from '@fluentui/react-icons'
import { apiRequest } from '../../../lib/apiClient'
import { EmptyState, PageStack, PageToolbar, TableActions, TableCard } from '../../../components/ui/FluentPage'

type Role = {
  id: number
  name: string
  description?: string | null
}

type ApiResponse<T> = {
  success?: boolean
  message?: string
  data: T
}

type UpsertRolePayload = {
  name: string
  description?: string
}

async function getRolesApi(): Promise<Role[]> {
  const response = await apiRequest<ApiResponse<Role[]> | Role[]>('/roles')
  return Array.isArray(response) ? response : response.data
}

async function createRoleApi(payload: UpsertRolePayload): Promise<Role> {
  const response = await apiRequest<ApiResponse<Role> | Role>('/roles', { method: 'POST', body: payload })
  return 'data' in response ? response.data : response
}

async function updateRoleApi(id: number, payload: UpsertRolePayload): Promise<Role> {
  const response = await apiRequest<ApiResponse<Role> | Role>(`/roles/${id}`, { method: 'PUT', body: payload })
  return 'data' in response ? response.data : response
}

async function deleteRoleApi(id: number): Promise<void> {
  await apiRequest(`/roles/${id}`, { method: 'DELETE' })
}

export function RolesPage() {
  const [rows, setRows] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createDescription, setCreateDescription] = useState('')

  const [editRoleId, setEditRoleId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const editingRole = useMemo(
    () => (editRoleId ? rows.find((role) => role.id === editRoleId) ?? null : null),
    [editRoleId, rows],
  )

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setRows(await getRolesApi())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load roles')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const resetCreateForm = () => {
    setCreateName('')
    setCreateDescription('')
  }

  const openEditDialog = (role: Role) => {
    setEditRoleId(role.id)
    setEditName(role.name)
    setEditDescription(role.description ?? '')
  }

  const closeEditDialog = () => {
    setEditRoleId(null)
    setEditName('')
    setEditDescription('')
  }

  const handleCreate = async () => {
    if (!createName.trim()) {
      setError('Role name is required')
      return
    }

    try {
      await createRoleApi({ name: createName.trim(), description: createDescription.trim() || undefined })
      setCreateOpen(false)
      resetCreateForm()
      await load()
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Failed to create role')
    }
  }

  const handleEdit = async () => {
    if (!editingRole) return
    if (!editName.trim()) {
      setError('Role name is required')
      return
    }

    try {
      await updateRoleApi(editingRole.id, { name: editName.trim(), description: editDescription.trim() || undefined })
      closeEditDialog()
      await load()
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Failed to update role')
    }
  }

  const handleDelete = async (role: Role) => {
    if (!window.confirm(`Delete role "${role.name}"?`)) return
    try {
      await deleteRoleApi(role.id)
      await load()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete role')
    }
  }

  return (
    <PageStack>
      <PageToolbar>
        <Button appearance="primary" icon={<Add24Regular />} onClick={() => setCreateOpen(true)}>
          Create role
        </Button>
      </PageToolbar>

      {error ? (
        <MessageBar intent="error">
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      ) : null}

      <TableCard title="Roles" subtitle={loading ? 'Loading roles...' : `Total ${rows.length} roles`}>
        {rows.length === 0 ? (
          <EmptyState
            title={loading ? 'Loading roles' : 'No roles found'}
            description={loading ? undefined : 'Create a role to get started.'}
          />
        ) : (
          <Table aria-label="Roles table">
            <colgroup>
              <col style={{ width: '12%' }} />
              <col style={{ width: '32%' }} />
              <col style={{ width: '46%' }} />
              <col style={{ width: '10%' }} />
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>ID</TableHeaderCell>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Description</TableHeaderCell>
                <TableHeaderCell style={{ textAlign: 'center' }}>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>{role.id}</TableCell>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.description || '-'}</TableCell>
                  <TableCell style={{ textAlign: 'center' }}>
                    <TableActions>
                      <Menu positioning="below-end">
                        <MenuTrigger disableButtonEnhancement>
                          <Button size="small" appearance="subtle" icon={<MoreHorizontalRegular />} aria-label="More actions" />
                        </MenuTrigger>
                        <MenuPopover>
                          <MenuList>
                            <MenuItem onClick={() => openEditDialog(role)}>Edit</MenuItem>
                            <MenuItem onClick={() => void handleDelete(role)}>Delete</MenuItem>
                          </MenuList>
                        </MenuPopover>
                      </Menu>
                    </TableActions>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableCard>

      <Dialog open={createOpen} onOpenChange={(_, data) => setCreateOpen(data.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Create role</DialogTitle>
            <DialogContent>
              <Field label="Name" required>
                <Input value={createName} onChange={(_, data) => setCreateName(data.value)} />
              </Field>
              <Field label="Description">
                <Input value={createDescription} onChange={(_, data) => setCreateDescription(data.value)} />
              </Field>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => { setCreateOpen(false); resetCreateForm() }}>
                Cancel
              </Button>
              <Button appearance="primary" onClick={() => void handleCreate()}>
                Save
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog open={Boolean(editingRole)} onOpenChange={(_, data) => !data.open && closeEditDialog()}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Edit role</DialogTitle>
            <DialogContent>
              <Field label="Name" required>
                <Input value={editName} onChange={(_, data) => setEditName(data.value)} />
              </Field>
              <Field label="Description">
                <Input value={editDescription} onChange={(_, data) => setEditDescription(data.value)} />
              </Field>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={closeEditDialog}>
                Cancel
              </Button>
              <Button appearance="primary" onClick={() => void handleEdit()}>
                Save
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </PageStack>
  )
}
