import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/hooks'
import { useAuthRoles } from '../../auth/useAuthRoles'
import { navigateTo } from '../../../lib/navigation'
import { createStudentApi, getBranchesApi } from '../api'
import type { BranchDto } from '../types'

export function StudentCreatePage() {
  const roles = useAuthRoles()
  const { currentUser } = useAuth()
  const isAdmin = roles.includes('Admin')

  const [branches, setBranches] = useState<BranchDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ branchId:'', fullName:'', email:'', phone:'', dateOfBirth:'', gender:'male', address:'' })

  useEffect(() => {
    void (async () => {
      const data = await getBranchesApi()
      setBranches(data)
      if (!isAdmin && currentUser?.branchId) setForm((prev)=>({ ...prev, branchId: String(currentUser.branchId) }))
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
    <form className="user-form" onSubmit={submit}>
      {error ? <p className="auth-error">{error}</p> : null}
      <label className="form-field"><span>Branch</span><select className="toolbar-select" value={form.branchId} onChange={(e)=>setForm({...form,branchId:e.target.value})}>{isAdmin ? <option value="">Select</option> : null}{branches.map((b)=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
      <label className="form-field"><span>Full name</span><input className="toolbar-input" value={form.fullName} onChange={(e)=>setForm({...form,fullName:e.target.value})} required /></label>
      <label className="form-field"><span>Email</span><input className="toolbar-input" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} /></label>
      <label className="form-field"><span>Phone</span><input className="toolbar-input" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} required /></label>
      <label className="form-field"><span>Date of birth</span><input className="toolbar-input" type="date" value={form.dateOfBirth} onChange={(e)=>setForm({...form,dateOfBirth:e.target.value})} /></label>
      <label className="form-field"><span>Gender</span><select className="toolbar-select" value={form.gender} onChange={(e)=>setForm({...form,gender:e.target.value})}><option value="male">male</option><option value="female">female</option><option value="other">other</option></select></label>
      <label className="form-field" style={{gridColumn:'1 / -1'}}><span>Address</span><input className="toolbar-input" value={form.address} onChange={(e)=>setForm({...form,address:e.target.value})} /></label>
      <div className="form-actions"><button className="ms-button ms-button--secondary" type="button" onClick={()=>navigateTo('/students')}>Cancel</button><button className="ms-button" type="submit">Create student</button></div>
    </form>
  )
}
