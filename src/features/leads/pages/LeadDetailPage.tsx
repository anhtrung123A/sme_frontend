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
  Tab,
  TabList,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Text,
  Textarea,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import { navigateTo } from '../../../lib/navigation'
import {
  cancelTaskApi,
  changeLeadStatusApi,
  completeTaskApi,
  convertLeadToStudentApi,
  createLeadActivityApi,
  createLeadTaskApi,
  getLeadActivitiesApi,
  getLeadApi,
  getLeadTasksApi,
  getSalesUsersApi,
} from '../api'
import type { FollowUpTaskDto, LeadActivityDto, LeadDto, UserLite } from '../types'
import { useAuthRoles } from '../../auth/useAuthRoles'
import { DetailCard, PageStack, TableActions, TableCard } from '../../../components/ui/FluentPage'
import { formatStatusLabel } from '../../../lib/formatStatus'

type LeadDetailPageProps = { leadId: string }

const useStyles = makeStyles({
  topActions: { display: 'flex', gap: tokens.spacingHorizontalS, flexWrap: 'wrap' },
  timeline: { display: 'grid', gap: tokens.spacingVerticalS },
  timelineItem: { padding: tokens.spacingHorizontalM, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusMedium },
  meta: { color: tokens.colorNeutralForeground3 },
})

function getStatusColor(status: string) {
  if (status === 'new') return 'brand'
  if (status === 'contacted') return 'informative'
  if (status === 'interested') return 'success'
  if (status === 'trial_scheduled') return 'warning'
  if (status === 'lost') return 'danger'
  return 'subtle'
}

