import { useEffect, useMemo, useState } from 'react'
import { navigateTo } from '../../../lib/navigation'
import { useAuthRoles } from '../../auth/useAuthRoles'
import { deleteStudentApi, getBranchesApi, getStudentsApi, updateStudentStatusApi } from '../api'
import type { BranchDto, StudentDto } from '../types'

const statuses = ['potential', 'active', 'inactive', 'completed', 'dropped']

export function StudentListPage() {
  const roles = useAuthRoles()
  const canDelete = roles.includes('Admin') || roles.includes('Manager')

  const [items, setItems] = useState<StudentDto[]>([])
  const [branches, setBranches] = useState<BranchDto[]>([])
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [branchId, setBranchId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const kpis = useMemo(() => {
    return {
      total: items.length,
      potential: items.filter((x) => x.status === 'potential').length,
      active: items.filter((x) => x.status === 'active').length,
      dropped: items.filter((x) => x.status === 'inactive' || x.status === 'dropped').length,
    }
  }, [items])

  const load = async () => {
    try {
      const [students, br] = await Promise.all([
        getStudentsApi({ keyword: keyword || undefined, status: status || undefined, branchId: branchId ? Number(branchId) : undefined }),
        getBranchesApi(),
      ])
      setItems(students.items)
      setBranches(br)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load students')
    }
  }

  useEffect(() => { void load() }, [])

  return (
    <>
      <div className="kpi-grid">
        <div className="kpi-card"><span>Total Students</span><strong>{kpis.total}</strong></div>
        <div className="kpi-card"><span>Potential</span><strong>{kpis.potential}</strong></div>
        <div className="kpi-card"><span>Active</span><strong>{kpis.active}</strong></div>
        <div className="kpi-card"><span>Inactive / Dropped</span><strong>{kpis.dropped}</strong></div>
      </div>

      <div className="users-toolbar">
        <div className="users-filters">
          <input className="toolbar-input" placeholder="Keyword" value={keyword} onChange={(e)=>setKeyword(e.target.value)} />
          <select className="toolbar-select" value={status} onChange={(e)=>setStatus(e.target.value)}><option value="">All status</option>{statuses.map((s)=><option key={s}>{s}</option>)}</select>
          <select className="toolbar-select" value={branchId} onChange={(e)=>setBranchId(e.target.value)}><option value="">All branches</option>{branches.map((b)=><option key={b.id} value={b.id}>{b.name}</option>)}</select>
          <button className="ms-button ms-button--secondary" onClick={()=>void load()}>Apply</button>
        </div>
        <button className="ms-button" onClick={()=>navigateTo('/students/create')}>Create student</button>
      </div>

      {error ? <p className="auth-error">{error}</p> : null}

      <table className="ms-table">
        <thead><tr><th>Student code</th><th>Full name</th><th>Phone</th><th>Email</th><th>Status</th><th>Branch</th><th>Actions</th></tr></thead>
        <tbody>
          {items.map((s)=> (
            <tr key={s.id}>
              <td>{s.studentCode}</td><td>{s.fullName}</td><td>{s.phone ?? '-'}</td><td>{s.email ?? '-'}</td><td>{s.status}</td><td>{s.branchName ?? '-'}</td>
              <td><div className="table-actions">
                <button className="table-action-btn" onClick={()=>navigateTo(`/students/${s.id}`)}>View detail</button>
                <button className="table-action-btn" onClick={()=>navigateTo(`/students/${s.id}/edit`)}>Edit</button>
                <button className="table-action-btn" onClick={async()=>{const ns=window.prompt('New status:', s.status); if(ns){await updateStudentStatusApi(s.id, ns); await load()}}}>Change status</button>
                {canDelete ? <button className="table-action-btn" onClick={async()=>{if(window.confirm(`Delete ${s.fullName}?`)){await deleteStudentApi(s.id); await load()}}}>Delete</button> : null}
              </div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
