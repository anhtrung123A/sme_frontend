import { useEffect, useState } from 'react'
import { navigateTo } from '../../../lib/navigation'
import { getBranchesApi, getStudentApi, updateStudentApi } from '../api'
import type { BranchDto } from '../types'

export function StudentEditPage({ studentId }: { studentId: string }) {
  const id = Number(studentId)
  const [branches, setBranches] = useState<BranchDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ branchId:'', fullName:'', email:'', phone:'', dateOfBirth:'', gender:'', address:'' })

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
    <form className="user-form" onSubmit={save}>
      {error ? <p className="auth-error">{error}</p> : null}
      <label className="form-field"><span>Branch</span><select className="toolbar-select" value={form.branchId} onChange={(e)=>setForm({...form,branchId:e.target.value})}><option value="">Select</option>{branches.map((b)=><option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
      <label className="form-field"><span>Full name</span><input className="toolbar-input" value={form.fullName} onChange={(e)=>setForm({...form,fullName:e.target.value})} required /></label>
      <label className="form-field"><span>Email</span><input className="toolbar-input" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} /></label>
      <label className="form-field"><span>Phone</span><input className="toolbar-input" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} required /></label>
      <label className="form-field"><span>Date of birth</span><input className="toolbar-input" type="date" value={form.dateOfBirth} onChange={(e)=>setForm({...form,dateOfBirth:e.target.value})} /></label>
      <label className="form-field"><span>Gender</span><input className="toolbar-input" value={form.gender} onChange={(e)=>setForm({...form,gender:e.target.value})} /></label>
      <label className="form-field" style={{gridColumn:'1 / -1'}}><span>Address</span><input className="toolbar-input" value={form.address} onChange={(e)=>setForm({...form,address:e.target.value})} /></label>
      <div className="form-actions"><button className="ms-button ms-button--secondary" type="button" onClick={()=>navigateTo(`/students/${id}`)}>Cancel</button><button className="ms-button" type="submit">Save</button></div>
    </form>
  )
}
