import { useEffect, useMemo, useState } from 'react'
import { useAuthRoles } from '../../auth/useAuthRoles'
import { getClassSessionApi } from '../../classes/api'
import { navigateTo } from '../../../lib/navigation'
import { bulkSaveAttendanceApi, completeSessionApi, getSessionAttendanceApi } from '../api'
import type { SessionAttendanceItem } from '../types'

const statuses = ['present', 'late', 'absent', 'excused'] as const

export function SessionAttendancePage({ sessionId }: { sessionId: string }) {
  const id = Number(sessionId)
  const roles = useAuthRoles()
  const canEdit = roles.includes('Admin') || roles.includes('Manager') || roles.includes('Teacher')
  const [session, setSession] = useState<Awaited<ReturnType<typeof getClassSessionApi>> | null>(null)
  const [items, setItems] = useState<SessionAttendanceItem[]>([])
  const [draft, setDraft] = useState<Record<number, { status: string; note: string }>>({})
  const [error, setError] = useState<string | null>(null)

  const summary = useMemo(() => ({
    present: Object.values(draft).filter((x) => x.status === 'present').length,
    late: Object.values(draft).filter((x) => x.status === 'late').length,
    absent: Object.values(draft).filter((x) => x.status === 'absent').length,
    excused: Object.values(draft).filter((x) => x.status === 'excused').length,
  }), [draft])

  const load = async () => {
    try {
      const [s, a] = await Promise.all([getClassSessionApi(id), getSessionAttendanceApi(id)])
      setSession(s)
      setItems(a)
      const next: Record<number, { status: string; note: string }> = {}
      for (const row of a) next[row.studentId] = { status: row.status ?? '', note: row.note ?? '' }
      setDraft(next)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load attendance')
    }
  }

  useEffect(() => { void load() }, [id])
  if (!session) return <p>{error ?? 'Loading...'}</p>

  return (
    <>
      {error ? <p className="auth-error">{error}</p> : null}
      <div className="detail-grid">
        <div><strong>Class:</strong> {session.classId}</div>
        <div><strong>Session date:</strong> {session.sessionDate}</div>
        <div><strong>Time:</strong> {String(session.startTime).slice(0, 8)} - {String(session.endTime).slice(0, 8)}</div>
        <div><strong>Room:</strong> {session.roomName ?? '-'}</div>
        <div><strong>Teacher:</strong> {session.teacherUserName ?? '-'}</div>
        <div><strong>Status:</strong> {session.status}</div>
        <div><strong>Topic:</strong> {session.topic ?? '-'}</div>
      </div>

      <div className="users-toolbar" style={{ marginTop: 12 }}>
        <div className="users-filters">
          {canEdit ? <button className="ms-button ms-button--secondary" onClick={async()=>{const records = Object.entries(draft).filter(([,v]) => v.status).map(([studentId, v]) => ({ studentId: Number(studentId), status: v.status, note: v.note || null })); await bulkSaveAttendanceApi(id, records); await load()}}>Save Attendance</button> : null}
          {canEdit ? <button className="ms-button" onClick={async()=>{if(session.status === 'completed' || session.status === 'cancelled') return; const topic = window.prompt('Topic', session.topic ?? '') || session.topic || null; const note = window.prompt('Note', session.note ?? '') || session.note || null; await completeSessionApi(id, { topic, note }); await load()}}>Complete Session</button> : null}
          <button className="table-action-btn" onClick={()=>navigateTo(`/classes/${session.classId}/attendance-summary`)}>Class Summary</button>
        </div>
        <div>Present {summary.present} | Late {summary.late} | Absent {summary.absent} | Excused {summary.excused}</div>
      </div>

      <table className="ms-table">
        <thead><tr><th>Student Code</th><th>Student Name</th><th>Present</th><th>Late</th><th>Absent</th><th>Excused</th><th>Note</th></tr></thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.studentId}>
              <td>{row.studentCode}</td>
              <td>{row.studentName}</td>
              {statuses.map((st) => <td key={st}><input type="radio" name={`status-${row.studentId}`} checked={draft[row.studentId]?.status === st} onChange={() => setDraft((prev)=>({ ...prev, [row.studentId]: { status: st, note: prev[row.studentId]?.note ?? '' } }))} /></td>)}
              <td><input className="toolbar-input" value={draft[row.studentId]?.note ?? ''} onChange={(e)=>setDraft((prev)=>({ ...prev, [row.studentId]: { status: prev[row.studentId]?.status ?? '', note: e.target.value } }))} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
