import { useState } from 'react'
import { navigateTo } from '../../../lib/navigation'
import { createCourseApi } from '../api'

export function CourseCreatePage() {
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name:'', code:'', level:'', description:'', totalSessions:'', tuitionFee:'' })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.name.trim()) return setError('Name required')
    if (!form.code.trim()) return setError('Code required')
    if (!form.totalSessions || Number(form.totalSessions) <= 0) return setError('Total sessions must be > 0')
    if (!form.tuitionFee || Number(form.tuitionFee) <= 0) return setError('Tuition fee must be > 0')

    await createCourseApi({
      name: form.name,
      code: form.code.toUpperCase(),
      level: form.level || null,
      description: form.description || null,
      totalSessions: Number(form.totalSessions),
      tuitionFee: Number(form.tuitionFee),
    })
    navigateTo('/courses', true)
  }

  return <form className="user-form" onSubmit={submit}>{error?<p className="auth-error">{error}</p>:null}<label className="form-field"><span>Name</span><input className="toolbar-input" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required /></label><label className="form-field"><span>Code</span><input className="toolbar-input" value={form.code} onChange={(e)=>setForm({...form,code:e.target.value.toUpperCase()})} required /></label><label className="form-field"><span>Level</span><input className="toolbar-input" value={form.level} onChange={(e)=>setForm({...form,level:e.target.value})} /></label><label className="form-field"><span>Total sessions</span><input className="toolbar-input" type="number" min={1} value={form.totalSessions} onChange={(e)=>setForm({...form,totalSessions:e.target.value})} required /></label><label className="form-field"><span>Tuition fee</span><input className="toolbar-input" type="number" min={1} value={form.tuitionFee} onChange={(e)=>setForm({...form,tuitionFee:e.target.value})} required /></label><label className="form-field" style={{gridColumn:'1 / -1'}}><span>Description</span><textarea className="toolbar-input" style={{height:'90px',paddingTop:'8px'}} value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} /></label><div className="form-actions"><button className="ms-button ms-button--secondary" type="button" onClick={()=>navigateTo('/courses')}>Cancel</button><button className="ms-button" type="submit">Create</button></div></form>
}
