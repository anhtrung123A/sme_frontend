import { useEffect, useMemo, useState } from 'react'
import { getStudentAttendanceHistoryApi } from '../api'
import type { StudentAttendanceHistoryItem } from '../types'

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
    <>
      <div className="users-toolbar">
        <div className="users-filters">
          <input className="toolbar-input" type="date" value={fromDate} onChange={(e)=>setFromDate(e.target.value)} />
          <input className="toolbar-input" type="date" value={toDate} onChange={(e)=>setToDate(e.target.value)} />
          <button className="ms-button ms-button--secondary" onClick={()=>void load()}>Apply</button>
        </div>
        <div>Total {summary.total} | Present {summary.present} | Late {summary.late} | Absent {summary.absent} | Excused {summary.excused} | Rate {summary.attendanceRate.toFixed(2)}%</div>
      </div>
      {error ? <p className="auth-error">{error}</p> : null}
      <table className="ms-table">
        <thead><tr><th>Session date</th><th>Class</th><th>Course</th><th>Status</th><th>Note</th><th>Marked at</th></tr></thead>
        <tbody>{items.map((x, i)=><tr key={`${x.sessionDate}-${x.className}-${i}`}><td>{x.sessionDate}</td><td>{x.className}</td><td>{x.courseName}</td><td>{x.status ?? 'unmarked'}</td><td>{x.note ?? '-'}</td><td>{x.markedAt ? new Date(x.markedAt).toLocaleString() : '-'}</td></tr>)}</tbody>
      </table>
    </>
  )
}
