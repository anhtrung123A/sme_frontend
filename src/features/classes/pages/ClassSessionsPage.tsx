import { useEffect, useState } from 'react'
import { navigateTo } from '../../../lib/navigation'
import { getClassSessionsApi } from '../api'
import type { ClassSessionDto } from '../types'

export function ClassSessionsPage({ classId }: { classId: string }) {
  const id = Number(classId)
  const [items, setItems] = useState<ClassSessionDto[]>([])
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [status, setStatus] = useState('')

  const load = async () => {
    const data = await getClassSessionsApi(id, { fromDate: fromDate || undefined, toDate: toDate || undefined, status: status || undefined })
    setItems(data)
  }

  useEffect(() => { void load() }, [])

  return (
    <>
      <div className="users-toolbar"><div className="users-filters"><input className="toolbar-input" type="date" value={fromDate} onChange={(e)=>setFromDate(e.target.value)} /><input className="toolbar-input" type="date" value={toDate} onChange={(e)=>setToDate(e.target.value)} /><select className="toolbar-select" value={status} onChange={(e)=>setStatus(e.target.value)}><option value="">All</option>{['scheduled','completed','cancelled'].map((s)=><option key={s}>{s}</option>)}</select><button className="ms-button ms-button--secondary" onClick={()=>void load()}>Apply</button></div></div>
      <table className="ms-table"><thead><tr><th>Session Date</th><th>Time</th><th>Teacher</th><th>Room</th><th>Topic</th><th>Status</th><th>Actions</th></tr></thead><tbody>{items.map((s)=><tr key={s.id}><td>{s.sessionDate}</td><td>{String(s.startTime).slice(0,8)} - {String(s.endTime).slice(0,8)}</td><td>{s.teacherUserName??'-'}</td><td>{s.roomName??'-'}</td><td>{s.topic??'-'}</td><td>{s.status}</td><td><button className="table-action-btn" onClick={()=>navigateTo(`/class-sessions/${s.id}`)}>Edit</button></td></tr>)}</tbody></table>
    </>
  )
}
