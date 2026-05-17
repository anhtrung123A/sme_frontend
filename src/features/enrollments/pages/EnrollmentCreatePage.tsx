import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Card,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Select,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import { navigateTo, useCurrentPath } from '../../../lib/navigation'
import { createEnrollmentApi, getClassesLiteApi, getCoursesLiteApi, getStudentsLiteApi, getUsersLiteApi } from '../api'
import type { ClassLite, CourseLite, StudentLite, UserLite } from '../types'

const useStyles = makeStyles({
  formCard: { maxWidth: '980px', padding: tokens.spacingHorizontalL },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))',
    gap: tokens.spacingHorizontalM,
    '@media (max-width: 760px)': { gridTemplateColumns: '1fr' },
  },
  full: { gridColumn: '1 / -1' },
  preview: { padding: tokens.spacingHorizontalM, border: `1px solid ${tokens.colorNeutralStroke2}`, borderRadius: tokens.borderRadiusMedium },
  actions: { marginTop: tokens.spacingVerticalL, display: 'flex', justifyContent: 'flex-end', gap: tokens.spacingHorizontalS },
})

export function EnrollmentCreatePage() {
  const styles = useStyles()
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
    <Card className={styles.formCard}>
      <form onSubmit={submit}>
        <div className={styles.grid}>
          <Field label="Student" required><Select value={studentId} onChange={(e) => setStudentId(e.currentTarget.value)}><option value="">Select student</option>{students.map((x) => <option key={x.id} value={x.id}>{x.studentCode} - {x.fullName}</option>)}</Select></Field>
          <Field label="Course" required><Select value={courseId} onChange={(e) => setCourseId(e.currentTarget.value)}><option value="">Select course</option>{courses.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</Select></Field>
          <Field label="Class (optional)"><Select value={classId} onChange={(e) => setClassId(e.currentTarget.value)}><option value="">Unassigned</option>{classes.map((x) => <option key={x.id} value={x.id}>{x.classCode} - {x.name}</option>)}</Select></Field>
          <Field label="Sales owner (optional)"><Select value={salesUserId} onChange={(e) => setSalesUserId(e.currentTarget.value)}><option value="">Select sales</option>{users.map((x) => <option key={x.id} value={x.id}>{x.fullName}</option>)}</Select></Field>
          <Field label="Start date"><Input type="date" value={startDate} onChange={(_, d) => setStartDate(d.value)} /></Field>
          <Field label="End date"><Input type="date" value={endDate} onChange={(_, d) => setEndDate(d.value)} /></Field>
          <Field label="Discount amount"><Input type="number" min={0} value={discountAmount} onChange={(_, d) => setDiscountAmount(d.value)} /></Field>
          <Field label="Note"><Input value={note} onChange={(_, d) => setNote(d.value)} /></Field>
          <div className={styles.full}>
            <div className={styles.preview}>
              <Text weight="semibold">Amount preview</Text>
              <Text block>Tuition Fee: {Number(tuitionFee ?? 0).toLocaleString()}</Text>
              <Text block>Discount: {Number(discountAmount || 0).toLocaleString()}</Text>
              <Text block>Final Amount: {finalAmount.toLocaleString()}</Text>
            </div>
          </div>
        </div>
        {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}
        <div className={styles.actions}><Button appearance="secondary" type="button" onClick={() => navigateTo('/enrollments')}>Cancel</Button><Button appearance="primary" type="submit">Create enrollment</Button></div>
      </form>
    </Card>
  )
}
