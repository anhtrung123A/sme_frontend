import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Select,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import { navigateTo } from '../../../lib/navigation'
import { getClassesLiteApi, getCoursesLiteApi, getEnrollmentApi, getStudentsLiteApi, getUsersLiteApi, updateEnrollmentApi } from '../api'

const useStyles = makeStyles({
  formCard: { maxWidth: '980px', padding: tokens.spacingHorizontalL },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))',
    gap: tokens.spacingHorizontalM,
    '@media (max-width: 760px)': { gridTemplateColumns: '1fr' },
  },
  actions: { marginTop: tokens.spacingVerticalL, display: 'flex', justifyContent: 'flex-end', gap: tokens.spacingHorizontalS },
})

export function EnrollmentEditPage({ enrollmentId }: { enrollmentId: string }) {
  const styles = useStyles()
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
    <Card className={styles.formCard}>
      <form onSubmit={submit}>
        <div className={styles.grid}>
          <Field label="Student"><Select value={studentId} onChange={(e) => setStudentId(e.currentTarget.value)}>{students.map((x) => <option key={x.id} value={x.id}>{x.studentCode} - {x.fullName}</option>)}</Select></Field>
          <Field label="Course"><Select value={courseId} onChange={(e) => setCourseId(e.currentTarget.value)}>{courses.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</Select></Field>
          <Field label="Class"><Select value={classId} onChange={(e) => setClassId(e.currentTarget.value)}><option value="">Unassigned</option>{classes.map((x) => <option key={x.id} value={x.id}>{x.classCode} - {x.name}</option>)}</Select></Field>
          <Field label="Sales owner"><Select value={salesUserId} onChange={(e) => setSalesUserId(e.currentTarget.value)}><option value="">Unassigned</option>{users.map((x) => <option key={x.id} value={x.id}>{x.fullName}</option>)}</Select></Field>
          <Field label="Start date"><Input type="date" value={startDate} onChange={(_, d) => setStartDate(d.value)} /></Field>
          <Field label="End date"><Input type="date" value={endDate} onChange={(_, d) => setEndDate(d.value)} /></Field>
          <Field label="Discount amount"><Input type="number" min={0} value={discountAmount} onChange={(_, d) => setDiscountAmount(d.value)} /></Field>
          <Field label="Note"><Input value={note} onChange={(_, d) => setNote(d.value)} /></Field>
        </div>
        {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}
        <div className={styles.actions}><Button appearance="secondary" type="button" onClick={() => navigateTo(`/enrollments/${id}`)}>Cancel</Button><Button appearance="primary" type="submit">Save changes</Button></div>
      </form>
    </Card>
  )
}
