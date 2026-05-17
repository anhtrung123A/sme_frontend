import { useEffect, useMemo, useState } from 'react'
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
  Select,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@fluentui/react-components'
import { Add24Regular } from '@fluentui/react-icons'
import { Pagination } from '../../../components/ui/Pagination'
import { EmptyState, FilterGroup, FilterItem, PageStack, PageToolbar, TableActions, TableCard } from '../../../components/ui/FluentPage'
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
  const pageSize = 20
  const [rooms, setRooms] = useState<RoomDto[]>([])
  const [branches, setBranches] = useState<BranchDto[]>([])
  const [branchFilter, setBranchFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRoomId, setEditingRoomId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(initialForm)
  const [isSaving, setIsSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [roomToDelete, setRoomToDelete] = useState<RoomDto | null>(null)

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

  const pagedRooms = rooms.slice((page - 1) * pageSize, page * pageSize)

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

  const handleDelete = async () => {
    if (!roomToDelete) return
    try {
      await deleteRoomApi(roomToDelete.id)
      setRoomToDelete(null)
      await loadData()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete room')
    }
  }

  return (
    <PageStack>
      <PageToolbar>
        <FilterGroup>
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
        </FilterGroup>
        <Button appearance="primary" icon={<Add24Regular />} onClick={openCreate}>
          Create room
        </Button>
      </PageToolbar>

      {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}

      <TableCard
        title="Rooms"
        subtitle={`${rooms.length.toLocaleString()} total rooms`}
        footer={<Pagination page={page} pageSize={pageSize} totalCount={rooms.length} onPageChange={setPage} />}
      >
        {loading ? (
          <div style={{ padding: 16 }}><Spinner label="Loading rooms..." /></div>
        ) : pagedRooms.length === 0 ? (
          <EmptyState title="No rooms found" description="Create a new room or adjust branch filter." />
        ) : (
          <Table aria-label="Rooms table">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Room Name</TableHeaderCell>
                <TableHeaderCell>Branch</TableHeaderCell>
                <TableHeaderCell>Capacity</TableHeaderCell>
                <TableHeaderCell>Active</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedRooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>{room.name}</TableCell>
                  <TableCell>{room.branchName}</TableCell>
                  <TableCell>{room.capacity ?? '-'}</TableCell>
                  <TableCell>
                    <Badge appearance="filled" color={room.isActive ? 'success' : 'danger'}>
                      {room.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <TableActions>
                      <Button size="small" appearance="subtle" onClick={() => void openEdit(room.id)}>
                        Edit
                      </Button>
                      <Button size="small" appearance="subtle" onClick={() => setRoomToDelete(room)}>
                        Delete
                      </Button>
                    </TableActions>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableCard>

      <Dialog open={isModalOpen} onOpenChange={(_, data) => !data.open && closeModal()}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>{editingRoomId ? 'Edit room' : 'Create room'}</DialogTitle>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <Field label="Room name" required>
                  <Input
                    value={form.name}
                    onChange={(_, data) => setForm((prev) => ({ ...prev, name: data.value }))}
                    required
                  />
                </Field>

                <Field label="Branch" required>
                  <Select
                    value={form.branchId}
                    onChange={(event) => setForm((prev) => ({ ...prev, branchId: event.currentTarget.value }))}
                    required
                  >
                    <option value="">Select branch</option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Capacity">
                  <Input
                    type="number"
                    min={1}
                    value={form.capacity}
                    onChange={(_, data) => setForm((prev) => ({ ...prev, capacity: data.value }))}
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
                    <Button appearance="secondary" type="button" onClick={closeModal}>Cancel</Button>
                  </DialogTrigger>
                  <Button appearance="primary" type="submit" disabled={isSaving}>
                    {isSaving ? 'Saving...' : editingRoomId ? 'Save changes' : 'Create room'}
                  </Button>
                </DialogActions>
              </form>
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog open={Boolean(roomToDelete)} onOpenChange={(_, data) => !data.open && setRoomToDelete(null)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Delete room</DialogTitle>
            <DialogContent>
              Delete "{roomToDelete?.name}"?
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
