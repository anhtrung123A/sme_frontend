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
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Textarea,
} from '@fluentui/react-components'
import { Add24Regular } from '@fluentui/react-icons'
import { cancelTaskApi, completeTaskApi, createLeadTaskApi, getSalesUsersApi } from '../../leads/api'
import { apiRequest } from '../../../lib/apiClient'
import { formatStatusLabel } from '../../../lib/formatStatus'
import { Pagination } from '../../../components/ui/Pagination'
import { FilterGroup, FilterItem, PageStack, PageToolbar, TableActions, TableCard } from '../../../components/ui/FluentPage'
import type { ApiResponse, FollowUpTaskDto, PagedResult, UserLite } from '../../leads/types'

export function FollowUpTaskListPage() {
  const pageSize = 20
  const [items, setItems] = useState<FollowUpTaskDto[]>([])
  const [users, setUsers] = useState<UserLite[]>([])
  const [status, setStatus] = useState('')
  const [keyword, setKeyword] = useState('')
  const [assignedToUserId, setAssignedToUserId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [page, setPage] = useState(1)

  const load = async () => {
    try {
      const qs = new URLSearchParams({ page: '1', pageSize: '100' })
      if (status) qs.set('status', status)
      if (keyword) qs.set('keyword', keyword)
      if (assignedToUserId) qs.set('assignedToUserId', assignedToUserId)
      const res = await apiRequest<ApiResponse<PagedResult<FollowUpTaskDto>>>(`/follow-up-tasks?${qs.toString()}`)
      setItems(res.data.items)
      setUsers(await getSalesUsersApi())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tasks')
    }
  }

  useEffect(() => { void load() }, [])

  const filtered = useMemo(() => items.filter((i) => !dueDate || i.dueAt.slice(0, 10) === dueDate), [items, dueDate])
  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page])

  return (
    <PageStack>
      <PageToolbar>
        <FilterGroup>
          <FilterItem><Field label="Status"><Select value={status} onChange={(e) => setStatus(e.currentTarget.value)}><option value="">All status</option>{['pending', 'completed', 'cancelled', 'overdue'].map((s) => <option key={s}>{formatStatusLabel(s)}</option>)}</Select></Field></FilterItem>
          <FilterItem><Field label="Keyword"><Input value={keyword} onChange={(_, d) => setKeyword(d.value)} /></Field></FilterItem>
          <FilterItem><Field label="Assigned user"><Select value={assignedToUserId} onChange={(e) => setAssignedToUserId(e.currentTarget.value)}><option value="">All users</option>{users.map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}</Select></Field></FilterItem>
          <FilterItem><Field label="Due date"><Input type="date" value={dueDate} onChange={(_, d) => setDueDate(d.value)} /></Field></FilterItem>
          <Button appearance="secondary" onClick={() => void load()}>Apply</Button>
        </FilterGroup>
        <Button appearance="primary" icon={<Add24Regular />} onClick={() => setShowCreate(true)}>Create task</Button>
      </PageToolbar>
      {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}
      <TableCard title="Follow-up Tasks" subtitle={`${filtered.length} tasks`} footer={<Pagination page={page} pageSize={pageSize} totalCount={filtered.length} onPageChange={setPage} />}>
        <Table aria-label="Follow-up tasks table"><TableHeader><TableRow><TableHeaderCell style={{ width: '7ch', minWidth: '7ch', whiteSpace: 'nowrap' }}>ID</TableHeaderCell><TableHeaderCell>Lead</TableHeaderCell><TableHeaderCell>Title</TableHeaderCell><TableHeaderCell>Due at</TableHeaderCell><TableHeaderCell>Assigned user</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell><TableHeaderCell>Actions</TableHeaderCell></TableRow></TableHeader><TableBody>{paged.map((t) => { const overdue = t.status === 'pending' && new Date(t.dueAt).getTime() < Date.now(); const display = overdue ? 'overdue' : t.status; return <TableRow key={t.id}><TableCell style={{ width: '7ch', minWidth: '7ch', whiteSpace: 'nowrap' }}>{t.id}</TableCell><TableCell>{t.leadName ?? '-'}</TableCell><TableCell>{t.title}</TableCell><TableCell>{new Date(t.dueAt).toLocaleString()}</TableCell><TableCell>{t.assignedToUserName}</TableCell><TableCell><Badge appearance="filled" color={overdue ? 'danger' : 'informative'}>{formatStatusLabel(display)}</Badge></TableCell><TableCell><TableActions><Button size="small" appearance="subtle" onClick={async () => { await completeTaskApi(t.id); await load() }}>Complete</Button><Button size="small" appearance="subtle" onClick={async () => { await cancelTaskApi(t.id); await load() }}>Cancel</Button></TableActions></TableCell></TableRow> })}</TableBody></Table>
      </TableCard>
      <CreateTaskDialog users={users} open={showCreate} onClose={() => setShowCreate(false)} onCreated={load} />
    </PageStack>
  )
}

function CreateTaskDialog({ users, open, onClose, onCreated }: { users: UserLite[]; open: boolean; onClose: () => void; onCreated: () => Promise<void> }) {
  const [leadId, setLeadId] = useState('')
  const [assignedToUserId, setAssignedToUserId] = useState(users[0] ? String(users[0].id) : '')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueAt, setDueAt] = useState('')

  useEffect(() => {
    if (!assignedToUserId && users[0]) setAssignedToUserId(String(users[0].id))
  }, [users, assignedToUserId])

  return (
    <Dialog open={open} onOpenChange={(_, d) => !d.open && onClose()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Create Follow-up Task</DialogTitle>
          <DialogContent>
            <Field label="Lead ID"><Input value={leadId} onChange={(_, d) => setLeadId(d.value)} /></Field>
            <Field label="Assigned user"><Select value={assignedToUserId} onChange={(e) => setAssignedToUserId(e.currentTarget.value)}>{users.map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}</Select></Field>
            <Field label="Title"><Input value={title} onChange={(_, d) => setTitle(d.value)} /></Field>
            <Field label="Description"><Textarea value={description} onChange={(_, d) => setDescription(d.value)} /></Field>
            <Field label="Due at"><Input type="datetime-local" value={dueAt} onChange={(_, d) => setDueAt(d.value)} /></Field>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement><Button appearance="secondary" onClick={onClose}>Cancel</Button></DialogTrigger>
            <Button appearance="primary" onClick={async () => { await createLeadTaskApi({ leadId: Number(leadId), assignedToUserId: Number(assignedToUserId), title, description, dueAt: new Date(dueAt).toISOString() }); onClose(); await onCreated() }}>Create</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}
