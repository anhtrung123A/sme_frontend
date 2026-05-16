import { useEffect, useState } from 'react'
import { getAttendanceSummaryApi, getRiskStudentsApi } from '../../dashboard/api'
import type { AttendanceSummary, RiskStudent } from '../../dashboard/types'

export function AttendanceAnalyticsPage() {
  const [summary, setSummary] = useState<AttendanceSummary | null>(null)
  const [risk, setRisk] = useState<RiskStudent[]>([])
  useEffect(() => { void (async () => { setSummary(await getAttendanceSummaryApi()); setRisk(await getRiskStudentsApi()) })() }, [])
  return (
    <>
      <div className="detail-grid">
        <div>Total Sessions: {summary?.totalSessions ?? 0}</div><div>Completed: {summary?.completedSessions ?? 0}</div><div>Records: {summary?.totalAttendanceRecords ?? 0}</div><div>Avg Rate: {Number(summary?.averageAttendanceRate ?? 0).toFixed(2)}%</div>
      </div>
      <table className="ms-table" style={{ marginTop: 12 }}>
        <thead><tr><th>Student</th><th>Class</th><th>Total</th><th>Present</th><th>Late</th><th>Absent</th><th>Rate</th></tr></thead>
        <tbody>{risk.map((x)=><tr key={`${x.studentId}-${x.classId}`}><td>{x.studentCode} - {x.studentName}</td><td>{x.className}</td><td>{x.totalSessions}</td><td>{x.presentCount}</td><td>{x.lateCount}</td><td>{x.absentCount}</td><td>{Number(x.attendanceRate).toFixed(2)}%</td></tr>)}</tbody>
      </table>
    </>
  )
}
