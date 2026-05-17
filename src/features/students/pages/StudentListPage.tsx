import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Button,
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
} from '@fluentui/react-components'
import { Add24Regular } from '@fluentui/react-icons'
import { navigateTo } from '../../../lib/navigation'
import { formatStatusLabel } from '../../../lib/formatStatus'
import { Pagination } from '../../../components/ui/Pagination'
import { EmptyState, FilterGroup, FilterItem, KpiCard, KpiGrid, PageStack, PageToolbar, TableActions, TableCard } from '../../../components/ui/FluentPage'
import { useAuthRoles } from '../../auth/useAuthRoles'
import { deleteStudentApi, getBranchesApi, getStudentsApi, updateStudentStatusApi } from '../api'
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

  const kpis = useMemo(() => {
    return {
      total: items.length,
      potential: items.filter((x) => x.status === 'potential').length,
      active: items.filter((x) => x.status === 'active').length,
      dropped: items.filter((x) => x.status === 'inactive' || x.status === 'dropped').length,
    }
  }, [items])

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

  useEffect(() => { void load(1) }, [])

  return (
    <PageStack>
      <KpiGrid>
        <KpiCard label="Total Students" value={kpis.total} />
        <KpiCard label="Potential" value={kpis.potential} />
        <KpiCard label="Active" value={kpis.active} />
        <KpiCard label="Inactive / Dropped" value={kpis.dropped} />
      </KpiGrid>

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
                  <TableCell>{s.studentCode}</TableCell>
                  <TableCell>{s.fullName}</TableCell>
                  <TableCell>{s.phone ?? '-'}</TableCell>
                  <TableCell>{s.email ?? '-'}</TableCell>
                  <TableCell><Badge appearance="filled" color={getStudentStatusColor(s.status)}>{formatStatusLabel(s.status)}</Badge></TableCell>
                  <TableCell>{s.branchName ?? '-'}</TableCell>
                  <TableCell>
                    <TableActions>
                      <Button size="small" appearance="subtle" onClick={() => navigateTo(`/students/${s.id}`)}>View</Button>
                      <Button size="small" appearance="subtle" onClick={() => navigateTo(`/students/${s.id}/edit`)}>Edit</Button>
                      <Button size="small" appearance="subtle" onClick={async () => { const ns = window.prompt('New status:', s.status); if (ns) { await updateStudentStatusApi(s.id, ns); await load() } }}>Status</Button>
                      {canDelete ? <Button size="small" appearance="subtle" onClick={async () => { if (window.confirm(`Delete ${s.fullName}?`)) { await deleteStudentApi(s.id); await load() } }}>Delete</Button> : null}
                    </TableActions>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableCard>
    </PageStack>
  )
}
