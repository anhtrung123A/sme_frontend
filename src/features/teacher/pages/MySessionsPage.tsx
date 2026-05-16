import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../auth/hooks'
import { getClassesApi, getClassSessionsApi } from '../../classes/api'
import { navigateTo } from '../../../lib/navigation'
import type { ClassSessionDto } from '../../classes/types'

type SessionRow = ClassSessionDto & { className: string }

export function MySessionsPage() {
  const { currentUser } = useAuth()
  const [date, setDate] = useState('')
  const [status, setStatus] = useState('')
  const [rows, setRows] = useState<SessionRow[]>([])
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => rows.filter((x) => (!date || x.sessionDate === date) && (!status || x.status === status)), [rows, date, status])

  const load = async () => {
    if (!currentUser?.id) return
    try {
      const classes = await getClassesApi({ teacherUserId: currentUser.id, pageSize: 100 })
      const sessions = await Promise.all(classes.items.map(async (c) => (await getClassSessionsApi(c.id)).map((s) => ({ ...s, className: c.name }))))
      setRows(sessions.flat())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load sessions')
    }
  }

  useEffect(() => { void load() }, [currentUser?.id])

  return (
    <>
      <div className="users-toolbar">
        <div className="users-filters">
          <input className="toolbar-input" type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
          <select className="toolbar-select" value={status} onChange={(e)=>setStatus(e.target.value)}><option value="">All status</option>{['scheduled', 'completed', 'cancelled'].map((x)=><option key={x}>{x}</option>)}</select>
          <button className="ms-button ms-button--secondary" onClick={()=>void load()}>Refresh</button>
        </div>
      </div>
      {error ? <p className="auth-error">{error}</p> : null}
      <table className="ms-table">
        <thead><tr><th>Session date</th><th>Class name</th><th>Time</th><th>Room</th><th>Topic</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>{filtered.map((s)=><tr key={s.id}><td>{s.sessionDate}</td><td>{s.className}</td><td>{String(s.startTime).slice(0,8)} - {String(s.endTime).slice(0,8)}</td><td>{s.roomName ?? '-'}</td><td>{s.topic ?? '-'}</td><td>{s.status}</td><td><div className="table-actions"><button className="table-action-btn" onClick={()=>navigateTo(`/attendance/sessions/${s.id}`)}>Mark Attendance</button><button className="table-action-btn" onClick={()=>navigateTo(`/attendance/sessions/${s.id}`)}>View</button></div></td></tr>)}</tbody>
      </table>
    </>
  )
}
