import { useEffect, useMemo, useState } from 'react'
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
  MessageBar,
  MessageBarBody,
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
import { Add24Regular } from '@fluentui/react-icons'
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

  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [sourceId, setSourceId] = useState('')
  const [assignedId, setAssignedId] = useState('')
  const [branchId, setBranchId] = useState('')

  const kpis = useMemo(() => {
    const map = { new: 0, contacted: 0, interested: 0, trial_scheduled: 0, lost: 0 }
    for (const l of leads) {
      const key = l.status as keyof typeof map
      if (key in map) map[key] += 1
    }
    return map
  }, [leads])

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

  return (
    <div className={styles.root}>
      <section className={styles.kpiGrid} aria-label="Lead summary">
        {statuses.map((item) => (
          <Card key={item} className={styles.kpiCard}>
            <Text className={styles.muted} size={200} weight="semibold">
              {statusLabels[item]}
            </Text>
            <Text size={700} weight="semibold">
              {kpis[item as keyof typeof kpis]}
            </Text>
          </Card>
        ))}
      </section>

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
                <TableHeaderCell>Lead name</TableHeaderCell>
                <TableHeaderCell>Phone</TableHeaderCell>
                <TableHeaderCell>Source</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Assigned to</TableHeaderCell>
                <TableHeaderCell>Next follow-up</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
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
                    <div className={styles.actions}>
                      <Button size="small" appearance="subtle" onClick={() => navigateTo(`/leads/${lead.id}`)}>View</Button>
                      <Button size="small" appearance="subtle" onClick={() => navigateTo(`/leads/${lead.id}/edit`)}>Edit</Button>
                      {canAssign ? <Button size="small" appearance="subtle" onClick={() => void handleAssign(lead)}>Assign</Button> : null}
                      <Button size="small" appearance="subtle" onClick={() => void handleChangeStatus(lead)}>Status</Button>
                      {canDelete ? (
                        <Button size="small" appearance="subtle" onClick={() => setLeadToDelete(lead)}>
                          Delete
                        </Button>
                      ) : null}
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
    </div>
  )
}
