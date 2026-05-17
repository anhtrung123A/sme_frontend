import { useEffect, useState } from 'react'
import { Button, MessageBar, MessageBarBody, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from '@fluentui/react-components'
import { navigateTo } from '../../../lib/navigation'
import { getStudentEnrollmentsApi } from '../../enrollments/api'
import { EnrollmentStatusBadge } from '../../enrollments/components/EnrollmentStatusBadge'
import type { EnrollmentDto } from '../../enrollments/types'

export function StudentEnrollmentsTab({ studentId }: { studentId: number }) {
  const [items, setItems] = useState<EnrollmentDto[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setItems(await getStudentEnrollmentsApi(studentId))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load enrollments')
    }
  }

  useEffect(() => { void load() }, [studentId])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <Button appearance="primary" onClick={() => navigateTo(`/enrollments/create?studentId=${studentId}`)}>Create Enrollment</Button>
      </div>
      {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}
      <Table aria-label="Student enrollments">
        <TableHeader><TableRow><TableHeaderCell>Course</TableHeaderCell><TableHeaderCell>Class</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell><TableHeaderCell>Final Amount</TableHeaderCell><TableHeaderCell>Start Date</TableHeaderCell><TableHeaderCell>End Date</TableHeaderCell><TableHeaderCell>Actions</TableHeaderCell></TableRow></TableHeader>
        <TableBody>{items.map((x) => <TableRow key={x.id}><TableCell>{x.courseName}</TableCell><TableCell>{x.className ?? '-'}</TableCell><TableCell><EnrollmentStatusBadge status={x.status} /></TableCell><TableCell>{x.finalAmount.toLocaleString()}</TableCell><TableCell>{x.startDate ?? '-'}</TableCell><TableCell>{x.endDate ?? '-'}</TableCell><TableCell><Button size="small" appearance="subtle" onClick={() => navigateTo(`/enrollments/${x.id}`)}>View</Button></TableCell></TableRow>)}</TableBody>
      </Table>
    </div>
  )
}
