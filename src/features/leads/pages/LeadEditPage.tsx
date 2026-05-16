import { useEffect, useState } from 'react'
import { navigateTo } from '../../../lib/navigation'
import { getLeadApi, updateLeadApi, getBranchesApi, getLeadSourcesApi, getSalesUsersApi } from '../api'
import type { BranchDto, LeadSourceDto, UserLite } from '../types'

export function LeadEditPage({ leadId }: { leadId: string }) {
  const id = Number(leadId)
  const [branches, setBranches] = useState<BranchDto[]>([])
  const [users, setUsers] = useState<UserLite[]>([])
  const [sources, setSources] = useState<LeadSourceDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ branchId:'', assignedToUserId:'', fullName:'', phone:'', email:'', dateOfBirth:'', address:'', sourceId:'', demandNote:'', status:'new' })

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
    <form className="user-form" onSubmit={save}>
      {error ? <p className="auth-error">{error}</p> : null}
      <label className="form-field"><span>Branch</span><select className="toolbar-select" value={form.branchId} onChange={(e)=>setForm({...form,branchId:e.target.value})}><option value="">Select</option>{branches.map((b)=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
      <label className="form-field"><span>Assigned Sales</span><select className="toolbar-select" value={form.assignedToUserId} onChange={(e)=>setForm({...form,assignedToUserId:e.target.value})}><option value="">Select</option>{users.map((u)=><option key={u.id} value={u.id}>{u.fullName}</option>)}</select></label>
      <label className="form-field"><span>Full Name</span><input className="toolbar-input" value={form.fullName} onChange={(e)=>setForm({...form,fullName:e.target.value})} required /></label>
      <label className="form-field"><span>Phone</span><input className="toolbar-input" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} required /></label>
      <label className="form-field"><span>Email</span><input className="toolbar-input" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} /></label>
      <label className="form-field"><span>Date of Birth</span><input className="toolbar-input" type="date" value={form.dateOfBirth} onChange={(e)=>setForm({...form,dateOfBirth:e.target.value})} /></label>
      <label className="form-field"><span>Address</span><input className="toolbar-input" value={form.address} onChange={(e)=>setForm({...form,address:e.target.value})} /></label>
      <label className="form-field"><span>Source</span><select className="toolbar-select" value={form.sourceId} onChange={(e)=>setForm({...form,sourceId:e.target.value})}><option value="">Select</option>{sources.map((s)=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      <label className="form-field"><span>Status</span><select className="toolbar-select" value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})}>{['new','contacted','interested','trial_scheduled','lost'].map((s)=><option key={s}>{s}</option>)}</select></label>
      <label className="form-field" style={{gridColumn:'1 / -1'}}><span>Demand Note</span><textarea className="toolbar-input" style={{height:'90px',paddingTop:'8px'}} value={form.demandNote} onChange={(e)=>setForm({...form,demandNote:e.target.value})} /></label>
      <div className="form-actions"><button className="ms-button ms-button--secondary" type="button" onClick={()=>navigateTo(`/leads/${id}`)}>Cancel</button><button className="ms-button" type="submit">Save</button></div>
    </form>
  )
}
