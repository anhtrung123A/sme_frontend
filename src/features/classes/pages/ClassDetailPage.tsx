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
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import { navigateTo } from '../../../lib/navigation'
import { formatStatusLabel } from '../../../lib/formatStatus'
import {
  createClassScheduleApi,
  deleteClassScheduleApi,
  generateSessionsApi,
  getClassApi,
  getClassSchedulesApi,
  getClassSessionsApi,
  updateClassScheduleApi,
  updateClassStatusApi,
} from '../api'
import type { ClassDto, ClassScheduleDto, ClassSessionDto } from '../types'
import { DetailCard, PageStack, TableActions, TableCard } from '../../../components/ui/FluentPage'

const dayMap: Record<number, string> = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 7: 'Sunday' }

const useStyles = makeStyles({
  topActions: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    marginBottom: tokens.spacingVerticalS,
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(140px, 1fr))',
    gap: tokens.spacingHorizontalS,
    alignItems: 'end',
    '@media (max-width: 760px)': {
      gridTemplateColumns: '1fr',
    },
  },
})

function getStatusColor(status: string) {
  if (status === 'active' || status === 'completed') return 'success'
  if (status === 'planned' || status === 'scheduled') return 'brand'
  if (status === 'cancelled') return 'danger'
  return 'subtle'
}

