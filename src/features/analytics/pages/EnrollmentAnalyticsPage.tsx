import { useEffect, useState } from 'react'
import { apiRequest } from '../../../lib/apiClient'

type ByCourse = { courseId: number; courseName: string; totalEnrollments: number; activeEnrollments: number; completedEnrollments: number; cancelledEnrollments: number; totalRevenue: number }

export function EnrollmentAnalyticsPage() {
  const [rows, setRows] = useState<ByCourse[]>([])
  useEffect(() => { void (async () => setRows(await apiRequest<ByCourse[]>('/analytics/enrollments/by-course')))() }, [])
  return (
    <table className="ms-table">
      <thead><tr><th>Course</th><th>Total</th><th>Active</th><th>Completed</th><th>Cancelled</th><th>Total Revenue</th></tr></thead>
      <tbody>{rows.map((x)=><tr key={x.courseId}><td>{x.courseName}</td><td>{x.totalEnrollments}</td><td>{x.activeEnrollments}</td><td>{x.completedEnrollments}</td><td>{x.cancelledEnrollments}</td><td>{x.totalRevenue.toLocaleString()}</td></tr>)}</tbody>
    </table>
  )
}
