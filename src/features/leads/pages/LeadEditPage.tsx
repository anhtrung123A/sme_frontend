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
import { navigateTo } from '../../../lib/navigation'
import { formatStatusLabel } from '../../../lib/formatStatus'
import { getLeadApi, updateLeadApi, getBranchesApi, getLeadSourcesApi, getSalesUsersApi } from '../api'
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

export function LeadEditPage({ leadId }: { leadId: string }) {
  const styles = useStyles()
  const id = Number(leadId)
  const [branches, setBranches] = useState<BranchDto[]>([])
  const [users, setUsers] = useState<UserLite[]>([])
  const [sources, setSources] = useState<LeadSourceDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ branchId: '', assignedToUserId: '', fullName: '', phone: '', email: '', dateOfBirth: '', address: '', sourceId: '', demandNote: '', status: 'new' })

  useEffect(() => {
    void (async () => {
      try {
        const [lead, b, u, s] = await Promise.all([getLeadApi(id), getBranchesApi(), getSalesUsersApi(), getLeadSourcesApi()])
        setBranches(b); setUsers(u); setSources(s)
        setForm({
          branchId: lead.branchId ? String(lead.branchId) : '',
          assignedToUserId: lead.assignedToUserId ? String(lead.assignedToUserId) : '',
          fullName: lead.fullName,
          phone: lead.phone,
          email: lead.email ?? '',
          dateOfBirth: lead.dateOfBirth ?? '',
          address: lead.address ?? '',
          sourceId: lead.sourceId ? String(lead.sourceId) : '',
          demandNote: lead.demandNote ?? '',
          status: lead.status,
        })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load lead')
      }
    })()
  }, [id])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await updateLeadApi(id, {
        branchId: form.branchId ? Number(form.branchId) : null,
        assignedToUserId: form.assignedToUserId ? Number(form.assignedToUserId) : null,
        fullName: form.fullName,
        phone: form.phone,
        email: form.email || null,
        dateOfBirth: form.dateOfBirth || null,
        address: form.address || null,
        sourceId: form.sourceId ? Number(form.sourceId) : null,
        demandNote: form.demandNote || null,
        status: form.status,
      })
      navigateTo(`/leads/${id}`, true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save lead')
    }
  }

  return (
    <Card className={styles.formCard}>
      <form onSubmit={save}>
        {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}
        <div className={styles.grid}>
          <Field label="Branch"><Select value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.currentTarget.value })}><option value="">Select</option>{branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</Select></Field>
          <Field label="Assigned Sales"><Select value={form.assignedToUserId} onChange={(e) => setForm({ ...form, assignedToUserId: e.currentTarget.value })}><option value="">Select</option>{users.map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}</Select></Field>
          <Field label="Full Name" required><Input value={form.fullName} onChange={(_, d) => setForm({ ...form, fullName: d.value })} /></Field>
          <Field label="Phone" required><Input value={form.phone} onChange={(_, d) => setForm({ ...form, phone: d.value })} /></Field>
          <Field label="Email"><Input value={form.email} onChange={(_, d) => setForm({ ...form, email: d.value })} /></Field>
          <Field label="Date of Birth"><Input type="date" value={form.dateOfBirth} onChange={(_, d) => setForm({ ...form, dateOfBirth: d.value })} /></Field>
          <Field label="Address"><Input value={form.address} onChange={(_, d) => setForm({ ...form, address: d.value })} /></Field>
          <Field label="Source"><Select value={form.sourceId} onChange={(e) => setForm({ ...form, sourceId: e.currentTarget.value })}><option value="">Select</option>{sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
          <Field label="Status"><Select value={form.status} onChange={(e) => setForm({ ...form, status: e.currentTarget.value })}>{['new', 'contacted', 'interested', 'trial_scheduled', 'lost'].map((s) => <option key={s}>{formatStatusLabel(s)}</option>)}</Select></Field>
          <Field className={styles.full} label="Demand Note"><Textarea value={form.demandNote} onChange={(_, d) => setForm({ ...form, demandNote: d.value })} /></Field>
        </div>
        <div className={styles.actions}>
          <Button appearance="secondary" type="button" onClick={() => navigateTo(`/leads/${id}`)}>Cancel</Button>
          <Button appearance="primary" type="submit">Save</Button>
        </div>
      </form>
    </Card>
  )
}
