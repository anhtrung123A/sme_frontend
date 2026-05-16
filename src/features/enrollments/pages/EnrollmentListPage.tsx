import { useEffect, useMemo, useState } from 'react'
import { navigateTo } from '../../../lib/navigation'
import { useAuthRoles } from '../../auth/useAuthRoles'
import { deleteEnrollmentApi, getBranchesLiteApi, getClassesLiteApi, getCoursesLiteApi, getEnrollmentsApi, getUsersLiteApi } from '../api'
import { EnrollmentStatusBadge } from '../components/EnrollmentStatusBadge'
import type { BranchLite, ClassLite, CourseLite, EnrollmentDto, UserLite } from '../types'

export function EnrollmentListPage() {
  const roles = useAuthRoles()
  const [items, setItems] = useState<EnrollmentDto[]>([])
  const [courses, setCourses] = useState<CourseLite[]>([])
  const [classes, setClasses] = useState<ClassLite[]>([])
  const [users, setUsers] = useState<UserLite[]>([])
  const [branches, setBranches] = useState<BranchLite[]>([])

  const [courseId, setCourseId] = useState('')
  const [classId, setClassId] = useState('')
  const [salesUserId, setSalesUserId] = useState('')
  const [branchId, setBranchId] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState<string | null>(null)

  const kpi = useMemo(() => ({
    pending: items.filter((x)=>x.status==='pending').length,
    waiting: items.filter((x)=>x.status==='waiting_payment').length,
    active: items.filter((x)=>x.status==='active').length,
    completed: items.filter((x)=>x.status==='completed').length,
  }), [items])

  const load = async () => {
    try {
      const [data, cs, cls, us, bs] = await Promise.all([
        getEnrollmentsApi({ courseId: courseId ? Number(courseId) : undefined, classId: classId ? Number(classId) : undefined, salesUserId: salesUserId ? Number(salesUserId) : undefined, branchId: branchId ? Number(branchId) : undefined, status: status || undefined }),
        getCoursesLiteApi(),
        getClassesLiteApi({ courseId: courseId ? Number(courseId) : undefined }),
        getUsersLiteApi(),
        getBranchesLiteApi(),
      ])
      setItems(Array.isArray(data.items) ? data.items : [])
      setCourses(cs); setClasses(cls); setUsers(us); setBranches(bs)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load enrollments')
    }
  }

  useEffect(() => { void load() }, [])

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <div className="kpi-card"><span>Pending</span><strong>{kpi.pending}</strong></div>
        <div className="kpi-card"><span>Waiting Payment</span><strong>{kpi.waiting}</strong></div>
        <div className="kpi-card"><span>Active</span><strong>{kpi.active}</strong></div>
        <div className="kpi-card"><span>Completed</span><strong>{kpi.completed}</strong></div>
      </div>
      <div className="users-toolbar">
        <div className="users-filters">
          <select className="toolbar-select" value={courseId} onChange={(e)=>setCourseId(e.target.value)}><option value="">All courses</option>{courses.map((x)=><option key={x.id} value={x.id}>{x.name}</option>)}</select>
          <select className="toolbar-select" value={classId} onChange={(e)=>setClassId(e.target.value)}><option value="">All classes</option>{classes.map((x)=><option key={x.id} value={x.id}>{x.classCode} - {x.name}</option>)}</select>
          <select className="toolbar-select" value={status} onChange={(e)=>setStatus(e.target.value)}><option value="">All status</option>{['pending','waiting_payment','active','completed','cancelled','suspended','transferred','refunded','dropped'].map((x)=><option key={x} value={x}>{x}</option>)}</select>
          <select className="toolbar-select" value={salesUserId} onChange={(e)=>setSalesUserId(e.target.value)}><option value="">All sales</option>{users.map((x)=><option key={x.id} value={x.id}>{x.fullName}</option>)}</select>
          <select className="toolbar-select" value={branchId} onChange={(e)=>setBranchId(e.target.value)}><option value="">All branches</option>{branches.map((x)=><option key={x.id} value={x.id}>{x.name}</option>)}</select>
          <button className="ms-button ms-button--secondary" onClick={()=>void load()}>Apply</button>
        </div>
        <button className="ms-button" onClick={()=>navigateTo('/enrollments/create')}>Create Enrollment</button>
      </div>
      {error ? <p className="auth-error">{error}</p> : null}
      <table className="ms-table">
        <thead><tr><th>Student</th><th>Course</th><th>Class</th><th>Sales</th><th>Final Amount</th><th>Status</th><th>Enrolled At</th><th>Actions</th></tr></thead>
        <tbody>{items.map((x)=><tr key={x.id}><td>{x.studentName}</td><td>{x.courseName}</td><td>{x.className ?? '-'}</td><td>{x.salesUserName ?? '-'}</td><td>{x.finalAmount.toLocaleString()}</td><td><EnrollmentStatusBadge status={x.status} /></td><td>{x.enrolledAt ? new Date(x.enrolledAt).toLocaleString() : '-'}</td><td><div className="table-actions"><button className="table-action-btn" onClick={()=>navigateTo(`/enrollments/${x.id}`)}>View</button><button className="table-action-btn" onClick={()=>navigateTo(`/enrollments/${x.id}/edit`)}>Edit</button>{roles.includes('Admin') ? <button className="table-action-btn" onClick={async()=>{if(window.confirm('Delete enrollment?')){await deleteEnrollmentApi(x.id); await load()}}}>Delete</button> : null}</div></td></tr>)}</tbody>
      </table>
    </>
  )
}
