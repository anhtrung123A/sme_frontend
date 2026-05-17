import { useEffect, useMemo, useState } from 'react'
import {
  Badge,
  Button,
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
} from '@fluentui/react-components'
import { getStudentAttendanceHistoryApi } from '../api'
import type { StudentAttendanceHistoryItem } from '../types'
import { KpiCard, KpiGrid, PageStack, TableCard } from '../../../components/ui/FluentPage'
import { formatStatusLabel } from '../../../lib/formatStatus'

function getAttendanceStatusColor(status: string | null) {
  if (status === 'present') return 'success'
  if (status === 'late') return 'warning'
  if (status === 'absent') return 'danger'
  if (status === 'excused') return 'informative'
  return 'subtle'
}

export function StudentAttendanceHistoryPage({ studentId }: { studentId: string }) {
  const id = Number(studentId)
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [items, setItems] = useState<StudentAttendanceHistoryItem[]>([])
  const [error, setError] = useState<string | null>(null)

  const summary = useMemo(() => {
    const present = items.filter((x) => x.status === 'present').length
    const late = items.filter((x) => x.status === 'late').length
    const absent = items.filter((x) => x.status === 'absent').length
    const excused = items.filter((x) => x.status === 'excused').length
    const total = items.length
    const attendanceRate = total ? ((present + late + excused) / total) * 100 : 0
    return { total, present, late, absent, excused, attendanceRate }
  }, [items])

  const load = async () => {
    try {
      setItems(await getStudentAttendanceHistoryApi(id, { fromDate: fromDate || undefined, toDate: toDate || undefined }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load history')
    }
  }

  useEffect(() => { void load() }, [id])

  return (
    <PageStack>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end' }}>
        <Field label="From date"><Input type="date" value={fromDate} onChange={(_, d) => setFromDate(d.value)} /></Field>
        <Field label="To date"><Input type="date" value={toDate} onChange={(_, d) => setToDate(d.value)} /></Field>
        <Button appearance="secondary" onClick={() => void load()}>Apply</Button>
      </div>

      <KpiGrid>
        <KpiCard label="Total" value={summary.total} />
        <KpiCard label="Present" value={summary.present} />
        <KpiCard label="Late" value={summary.late} />
        <KpiCard label="Absent" value={summary.absent} />
        <KpiCard label="Excused" value={summary.excused} />
        <KpiCard label="Attendance Rate" value={`${summary.attendanceRate.toFixed(2)}%`} />
      </KpiGrid>

      {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}
      <TableCard title="Attendance History" subtitle={`${items.length} records`}>
        <Table aria-label="Student attendance history">
          <TableHeader><TableRow><TableHeaderCell>Session date</TableHeaderCell><TableHeaderCell>Class</TableHeaderCell><TableHeaderCell>Course</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell><TableHeaderCell>Note</TableHeaderCell><TableHeaderCell>Marked at</TableHeaderCell></TableRow></TableHeader>
          <TableBody>{items.map((x, i) => <TableRow key={`${x.sessionDate}-${x.className}-${i}`}><TableCell>{x.sessionDate}</TableCell><TableCell>{x.className}</TableCell><TableCell>{x.courseName}</TableCell><TableCell><Badge appearance="filled" color={getAttendanceStatusColor(x.status)}>{formatStatusLabel(x.status ?? 'unmarked')}</Badge></TableCell><TableCell>{x.note ?? '-'}</TableCell><TableCell>{x.markedAt ? new Date(x.markedAt).toLocaleString() : '-'}</TableCell></TableRow>)}</TableBody>
        </Table>
      </TableCard>
    </PageStack>
  )
}
