import { useEffect, useState } from 'react'
import { navigateTo } from '../../../lib/navigation'
import {
  createClassScheduleApi,
  deleteClassScheduleApi,
  generateSessionsApi,
  getClassApi,
  getClassSchedulesApi,
  getClassSessionsApi,
  updateClassScheduleApi,
  updateClassStatusApi,
} from '../api'
import type { ClassDto, ClassScheduleDto, ClassSessionDto } from '../types'

const dayMap: Record<number, string> = { 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 7: 'Sunday' }

export function ClassDetailPage({ classId }: { classId: string }) {
  const id = Number(classId)
  const [item, setItem] = useState<ClassDto | null>(null)
  const [schedules, setSchedules] = useState<ClassScheduleDto[]>([])
  const [sessions, setSessions] = useState<ClassSessionDto[]>([])
  const [tab, setTab] = useState<'overview'|'schedules'|'sessions'>('overview')
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const [c, sch, ses] = await Promise.all([getClassApi(id), getClassSchedulesApi(id), getClassSessionsApi(id)])
      setItem(c); setSchedules(sch); setSessions(ses)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load class')
    }
  }

  useEffect(() => { void load() }, [id])
  if (!item) return <p>{error ?? 'Loading...'}</p>

  return (
    <>
      {error ? <p className="auth-error">{error}</p> : null}
      <div className="users-toolbar"><div className="users-filters"><button className="table-action-btn" onClick={()=>navigateTo(`/classes/${item.id}/edit`)}>Edit class</button><button className="table-action-btn" onClick={async()=>{const s=window.prompt('Status',item.status);if(s){await updateClassStatusApi(item.id,s);await load()}}}>Change status</button><button className="table-action-btn" onClick={async()=>{const fromDate=window.prompt('From date (YYYY-MM-DD)', item.startDate ?? '')||'';const toDate=window.prompt('To date (YYYY-MM-DD)', item.endDate ?? '')||'';const overwriteExisting=window.confirm('Overwrite existing sessions?');const res=await generateSessionsApi(item.id,{fromDate:fromDate||null,toDate:toDate||null,overwriteExisting});alert(`Generated ${res.createdCount} sessions`);await load()}}>Generate sessions</button></div></div>
      <div className="tabs"><button className={`tab-btn ${tab==='overview'?'active':''}`} onClick={()=>setTab('overview')}>Overview</button><button className={`tab-btn ${tab==='schedules'?'active':''}`} onClick={()=>setTab('schedules')}>Schedules</button><button className={`tab-btn ${tab==='sessions'?'active':''}`} onClick={()=>setTab('sessions')}>Sessions</button><button className="tab-btn">Students (Phase 5)</button><button className="tab-btn">Attendance (Phase 7)</button></div>

      {tab==='overview' ? <div className="detail-grid"><div><strong>Class code:</strong> {item.classCode}</div><div><strong>Class name:</strong> {item.name}</div><div><strong>Course:</strong> {item.courseName??'-'}</div><div><strong>Branch:</strong> {item.branchName??'-'}</div><div><strong>Room:</strong> {item.roomName??'-'}</div><div><strong>Teacher:</strong> {item.teacherUserName??'-'}</div><div><strong>Max students:</strong> {item.maxStudents??'-'}</div><div><strong>Start date:</strong> {item.startDate??'-'}</div><div><strong>End date:</strong> {item.endDate??'-'}</div><div><strong>Status:</strong> {item.status}</div><div><strong>Created at:</strong> -</div></div> : null}

      {tab==='schedules' ? <div><button className="ms-button" onClick={async()=>{const dayOfWeek=Number(window.prompt('Day of week (1-7)','1'));const startTime=window.prompt('Start time (HH:mm:ss)','19:00:00')||'';const endTime=window.prompt('End time (HH:mm:ss)','21:00:00')||'';if(!(dayOfWeek>=1&&dayOfWeek<=7)) return; if(startTime>=endTime){alert('startTime must be < endTime');return;} const exists=schedules.some((s)=>s.dayOfWeek===dayOfWeek&&s.startTime===startTime&&s.endTime===endTime); if(exists){alert('Duplicate schedule'); return;} await createClassScheduleApi(item.id,{dayOfWeek,startTime,endTime}); await load()}}>+ Add Schedule</button><div className="timeline" style={{marginTop:'10px'}}>{schedules.map((s)=><div key={s.id} className="timeline-item"><div><strong>{dayMap[s.dayOfWeek]}</strong> {String(s.startTime).slice(0,8)} - {String(s.endTime).slice(0,8)}</div><div className="table-actions" style={{marginTop:'8px'}}><button className="table-action-btn" onClick={async()=>{const dayOfWeek=Number(window.prompt('Day of week (1-7)',String(s.dayOfWeek))||s.dayOfWeek);const startTime=window.prompt('Start time',String(s.startTime))||String(s.startTime);const endTime=window.prompt('End time',String(s.endTime))||String(s.endTime);await updateClassScheduleApi(item.id,s.id,{dayOfWeek,startTime,endTime});await load()}}>Edit</button><button className="table-action-btn" onClick={async()=>{if(window.confirm('Delete schedule?')){await deleteClassScheduleApi(item.id,s.id);await load()}}}>Delete</button></div></div>)}</div></div> : null}

      {tab==='sessions' ? <table className="ms-table"><thead><tr><th>Session Date</th><th>Time</th><th>Teacher</th><th>Room</th><th>Topic</th><th>Status</th><th>Actions</th></tr></thead><tbody>{sessions.map((s)=><tr key={s.id}><td>{s.sessionDate}</td><td>{String(s.startTime).slice(0,8)} - {String(s.endTime).slice(0,8)}</td><td>{s.teacherUserName??'-'}</td><td>{s.roomName??'-'}</td><td>{s.topic??'-'}</td><td>{s.status}</td><td><button className="table-action-btn" onClick={()=>navigateTo(`/class-sessions/${s.id}`)}>Edit</button></td></tr>)}</tbody></table> : null}
    </>
  )
}
