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
import { getBranchesApi, getStudentApi, updateStudentApi } from '../api'
import type { BranchDto } from '../types'

const useStyles = makeStyles({
  formCard: { maxWidth: '960px', padding: tokens.spacingHorizontalL },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))',
    gap: tokens.spacingHorizontalM,
    '@media (max-width: 760px)': { gridTemplateColumns: '1fr' },
  },
  full: { gridColumn: '1 / -1' },
  actions: { marginTop: tokens.spacingVerticalL, display: 'flex', justifyContent: 'flex-end', gap: tokens.spacingHorizontalS },
})

export function StudentEditPage({ studentId }: { studentId: string }) {
  const styles = useStyles()
  const id = Number(studentId)
  const [branches, setBranches] = useState<BranchDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ branchId: '', fullName: '', email: '', phone: '', dateOfBirth: '', gender: '', address: '' })

  useEffect(() => {
    void (async () => {
      try {
        const [s, b] = await Promise.all([getStudentApi(id), getBranchesApi()])
        setBranches(b)
        setForm({
          branchId: s.branchId ? String(s.branchId) : '', fullName: s.fullName, email: s.email ?? '', phone: s.phone ?? '',
          dateOfBirth: s.dateOfBirth ?? '', gender: s.gender ?? '', address: s.address ?? '',
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load student')
      }
    })()
  }, [id])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateStudentApi(id, {
      branchId: form.branchId ? Number(form.branchId) : null,
      fullName: form.fullName,
      email: form.email || null,
      phone: form.phone || null,
      dateOfBirth: form.dateOfBirth || null,
      gender: form.gender || null,
      address: form.address || null,
    })
    navigateTo(`/students/${id}`, true)
  }

  return (
    <Card className={styles.formCard}>
      <form onSubmit={save}>
        {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}
        <div className={styles.grid}>
          <Field label="Branch"><Select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.currentTarget.value })}><option value="">Select</option>{branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</Select></Field>
          <Field label="Full name" required><Input value={form.fullName} onChange={(_, d) => setForm({ ...form, fullName: d.value })} /></Field>
          <Field label="Email"><Input value={form.email} onChange={(_, d) => setForm({ ...form, email: d.value })} /></Field>
          <Field label="Phone" required><Input value={form.phone} onChange={(_, d) => setForm({ ...form, phone: d.value })} /></Field>
          <Field label="Date of birth"><Input type="date" value={form.dateOfBirth} onChange={(_, d) => setForm({ ...form, dateOfBirth: d.value })} /></Field>
          <Field label="Gender"><Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.currentTarget.value })}><option value="">Select</option><option value="male">male</option><option value="female">female</option><option value="other">other</option></Select></Field>
          <Field className={styles.full} label="Address"><Input value={form.address} onChange={(_, d) => setForm({ ...form, address: d.value })} /></Field>
        </div>
        <div className={styles.actions}>
          <Button appearance="secondary" type="button" onClick={() => navigateTo(`/students/${id}`)}>Cancel</Button>
          <Button appearance="primary" type="submit">Save</Button>
        </div>
      </form>
    </Card>
  )
}
