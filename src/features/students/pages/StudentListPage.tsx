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
  SearchBox,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@fluentui/react-components'
import { Add24Regular, MoreHorizontalRegular } from '@fluentui/react-icons'
import { navigateTo } from '../../../lib/navigation'
import { formatStatusLabel } from '../../../lib/formatStatus'
import { Pagination } from '../../../components/ui/Pagination'
import { EmptyState, FilterGroup, FilterItem, PageStack, PageToolbar, TableActions, TableCard } from '../../../components/ui/FluentPage'
import { useAuthRoles } from '../../auth/useAuthRoles'
import { deleteStudentApi, getBranchesApi, getStudentsApi, updateStudentApi, updateStudentStatusApi } from '../api'
import type { BranchDto, StudentDto } from '../types'

const statuses = ['potential', 'active', 'inactive', 'completed', 'dropped']

function getStudentStatusColor(status: string) {
  if (status === 'active' || status === 'completed') return 'success'
  if (status === 'potential') return 'brand'
  if (status === 'inactive' || status === 'dropped') return 'danger'
  return 'subtle'
}

export function StudentListPage() {
  const pageSize = 20
  const roles = useAuthRoles()
  const canDelete = roles.includes('Admin') || roles.includes('Manager')

  const [items, setItems] = useState<StudentDto[]>([])
  const [branches, setBranches] = useState<BranchDto[]>([])
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [branchId, setBranchId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [viewStudent, setViewStudent] = useState<StudentDto | null>(null)
  const [editStudent, setEditStudent] = useState<StudentDto | null>(null)
  const [editForm, setEditForm] = useState({ fullName: '', phone: '', email: '', status: 'potential', gender: '', address: '' })

  const load = async (nextPage = page) => {
    try {
      const [students, br] = await Promise.all([
        getStudentsApi({ keyword: keyword || undefined, status: status || undefined, branchId: branchId ? Number(branchId) : undefined, page: nextPage, pageSize }),
        getBranchesApi(),
      ])
      setItems(students.items)
      setTotalCount(students.totalCount)
      setPage(students.pageNumber)
      setBranches(br)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load students')
    }
  }

  const openEditStudent = (s: StudentDto) => {
    setEditStudent(s)
    setEditForm({
      fullName: s.fullName,
      phone: s.phone ?? '',
      email: s.email ?? '',
      status: s.status,
      gender: s.gender ?? '',
      address: s.address ?? '',
    })
  }

  const saveEditStudent = async () => {
    if (!editStudent) return
    await updateStudentApi(editStudent.id, {
      branchId: editStudent.branchId,
      fullName: editForm.fullName,
      email: editForm.email || null,
      phone: editForm.phone || null,
      dateOfBirth: editStudent.dateOfBirth,
      gender: editForm.gender || null,
      address: editForm.address || null,
      status: editForm.status,
    })
    setEditStudent(null)
    await load()
  }

  useEffect(() => { void load(1) }, [])

  return (
    <PageStack>
      <PageToolbar>
        <FilterGroup>
          <FilterItem>
            <Field label="Search">
              <SearchBox placeholder="Keyword" value={keyword} onChange={(_, data) => setKeyword(data.value)} />
            </Field>
          </FilterItem>
          <FilterItem>
            <Field label="Status">
              <Select value={status} onChange={(e) => setStatus(e.currentTarget.value)}>
                <option value="">All status</option>
                {statuses.map((s) => <option key={s}>{formatStatusLabel(s)}</option>)}
              </Select>
            </Field>
          </FilterItem>
          <FilterItem>
            <Field label="Branch">
              <Select value={branchId} onChange={(e) => setBranchId(e.currentTarget.value)}>
                <option value="">All branches</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </Field>
          </FilterItem>
          <Button appearance="secondary" onClick={() => void load(1)}>Apply</Button>
        </FilterGroup>
        <Button appearance="primary" icon={<Add24Regular />} onClick={() => navigateTo('/students/create')}>
          Create student
        </Button>
      </PageToolbar>

      {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}

      <TableCard title="Students" subtitle={`${totalCount.toLocaleString()} total students`} footer={<Pagination page={page} pageSize={pageSize} totalCount={totalCount} onPageChange={(p) => void load(p)} />}>
        {items.length === 0 ? (
          <EmptyState title="No students found" description="Adjust filters or create a new student." />
        ) : (
          <Table aria-label="Students table">
            <TableHeader>
              <TableRow>
                <TableHeaderCell style={{ width: '7ch', minWidth: '7ch', whiteSpace: 'nowrap' }}>ID</TableHeaderCell>
                <TableHeaderCell>Student code</TableHeaderCell>
                <TableHeaderCell>Full name</TableHeaderCell>
                <TableHeaderCell>Phone</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Branch</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((s) => (
                <TableRow key={s.id}>
                  <TableCell style={{ width: '7ch', minWidth: '7ch', whiteSpace: 'nowrap' }}>{s.id}</TableCell>
                  <TableCell>{s.studentCode}</TableCell>
                  <TableCell>{s.fullName}</TableCell>
                  <TableCell>{s.phone ?? '-'}</TableCell>
                  <TableCell>{s.email ?? '-'}</TableCell>
                  <TableCell><Badge appearance="filled" color={getStudentStatusColor(s.status)}>{formatStatusLabel(s.status)}</Badge></TableCell>
                  <TableCell>{s.branchName ?? '-'}</TableCell>
                  <TableCell>
                    <TableActions>
                      <Menu positioning="below-end">
                        <MenuTrigger disableButtonEnhancement>
                          <Button size="small" appearance="subtle" icon={<MoreHorizontalRegular />} aria-label="More actions" />
                        </MenuTrigger>
                        <MenuPopover>
                          <MenuList>
                            <MenuItem onClick={() => setViewStudent(s)}>View</MenuItem>
                            <MenuItem onClick={() => openEditStudent(s)}>Edit</MenuItem>
                            <MenuItem onClick={async () => { const ns = window.prompt('New status:', s.status); if (ns) { await updateStudentStatusApi(s.id, ns); await load() } }}>Status</MenuItem>
                            {canDelete ? <MenuItem onClick={async () => { if (window.confirm(`Delete ${s.fullName}?`)) { await deleteStudentApi(s.id); await load() } }}>Delete</MenuItem> : null}
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

      <Dialog open={Boolean(viewStudent)} onOpenChange={(_, data) => !data.open && setViewStudent(null)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Student Detail</DialogTitle>
            <DialogContent>
              {viewStudent ? (
                <div style={{ display: 'grid', gap: 8 }}>
                  <div>ID: {viewStudent.id}</div>
                  <div>Code: {viewStudent.studentCode}</div>
                  <div>Full name: {viewStudent.fullName}</div>
                  <div>Phone: {viewStudent.phone ?? '-'}</div>
                  <div>Email: {viewStudent.email ?? '-'}</div>
                  <div>Status: {formatStatusLabel(viewStudent.status)}</div>
                  <div>Branch: {viewStudent.branchName ?? '-'}</div>
                </div>
              ) : null}
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement><Button appearance="secondary">Close</Button></DialogTrigger>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog open={Boolean(editStudent)} onOpenChange={(_, data) => !data.open && setEditStudent(null)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogContent>
              <div style={{ display: 'grid', gap: 10 }}>
                <Field label="Full name"><Input value={editForm.fullName} onChange={(_, d) => setEditForm((p) => ({ ...p, fullName: d.value }))} /></Field>
                <Field label="Phone"><Input value={editForm.phone} onChange={(_, d) => setEditForm((p) => ({ ...p, phone: d.value }))} /></Field>
                <Field label="Email"><Input value={editForm.email} onChange={(_, d) => setEditForm((p) => ({ ...p, email: d.value }))} /></Field>
                <Field label="Status"><Select value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.currentTarget.value }))}>{statuses.map((st) => <option key={st} value={st}>{formatStatusLabel(st)}</option>)}</Select></Field>
                <Field label="Gender"><Input value={editForm.gender} onChange={(_, d) => setEditForm((p) => ({ ...p, gender: d.value }))} /></Field>
                <Field label="Address"><Input value={editForm.address} onChange={(_, d) => setEditForm((p) => ({ ...p, address: d.value }))} /></Field>
              </div>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement><Button appearance="secondary">Cancel</Button></DialogTrigger>
              <Button appearance="primary" onClick={() => void saveEditStudent()}>Save</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </PageStack>
  )
}
