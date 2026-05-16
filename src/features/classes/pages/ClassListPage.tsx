import { useEffect, useMemo, useState } from 'react'
import { useAuthRoles } from '../../auth/useAuthRoles'
import { navigateTo } from '../../../lib/navigation'
import { getBranchesLiteApi, getClassesApi, getCoursesLiteApi, getUsersLiteApi } from '../api'
import type { BranchLite, ClassDto, CourseLite, UserLite } from '../types'

export function ClassListPage() {
  const roles = useAuthRoles()
  const canManage = roles.includes('Admin') || roles.includes('Manager')

  const [items, setItems] = useState<ClassDto[]>([])
  const [courses, setCourses] = useState<CourseLite[]>([])
  const [branches, setBranches] = useState<BranchLite[]>([])
  const [teachers, setTeachers] = useState<UserLite[]>([])

  const [courseId, setCourseId] = useState('')
  const [branchId, setBranchId] = useState('')
  const [teacherUserId, setTeacherUserId] = useState('')
  const [status, setStatus] = useState('')

  const kpis = useMemo(() => ({
    total: items.length,
    planned: items.filter((x) => x.status === 'planned').length,
    active: items.filter((x) => x.status === 'active').length,
    todaySessions: 0,
  }), [items])

  const load = async () => {
    const [classes, cs, bs, us] = await Promise.all([
      getClassesApi({
        courseId: courseId ? Number(courseId) : undefined,
        branchId: branchId ? Number(branchId) : undefined,
        teacherUserId: teacherUserId ? Number(teacherUserId) : undefined,
        status: status || undefined,
      }),
      getCoursesLiteApi(), getBranchesLiteApi(), getUsersLiteApi(),
    ])
    setItems(classes.items)
    setCourses(cs)
    setBranches(bs)
    setTeachers(us)
  }

  useEffect(() => { void load() }, [])

  return (
    <>
      <div className="kpi-grid">
        <div className="kpi-card"><span>Total classes</span><strong>{kpis.total}</strong></div>
        <div className="kpi-card"><span>Planned classes</span><strong>{kpis.planned}</strong></div>
        <div className="kpi-card"><span>Active classes</span><strong>{kpis.active}</strong></div>
        <div className="kpi-card"><span>Today sessions</span><strong>{kpis.todaySessions}</strong></div>
      </div>

      <div className="users-toolbar">
        <div className="users-filters">
          <select className="toolbar-select" value={courseId} onChange={(e)=>setCourseId(e.target.value)}><option value="">All courses</option>{courses.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <select className="toolbar-select" value={status} onChange={(e)=>setStatus(e.target.value)}><option value="">All status</option>{['planned','active','completed','cancelled'].map((s)=><option key={s}>{s}</option>)}</select>
          <select className="toolbar-select" value={teacherUserId} onChange={(e)=>setTeacherUserId(e.target.value)}><option value="">All teachers</option>{teachers.map((u)=><option key={u.id} value={u.id}>{u.fullName}</option>)}</select>
          <select className="toolbar-select" value={branchId} onChange={(e)=>setBranchId(e.target.value)}><option value="">All branches</option>{branches.map((b)=><option key={b.id} value={b.id}>{b.name}</option>)}</select>
          <button className="ms-button ms-button--secondary" onClick={()=>void load()}>Apply</button>
        </div>
        {canManage ? <button className="ms-button" onClick={()=>navigateTo('/classes/create')}>Create class</button> : null}
      </div>

      <table className="ms-table"><thead><tr><th>Class code</th><th>Class name</th><th>Course</th><th>Teacher</th><th>Room</th><th>Status</th><th>Start date</th><th>End date</th><th>Actions</th></tr></thead><tbody>{items.map((c)=><tr key={c.id}><td>{c.classCode}</td><td>{c.name}</td><td>{c.courseName??'-'}</td><td>{c.teacherUserName??'-'}</td><td>{c.roomName??'-'}</td><td>{c.status}</td><td>{c.startDate??'-'}</td><td>{c.endDate??'-'}</td><td><div className="table-actions"><button className="table-action-btn" onClick={()=>navigateTo(`/classes/${c.id}`)}>View</button>{canManage ? <button className="table-action-btn" onClick={()=>navigateTo(`/classes/${c.id}/edit`)}>Edit</button> : null}<button className="table-action-btn" onClick={()=>navigateTo(`/classes/${c.id}/sessions`)}>Sessions</button></div></td></tr>)}</tbody></table>
    </>
  )
}
