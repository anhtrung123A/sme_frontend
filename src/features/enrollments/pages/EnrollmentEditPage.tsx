import { useEffect, useState } from 'react'
import { navigateTo } from '../../../lib/navigation'
import { getClassesLiteApi, getCoursesLiteApi, getEnrollmentApi, getStudentsLiteApi, getUsersLiteApi, updateEnrollmentApi } from '../api'

export function EnrollmentEditPage({ enrollmentId }: { enrollmentId: string }) {
  const id = Number(enrollmentId)
  const [studentId, setStudentId] = useState('')
  const [courseId, setCourseId] = useState('')
  const [classId, setClassId] = useState('')
  const [salesUserId, setSalesUserId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [discountAmount, setDiscountAmount] = useState('0')
  const [note, setNote] = useState('')
  const [students, setStudents] = useState<{ id: number; fullName: string; studentCode: string }[]>([])
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([])
  const [classes, setClasses] = useState<{ id: number; classCode: string; name: string }[]>([])
  const [users, setUsers] = useState<{ id: number; fullName: string }[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try {
        const [enr, ss, cs, us] = await Promise.all([getEnrollmentApi(id), getStudentsLiteApi(), getCoursesLiteApi(), getUsersLiteApi()])
        setStudents(ss); setCourses(cs); setUsers(us)
        setStudentId(String(enr.studentId))
        setCourseId(String(enr.courseId))
        setClassId(enr.classId ? String(enr.classId) : '')
        setSalesUserId(enr.salesUserId ? String(enr.salesUserId) : '')
        setStartDate(enr.startDate ?? '')
        setEndDate(enr.endDate ?? '')
        setDiscountAmount(String(enr.discountAmount ?? 0))
        setNote(enr.note ?? '')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load enrollment')
      }
    })()
  }, [id])

  useEffect(() => {
    void (async () => setClasses(await getClassesLiteApi({ courseId: courseId ? Number(courseId) : undefined })))()
  }, [courseId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateEnrollmentApi(id, {
        studentId: Number(studentId),
        courseId: Number(courseId),
        classId: classId ? Number(classId) : null,
        salesUserId: salesUserId ? Number(salesUserId) : null,
        startDate: startDate || null,
        endDate: endDate || null,
        discountAmount: Number(discountAmount || 0),
        note: note || null,
      })
      navigateTo(`/enrollments/${id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update enrollment')
    }
  }

  return (
    <form className="user-form" onSubmit={submit}>
      <label className="form-field"><span>Student</span><select className="toolbar-select" value={studentId} onChange={(e)=>setStudentId(e.target.value)}>{students.map((x)=><option key={x.id} value={x.id}>{x.studentCode} - {x.fullName}</option>)}</select></label>
      <label className="form-field"><span>Course</span><select className="toolbar-select" value={courseId} onChange={(e)=>setCourseId(e.target.value)}>{courses.map((x)=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      <label className="form-field"><span>Class</span><select className="toolbar-select" value={classId} onChange={(e)=>setClassId(e.target.value)}><option value="">Unassigned</option>{classes.map((x)=><option key={x.id} value={x.id}>{x.classCode} - {x.name}</option>)}</select></label>
      <label className="form-field"><span>Sales owner</span><select className="toolbar-select" value={salesUserId} onChange={(e)=>setSalesUserId(e.target.value)}><option value="">Unassigned</option>{users.map((x)=><option key={x.id} value={x.id}>{x.fullName}</option>)}</select></label>
      <label className="form-field"><span>Start date</span><input className="toolbar-input" type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} /></label>
      <label className="form-field"><span>End date</span><input className="toolbar-input" type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} /></label>
      <label className="form-field"><span>Discount amount</span><input className="toolbar-input" type="number" min={0} value={discountAmount} onChange={(e)=>setDiscountAmount(e.target.value)} /></label>
      <label className="form-field"><span>Note</span><input className="toolbar-input" value={note} onChange={(e)=>setNote(e.target.value)} /></label>
      {error ? <p className="auth-error" style={{ gridColumn: '1 / -1' }}>{error}</p> : null}
      <div className="form-actions"><button className="ms-button ms-button--secondary" type="button" onClick={()=>navigateTo(`/enrollments/${id}`)}>Cancel</button><button className="ms-button" type="submit">Save changes</button></div>
    </form>
  )
}
