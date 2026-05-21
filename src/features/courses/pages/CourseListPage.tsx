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
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  MessageBar,
  MessageBarBody,
  SearchBox,
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
import { Pagination } from '../../../components/ui/Pagination'
import { EmptyState, FilterGroup, FilterItem, PageStack, PageToolbar, TableActions, TableCard } from '../../../components/ui/FluentPage'
import { deleteCourseApi, getCoursesApi, updateCourseApi } from '../api'
import type { CourseDto } from '../types'

export function CourseListPage() {
  const pageSize = 20
  const roles = useAuthRoles()
  const canEdit = roles.includes('Admin')
  const [items, setItems] = useState<CourseDto[]>([])
  const [keyword, setKeyword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [courseToDelete, setCourseToDelete] = useState<CourseDto | null>(null)

  const load = async (nextPage = page) => {
    try {
      const data = await getCoursesApi({ keyword: keyword || undefined, page: nextPage, pageSize })
      setItems(data.items)
      setPage(data.pageNumber)
      setTotalCount(data.totalCount)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load courses')
    }
  }

  useEffect(() => { void load(1) }, [])

  return (
    <PageStack>
      <PageToolbar>
        <FilterGroup>
          <FilterItem>
            <Field label="Search">
              <SearchBox placeholder="Search course" value={keyword} onChange={(_, d) => setKeyword(d.value)} />
            </Field>
          </FilterItem>
          <Button appearance="secondary" onClick={() => void load(1)}>Search</Button>
        </FilterGroup>
        {canEdit ? <Button appearance="primary" icon={<Add24Regular />} onClick={() => navigateTo('/courses/create')}>Create course</Button> : null}
      </PageToolbar>
      {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}
      <TableCard title="Courses" subtitle={`${totalCount.toLocaleString()} total courses`} footer={<Pagination page={page} pageSize={pageSize} totalCount={totalCount} onPageChange={(p) => void load(p)} />}>
        {items.length === 0 ? (
          <EmptyState title="No courses found" description="Adjust search filter or create a new course." />
        ) : (
          <Table aria-label="Courses table">
            <TableHeader><TableRow><TableHeaderCell>Code</TableHeaderCell><TableHeaderCell>Name</TableHeaderCell><TableHeaderCell>Level</TableHeaderCell><TableHeaderCell>Total Sessions</TableHeaderCell><TableHeaderCell>Tuition Fee</TableHeaderCell><TableHeaderCell>Active</TableHeaderCell><TableHeaderCell>Actions</TableHeaderCell></TableRow></TableHeader>
            <TableBody>
              {items.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.code}</TableCell><TableCell>{c.name}</TableCell><TableCell>{c.level ?? '-'}</TableCell><TableCell>{c.totalSessions ?? '-'}</TableCell><TableCell>{c.tuitionFee.toLocaleString()}</TableCell>
                  <TableCell><Badge appearance="filled" color={c.isActive ? 'success' : 'danger'}>{c.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                  <TableCell>
                    <TableActions>
                      <Menu positioning="below-end">
                        <MenuTrigger disableButtonEnhancement>
                          <Button size="small" appearance="subtle" icon={<MoreHorizontalRegular />} aria-label="More actions" />
                        </MenuTrigger>
                        <MenuPopover>
                          <MenuList>
                            {canEdit ? <MenuItem onClick={() => navigateTo(`/courses/${c.id}/edit`)}>Edit</MenuItem> : null}
                            {canEdit ? <MenuItem onClick={async () => { await updateCourseApi(c.id, { name: c.name, code: c.code, level: c.level, description: c.description, totalSessions: c.totalSessions, tuitionFee: c.tuitionFee, isActive: !c.isActive }); await load() }}>{c.isActive ? 'Deactivate' : 'Activate'}</MenuItem> : null}
                            {canEdit ? <MenuItem onClick={() => setCourseToDelete(c)}>Delete</MenuItem> : null}
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
      <Dialog open={Boolean(courseToDelete)} onOpenChange={(_, d) => !d.open && setCourseToDelete(null)}>
        <DialogSurface><DialogBody><DialogTitle>Delete course</DialogTitle><DialogContent>Delete "{courseToDelete?.name}"?</DialogContent><DialogActions><DialogTrigger disableButtonEnhancement><Button appearance="secondary">Cancel</Button></DialogTrigger><Button appearance="primary" onClick={async () => { if (!courseToDelete) return; await deleteCourseApi(courseToDelete.id); setCourseToDelete(null); await load() }}>Delete</Button></DialogActions></DialogBody></DialogSurface>
      </Dialog>
    </PageStack>
  )
}
