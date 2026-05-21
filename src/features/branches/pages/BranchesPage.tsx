import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@fluentui/react-components'
import { Add24Regular, MoreHorizontalRegular } from '@fluentui/react-icons'
import { Pagination } from '../../../components/ui/Pagination'
import { EmptyState, PageStack, PageToolbar, TableActions, TableCard } from '../../../components/ui/FluentPage'
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
  const pageSize = 20
  const [branches, setBranches] = useState<BranchDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingBranchId, setEditingBranchId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(initialFormState)
  const [isSaving, setIsSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [branchToDelete, setBranchToDelete] = useState<BranchDto | null>(null)

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

  const pagedBranches = branches.slice((page - 1) * pageSize, page * pageSize)

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

  const handleDelete = async () => {
    if (!branchToDelete) return
    try {
      await deleteBranchApi(branchToDelete.id)
      setBranchToDelete(null)
      await loadBranches()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete branch')
    }
  }

  return (
    <PageStack>
      <PageToolbar>
        <div />
        <Button appearance="primary" icon={<Add24Regular />} type="button" onClick={openCreateModal}>
          Create branch
        </Button>
      </PageToolbar>

      {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}

      <TableCard
        title="Branches"
        subtitle={`${branches.length.toLocaleString()} total branches`}
        footer={<Pagination page={page} pageSize={pageSize} totalCount={branches.length} onPageChange={setPage} />}
      >
        {loading ? (
          <div style={{ padding: 16 }}><Spinner label="Loading branches..." /></div>
        ) : pagedBranches.length === 0 ? (
          <EmptyState title="No branches found" description="Create a branch to get started." />
        ) : (
          <Table aria-label="Branches table">
            <TableHeader>
              <TableRow>
                <TableHeaderCell style={{ width: '7ch', minWidth: '7ch', whiteSpace: 'nowrap' }}>ID</TableHeaderCell>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Address</TableHeaderCell>
                <TableHeaderCell>Phone</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Active</TableHeaderCell>
                <TableHeaderCell style={{ textAlign: 'center' }}>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedBranches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell style={{ width: '7ch', minWidth: '7ch', whiteSpace: 'nowrap' }}>{branch.id}</TableCell>
                  <TableCell>{branch.name}</TableCell>
                  <TableCell>{branch.address || '-'}</TableCell>
                  <TableCell>{branch.phone || '-'}</TableCell>
                  <TableCell>{branch.email || '-'}</TableCell>
                  <TableCell>
                    <Button size="small" appearance="subtle" onClick={() => void handleToggleActive(branch)}>
                      <Badge appearance="filled" color={branch.isActive ? 'success' : 'danger'}>
                        {branch.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Button>
                  </TableCell>
                  <TableCell style={{ textAlign: 'center' }}>
                    <TableActions>
                      <Menu positioning="below-end">
                        <MenuTrigger disableButtonEnhancement>
                          <Button size="small" appearance="subtle" icon={<MoreHorizontalRegular />} aria-label="More actions" />
                        </MenuTrigger>
                        <MenuPopover>
                          <MenuList>
                            <MenuItem onClick={() => void openEditModal(branch.id)}>Edit</MenuItem>
                            <MenuItem onClick={() => setBranchToDelete(branch)}>Delete</MenuItem>
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

      <Dialog open={isCreateOpen} onOpenChange={(_, data) => !data.open && closeModal()}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{editingBranchId ? 'Edit branch' : 'Create branch'}</DialogTitle>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <Field label="Name" required>
                  <Input
                    value={form.name}
                    onChange={(_, data) => setForm((prev) => ({ ...prev, name: data.value }))}
                    required
                  />
                </Field>

                <Field label="Address">
                  <Input
                    value={form.address}
                    onChange={(_, data) => setForm((prev) => ({ ...prev, address: data.value }))}
                  />
                </Field>

                <Field label="Phone">
                  <Input
                    value={form.phone}
                    onChange={(_, data) => setForm((prev) => ({ ...prev, phone: data.value }))}
                  />
                </Field>

                <Field label="Email">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(_, data) => setForm((prev) => ({ ...prev, email: data.value }))}
                  />
                </Field>

                <Field label="Status">
                  <Switch
                    checked={form.isActive}
                    onChange={(_, data) => setForm((prev) => ({ ...prev, isActive: data.checked }))}
                    label={form.isActive ? 'Active' : 'Inactive'}
                  />
                </Field>

                <DialogActions>
                  <DialogTrigger disableButtonEnhancement>
                    <Button appearance="secondary" type="button" onClick={closeModal}>
                      Cancel
                    </Button>
                  </DialogTrigger>
                  <Button appearance="primary" type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : editingBranchId ? 'Save changes' : 'Create branch'}
                  </Button>
                </DialogActions>
              </form>
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog open={Boolean(branchToDelete)} onOpenChange={(_, data) => !data.open && setBranchToDelete(null)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Delete branch</DialogTitle>
            <DialogContent>
              Delete "{branchToDelete?.name}"?
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement><Button appearance="secondary">Cancel</Button></DialogTrigger>
              <Button appearance="primary" onClick={() => void handleDelete()}>Delete</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </PageStack>
  )
}
