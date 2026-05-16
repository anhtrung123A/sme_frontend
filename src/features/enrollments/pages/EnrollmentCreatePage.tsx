import { useEffect, useMemo, useState } from 'react'
import { navigateTo, useCurrentPath } from '../../../lib/navigation'
import { createEnrollmentApi, getClassesLiteApi, getCoursesLiteApi, getStudentsLiteApi, getUsersLiteApi } from '../api'
import type { ClassLite, CourseLite, StudentLite, UserLite } from '../types'

export function EnrollmentCreatePage() {
  const path = useCurrentPath()
  const preselectedStudentId = useMemo(() => {
    const idx = path.indexOf('?')
    if (idx < 0) return ''
    const query = new URLSearchParams(path.slice(idx + 1))
    return query.get('studentId') ?? ''
  }, [path])

  const [students, setStudents] = useState<StudentLite[]>([])
  const [courses, setCourses] = useState<CourseLite[]>([])
  const [classes, setClasses] = useState<ClassLite[]>([])
  const [users, setUsers] = useState<UserLite[]>([])

  const [studentId, setStudentId] = useState(preselectedStudentId)
  const [courseId, setCourseId] = useState('')
  const [classId, setClassId] = useState('')
  const [salesUserId, setSalesUserId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [discountAmount, setDiscountAmount] = useState('0')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  const tuitionFee = useMemo(() => courses.find((x) => String(x.id) === courseId)?.tuitionFee ?? 0, [courses, courseId])
  const finalAmount = useMemo(() => Math.max(0, Number(tuitionFee ?? 0) - Number(discountAmount || 0)), [tuitionFee, discountAmount])

  useEffect(() => {
    void (async () => {
      const [ss, cs, us] = await Promise.all([getStudentsLiteApi(), getCoursesLiteApi(), getUsersLiteApi()])
      setStudents(ss); setCourses(cs); setUsers(us)
    })()
  }, [])

  useEffect(() => {
    void (async () => {
      setClasses(await getClassesLiteApi({ courseId: courseId ? Number(courseId) : undefined }))
    })()
  }, [courseId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!studentId || !courseId) { setError('Student and course are required'); return }
    try {
      const created = await createEnrollmentApi({
        studentId: Number(studentId),
        courseId: Number(courseId),
        classId: classId ? Number(classId) : null,
        salesUserId: salesUserId ? Number(salesUserId) : null,
        startDate: startDate || null,
        endDate: endDate || null,
        discountAmount: Number(discountAmount || 0),
        note: note || null,
      })
      navigateTo(`/enrollments/${created.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create enrollment')
    }
  }

  return (
    <form className="user-form" onSubmit={submit}>
      <label className="form-field"><span>Student</span><select className="toolbar-select" value={studentId} onChange={(e)=>setStudentId(e.target.value)}><option value="">Select student</option>{students.map((x)=><option key={x.id} value={x.id}>{x.studentCode} - {x.fullName}</option>)}</select></label>
      <label className="form-field"><span>Course</span><select className="toolbar-select" value={courseId} onChange={(e)=>setCourseId(e.target.value)}><option value="">Select course</option>{courses.map((x)=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      <label className="form-field"><span>Class (optional)</span><select className="toolbar-select" value={classId} onChange={(e)=>setClassId(e.target.value)}><option value="">Unassigned</option>{classes.map((x)=><option key={x.id} value={x.id}>{x.classCode} - {x.name}</option>)}</select></label>
      <label className="form-field"><span>Sales owner (optional)</span><select className="toolbar-select" value={salesUserId} onChange={(e)=>setSalesUserId(e.target.value)}><option value="">Select sales</option>{users.map((x)=><option key={x.id} value={x.id}>{x.fullName}</option>)}</select></label>
      <label className="form-field"><span>Start date</span><input className="toolbar-input" type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} /></label>
      <label className="form-field"><span>End date</span><input className="toolbar-input" type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} /></label>
      <label className="form-field"><span>Discount amount</span><input className="toolbar-input" type="number" min={0} value={discountAmount} onChange={(e)=>setDiscountAmount(e.target.value)} /></label>
      <label className="form-field"><span>Note</span><input className="toolbar-input" value={note} onChange={(e)=>setNote(e.target.value)} /></label>
      <div className="form-fieldset">
        <strong>Amount preview</strong>
        <div style={{ marginTop: 8 }}>Tuition Fee: {Number(tuitionFee ?? 0).toLocaleString()}</div>
        <div>Discount: {Number(discountAmount || 0).toLocaleString()}</div>
        <div>Final Amount: {finalAmount.toLocaleString()}</div>
      </div>
      {error ? <p className="auth-error" style={{ gridColumn: '1 / -1' }}>{error}</p> : null}
      <div className="form-actions"><button className="ms-button ms-button--secondary" type="button" onClick={()=>navigateTo('/enrollments')}>Cancel</button><button className="ms-button" type="submit">Create enrollment</button></div>
    </form>
  )
}
