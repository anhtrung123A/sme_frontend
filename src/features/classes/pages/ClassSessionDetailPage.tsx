import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Textarea,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import { navigateTo } from '../../../lib/navigation'
import { deleteClassSessionApi, getClassSessionApi, updateClassSessionApi, updateClassSessionStatusApi } from '../api'

const useStyles = makeStyles({
  formCard: {
    maxWidth: '920px',
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
    marginTop: tokens.spacingVerticalL,
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: tokens.spacingHorizontalS,
  },
})

export function ClassSessionDetailPage({ sessionId }: { sessionId: string }) {
  const styles = useStyles()
  const id = Number(sessionId)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ classId: 0, sessionDate: '', startTime: '', endTime: '', roomId: '', teacherUserId: '', topic: '', note: '', status: '' })

  useEffect(() => {
    void (async () => {
      try {
        const s = await getClassSessionApi(id)
        setForm({
          classId: s.classId,
          sessionDate: s.sessionDate,
          startTime: String(s.startTime).slice(0, 8),
          endTime: String(s.endTime).slice(0, 8),
          roomId: s.roomId ? String(s.roomId) : '',
          teacherUserId: s.teacherUserId ? String(s.teacherUserId) : '',
          topic: s.topic ?? '',
          note: s.note ?? '',
          status: s.status,
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load session')
      }
    })()
  }, [id])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateClassSessionApi(id, {
      sessionDate: form.sessionDate,
      startTime: form.startTime,
      endTime: form.endTime,
      roomId: form.roomId ? Number(form.roomId) : null,
      teacherUserId: form.teacherUserId ? Number(form.teacherUserId) : null,
      topic: form.topic || null,
      note: form.note || null,
    })
    navigateTo(`/classes/${form.classId}/sessions`, true)
  }

  return (
    <Card className={styles.formCard}>
      <form onSubmit={save}>
        {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}
        <div className={styles.formGrid}>
          <Field label="Session Date"><Input type="date" value={form.sessionDate} onChange={(_, d) => setForm({ ...form, sessionDate: d.value })} /></Field>
          <Field label="Start Time"><Input value={form.startTime} onChange={(_, d) => setForm({ ...form, startTime: d.value })} /></Field>
          <Field label="End Time"><Input value={form.endTime} onChange={(_, d) => setForm({ ...form, endTime: d.value })} /></Field>
          <Field label="Topic"><Input value={form.topic} onChange={(_, d) => setForm({ ...form, topic: d.value })} /></Field>
          <Field label="Note" className={styles.fullSpan}>
            <Textarea value={form.note} onChange={(_, d) => setForm({ ...form, note: d.value })} resize="vertical" />
          </Field>
        </div>
        <div className={styles.actions}>
          <Button appearance="secondary" type="button" onClick={() => navigateTo(`/classes/${form.classId}/sessions`)}>Cancel</Button>
          <Button appearance="secondary" type="button" onClick={async () => {
            const st = window.prompt('Status', form.status)
            if (st) {
              await updateClassSessionStatusApi(id, st)
              setForm({ ...form, status: st })
            }
          }}>Change status</Button>
          <Button appearance="secondary" type="button" onClick={async () => {
            if (window.confirm('Delete session?')) {
              await deleteClassSessionApi(id)
              navigateTo(`/classes/${form.classId}/sessions`, true)
            }
          }}>Delete</Button>
          <Button appearance="primary" type="submit">Save</Button>
        </div>
      </form>
    </Card>
  )
}
