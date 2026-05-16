import { useEffect, useState } from 'react'
import { useAuthRoles } from '../../auth/useAuthRoles'
import { navigateTo } from '../../../lib/navigation'
import { assignEnrollmentClassApi, getClassesLiteApi, getEnrollmentApi, updateEnrollmentStatusApi } from '../api'
import { createInvoiceFromEnrollmentApi } from '../../invoices/api'
import { EnrollmentStatusBadge } from '../components/EnrollmentStatusBadge'
import type { ClassLite, EnrollmentDto } from '../types'

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
    <>
      {error ? <p className="auth-error">{error}</p> : null}
      <div className="users-toolbar">
        <div className="users-filters">
          <button className="table-action-btn" onClick={() => navigateTo(`/enrollments/${item.id}/edit`)}>Edit enrollment</button>
          {canAssignClass ? <button className="table-action-btn" onClick={async()=>{const selected = window.prompt('Class ID (empty to unassign)', item.classId ? String(item.classId) : ''); if (selected === null) return; await assignEnrollmentClassApi(item.id, selected.trim() ? Number(selected) : null); await load()}}>Assign class</button> : null}
          {canChangeStatus ? <button className="table-action-btn" onClick={async()=>{const status = window.prompt('New status', item.status); if (!status) return; const note = window.prompt('Note (optional)', item.note ?? '') ?? undefined; await updateEnrollmentStatusApi(item.id, status, note); await load()}}>Change status</button> : null}
          {canCreateInvoice ? <button className="table-action-btn" onClick={async()=>{const dueDate = window.prompt('Due date (YYYY-MM-DD)', '') || undefined; const invoice = await createInvoiceFromEnrollmentApi(item.id, dueDate); navigateTo(`/invoices/${invoice.id}`)}}>Create invoice</button> : null}
        </div>
      </div>

      <div className="detail-grid">
        <div><strong>Student:</strong> {item.studentName}</div>
        <div><strong>Course:</strong> {item.courseName}</div>
        <div><strong>Class:</strong> {item.className ?? '-'}</div>
        <div><strong>Sales owner:</strong> {item.salesUserName ?? '-'}</div>
        <div><strong>Status:</strong> <EnrollmentStatusBadge status={item.status} /></div>
        <div><strong>Tuition fee:</strong> {item.tuitionFee.toLocaleString()}</div>
        <div><strong>Discount amount:</strong> {item.discountAmount.toLocaleString()}</div>
        <div><strong>Final amount:</strong> {item.finalAmount.toLocaleString()}</div>
        <div><strong>Start date:</strong> {item.startDate ?? '-'}</div>
        <div><strong>End date:</strong> {item.endDate ?? '-'}</div>
        <div><strong>Enrolled at:</strong> {item.enrolledAt ? new Date(item.enrolledAt).toLocaleString() : '-'}</div>
        <div><strong>Note:</strong> {item.note ?? '-'}</div>
      </div>

      <div style={{ marginTop: 16 }}>
        <h3>History</h3>
        <p>Enrollment created and updated actions are tracked on the backend audit trail.</p>
        <p>Available classes for this course: {classes.filter((x)=>x.status !== 'completed' && x.status !== 'cancelled').length}</p>
      </div>
    </>
  )
}
