import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Switch,
  Textarea,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import { navigateTo } from '../../../lib/navigation'
import { getCourseApi, updateCourseApi } from '../api'

const useStyles = makeStyles({
  formCard: { maxWidth: '920px', padding: tokens.spacingHorizontalL },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))',
    gap: tokens.spacingHorizontalM,
    '@media (max-width: 760px)': { gridTemplateColumns: '1fr' },
  },
  full: { gridColumn: '1 / -1' },
  actions: { marginTop: tokens.spacingVerticalL, display: 'flex', justifyContent: 'flex-end', gap: tokens.spacingHorizontalS },
})

export function CourseEditPage({ courseId }: { courseId: string }) {
  const styles = useStyles()
  const id = Number(courseId)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', code: '', level: '', description: '', totalSessions: '', tuitionFee: '', isActive: true })

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

  return (
    <Card className={styles.formCard}>
      <form onSubmit={submit}>
        {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}
        <div className={styles.grid}>
          <Field label="Name" required><Input value={form.name} onChange={(_, d) => setForm({ ...form, name: d.value })} /></Field>
          <Field label="Code" required><Input value={form.code} onChange={(_, d) => setForm({ ...form, code: d.value.toUpperCase() })} /></Field>
          <Field label="Level"><Input value={form.level} onChange={(_, d) => setForm({ ...form, level: d.value })} /></Field>
          <Field label="Total sessions" required><Input type="number" min={1} value={form.totalSessions} onChange={(_, d) => setForm({ ...form, totalSessions: d.value })} /></Field>
          <Field label="Tuition fee" required><Input type="number" min={1} value={form.tuitionFee} onChange={(_, d) => setForm({ ...form, tuitionFee: d.value })} /></Field>
          <Field label="Status"><Switch checked={form.isActive} onChange={(_, d) => setForm({ ...form, isActive: d.checked })} label={form.isActive ? 'Active' : 'Inactive'} /></Field>
          <Field className={styles.full} label="Description"><Textarea value={form.description} onChange={(_, d) => setForm({ ...form, description: d.value })} /></Field>
        </div>
        <div className={styles.actions}>
          <Button appearance="secondary" type="button" onClick={() => navigateTo('/courses')}>Cancel</Button>
          <Button appearance="primary" type="submit">Save</Button>
        </div>
      </form>
    </Card>
  )
}
