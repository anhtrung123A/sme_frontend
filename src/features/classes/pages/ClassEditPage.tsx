import { useEffect, useMemo, useState } from 'react'
import { navigateTo } from '../../../lib/navigation'
import { getBranchesLiteApi, getClassApi, getCoursesLiteApi, getRoomsLiteApi, getUsersLiteApi, updateClassApi } from '../api'
import type { BranchLite, CourseLite, RoomLite, UserLite } from '../types'

export function ClassEditPage({ classId }: { classId: string }) {
  const id = Number(classId)
  const [branches, setBranches] = useState<BranchLite[]>([])
  const [courses, setCourses] = useState<CourseLite[]>([])
  const [rooms, setRooms] = useState<RoomLite[]>([])
  const [teachers, setTeachers] = useState<UserLite[]>([])
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ branchId:'', courseId:'', roomId:'', teacherUserId:'', classCode:'', name:'', maxStudents:'', startDate:'', endDate:'' })

  useEffect(() => {
    void (async () => {
      try {
        const [item, b, c, r, u] = await Promise.all([getClassApi(id), getBranchesLiteApi(), getCoursesLiteApi(), getRoomsLiteApi(), getUsersLiteApi()])
        setBranches(b); setCourses(c); setRooms(r); setTeachers(u)
        setForm({
          branchId: String(item.branchId),
          courseId: String(item.courseId),
          roomId: item.roomId ? String(item.roomId) : '',
          teacherUserId: item.teacherUserId ? String(item.teacherUserId) : '',
          classCode: item.classCode,
          name: item.name,
          maxStudents: item.maxStudents ? String(item.maxStudents) : '',
          startDate: item.startDate ?? '',
          endDate: item.endDate ?? '',
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load class')
      }
    })()
  }, [id])

  const filteredRooms = useMemo(() => form.branchId ? rooms.filter((r)=>r.branchId===Number(form.branchId)) : rooms, [rooms, form.branchId])
  const filteredTeachers = useMemo(() => form.branchId ? teachers.filter((u)=>u.branchId===Number(form.branchId)) : teachers, [teachers, form.branchId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateClassApi(id, {
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
    navigateTo(`/classes/${id}`, true)
  }

  return (
    <form className="user-form" onSubmit={submit}>
      {error ? <p className="auth-error">{error}</p> : null}
      <label className="form-field"><span>Branch</span><select className="toolbar-select" value={form.branchId} onChange={(e)=>setForm({...form,branchId:e.target.value})}>{branches.map((b)=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
      <label className="form-field"><span>Course</span><select className="toolbar-select" value={form.courseId} onChange={(e)=>setForm({...form,courseId:e.target.value})}>{courses.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label className="form-field"><span>Room</span><select className="toolbar-select" value={form.roomId} onChange={(e)=>setForm({...form,roomId:e.target.value})}><option value="">Select</option>{filteredRooms.map((r)=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
      <label className="form-field"><span>Teacher</span><select className="toolbar-select" value={form.teacherUserId} onChange={(e)=>setForm({...form,teacherUserId:e.target.value})}><option value="">Select</option>{filteredTeachers.map((u)=><option key={u.id} value={u.id}>{u.fullName}</option>)}</select></label>
      <label className="form-field"><span>Class code</span><input className="toolbar-input" value={form.classCode} onChange={(e)=>setForm({...form,classCode:e.target.value.toUpperCase()})} required /></label>
      <label className="form-field"><span>Class name</span><input className="toolbar-input" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required /></label>
      <label className="form-field"><span>Max students</span><input className="toolbar-input" type="number" min={1} value={form.maxStudents} onChange={(e)=>setForm({...form,maxStudents:e.target.value})} /></label>
      <label className="form-field"><span>Start date</span><input className="toolbar-input" type="date" value={form.startDate} onChange={(e)=>setForm({...form,startDate:e.target.value})} /></label>
      <label className="form-field"><span>End date</span><input className="toolbar-input" type="date" value={form.endDate} onChange={(e)=>setForm({...form,endDate:e.target.value})} /></label>
      <div className="form-actions"><button className="ms-button ms-button--secondary" type="button" onClick={()=>navigateTo(`/classes/${id}`)}>Cancel</button><button className="ms-button" type="submit">Save</button></div>
    </form>
  )
}
