import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Field,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import { navigateTo } from '../../../lib/navigation'
import { formatStatusLabel } from '../../../lib/formatStatus'
import { TableCard } from '../../../components/ui/FluentPage'
import { getClassSessionsApi } from '../api'
import type { ClassSessionDto } from '../types'

function getStatusColor(status: string) {
  if (status === 'scheduled') return 'brand'
  if (status === 'completed') return 'success'
  if (status === 'cancelled') return 'danger'
  return 'subtle'
}

const useStyles = makeStyles({
  filters: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalL}`,
    alignItems: 'end',
  },
})

export function ClassSessionsPage({ classId }: { classId: string }) {
  const styles = useStyles()
  const id = Number(classId)
  const [items, setItems] = useState<ClassSessionDto[]>([])
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [status, setStatus] = useState('')

  const load = async () => {
    const data = await getClassSessionsApi(id, { fromDate: fromDate || undefined, toDate: toDate || undefined, status: status || undefined })
    setItems(data)
  }

  useEffect(() => { void load() }, [])

  return (
    <TableCard title="Class Sessions" subtitle={`${items.length} sessions`}>
      <div className={styles.filters}>
        <Field label="From"><Input type="date" value={fromDate} onChange={(_, d) => setFromDate(d.value)} /></Field>
        <Field label="To"><Input type="date" value={toDate} onChange={(_, d) => setToDate(d.value)} /></Field>
        <Field label="Status">
          <Select value={status} onChange={(e) => setStatus(e.currentTarget.value)}>
            <option value="">All</option>
            {['scheduled', 'completed', 'cancelled'].map((s) => <option key={s}>{formatStatusLabel(s)}</option>)}
          </Select>
        </Field>
        <Button appearance="secondary" onClick={() => void load()}>Apply</Button>
      </div>
      <Table aria-label="Class sessions table">
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
          {items.map((s) => (
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
  )
}
