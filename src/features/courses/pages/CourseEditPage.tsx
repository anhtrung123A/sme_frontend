import { useEffect, useState } from 'react'
import { navigateTo } from '../../../lib/navigation'
import { getCourseApi, updateCourseApi } from '../api'

export function CourseEditPage({ courseId }: { courseId: string }) {
  const id = Number(courseId)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name:'', code:'', level:'', description:'', totalSessions:'', tuitionFee:'', isActive:true })

  useEffect(() => {
    void (async () => {
      try {
        const c = await getCourseApi(id)
        setForm({
          name: c.name,
          code: c.code,
          level: c.level ?? '',
          description: c.description ?? '',
          totalSessions: String(c.totalSessions ?? ''),
          tuitionFee: String(c.tuitionFee),
          isActive: c.isActive,
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load course')
      }
    })()
  }, [id])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateCourseApi(id, {
      name: form.name,
      code: form.code.toUpperCase(),
      level: form.level || null,
      description: form.description || null,
      totalSessions: Number(form.totalSessions),
      tuitionFee: Number(form.tuitionFee),
      isActive: form.isActive,
    })
    navigateTo('/courses', true)
  }

  return <form className="user-form" onSubmit={submit}>{error?<p className="auth-error">{error}</p>:null}<label className="form-field"><span>Name</span><input className="toolbar-input" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required /></label><label className="form-field"><span>Code</span><input className="toolbar-input" value={form.code} onChange={(e)=>setForm({...form,code:e.target.value.toUpperCase()})} required /></label><label className="form-field"><span>Level</span><input className="toolbar-input" value={form.level} onChange={(e)=>setForm({...form,level:e.target.value})} /></label><label className="form-field"><span>Total sessions</span><input className="toolbar-input" type="number" min={1} value={form.totalSessions} onChange={(e)=>setForm({...form,totalSessions:e.target.value})} required /></label><label className="form-field"><span>Tuition fee</span><input className="toolbar-input" type="number" min={1} value={form.tuitionFee} onChange={(e)=>setForm({...form,tuitionFee:e.target.value})} required /></label><label className="switch-field"><input type="checkbox" checked={form.isActive} onChange={(e)=>setForm({...form,isActive:e.target.checked})} /><span>Active</span></label><label className="form-field" style={{gridColumn:'1 / -1'}}><span>Description</span><textarea className="toolbar-input" style={{height:'90px',paddingTop:'8px'}} value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} /></label><div className="form-actions"><button className="ms-button ms-button--secondary" type="button" onClick={()=>navigateTo('/courses')}>Cancel</button><button className="ms-button" type="submit">Save</button></div></form>
}
