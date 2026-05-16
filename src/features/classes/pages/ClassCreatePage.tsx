import { useEffect, useMemo, useState } from 'react'
import { navigateTo } from '../../../lib/navigation'
import { createClassApi, getBranchesLiteApi, getCoursesLiteApi, getRoomsLiteApi, getUsersLiteApi } from '../api'
import type { BranchLite, CourseLite, RoomLite, UserLite } from '../types'

export function ClassCreatePage() {
  const [branches, setBranches] = useState<BranchLite[]>([])
  const [courses, setCourses] = useState<CourseLite[]>([])
  const [rooms, setRooms] = useState<RoomLite[]>([])
  const [teachers, setTeachers] = useState<UserLite[]>([])
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({ branchId:'', courseId:'', roomId:'', teacherUserId:'', classCode:'', name:'', maxStudents:'', startDate:'', endDate:'' })

  useEffect(() => {
    void (async () => {
      const [b, c, r, u] = await Promise.all([getBranchesLiteApi(), getCoursesLiteApi(), getRoomsLiteApi(), getUsersLiteApi()])
      setBranches(b); setCourses(c); setRooms(r); setTeachers(u)
    })()
  }, [])

  const filteredRooms = useMemo(() => {
    if (!form.branchId) return rooms
    const branch = Number(form.branchId)
    return rooms.filter((r) => r.branchId === branch)
  }, [rooms, form.branchId])

  const filteredTeachers = useMemo(() => {
    if (!form.branchId) return teachers
    const branch = Number(form.branchId)
    return teachers.filter((u) => u.branchId === branch)
  }, [teachers, form.branchId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.branchId || !form.courseId || !form.classCode.trim() || !form.name.trim()) return setError('Required fields missing')
    if (form.startDate && form.endDate && form.startDate > form.endDate) return setError('Start date must be <= end date')
    if (form.maxStudents && Number(form.maxStudents) <= 0) return setError('Max students must be > 0')

    await createClassApi({
      branchId: Number(form.branchId),
      courseId: Number(form.courseId),
      roomId: form.roomId ? Number(form.roomId) : null,
      teacherUserId: form.teacherUserId ? Number(form.teacherUserId) : null,
      classCode: form.classCode.toUpperCase(),
      name: form.name,
      maxStudents: form.maxStudents ? Number(form.maxStudents) : null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    })

    navigateTo('/classes', true)
  }

  return (
    <form className="user-form" onSubmit={submit}>
      {error ? <p className="auth-error">{error}</p> : null}
      <label className="form-field"><span>Branch</span><select className="toolbar-select" value={form.branchId} onChange={(e)=>setForm({...form,branchId:e.target.value,roomId:'',teacherUserId:''})}><option value="">Select</option>{branches.map((b)=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
      <label className="form-field"><span>Course</span><select className="toolbar-select" value={form.courseId} onChange={(e)=>setForm({...form,courseId:e.target.value})}><option value="">Select</option>{courses.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label className="form-field"><span>Room</span><select className="toolbar-select" value={form.roomId} onChange={(e)=>setForm({...form,roomId:e.target.value})}><option value="">Select</option>{filteredRooms.map((r)=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
      <label className="form-field"><span>Teacher</span><select className="toolbar-select" value={form.teacherUserId} onChange={(e)=>setForm({...form,teacherUserId:e.target.value})}><option value="">Select</option>{filteredTeachers.map((u)=><option key={u.id} value={u.id}>{u.fullName}</option>)}</select></label>
      <label className="form-field"><span>Class code</span><input className="toolbar-input" value={form.classCode} onChange={(e)=>setForm({...form,classCode:e.target.value.toUpperCase()})} required /></label>
      <label className="form-field"><span>Class name</span><input className="toolbar-input" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required /></label>
      <label className="form-field"><span>Max students</span><input className="toolbar-input" type="number" min={1} value={form.maxStudents} onChange={(e)=>setForm({...form,maxStudents:e.target.value})} /></label>
      <label className="form-field"><span>Start date</span><input className="toolbar-input" type="date" value={form.startDate} onChange={(e)=>setForm({...form,startDate:e.target.value})} /></label>
      <label className="form-field"><span>End date</span><input className="toolbar-input" type="date" value={form.endDate} onChange={(e)=>setForm({...form,endDate:e.target.value})} /></label>
      <div className="form-actions"><button className="ms-button ms-button--secondary" type="button" onClick={()=>navigateTo('/classes')}>Cancel</button><button className="ms-button" type="submit">Create class</button></div>
    </form>
  )
}
