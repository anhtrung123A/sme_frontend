import { useEffect, useState } from 'react'
import { navigateTo } from '../../../lib/navigation'
import { deleteClassSessionApi, getClassSessionApi, updateClassSessionApi, updateClassSessionStatusApi } from '../api'

export function ClassSessionDetailPage({ sessionId }: { sessionId: string }) {
  const id = Number(sessionId)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ classId:0, sessionDate:'', startTime:'', endTime:'', roomId:'', teacherUserId:'', topic:'', note:'', status:'' })

  useEffect(() => {
    void (async () => {
      try {
        const s = await getClassSessionApi(id)
        setForm({
          classId: s.classId,
          sessionDate: s.sessionDate,
          startTime: String(s.startTime).slice(0,8),
          endTime: String(s.endTime).slice(0,8),
          roomId: s.roomId ? String(s.roomId) : '',
          teacherUserId: s.teacherUserId ? String(s.teacherUserId) : '',
          topic: s.topic ?? '',
          note: s.note ?? '',
          status: s.status,
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load session')
      }
    })()
  }, [id])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateClassSessionApi(id, {
      sessionDate: form.sessionDate,
      startTime: form.startTime,
      endTime: form.endTime,
      roomId: form.roomId ? Number(form.roomId) : null,
      teacherUserId: form.teacherUserId ? Number(form.teacherUserId) : null,
      topic: form.topic || null,
      note: form.note || null,
    })
    navigateTo(`/classes/${form.classId}/sessions`, true)
  }

  return (
    <form className="user-form" onSubmit={save}>
      {error ? <p className="auth-error">{error}</p> : null}
      <label className="form-field"><span>Session Date</span><input className="toolbar-input" type="date" value={form.sessionDate} onChange={(e)=>setForm({...form,sessionDate:e.target.value})} /></label>
      <label className="form-field"><span>Start Time</span><input className="toolbar-input" value={form.startTime} onChange={(e)=>setForm({...form,startTime:e.target.value})} /></label>
      <label className="form-field"><span>End Time</span><input className="toolbar-input" value={form.endTime} onChange={(e)=>setForm({...form,endTime:e.target.value})} /></label>
      <label className="form-field"><span>Topic</span><input className="toolbar-input" value={form.topic} onChange={(e)=>setForm({...form,topic:e.target.value})} /></label>
      <label className="form-field" style={{gridColumn:'1 / -1'}}><span>Note</span><textarea className="toolbar-input" style={{height:'90px',paddingTop:'8px'}} value={form.note} onChange={(e)=>setForm({...form,note:e.target.value})} /></label>
      <div className="form-actions"><button className="ms-button ms-button--secondary" type="button" onClick={()=>navigateTo(`/classes/${form.classId}/sessions`)}>Cancel</button><button className="ms-button" type="submit">Save</button><button className="table-action-btn" type="button" onClick={async()=>{const st=window.prompt('Status',form.status);if(st){await updateClassSessionStatusApi(id,st); setForm({...form,status:st})}}}>Change status</button><button className="table-action-btn" type="button" onClick={async()=>{if(window.confirm('Delete session?')){await deleteClassSessionApi(id);navigateTo(`/classes/${form.classId}/sessions`,true)}}}>Delete</button></div>
    </form>
  )
}
