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
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Tab,
  TabList,
  Text,
  Textarea,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import { createGuardianApi, deleteGuardianApi, getGuardiansApi, updateGuardianApi } from '../../guardians/api'
import { createStudentNoteApi, deleteStudentNoteApi, getStudentNotesApi, updateStudentNoteApi } from '../../studentNotes/api'
import { getStudentApi, updateStudentStatusApi } from '../api'
import { StudentEnrollmentsTab } from '../components/StudentEnrollmentsTab'
import { StudentInvoicesTab } from '../components/StudentInvoicesTab'
import { StudentPaymentsTab } from '../components/StudentPaymentsTab'
import { StudentAttendanceTab } from '../components/StudentAttendanceTab'
import type { StudentDto, StudentGuardianDto, StudentNoteDto } from '../types'
import { DetailCard, PageStack, TableActions } from '../../../components/ui/FluentPage'
import { formatStatusLabel } from '../../../lib/formatStatus'

const useStyles = makeStyles({
  timeline: { display: 'grid', gap: tokens.spacingVerticalS },
  timelineItem: { padding: tokens.spacingHorizontalM, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusMedium },
  muted: { color: tokens.colorNeutralForeground3 },
})

function getStudentStatusColor(status: string) {
  if (status === 'active' || status === 'completed') return 'success'
  if (status === 'potential') return 'brand'
  if (status === 'inactive' || status === 'dropped') return 'danger'
  return 'subtle'
}

