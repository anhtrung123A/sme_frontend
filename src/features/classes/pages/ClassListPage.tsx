import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Field,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@fluentui/react-components'
import { Add24Regular, MoreHorizontalRegular } from '@fluentui/react-icons'
import { useAuthRoles } from '../../auth/useAuthRoles'
import { navigateTo } from '../../../lib/navigation'
import { formatStatusLabel } from '../../../lib/formatStatus'
import { Pagination } from '../../../components/ui/Pagination'
import { EmptyState, FilterGroup, FilterItem, PageStack, PageToolbar, TableActions, TableCard } from '../../../components/ui/FluentPage'
import { getBranchesLiteApi, getClassesApi, getCoursesLiteApi, getUsersLiteApi } from '../api'
import type { BranchLite, ClassDto, CourseLite, UserLite } from '../types'

function getClassStatusColor(status: string) {
  if (status === 'active') return 'success'
  if (status === 'planned') return 'brand'
  if (status === 'completed') return 'informative'
  if (status === 'cancelled') return 'danger'
  return 'subtle'
}

export function ClassListPage() {
  const pageSize = 20
  const roles = useAuthRoles()
  const canManage = roles.includes('Admin') || roles.includes('Manager')

  const [items, setItems] = useState<ClassDto[]>([])
  const [courses, setCourses] = useState<CourseLite[]>([])
  const [branches, setBranches] = useState<BranchLite[]>([])
  const [teachers, setTeachers] = useState<UserLite[]>([])

  const [courseId, setCourseId] = useState('')
  const [branchId, setBranchId] = useState('')
  const [teacherUserId, setTeacherUserId] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const load = async (nextPage = page) => {
    const [classes, cs, bs, us] = await Promise.all([
      getClassesApi({
        courseId: courseId ? Number(courseId) : undefined,
        branchId: branchId ? Number(branchId) : undefined,
        teacherUserId: teacherUserId ? Number(teacherUserId) : undefined,
        status: status || undefined,
        page: nextPage,
        pageSize,
      }),
      getCoursesLiteApi(), getBranchesLiteApi(), getUsersLiteApi(),
    ])
    setItems(classes.items)
    setPage(classes.pageNumber)
    setTotalCount(classes.totalCount)
    setCourses(cs)
    setBranches(bs)
    setTeachers(us)
  }

  useEffect(() => { void load(1) }, [])

  return (
    <PageStack>
      <PageToolbar>
        <FilterGroup>
          <FilterItem>
            <Field label="Course">
              <Select value={courseId} onChange={(e) => setCourseId(e.currentTarget.value)}>
                <option value="">All courses</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </Field>
          </FilterItem>
          <FilterItem>
            <Field label="Status">
              <Select value={status} onChange={(e) => setStatus(e.currentTarget.value)}>
                <option value="">All status</option>
                {['planned', 'active', 'completed', 'cancelled'].map((s) => <option key={s}>{formatStatusLabel(s)}</option>)}
              </Select>
            </Field>
          </FilterItem>
          <FilterItem>
            <Field label="Teacher">
              <Select value={teacherUserId} onChange={(e) => setTeacherUserId(e.currentTarget.value)}>
                <option value="">All teachers</option>
                {teachers.map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
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
        {canManage ? <Button appearance="primary" icon={<Add24Regular />} onClick={() => navigateTo('/classes/create')}>Create class</Button> : null}
      </PageToolbar>

      <TableCard title="Classes" subtitle={`${totalCount.toLocaleString()} total classes`} footer={<Pagination page={page} pageSize={pageSize} totalCount={totalCount} onPageChange={(p) => void load(p)} />}>
        {items.length === 0 ? (
          <EmptyState title="No classes found" description="Adjust filters or create a new class." />
        ) : (
          <Table aria-label="Classes table">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Class code</TableHeaderCell>
                <TableHeaderCell>Class name</TableHeaderCell>
                <TableHeaderCell>Course</TableHeaderCell>
                <TableHeaderCell>Teacher</TableHeaderCell>
                <TableHeaderCell>Room</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Start date</TableHeaderCell>
                <TableHeaderCell>End date</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.classCode}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.courseName ?? '-'}</TableCell>
                  <TableCell>{c.teacherUserName ?? '-'}</TableCell>
                  <TableCell>{c.roomName ?? '-'}</TableCell>
                  <TableCell><Badge appearance="filled" color={getClassStatusColor(c.status)}>{formatStatusLabel(c.status)}</Badge></TableCell>
                  <TableCell>{c.startDate ?? '-'}</TableCell>
                  <TableCell>{c.endDate ?? '-'}</TableCell>
                  <TableCell>
                    <TableActions>
                      <Menu positioning="below-end">
                        <MenuTrigger disableButtonEnhancement>
                          <Button size="small" appearance="subtle" icon={<MoreHorizontalRegular />} aria-label="More actions" />
                        </MenuTrigger>
                        <MenuPopover>
                          <MenuList>
                            <MenuItem onClick={() => navigateTo(`/classes/${c.id}`)}>View</MenuItem>
                            {canManage ? <MenuItem onClick={() => navigateTo(`/classes/${c.id}/edit`)}>Edit</MenuItem> : null}
                            <MenuItem onClick={() => navigateTo(`/classes/${c.id}/sessions`)}>Sessions</MenuItem>
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
    </PageStack>
  )
}
