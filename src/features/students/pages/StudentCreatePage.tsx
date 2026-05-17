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
import { useAuth } from '../../auth/hooks'
import { useAuthRoles } from '../../auth/useAuthRoles'
import { navigateTo } from '../../../lib/navigation'
import { createStudentApi, getBranchesApi } from '../api'
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

export function StudentCreatePage() {
  const styles = useStyles()
  const roles = useAuthRoles()
  const { currentUser } = useAuth()
  const isAdmin = roles.includes('Admin')

  const [branches, setBranches] = useState<BranchDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ branchId: '', fullName: '', email: '', phone: '', dateOfBirth: '', gender: 'male', address: '' })

  useEffect(() => {
    void (async () => {
      const data = await getBranchesApi()
      setBranches(data)
      if (!isAdmin && currentUser?.branchId) setForm((prev) => ({ ...prev, branchId: String(currentUser.branchId) }))
    })()
  }, [isAdmin, currentUser])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.fullName.trim()) return setError('Full name required')
    if (!form.phone.trim()) return setError('Phone required')
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return setError('Invalid email')
    if (form.dateOfBirth && new Date(form.dateOfBirth) > new Date()) return setError('Date of birth cannot be in the future')
    if (isAdmin && !form.branchId) return setError('Branch required')

    await createStudentApi({
      branchId: form.branchId ? Number(form.branchId) : null,
      fullName: form.fullName,
      email: form.email || null,
      phone: form.phone || null,
      dateOfBirth: form.dateOfBirth || null,
      gender: form.gender || null,
      address: form.address || null,
    })

    navigateTo('/students', true)
  }

  return (
    <Card className={styles.formCard}>
      <form onSubmit={submit}>
        {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}
        <div className={styles.grid}>
          <Field label="Branch" required>
            <Select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.currentTarget.value })}>
              {isAdmin ? <option value="">Select</option> : null}
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </Field>
          <Field label="Full name" required><Input value={form.fullName} onChange={(_, d) => setForm({ ...form, fullName: d.value })} /></Field>
          <Field label="Email"><Input value={form.email} onChange={(_, d) => setForm({ ...form, email: d.value })} /></Field>
          <Field label="Phone" required><Input value={form.phone} onChange={(_, d) => setForm({ ...form, phone: d.value })} /></Field>
          <Field label="Date of birth"><Input type="date" value={form.dateOfBirth} onChange={(_, d) => setForm({ ...form, dateOfBirth: d.value })} /></Field>
          <Field label="Gender">
            <Select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.currentTarget.value })}>
              <option value="male">male</option><option value="female">female</option><option value="other">other</option>
            </Select>
          </Field>
          <Field className={styles.full} label="Address"><Input value={form.address} onChange={(_, d) => setForm({ ...form, address: d.value })} /></Field>
        </div>
        <div className={styles.actions}>
          <Button appearance="secondary" type="button" onClick={() => navigateTo('/students')}>Cancel</Button>
          <Button appearance="primary" type="submit">Create student</Button>
        </div>
      </form>
    </Card>
  )
}
