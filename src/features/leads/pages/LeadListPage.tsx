import { useEffect, useMemo, useState } from 'react'
import { navigateTo } from '../../../lib/navigation'
import { useAuthRoles } from '../../auth/useAuthRoles'
import {
  assignLeadApi,
  changeLeadStatusApi,
  deleteLeadApi,
  getBranchesApi,
  getLeadsApi,
  getLeadSourcesApi,
  getSalesUsersApi,
} from '../api'
import type { BranchDto, LeadDto, LeadSourceDto, UserLite } from '../types'

const statuses = ['new', 'contacted', 'interested', 'trial_scheduled', 'lost']

export function LeadListPage() {
  const roles = useAuthRoles()
  const isAdmin = roles.includes('Admin')
  const isManager = roles.includes('Manager')
  const canAssign = isAdmin || isManager
  const canDelete = isAdmin

  const [leads, setLeads] = useState<LeadDto[]>([])
  const [sources, setSources] = useState<LeadSourceDto[]>([])
  const [branches, setBranches] = useState<BranchDto[]>([])
  const [users, setUsers] = useState<UserLite[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [sourceId, setSourceId] = useState('')
  const [assignedId, setAssignedId] = useState('')
  const [branchId, setBranchId] = useState('')

  const kpis = useMemo(() => {
    const map = { new: 0, contacted: 0, interested: 0, trial_scheduled: 0, lost: 0 }
    for (const l of leads) {
      const key = l.status as keyof typeof map
      if (key in map) map[key] += 1
    }
    return map
  }, [leads])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [leadPage, srcs, brs, us] = await Promise.all([
        getLeadsApi({
          keyword: keyword || undefined,
          status: status || undefined,
          sourceId: sourceId ? Number(sourceId) : undefined,
          assignedToUserId: assignedId ? Number(assignedId) : undefined,
          branchId: branchId ? Number(branchId) : undefined,
        }),
        getLeadSourcesApi(),
        getBranchesApi(),
        getSalesUsersApi(),
      ])
      setLeads(leadPage.items)
      setSources(srcs)
      setBranches(brs)
      setUsers(us)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load leads')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const handleAssign = async (lead: LeadDto) => {
    if (!canAssign) return
    const value = window.prompt('Assign to user id:', lead.assignedToUserId ? String(lead.assignedToUserId) : '')
    if (!value) return
    await assignLeadApi(lead.id, Number(value))
    await load()
  }

  const handleChangeStatus = async (lead: LeadDto) => {
    const value = window.prompt('New status (new/contacted/interested/trial_scheduled/lost):', lead.status)
    if (!value) return
    await changeLeadStatusApi(lead.id, value)
    await load()
  }

  const handleDelete = async (lead: LeadDto) => {
    if (!canDelete) return
    if (!window.confirm(`Delete lead "${lead.fullName}"?`)) return
    await deleteLeadApi(lead.id)
    await load()
  }

  return (
    <>
      <div className="kpi-grid">
        <div className="kpi-card"><span>New</span><strong>{kpis.new}</strong></div>
        <div className="kpi-card"><span>Contacted</span><strong>{kpis.contacted}</strong></div>
        <div className="kpi-card"><span>Interested</span><strong>{kpis.interested}</strong></div>
        <div className="kpi-card"><span>Trial Scheduled</span><strong>{kpis.trial_scheduled}</strong></div>
        <div className="kpi-card"><span>Lost</span><strong>{kpis.lost}</strong></div>
      </div>

      <div className="users-toolbar">
        <div className="users-filters">
          <input className="toolbar-input" placeholder="Keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          <select className="toolbar-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All status</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="toolbar-select" value={sourceId} onChange={(e) => setSourceId(e.target.value)}>
            <option value="">All sources</option>
            {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="toolbar-select" value={assignedId} onChange={(e) => setAssignedId(e.target.value)}>
            <option value="">All assigned users</option>
            {users.map((u) => <option key={u.id} value={u.id}>{u.fullName}</option>)}
          </select>
          <select className="toolbar-select" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
            <option value="">All branches</option>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <button className="ms-button ms-button--secondary" onClick={() => void load()} type="button">Apply</button>
        </div>
        <button className="ms-button" type="button" onClick={() => navigateTo('/leads/create')}>Create lead</button>
      </div>

      {error ? <p className="auth-error">{error}</p> : null}
      {loading ? <p>Loading leads...</p> : null}

      <table className="ms-table">
        <thead><tr><th>Lead name</th><th>Phone</th><th>Source</th><th>Status</th><th>Assigned to</th><th>Next follow-up</th><th>Actions</th></tr></thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>{lead.fullName}</td><td>{lead.phone}</td><td>{lead.sourceName ?? '-'}</td>
              <td><span className="status-badge status-active">{lead.status}</span></td>
              <td>{lead.assignedToUserName ?? '-'}</td><td>-</td>
              <td>
                <div className="table-actions">
                  <button className="table-action-btn" onClick={() => navigateTo(`/leads/${lead.id}`)}>View detail</button>
                  <button className="table-action-btn" onClick={() => navigateTo(`/leads/${lead.id}/edit`)}>Edit</button>
                  {canAssign ? <button className="table-action-btn" onClick={() => void handleAssign(lead)}>Assign</button> : null}
                  <button className="table-action-btn" onClick={() => void handleChangeStatus(lead)}>Change status</button>
                  {canDelete ? <button className="table-action-btn" onClick={() => void handleDelete(lead)}>Delete</button> : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
