import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Card,
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
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import { Add24Regular, MoreHorizontalRegular } from '@fluentui/react-icons'
import { navigateTo } from '../../../lib/navigation'
import { Pagination } from '../../../components/ui/Pagination'
import { useAuthRoles } from '../../auth/useAuthRoles'
import {
  assignLeadApi,
  changeLeadStatusApi,
  deleteLeadApi,
  getBranchesApi,
  getLeadsApi,
  getLeadSourcesApi,
  getSalesUsersApi,
  updateLeadApi,
} from '../api'
import type { BranchDto, LeadDto, LeadSourceDto, UserLite } from '../types'

const statuses = ['new', 'contacted', 'interested', 'trial_scheduled', 'lost']

const statusLabels: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  interested: 'Interested',
  trial_scheduled: 'Trial scheduled',
  lost: 'Lost',
}

function getLeadStatusColor(status: string) {
  if (status === 'new') return 'brand'
  if (status === 'contacted') return 'informative'
  if (status === 'interested') return 'success'
  if (status === 'trial_scheduled') return 'warning'
  if (status === 'lost') return 'danger'
  return 'subtle'
}

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalL,
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: tokens.spacingHorizontalM,
  },
  kpiCard: {
    padding: tokens.spacingHorizontalL,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
  },
  muted: {
    color: tokens.colorNeutralForeground3,
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'end',
    gap: tokens.spacingHorizontalM,
    flexWrap: 'wrap',
  },
  filters: {
    display: 'grid',
    gridTemplateColumns: 'minmax(220px, 1.4fr) repeat(4, minmax(150px, 1fr)) auto',
    gap: tokens.spacingHorizontalS,
    alignItems: 'end',
    flex: 1,
    '@media (max-width: 1120px)': {
      gridTemplateColumns: 'repeat(2, minmax(180px, 1fr))',
    },
    '@media (max-width: 640px)': {
      gridTemplateColumns: '1fr',
    },
  },
  tableCard: {
    padding: 0,
    overflowX: 'auto',
  },
  tableHeader: {
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  emptyState: {
    display: 'grid',
    placeItems: 'center',
    gap: tokens.spacingVerticalS,
    padding: tokens.spacingVerticalXXXL,
    textAlign: 'center',
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalXS,
    flexWrap: 'wrap',
  },
  actionHeadWrap: { width: '100%', display: 'flex', justifyContent: 'center' },
  actionCellWrap: { width: '100%', display: 'flex', justifyContent: 'center' },
  pagination: {
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
})

