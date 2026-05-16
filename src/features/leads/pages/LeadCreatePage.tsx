import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/hooks'
import { useAuthRoles } from '../../auth/useAuthRoles'
import { navigateTo } from '../../../lib/navigation'
import { createLeadApi, getBranchesApi, getLeadSourcesApi, getSalesUsersApi } from '../api'
import type { BranchDto, LeadSourceDto, UserLite } from '../types'

export function LeadCreatePage() {
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
    <form className="user-form" onSubmit={submit}>
      {error ? <p className="auth-error">{error}</p> : null}
      <label className="form-field"><span>Branch</span><select className="toolbar-select" value={form.branchId} onChange={(e)=>setForm({...form,branchId:e.target.value})}>{!isAdmin ? null : <option value="">Select</option>}{branches.map((b)=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
      <label className="form-field"><span>Assigned Sales</span><select className="toolbar-select" value={form.assignedToUserId} onChange={(e)=>setForm({...form,assignedToUserId:e.target.value})}><option value="">Select</option>{users.map((u)=><option key={u.id} value={u.id}>{u.fullName}</option>)}</select></label>
      <label className="form-field"><span>Full Name</span><input className="toolbar-input" value={form.fullName} onChange={(e)=>setForm({...form,fullName:e.target.value})} required /></label>
      <label className="form-field"><span>Phone</span><input className="toolbar-input" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} required /></label>
      <label className="form-field"><span>Email</span><input className="toolbar-input" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} /></label>
      <label className="form-field"><span>Date of Birth</span><input className="toolbar-input" type="date" value={form.dateOfBirth} onChange={(e)=>setForm({...form,dateOfBirth:e.target.value})} /></label>
      <label className="form-field"><span>Address</span><input className="toolbar-input" value={form.address} onChange={(e)=>setForm({...form,address:e.target.value})} /></label>
      <label className="form-field"><span>Source</span><select className="toolbar-select" value={form.sourceId} onChange={(e)=>setForm({...form,sourceId:e.target.value})}><option value="">Select</option>{sources.map((s)=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      <label className="form-field" style={{gridColumn:'1 / -1'}}><span>Demand Note</span><textarea className="toolbar-input" style={{height:'90px',paddingTop:'8px'}} value={form.demandNote} onChange={(e)=>setForm({...form,demandNote:e.target.value.slice(0,2000)})} /></label>
      <div className="form-actions"><button className="ms-button ms-button--secondary" type="button" onClick={()=>navigateTo('/leads')}>Cancel</button><button className="ms-button" type="submit">Create lead</button></div>
    </form>
  )
}