export function ClassDetailPage({ classId }: { classId: string }) {
  const styles = useStyles()
  const id = Number(classId)
  const [item, setItem] = useState<ClassDto | null>(null)
  const [schedules, setSchedules] = useState<ClassScheduleDto[]>([])
  const [sessions, setSessions] = useState<ClassSessionDto[]>([])
  const [tab, setTab] = useState<'overview' | 'schedules' | 'sessions' | 'attendance'>('overview')
  const [error, setError] = useState<string | null>(null)
  const [showAddSchedule, setShowAddSchedule] = useState(false)
  const [newSchedule, setNewSchedule] = useState({ dayOfWeek: '1', startTime: '19:00:00', endTime: '21:00:00' })

  const load = async () => {
    try {
      const [c, sch, ses] = await Promise.all([getClassApi(id), getClassSchedulesApi(id), getClassSessionsApi(id)])
      setItem(c); setSchedules(sch); setSessions(ses)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load class')
    }
  }

  useEffect(() => { void load() }, [id])
  if (!item) return <p>{error ?? 'Loading...'}</p>

  return (
    <PageStack>
      {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}

      <div className={styles.topActions}>
        <Button appearance="secondary" onClick={() => navigateTo(`/classes/${item.id}/edit`)}>Edit class</Button>
        <Button appearance="secondary" onClick={async () => {
          const s = window.prompt('Status', item.status)
          if (s) { await updateClassStatusApi(item.id, s); await load() }
        }}>Change status</Button>
        <Button appearance="primary" onClick={async () => {
          const fromDate = window.prompt('From date (YYYY-MM-DD)', item.startDate ?? '') || ''
          const toDate = window.prompt('To date (YYYY-MM-DD)', item.endDate ?? '') || ''
          const overwriteExisting = window.confirm('Overwrite existing sessions?')
          const res = await generateSessionsApi(item.id, { fromDate: fromDate || null, toDate: toDate || null, overwriteExisting })
          alert(`Generated ${res.createdCount} sessions`)
          await load()
        }}>Generate sessions</Button>
      </div>

      <TabList selectedValue={tab} onTabSelect={(_, d) => setTab(d.value as typeof tab)}>
        <Tab value="overview">Overview</Tab>
        <Tab value="schedules">Schedules</Tab>
        <Tab value="sessions">Sessions</Tab>
        <Tab value="attendance">Attendance</Tab>
      </TabList>

      {tab === 'overview' ? (
        <DetailCard>
          <div><Text weight="semibold">Class code</Text><Text>{item.classCode}</Text></div>
          <div><Text weight="semibold">Class name</Text><Text>{item.name}</Text></div>
          <div><Text weight="semibold">Course</Text><Text>{item.courseName ?? '-'}</Text></div>
          <div><Text weight="semibold">Branch</Text><Text>{item.branchName ?? '-'}</Text></div>
          <div><Text weight="semibold">Room</Text><Text>{item.roomName ?? '-'}</Text></div>
          <div><Text weight="semibold">Teacher</Text><Text>{item.teacherUserName ?? '-'}</Text></div>
          <div><Text weight="semibold">Max students</Text><Text>{item.maxStudents ?? '-'}</Text></div>
          <div><Text weight="semibold">Start date</Text><Text>{item.startDate ?? '-'}</Text></div>
          <div><Text weight="semibold">End date</Text><Text>{item.endDate ?? '-'}</Text></div>
          <div><Text weight="semibold">Status</Text><Badge appearance="filled" color={getStatusColor(item.status)}>{formatStatusLabel(item.status)}</Badge></div>
        </DetailCard>
      ) : null}

      {tab === 'schedules' ? (
        <Card>
          <Text className={styles.sectionTitle} weight="semibold">Schedules</Text>
          <Button appearance="primary" onClick={() => setShowAddSchedule(true)}>Add schedule</Button>
          <Table aria-label="Class schedules">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Day</TableHeaderCell>
                <TableHeaderCell>Start</TableHeaderCell>
                <TableHeaderCell>End</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{dayMap[s.dayOfWeek]}</TableCell>
                  <TableCell>{String(s.startTime).slice(0, 8)}</TableCell>
                  <TableCell>{String(s.endTime).slice(0, 8)}</TableCell>
                  <TableCell>
                    <TableActions>
                      <Button size="small" appearance="subtle" onClick={async () => {
                        const dayOfWeek = Number(window.prompt('Day of week (1-7)', String(s.dayOfWeek)) || s.dayOfWeek)
                        const startTime = window.prompt('Start time', String(s.startTime)) || String(s.startTime)
                        const endTime = window.prompt('End time', String(s.endTime)) || String(s.endTime)
                        await updateClassScheduleApi(item.id, s.id, { dayOfWeek, startTime, endTime })
                        await load()
                      }}>Edit</Button>
                      <Button size="small" appearance="subtle" onClick={async () => {
                        if (window.confirm('Delete schedule?')) {
                          await deleteClassScheduleApi(item.id, s.id)
                          await load()
                        }
                      }}>Delete</Button>
                    </TableActions>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : null}

      {tab === 'sessions' ? (
        <TableCard title="Sessions" subtitle={`${sessions.length} sessions`}>
          <Table aria-label="Class sessions">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Session Date</TableHeaderCell>
                <TableHeaderCell>Time</TableHeaderCell>
                <TableHeaderCell>Teacher</TableHeaderCell>
                <TableHeaderCell>Room</TableHeaderCell>
                <TableHeaderCell>Topic</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.sessionDate}</TableCell>
                  <TableCell>{String(s.startTime).slice(0, 8)} - {String(s.endTime).slice(0, 8)}</TableCell>
                  <TableCell>{s.teacherUserName ?? '-'}</TableCell>
                  <TableCell>{s.roomName ?? '-'}</TableCell>
                  <TableCell>{s.topic ?? '-'}</TableCell>
                  <TableCell><Badge appearance="filled" color={getStatusColor(s.status)}>{formatStatusLabel(s.status)}</Badge></TableCell>
                  <TableCell><Button size="small" appearance="subtle" onClick={() => navigateTo(`/class-sessions/${s.id}`)}>Edit</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableCard>
      ) : null}

      {tab === 'attendance' ? (
        <Card>
          <Button appearance="primary" onClick={() => navigateTo(`/classes/${item.id}/attendance-summary`)}>
            View attendance summary
          </Button>
        </Card>
      ) : null}

      <Dialog open={showAddSchedule} onOpenChange={(_, d) => setShowAddSchedule(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Add Schedule</DialogTitle>
            <DialogContent>
              <div className={styles.formRow}>
                <Field label="Day of week">
                  <Select value={newSchedule.dayOfWeek} onChange={(e) => setNewSchedule({ ...newSchedule, dayOfWeek: e.currentTarget.value })}>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                    <option value="7">Sunday</option>
                  </Select>
                </Field>
                <Field label="Start time"><Input value={newSchedule.startTime} onChange={(_, d) => setNewSchedule({ ...newSchedule, startTime: d.value })} /></Field>
                <Field label="End time"><Input value={newSchedule.endTime} onChange={(_, d) => setNewSchedule({ ...newSchedule, endTime: d.value })} /></Field>
              </div>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement><Button appearance="secondary">Cancel</Button></DialogTrigger>
              <Button appearance="primary" onClick={async () => {
                const dayOfWeek = Number(newSchedule.dayOfWeek)
                if (!(dayOfWeek >= 1 && dayOfWeek <= 7)) return
                if (newSchedule.startTime >= newSchedule.endTime) return
                await createClassScheduleApi(item.id, { dayOfWeek, startTime: newSchedule.startTime, endTime: newSchedule.endTime })
                setShowAddSchedule(false)
                await load()
              }}>Add</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </PageStack>
  )
}