export function LeadListPage() {
  const pageSize = 20
  const roles = useAuthRoles()
  const styles = useStyles()
  const isAdmin = roles.includes('Admin')
  const isManager = roles.includes('Manager')
  const canAssign = isAdmin || isManager
  const canDelete = isAdmin

  const [leads, setLeads] = useState<LeadDto[]>([])
  const [sources, setSources] = useState<LeadSourceDto[]>([])
  const [branches, setBranches] = useState<BranchDto[]>([])
  const [users, setUsers] = useState<UserLite[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [leadToDelete, setLeadToDelete] = useState<LeadDto | null>(null)
  const [viewLead, setViewLead] = useState<LeadDto | null>(null)
  const [editLead, setEditLead] = useState<LeadDto | null>(null)
  const [editForm, setEditForm] = useState({ fullName: '', phone: '', email: '', status: 'new', address: '' })

  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [sourceId, setSourceId] = useState('')
  const [assignedId, setAssignedId] = useState('')
  const [branchId, setBranchId] = useState('')

  const load = async (nextPage = page) => {
    setLoading(true)
    setError(null)
    try {
      const [leadPage, srcs, brs, us] = await Promise.all([
        getLeadsApi({
          keyword: keyword || undefined,
          status: status || undefined,
          sourceId: sourceId ? Number(sourceId) : undefined,
          assignedToUserId: assignedId ? Number(assignedId) : undefined,
          branchId: branchId ? Number(branchId) : undefined,
          page: nextPage,
          pageSize,
        }),
        getLeadSourcesApi(),
        getBranchesApi(),
        getSalesUsersApi(),
      ])
      setLeads(leadPage.items)
      setTotalCount(leadPage.totalCount)
      setPage(leadPage.pageNumber)
      setSources(srcs)
      setBranches(brs)
      setUsers(us)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load(1)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  const handleAssign = async (lead: LeadDto) => {
    if (!canAssign) return
    const value = window.prompt('Assign to user id:', lead.assignedToUserId ? String(lead.assignedToUserId) : '')
    if (!value) return
    await assignLeadApi(lead.id, Number(value))
    await load()
  }

  const handleChangeStatus = async (lead: LeadDto) => {
    const value = window.prompt('New status (new/contacted/interested/trial_scheduled/lost):', lead.status)
    if (!value) return
    await changeLeadStatusApi(lead.id, value)
    await load()
  }

  const handleDelete = async () => {
    if (!leadToDelete || !canDelete) return
    await deleteLeadApi(leadToDelete.id)
    setLeadToDelete(null)
    await load()
  }

  const openEditLead = (lead: LeadDto) => {
    setEditLead(lead)
    setEditForm({
      fullName: lead.fullName,
      phone: lead.phone,
      email: lead.email ?? '',
      status: lead.status,
      address: lead.address ?? '',
    })
  }

  const saveEditLead = async () => {
    if (!editLead) return
    await updateLeadApi(editLead.id, {
      branchId: editLead.branchId,
      assignedToUserId: editLead.assignedToUserId,
      fullName: editForm.fullName,
      phone: editForm.phone,
      email: editForm.email || null,
      dateOfBirth: editLead.dateOfBirth,
      address: editForm.address || null,
      sourceId: editLead.sourceId,
      interestedCourseId: editLead.interestedCourseId,
      status: editForm.status,
      demandNote: editLead.demandNote,
    })
    setEditLead(null)
    await load()
  }

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <Field label="Search">
            <SearchBox
              aria-label="Search leads"
              placeholder="Name, phone, or email"
              value={keyword}
              onChange={(_, data) => setKeyword(data.value)}
            />
          </Field>
          <Field label="Status">
            <Select value={status} onChange={(event) => setStatus(event.currentTarget.value)}>
              <option value="">All status</option>
              {statuses.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
            </Select>
          </Field>
          <Field label="Source">
            <Select value={sourceId} onChange={(event) => setSourceId(event.currentTarget.value)}>
              <option value="">All sources</option>
              {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Field>
          <Field label="Assigned user">
            <Select value={assignedId} onChange={(event) => setAssignedId(event.currentTarget.value)}>
              <option value="">All users</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
            </Select>
          </Field>
          <Field label="Branch">
            <Select value={branchId} onChange={(event) => setBranchId(event.currentTarget.value)}>
              <option value="">All branches</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </Field>
          <Button appearance="secondary" onClick={() => void load(1)} disabled={loading}>
            Apply
          </Button>
        </div>
        <Button appearance="primary" icon={<Add24Regular />} onClick={() => navigateTo('/leads/create')}>
          Create lead
        </Button>
      </div>

      {error ? (
        <MessageBar intent="error">
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      ) : null}

      <Card className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <div>
            <Text weight="semibold">Lead pipeline</Text>
            <Text className={styles.muted} block size={200}>
              {totalCount.toLocaleString()} total leads
            </Text>
          </div>
          {loading ? <Spinner size="tiny" label="Loading leads" /> : null}
        </div>

        {!loading && leads.length === 0 ? (
          <div className={styles.emptyState}>
            <Text size={500} weight="semibold">No leads found</Text>
            <Text className={styles.muted}>Adjust filters or create a new lead.</Text>
            <Button appearance="primary" icon={<Add24Regular />} onClick={() => navigateTo('/leads/create')}>
              Create lead
            </Button>
          </div>
        ) : (
          <Table aria-label="Leads table">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>ID</TableHeaderCell>
                <TableHeaderCell>Lead name</TableHeaderCell>
                <TableHeaderCell>Phone</TableHeaderCell>
                <TableHeaderCell>Source</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Assigned to</TableHeaderCell>
                <TableHeaderCell>Next follow-up</TableHeaderCell>
                <TableHeaderCell>
                  <div className={styles.actionHeadWrap}>Actions</div>
                </TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>{lead.id}</TableCell>
                  <TableCell>
                    <TableCellLayout>{lead.fullName}</TableCellLayout>
                  </TableCell>
                  <TableCell>{lead.phone}</TableCell>
                  <TableCell>{lead.sourceName ?? '-'}</TableCell>
                  <TableCell>
                    <Badge appearance="filled" color={getLeadStatusColor(lead.status)}>
                      {statusLabels[lead.status] ?? lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{lead.assignedToUserName ?? '-'}</TableCell>
                  <TableCell>-</TableCell>
                  <TableCell>
                    <div className={styles.actionCellWrap}>
                      <Menu positioning="below-end">
                        <MenuTrigger disableButtonEnhancement>
                          <Button size="small" appearance="subtle" icon={<MoreHorizontalRegular />} aria-label="More actions" />
                        </MenuTrigger>
                        <MenuPopover>
                          <MenuList>
                            <MenuItem onClick={() => setViewLead(lead)}>View</MenuItem>
                            <MenuItem onClick={() => openEditLead(lead)}>Edit</MenuItem>
                            {canAssign ? <MenuItem onClick={() => void handleAssign(lead)}>Assign</MenuItem> : null}
                            <MenuItem onClick={() => void handleChangeStatus(lead)}>Change status</MenuItem>
                            {canDelete ? <MenuItem onClick={() => setLeadToDelete(lead)}>Delete</MenuItem> : null}
                          </MenuList>
                        </MenuPopover>
                      </Menu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div className={styles.pagination}>
          <Pagination page={page} pageSize={pageSize} totalCount={totalCount} onPageChange={(p) => void load(p)} />
        </div>
      </Card>

      <Dialog open={Boolean(leadToDelete)} onOpenChange={(_, data) => !data.open && setLeadToDelete(null)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Delete lead</DialogTitle>
            <DialogContent>
              Delete "{leadToDelete?.fullName}"? This action cannot be undone.
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Cancel</Button>
              </DialogTrigger>
              <Button appearance="primary" onClick={() => void handleDelete()}>
                Delete
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog open={Boolean(viewLead)} onOpenChange={(_, data) => !data.open && setViewLead(null)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Lead Detail</DialogTitle>
            <DialogContent>
              {viewLead ? (
                <div style={{ display: 'grid', gap: 8 }}>
                  <Text>ID: {viewLead.id}</Text>
                  <Text>Full name: {viewLead.fullName}</Text>
                  <Text>Phone: {viewLead.phone}</Text>
                  <Text>Email: {viewLead.email ?? '-'}</Text>
                  <Text>Status: {statusLabels[viewLead.status] ?? viewLead.status}</Text>
                  <Text>Source: {viewLead.sourceName ?? '-'}</Text>
                  <Text>Assigned to: {viewLead.assignedToUserName ?? '-'}</Text>
                  <Text>Address: {viewLead.address ?? '-'}</Text>
                </div>
              ) : null}
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement><Button appearance="secondary">Close</Button></DialogTrigger>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog open={Boolean(editLead)} onOpenChange={(_, data) => !data.open && setEditLead(null)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Edit Lead</DialogTitle>
            <DialogContent>
              <div style={{ display: 'grid', gap: 10 }}>
                <Field label="Full name"><Input value={editForm.fullName} onChange={(_, d) => setEditForm((p) => ({ ...p, fullName: d.value }))} /></Field>
                <Field label="Phone"><Input value={editForm.phone} onChange={(_, d) => setEditForm((p) => ({ ...p, phone: d.value }))} /></Field>
                <Field label="Email"><Input value={editForm.email} onChange={(_, d) => setEditForm((p) => ({ ...p, email: d.value }))} /></Field>
                <Field label="Status"><Select value={editForm.status} onChange={(e) => setEditForm((p) => ({ ...p, status: e.currentTarget.value }))}>{statuses.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}</Select></Field>
                <Field label="Address"><Input value={editForm.address} onChange={(_, d) => setEditForm((p) => ({ ...p, address: d.value }))} /></Field>
              </div>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement><Button appearance="secondary">Cancel</Button></DialogTrigger>
              <Button appearance="primary" onClick={() => void saveEditLead()}>Save</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  )
}
