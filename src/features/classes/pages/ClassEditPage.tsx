import { useEffect, useMemo, useState } from 'react'
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
import { getBranchesLiteApi, getClassApi, getCoursesLiteApi, getRoomsLiteApi, getUsersLiteApi, updateClassApi } from '../api'
import type { BranchLite, CourseLite, RoomLite, UserLite } from '../types'

const useStyles = makeStyles({
  formCard: {
    maxWidth: '960px',
    padding: tokens.spacingHorizontalL,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))',
    gap: tokens.spacingHorizontalM,
    '@media (max-width: 740px)': {
      gridTemplateColumns: '1fr',
    },
  },
  fullSpan: {
    gridColumn: '1 / -1',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalL,
  },
})

export function ClassEditPage({ classId }: { classId: string }) {
  const styles = useStyles()
  const id = Number(classId)
  const [branches, setBranches] = useState<BranchLite[]>([])
  const [courses, setCourses] = useState<CourseLite[]>([])
  const [rooms, setRooms] = useState<RoomLite[]>([])
  const [teachers, setTeachers] = useState<UserLite[]>([])
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ branchId: '', courseId: '', roomId: '', teacherUserId: '', classCode: '', name: '', maxStudents: '', startDate: '', endDate: '' })

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

  const filteredRooms = useMemo(() => form.branchId ? rooms.filter((r) => r.branchId === Number(form.branchId)) : rooms, [rooms, form.branchId])
  const filteredTeachers = useMemo(() => form.branchId ? teachers.filter((u) => u.branchId === Number(form.branchId)) : teachers, [teachers, form.branchId])

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
    <Card className={styles.formCard}>
      <form onSubmit={submit}>
        {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}
        <div className={styles.formGrid}>
          <Field label="Branch" required>
            <Select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.currentTarget.value })}>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </Field>
          <Field label="Course" required>
            <Select value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.currentTarget.value })}>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Field>
          <Field label="Room">
            <Select value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.currentTarget.value })}>
              <option value="">Select</option>
              {filteredRooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
          </Field>
          <Field label="Teacher">
            <Select value={form.teacherUserId} onChange={(e) => setForm({ ...form, teacherUserId: e.currentTarget.value })}>
              <option value="">Select</option>
              {filteredTeachers.map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
            </Select>
          </Field>
          <Field label="Class code" required>
            <Input value={form.classCode} onChange={(_, d) => setForm({ ...form, classCode: d.value.toUpperCase() })} />
          </Field>
          <Field label="Class name" required>
            <Input value={form.name} onChange={(_, d) => setForm({ ...form, name: d.value })} />
          </Field>
          <Field label="Max students">
            <Input type="number" min={1} value={form.maxStudents} onChange={(_, d) => setForm({ ...form, maxStudents: d.value })} />
          </Field>
          <Field label="Start date">
            <Input type="date" value={form.startDate} onChange={(_, d) => setForm({ ...form, startDate: d.value })} />
          </Field>
          <Field label="End date" className={styles.fullSpan}>
            <Input type="date" value={form.endDate} onChange={(_, d) => setForm({ ...form, endDate: d.value })} />
          </Field>
        </div>
        <div className={styles.actions}>
          <Button appearance="secondary" type="button" onClick={() => navigateTo(`/classes/${id}`)}>Cancel</Button>
          <Button appearance="primary" type="submit">Save</Button>
        </div>
      </form>
    </Card>
  )
}