export function StudentDetailPage({ studentId, defaultTab = 'overview' }: { studentId: string; defaultTab?: 'overview'|'guardians'|'notes'|'enrollments'|'invoices'|'payments'|'attendance' }) {
  const styles = useStyles()
  const id = Number(studentId)
  const [student, setStudent] = useState<StudentDto | null>(null)
  const [guardians, setGuardians] = useState<StudentGuardianDto[]>([])
  const [notes, setNotes] = useState<StudentNoteDto[]>([])
  const [tab, setTab] = useState<'overview'|'guardians'|'notes'|'enrollments'|'invoices'|'payments'|'attendance'|'disabled'>(defaultTab)
  const [error, setError] = useState<string | null>(null)
  const [showGuardianDialog, setShowGuardianDialog] = useState(false)
  const [showNoteDialog, setShowNoteDialog] = useState(false)
  const [guardianForm, setGuardianForm] = useState({ fullName: '', phone: '', email: '', relationship: '' })
  const [noteContent, setNoteContent] = useState('')

  const load = async () => {
    try {
      const [s, g, n] = await Promise.all([getStudentApi(id), getGuardiansApi(id), getStudentNotesApi(id)])
      setStudent(s); setGuardians(g); setNotes(n)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load student detail')
    }
  }

  useEffect(() => { void load() }, [id])
  if (!student) return <p>{error ?? 'Loading...'}</p>

  return (
    <PageStack>
      {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}

      <TabList selectedValue={tab} onTabSelect={(_, d) => setTab(d.value as typeof tab)}>
        <Tab value="overview">Overview</Tab>
        <Tab value="guardians">Guardians</Tab>
        <Tab value="notes">Notes</Tab>
        <Tab value="enrollments">Enrollments</Tab>
        <Tab value="invoices">Invoices</Tab>
        <Tab value="payments">Payments</Tab>
        <Tab value="attendance">Attendance</Tab>
      </TabList>

      {tab === 'overview' ? (
        <DetailCard>
          <div><Text weight="semibold">Student code</Text><Text>{student.studentCode}</Text></div>
          <div><Text weight="semibold">Full name</Text><Text>{student.fullName}</Text></div>
          <div><Text weight="semibold">Phone</Text><Text>{student.phone ?? '-'}</Text></div>
          <div><Text weight="semibold">Email</Text><Text>{student.email ?? '-'}</Text></div>
          <div><Text weight="semibold">Date of birth</Text><Text>{student.dateOfBirth ?? '-'}</Text></div>
          <div><Text weight="semibold">Gender</Text><Text>{student.gender ?? '-'}</Text></div>
          <div><Text weight="semibold">Address</Text><Text>{student.address ?? '-'}</Text></div>
          <div><Text weight="semibold">Branch</Text><Text>{student.branchName ?? '-'}</Text></div>
          <div><Text weight="semibold">Status</Text><Badge appearance="filled" color={getStudentStatusColor(student.status)}>{formatStatusLabel(student.status)}</Badge></div>
          <div><Text weight="semibold">Source lead</Text><Text>-</Text></div>
          <div><Text weight="semibold">Created at</Text><Text>-</Text></div>
          <div>
            <Button size="small" appearance="secondary" onClick={async () => {
              const s = window.prompt('New status', student.status)
              if (s) { await updateStudentStatusApi(student.id, s); await load() }
            }}>Change status</Button>
          </div>
        </DetailCard>
      ) : null}

      {tab === 'guardians' ? (
        <>
          <Button appearance="primary" onClick={() => setShowGuardianDialog(true)}>Add Guardian</Button>
          <Table aria-label="Student guardians">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Full name</TableHeaderCell>
                <TableHeaderCell>Phone</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Relationship</TableHeaderCell>
                <TableHeaderCell>Primary</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guardians.map((g) => (
                <TableRow key={g.guardianId}>
                  <TableCell>{g.fullName}</TableCell>
                  <TableCell>{g.phone}</TableCell>
                  <TableCell>{g.email ?? '-'}</TableCell>
                  <TableCell>{g.relationship ?? '-'}</TableCell>
                  <TableCell>{g.isPrimary ? 'Primary' : '-'}</TableCell>
                  <TableCell>
                    <TableActions>
                      <Button size="small" appearance="subtle" onClick={async () => {
                        const fullName = window.prompt('Full name', g.fullName) || g.fullName
                        const phone = window.prompt('Phone', g.phone) || g.phone
                        await updateGuardianApi(id, g.guardianId, { fullName, phone, email: g.email, address: g.address, relationship: g.relationship, isPrimary: g.isPrimary })
                        await load()
                      }}>Edit</Button>
                      <Button size="small" appearance="subtle" onClick={async () => {
                        if (window.confirm('Delete guardian?')) {
                          await deleteGuardianApi(id, g.guardianId)
                          await load()
                        }
                      }}>Delete</Button>
                    </TableActions>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      ) : null}

      {tab === 'notes' ? (
        <>
          <Button appearance="primary" onClick={() => setShowNoteDialog(true)}>Add Note</Button>
          <div className={styles.timeline}>
            {notes.map((n) => (
              <div key={n.id} className={styles.timelineItem}>
                <Text>{n.content}</Text>
                <Text size={200} className={styles.muted}>{n.userName} - {new Date(n.createdAtUtc).toLocaleString()}</Text>
                <TableActions>
                  <Button size="small" appearance="subtle" onClick={async () => {
                    const content = window.prompt('Edit note', n.content) || n.content
                    await updateStudentNoteApi(id, n.id, content)
                    await load()
                  }}>Edit</Button>
                  <Button size="small" appearance="subtle" onClick={async () => {
                    if (window.confirm('Delete note?')) {
                      await deleteStudentNoteApi(id, n.id)
                      await load()
                    }
                  }}>Delete</Button>
                </TableActions>
              </div>
            ))}
          </div>
        </>
      ) : null}

      {tab === 'enrollments' ? <StudentEnrollmentsTab studentId={id} /> : null}
      {tab === 'invoices' ? <StudentInvoicesTab studentId={id} /> : null}
      {tab === 'payments' ? <StudentPaymentsTab studentId={id} /> : null}
      {tab === 'attendance' ? <StudentAttendanceTab studentId={id} /> : null}
      {tab === 'disabled' ? <p>This tab will be available in a later phase.</p> : null}

      <Dialog open={showGuardianDialog} onOpenChange={(_, d) => setShowGuardianDialog(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Add Guardian</DialogTitle>
            <DialogContent>
              <Field label="Full name" required><Input value={guardianForm.fullName} onChange={(_, d) => setGuardianForm({ ...guardianForm, fullName: d.value })} /></Field>
              <Field label="Phone" required><Input value={guardianForm.phone} onChange={(_, d) => setGuardianForm({ ...guardianForm, phone: d.value })} /></Field>
              <Field label="Email"><Input value={guardianForm.email} onChange={(_, d) => setGuardianForm({ ...guardianForm, email: d.value })} /></Field>
              <Field label="Relationship"><Input value={guardianForm.relationship} onChange={(_, d) => setGuardianForm({ ...guardianForm, relationship: d.value })} /></Field>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement><Button appearance="secondary">Cancel</Button></DialogTrigger>
              <Button appearance="primary" onClick={async () => {
                if (!guardianForm.fullName.trim() || !guardianForm.phone.trim()) return
                await createGuardianApi(id, {
                  fullName: guardianForm.fullName,
                  phone: guardianForm.phone,
                  email: guardianForm.email || null,
                  address: null,
                  relationship: guardianForm.relationship || null,
                  isPrimary: false,
                })
                setGuardianForm({ fullName: '', phone: '', email: '', relationship: '' })
                setShowGuardianDialog(false)
                await load()
              }}>Create</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog open={showNoteDialog} onOpenChange={(_, d) => setShowNoteDialog(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Add Note</DialogTitle>
            <DialogContent>
              <Field label="Content" required>
                <Textarea value={noteContent} onChange={(_, d) => setNoteContent(d.value)} />
              </Field>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement><Button appearance="secondary">Cancel</Button></DialogTrigger>
              <Button appearance="primary" onClick={async () => {
                if (!noteContent.trim()) return
                await createStudentNoteApi(id, noteContent)
                setNoteContent('')
                setShowNoteDialog(false)
                await load()
              }}>Create</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </PageStack>
  )
}
