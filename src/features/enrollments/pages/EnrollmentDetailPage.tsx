import { useEffect, useState } from 'react'
import { Button, Card, MessageBar, MessageBarBody, Text } from '@fluentui/react-components'
import { useAuthRoles } from '../../auth/useAuthRoles'
import { navigateTo } from '../../../lib/navigation'
import { assignEnrollmentClassApi, getClassesLiteApi, getEnrollmentApi, updateEnrollmentStatusApi } from '../api'
import { createInvoiceFromEnrollmentApi } from '../../invoices/api'
import { EnrollmentStatusBadge } from '../components/EnrollmentStatusBadge'
import type { ClassLite, EnrollmentDto } from '../types'
import { DetailCard, PageStack } from '../../../components/ui/FluentPage'

export function EnrollmentDetailPage({ enrollmentId }: { enrollmentId: string }) {
  const id = Number(enrollmentId)
  const roles = useAuthRoles()
  const canAssignClass = roles.includes('Admin') || roles.includes('Manager')
  const canChangeStatus = roles.includes('Admin') || roles.includes('Manager') || roles.includes('Sales')
  const canCreateInvoice = roles.includes('Admin') || roles.includes('Manager')

  const [item, setItem] = useState<EnrollmentDto | null>(null)
  const [classes, setClasses] = useState<ClassLite[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const enrollment = await getEnrollmentApi(id)
      setItem(enrollment)
      setClasses(await getClassesLiteApi({ courseId: enrollment.courseId }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load enrollment')
    }
  }

  useEffect(() => { void load() }, [id])
  if (!item) return <p>{error ?? 'Loading...'}</p>

  return (
    <PageStack>
      {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button appearance="secondary" onClick={() => navigateTo(`/enrollments/${item.id}/edit`)}>Edit enrollment</Button>
        {canAssignClass ? <Button appearance="secondary" onClick={async () => { const selected = window.prompt('Class ID (empty to unassign)', item.classId ? String(item.classId) : ''); if (selected === null) return; await assignEnrollmentClassApi(item.id, selected.trim() ? Number(selected) : null); await load() }}>Assign class</Button> : null}
        {canChangeStatus ? <Button appearance="secondary" onClick={async () => { const status = window.prompt('New status', item.status); if (!status) return; const note = window.prompt('Note (optional)', item.note ?? '') ?? undefined; await updateEnrollmentStatusApi(item.id, status, note); await load() }}>Change status</Button> : null}
        {canCreateInvoice ? <Button appearance="primary" onClick={async () => { const dueDate = window.prompt('Due date (YYYY-MM-DD)', '') || undefined; const invoice = await createInvoiceFromEnrollmentApi(item.id, dueDate); navigateTo(`/invoices/${invoice.id}`) }}>Create invoice</Button> : null}
      </div>

      <DetailCard>
        <div><Text weight="semibold">Student</Text><Text>{item.studentName}</Text></div>
        <div><Text weight="semibold">Course</Text><Text>{item.courseName}</Text></div>
        <div><Text weight="semibold">Class</Text><Text>{item.className ?? '-'}</Text></div>
        <div><Text weight="semibold">Sales owner</Text><Text>{item.salesUserName ?? '-'}</Text></div>
        <div><Text weight="semibold">Status</Text><EnrollmentStatusBadge status={item.status} /></div>
        <div><Text weight="semibold">Tuition fee</Text><Text>{item.tuitionFee.toLocaleString()}</Text></div>
        <div><Text weight="semibold">Discount amount</Text><Text>{item.discountAmount.toLocaleString()}</Text></div>
        <div><Text weight="semibold">Final amount</Text><Text>{item.finalAmount.toLocaleString()}</Text></div>
        <div><Text weight="semibold">Start date</Text><Text>{item.startDate ?? '-'}</Text></div>
        <div><Text weight="semibold">End date</Text><Text>{item.endDate ?? '-'}</Text></div>
        <div><Text weight="semibold">Enrolled at</Text><Text>{item.enrolledAt ? new Date(item.enrolledAt).toLocaleString() : '-'}</Text></div>
        <div><Text weight="semibold">Note</Text><Text>{item.note ?? '-'}</Text></div>
      </DetailCard>

      <Card>
        <Text weight="semibold">History</Text>
        <Text block>Enrollment created and updated actions are tracked on the backend audit trail.</Text>
        <Text block>Available classes for this course: {classes.filter((x) => x.status !== 'completed' && x.status !== 'cancelled').length}</Text>
      </Card>
    </PageStack>
  )
}