export function LeadDetailPage({ leadId }: LeadDetailPageProps) {
  const styles = useStyles()
  const roles = useAuthRoles()
  const canConvert = roles.includes('Admin') || roles.includes('Manager') || roles.includes('Sales')

  const id = Number(leadId)
  const [lead, setLead] = useState<LeadDto | null>(null)
  const [activities, setActivities] = useState<LeadActivityDto[]>([])
  const [tasks, setTasks] = useState<FollowUpTaskDto[]>([])
  const [users, setUsers] = useState<UserLite[]>([])
  const [tab, setTab] = useState<'overview' | 'activities' | 'tasks'>('overview')
  const [error, setError] = useState<string | null>(null)
  const [showActivity, setShowActivity] = useState(false)
  const [showTask, setShowTask] = useState(false)

  const refresh = async () => {
    try {
      const [l, a, t, u] = await Promise.all([
        getLeadApi(id),
        getLeadActivitiesApi(id),
        getLeadTasksApi(id),
        getSalesUsersApi(),
      ])
      setLead(l); setActivities(a); setTasks(t); setUsers(u)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load lead detail')
    }
  }

  useEffect(() => { void refresh() }, [id])

  const nextFollowUp = useMemo(() => {
    const pending = tasks.filter((t) => t.status === 'pending').sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    return pending[0]
  }, [tasks])

  if (!lead) return <p>{error ?? 'Loading...'}</p>
  const canShowConvert = canConvert && lead.status !== 'lost'

  return (
    <PageStack>
      {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}
      <div className={styles.topActions}>
        <Button appearance="secondary" onClick={() => navigateTo(`/leads/${lead.id}/edit`)}>Edit lead</Button>
        <Button appearance="secondary" onClick={async () => {
          const s = window.prompt('Status:', lead.status)
          if (s) { await changeLeadStatusApi(lead.id, s); await refresh() }
        }}>Change status</Button>
        {canShowConvert ? <Button appearance="primary" onClick={async () => {
          const gender = window.prompt('Gender (male/female/other), optional:', '') || null
          const response = await convertLeadToStudentApi(lead.id, { gender })
          navigateTo(`/students/${response.studentId}`, true)
        }}>Convert to Student</Button> : null}
        <Button appearance="secondary" onClick={() => setShowActivity(true)}>Add Activity</Button>
        <Button appearance="secondary" onClick={() => setShowTask(true)}>Add Follow-up Task</Button>
      </div>

      <TabList selectedValue={tab} onTabSelect={(_, d) => setTab(d.value as typeof tab)}>
        <Tab value="overview">Overview</Tab>
        <Tab value="activities">Activities</Tab>
        <Tab value="tasks">Follow-up Tasks</Tab>
      </TabList>

      {tab === 'overview' ? (
        <DetailCard>
          <div><Text weight="semibold">Full name</Text><Text>{lead.fullName}</Text></div>
          <div><Text weight="semibold">Phone</Text><Text>{lead.phone}</Text></div>
          <div><Text weight="semibold">Email</Text><Text>{lead.email ?? '-'}</Text></div>
          <div><Text weight="semibold">Address</Text><Text>{lead.address ?? '-'}</Text></div>
          <div><Text weight="semibold">Source</Text><Text>{lead.sourceName ?? '-'}</Text></div>
          <div><Text weight="semibold">Status</Text><Badge appearance="filled" color={getStatusColor(lead.status)}>{formatStatusLabel(lead.status)}</Badge></div>
          <div><Text weight="semibold">Assigned sales</Text><Text>{lead.assignedToUserName ?? '-'}</Text></div>
          <div><Text weight="semibold">Next follow-up</Text><Text>{nextFollowUp ? new Date(nextFollowUp.dueAt).toLocaleString() : '-'}</Text></div>
          <div><Text weight="semibold">Demand note</Text><Text>{lead.demandNote ?? '-'}</Text></div>
        </DetailCard>
      ) : null}

      {tab === 'activities' ? (
        <div className={styles.timeline}>
          {activities.map((a) => (
            <div key={a.id} className={styles.timelineItem}>
              <Text weight="semibold">{a.type} - {a.content}</Text>
              <Text size={200} className={styles.meta}>{new Date(a.contactedAtUtc ?? a.createdAtUtc).toLocaleString()} by {a.userName}</Text>
            </div>
          ))}
        </div>
      ) : null}

      {tab === 'tasks' ? (
        <TableCard title="Follow-up Tasks" subtitle={`${tasks.length} tasks`}>
          <Table aria-label="Lead tasks table">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Title</TableHeaderCell>
                <TableHeaderCell>Due at</TableHeaderCell>
                <TableHeaderCell>Assigned user</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((t) => {
                const overdue = t.status === 'pending' && new Date(t.dueAt).getTime() < Date.now()
                const display = overdue ? 'overdue' : t.status
                return (
                  <TableRow key={t.id}>
                    <TableCell>{t.title}</TableCell>
                    <TableCell>{new Date(t.dueAt).toLocaleString()}</TableCell>
                    <TableCell>{t.assignedToUserName}</TableCell>
                    <TableCell><Badge appearance="filled" color={overdue ? 'danger' : 'informative'}>{formatStatusLabel(display)}</Badge></TableCell>
                    <TableCell>
                      <TableActions>
                        <Button size="small" appearance="subtle" onClick={async () => { await completeTaskApi(t.id); await refresh() }}>Complete</Button>
                        <Button size="small" appearance="subtle" onClick={async () => { await cancelTaskApi(t.id); await refresh() }}>Cancel</Button>
                      </TableActions>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableCard>
      ) : null}

      <ActivityDialog leadId={lead.id} open={showActivity} onOpenChange={setShowActivity} onCreated={refresh} />
      <TaskDialog leadId={lead.id} users={users} open={showTask} onOpenChange={setShowTask} onCreated={refresh} />
    </PageStack>
  )
}

function ActivityDialog({ leadId, open, onOpenChange, onCreated }: { leadId: number; open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => Promise<void> }) {
  const [type, setType] = useState('call')
  const [content, setContent] = useState('')
  const [contactedAt, setContactedAt] = useState('')

  return (
    <Dialog open={open} onOpenChange={(_, d) => onOpenChange(d.open)}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Create Activity</DialogTitle>
          <DialogContent>
            <Field label="Type"><Select value={type} onChange={(e) => setType(e.currentTarget.value)}>{['call', 'email', 'zalo', 'meeting', 'note', 'trial_follow_up'].map((t) => <option key={t}>{t}</option>)}</Select></Field>
            <Field label="Content"><Textarea value={content} onChange={(_, d) => setContent(d.value)} /></Field>
            <Field label="Contacted At"><Input type="datetime-local" value={contactedAt} onChange={(_, d) => setContactedAt(d.value)} /></Field>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement><Button appearance="secondary">Cancel</Button></DialogTrigger>
            <Button appearance="primary" onClick={async () => {
              await createLeadActivityApi(leadId, { type, content, contactedAt: contactedAt ? new Date(contactedAt).toISOString() : undefined })
              onOpenChange(false); await onCreated()
            }}>Create</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

function TaskDialog({ leadId, users, open, onOpenChange, onCreated }: { leadId: number; users: UserLite[]; open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => Promise<void> }) {
  const [assignedToUserId, setAssignedToUserId] = useState(users[0] ? String(users[0].id) : '')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueAt, setDueAt] = useState('')

  useEffect(() => {
    if (!assignedToUserId && users[0]) setAssignedToUserId(String(users[0].id))
  }, [users, assignedToUserId])

  return (
    <Dialog open={open} onOpenChange={(_, d) => onOpenChange(d.open)}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Create Follow-up Task</DialogTitle>
          <DialogContent>
            <Field label="Assigned user"><Select value={assignedToUserId} onChange={(e) => setAssignedToUserId(e.currentTarget.value)}>{users.map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}</Select></Field>
            <Field label="Title"><Input value={title} onChange={(_, d) => setTitle(d.value)} /></Field>
            <Field label="Description"><Textarea value={description} onChange={(_, d) => setDescription(d.value)} /></Field>
            <Field label="Due at"><Input type="datetime-local" value={dueAt} onChange={(_, d) => setDueAt(d.value)} /></Field>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement><Button appearance="secondary">Cancel</Button></DialogTrigger>
            <Button appearance="primary" onClick={async () => {
              await createLeadTaskApi({ leadId, assignedToUserId: Number(assignedToUserId), title, description, dueAt: new Date(dueAt).toISOString() })
              onOpenChange(false); await onCreated()
            }}>Create</Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}
