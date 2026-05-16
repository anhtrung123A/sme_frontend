import { useEffect, useState } from 'react'
import { getClassAttendanceSummaryApi } from '../api'
import type { ClassAttendanceSummaryItem } from '../types'

export function ClassAttendanceSummaryPage({ classId }: { classId: string }) {
  const id = Number(classId)
  const [items, setItems] = useState<ClassAttendanceSummaryItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try { setItems(await getClassAttendanceSummaryApi(id)) } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load summary') }
    })()
  }, [id])

  return (
    <>
      {error ? <p className="auth-error">{error}</p> : null}
      <table className="ms-table">
        <thead><tr><th>Student</th><th>Total</th><th>Present</th><th>Late</th><th>Absent</th><th>Excused</th><th>Attendance Rate</th><th>Risk</th></tr></thead>
        <tbody>{items.map((x)=>{const risk = x.attendanceRate < 50 ? 'High Risk' : x.attendanceRate < 70 ? 'Risk' : '-'; return <tr key={x.studentId}><td>{x.studentCode} - {x.studentName}</td><td>{x.totalSessions}</td><td>{x.presentCount}</td><td>{x.lateCount}</td><td>{x.absentCount}</td><td>{x.excusedCount}</td><td>{Number(x.attendanceRate).toFixed(2)}%</td><td>{risk}</td></tr>})}</tbody>
      </table>
    </>
  )
}
