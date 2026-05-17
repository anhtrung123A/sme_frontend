import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Field,
  MessageBar,
  MessageBarBody,
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
import { Pagination } from '../../../components/ui/Pagination'
import { EmptyState, FilterGroup, FilterItem, KpiCard, KpiGrid, PageStack, PageToolbar, TableActions, TableCard } from '../../../components/ui/FluentPage'
import { useAuthRoles } from '../../auth/useAuthRoles'
import { deleteEnrollmentApi, getBranchesLiteApi, getClassesLiteApi, getCoursesLiteApi, getEnrollmentsApi, getUsersLiteApi } from '../api'
import { EnrollmentStatusBadge } from '../components/EnrollmentStatusBadge'
import type { BranchLite, ClassLite, CourseLite, EnrollmentDto, UserLite } from '../types'

export function EnrollmentListPage() {
  const pageSize = 20
  const roles = useAuthRoles()
  const [items, setItems] = useState<EnrollmentDto[]>([])
  const [courses, setCourses] = useState<CourseLite[]>([])
  const [classes, setClasses] = useState<ClassLite[]>([])
  const [users, setUsers] = useState<UserLite[]>([])
  const [branches, setBranches] = useState<BranchLite[]>([])

  const [courseId, setCourseId] = useState('')
  const [classId, setClassId] = useState('')
  const [salesUserId, setSalesUserId] = useState('')
  const [branchId, setBranchId] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const kpi = useMemo(() => ({
    pending: items.filter((x) => x.status === 'pending').length,
    waiting: items.filter((x) => x.status === 'waiting_payment').length,
    active: items.filter((x) => x.status === 'active').length,
    completed: items.filter((x) => x.status === 'completed').length,
  }), [items])

  const load = async (nextPage = page) => {
    try {
      const [data, cs, cls, us, bs] = await Promise.all([
        getEnrollmentsApi({ courseId: courseId ? Number(courseId) : undefined, classId: classId ? Number(classId) : undefined, salesUserId: salesUserId ? Number(salesUserId) : undefined, branchId: branchId ? Number(branchId) : undefined, status: status || undefined, page: nextPage, pageSize }),
        getCoursesLiteApi(),
        getClassesLiteApi({ courseId: courseId ? Number(courseId) : undefined }),
        getUsersLiteApi(),
        getBranchesLiteApi(),
      ])
      setItems(Array.isArray(data.items) ? data.items : [])
      setPage(data.pageNumber)
      setTotalCount(data.totalCount)
      setCourses(cs)
      setClasses(cls)
      setUsers(us)
      setBranches(bs)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load enrollments')
    }
  }

  useEffect(() => { void load(1) }, [])

  return (
    <PageStack>
      <KpiGrid>
        <KpiCard label="Pending" value={kpi.pending} />
        <KpiCard label="Waiting Payment" value={kpi.waiting} />
        <KpiCard label="Active" value={kpi.active} />
        <KpiCard label="Completed" value={kpi.completed} />
      </KpiGrid>

      <PageToolbar>
        <FilterGroup>
          <FilterItem>
            <Field label="Course">
              <Select value={courseId} onChange={(e) => setCourseId(e.currentTarget.value)}>
                <option value="">All courses</option>
                {courses.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </Select>
            </Field>
          </FilterItem>
          <FilterItem>
            <Field label="Class">
              <Select value={classId} onChange={(e) => setClassId(e.currentTarget.value)}>
                <option value="">All classes</option>
                {classes.map((x) => <option key={x.id} value={x.id}>{x.classCode} - {x.name}</option>)}
              </Select>
            </Field>
          </FilterItem>
          <FilterItem>
            <Field label="Status">
              <Select value={status} onChange={(e) => setStatus(e.currentTarget.value)}>
                <option value="">All status</option>
                {['pending', 'waiting_payment', 'active', 'completed', 'cancelled', 'suspended', 'transferred', 'refunded', 'dropped'].map((x) => <option key={x} value={x}>{x}</option>)}
              </Select>
            </Field>
          </FilterItem>
          <FilterItem>
            <Field label="Sales">
              <Select value={salesUserId} onChange={(e) => setSalesUserId(e.currentTarget.value)}>
                <option value="">All sales</option>
                {users.map((x) => <option key={x.id} value={x.id}>{x.fullName}</option>)}
              </Select>
            </Field>
          </FilterItem>
          <FilterItem>
            <Field label="Branch">
              <Select value={branchId} onChange={(e) => setBranchId(e.currentTarget.value)}>
                <option value="">All branches</option>
                {branches.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </Select>
            </Field>
          </FilterItem>
          <Button appearance="secondary" onClick={() => void load(1)}>Apply</Button>
        </FilterGroup>
        <Button appearance="primary" icon={<Add24Regular />} onClick={() => navigateTo('/enrollments/create')}>
          Create Enrollment
        </Button>
      </PageToolbar>

      {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}

      <TableCard title="Enrollments" subtitle={`${totalCount.toLocaleString()} total enrollments`} footer={<Pagination page={page} pageSize={pageSize} totalCount={totalCount} onPageChange={(p) => void load(p)} />}>
        {items.length === 0 ? (
          <EmptyState title="No enrollments found" description="Adjust filters or create a new enrollment." />
        ) : (
          <Table aria-label="Enrollments table">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Student</TableHeaderCell>
                <TableHeaderCell>Course</TableHeaderCell>
                <TableHeaderCell>Class</TableHeaderCell>
                <TableHeaderCell>Sales</TableHeaderCell>
                <TableHeaderCell>Final Amount</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Enrolled At</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((x) => (
                <TableRow key={x.id}>
                  <TableCell>{x.studentName}</TableCell>
                  <TableCell>{x.courseName}</TableCell>
                  <TableCell>{x.className ?? '-'}</TableCell>
                  <TableCell>{x.salesUserName ?? '-'}</TableCell>
                  <TableCell>{x.finalAmount.toLocaleString()}</TableCell>
                  <TableCell><EnrollmentStatusBadge status={x.status} /></TableCell>
                  <TableCell>{x.enrolledAt ? new Date(x.enrolledAt).toLocaleString() : '-'}</TableCell>
                  <TableCell>
                    <TableActions>
                      <Button size="small" appearance="subtle" onClick={() => navigateTo(`/enrollments/${x.id}`)}>View</Button>
                      <Button size="small" appearance="subtle" onClick={() => navigateTo(`/enrollments/${x.id}/edit`)}>Edit</Button>
                      {roles.includes('Admin') ? <Button size="small" appearance="subtle" onClick={async () => { if (window.confirm('Delete enrollment?')) { await deleteEnrollmentApi(x.id); await load() } }}>Delete</Button> : null}
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
