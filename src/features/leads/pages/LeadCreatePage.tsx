import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Select,
  Textarea,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import { useAuth } from '../../auth/hooks'
import { useAuthRoles } from '../../auth/useAuthRoles'
import { navigateTo } from '../../../lib/navigation'
import { createLeadApi, getBranchesApi, getLeadSourcesApi, getSalesUsersApi } from '../api'
import type { BranchDto, LeadSourceDto, UserLite } from '../types'

const useStyles = makeStyles({
  formCard: { maxWidth: '980px', padding: tokens.spacingHorizontalL },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(220px, 1fr))',
    gap: tokens.spacingHorizontalM,
    '@media (max-width: 760px)': { gridTemplateColumns: '1fr' },
  },
  full: { gridColumn: '1 / -1' },
  actions: { marginTop: tokens.spacingVerticalL, display: 'flex', justifyContent: 'flex-end', gap: tokens.spacingHorizontalS },
})

export function LeadCreatePage() {
  const styles = useStyles()
  const { currentUser } = useAuth()
  const roles = useAuthRoles()
  const isAdmin = roles.includes('Admin')

  const [branches, setBranches] = useState<BranchDto[]>([])
  const [users, setUsers] = useState<UserLite[]>([])
  const [sources, setSources] = useState<LeadSourceDto[]>([])
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    branchId: '', assignedToUserId: '', fullName: '', phone: '', email: '', dateOfBirth: '',
    address: '', sourceId: '', demandNote: '',
  })

  useEffect(() => {
    void (async () => {
      const [b, u, s] = await Promise.all([getBranchesApi(), getSalesUsersApi(), getLeadSourcesApi()])
      setBranches(b); setUsers(u); setSources(s)
      if (currentUser && !isAdmin) {
        setForm((prev) => ({
          ...prev,
          branchId: currentUser.branchId ? String(currentUser.branchId) : '',
          assignedToUserId: String(currentUser.id),
        }))
      }
    })()
  }, [currentUser, isAdmin])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.fullName.trim()) return setError('Full name is required')
    if (!form.phone.trim()) return setError('Phone is required')
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return setError('Invalid email format')
    if (isAdmin && !form.branchId) return setError('Branch is required')

    try {
      await createLeadApi({
        branchId: form.branchId ? Number(form.branchId) : null,
        assignedToUserId: form.assignedToUserId ? Number(form.assignedToUserId) : null,
        fullName: form.fullName,
        phone: form.phone,
        email: form.email || null,
        dateOfBirth: form.dateOfBirth || null,
        address: form.address || null,
        sourceId: form.sourceId ? Number(form.sourceId) : null,
        demandNote: form.demandNote || null,
      })
      navigateTo('/leads', true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create lead failed')
    }
  }

  return (
    <Card className={styles.formCard}>
      <form onSubmit={submit}>
        {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}
        <div className={styles.grid}>
          <Field label="Branch" required>
            <Select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.currentTarget.value })}>
              {!isAdmin ? null : <option value="">Select</option>}
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          </Field>
          <Field label="Assigned Sales">
            <Select value={form.assignedToUserId} onChange={(e) => setForm({ ...form, assignedToUserId: e.currentTarget.value })}>
              <option value="">Select</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
            </Select>
          </Field>
          <Field label="Full Name" required><Input value={form.fullName} onChange={(_, d) => setForm({ ...form, fullName: d.value })} /></Field>
          <Field label="Phone" required><Input value={form.phone} onChange={(_, d) => setForm({ ...form, phone: d.value })} /></Field>
          <Field label="Email"><Input value={form.email} onChange={(_, d) => setForm({ ...form, email: d.value })} /></Field>
          <Field label="Date of Birth"><Input type="date" value={form.dateOfBirth} onChange={(_, d) => setForm({ ...form, dateOfBirth: d.value })} /></Field>
          <Field label="Address"><Input value={form.address} onChange={(_, d) => setForm({ ...form, address: d.value })} /></Field>
          <Field label="Source">
            <Select value={form.sourceId} onChange={(e) => setForm({ ...form, sourceId: e.currentTarget.value })}>
              <option value="">Select</option>
              {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Field>
          <Field className={styles.full} label="Demand Note">
            <Textarea value={form.demandNote} onChange={(_, d) => setForm({ ...form, demandNote: d.value.slice(0, 2000) })} />
          </Field>
        </div>
        <div className={styles.actions}>
          <Button appearance="secondary" type="button" onClick={() => navigateTo('/leads')}>Cancel</Button>
          <Button appearance="primary" type="submit">Create lead</Button>
        </div>
      </form>
    </Card>
  )
}
