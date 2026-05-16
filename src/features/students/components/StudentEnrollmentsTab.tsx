import { useEffect, useState } from 'react'
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
      <div className="users-toolbar">
        <div />
        <button className="ms-button" onClick={() => navigateTo(`/enrollments/create?studentId=${studentId}`)}>Create Enrollment</button>
      </div>
      {error ? <p className="auth-error">{error}</p> : null}
      <table className="ms-table">
        <thead><tr><th>Course</th><th>Class</th><th>Status</th><th>Final Amount</th><th>Start Date</th><th>End Date</th><th>Actions</th></tr></thead>
        <tbody>{items.map((x)=><tr key={x.id}><td>{x.courseName}</td><td>{x.className ?? '-'}</td><td><EnrollmentStatusBadge status={x.status} /></td><td>{x.finalAmount.toLocaleString()}</td><td>{x.startDate ?? '-'}</td><td>{x.endDate ?? '-'}</td><td><button className="table-action-btn" onClick={()=>navigateTo(`/enrollments/${x.id}`)}>View</button></td></tr>)}</tbody>
      </table>
    </div>
  )
}
