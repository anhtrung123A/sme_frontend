import { useEffect, useMemo, useState } from 'react'
import { cancelTaskApi, completeTaskApi, createLeadTaskApi, getSalesUsersApi } from '../../leads/api'
import { apiRequest } from '../../../lib/apiClient'
import type { ApiResponse, FollowUpTaskDto, PagedResult, UserLite } from '../../leads/types'

export function FollowUpTaskListPage() {
  const [items, setItems] = useState<FollowUpTaskDto[]>([])
  const [users, setUsers] = useState<UserLite[]>([])
  const [status, setStatus] = useState('')
  const [keyword, setKeyword] = useState('')
  const [assignedToUserId, setAssignedToUserId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const load = async () => {
    try {
      const qs = new URLSearchParams({ page: '1', pageSize: '100' })
      if (status) qs.set('status', status)
      if (keyword) qs.set('keyword', keyword)
      if (assignedToUserId) qs.set('assignedToUserId', assignedToUserId)
      const res = await apiRequest<ApiResponse<PagedResult<FollowUpTaskDto>>>(`/follow-up-tasks?${qs.toString()}`)
      setItems(res.data.items)
      setUsers(await getSalesUsersApi())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tasks')
    }
  }

  useEffect(() => { void load() }, [])

  const filtered = useMemo(() => items.filter((i) => !dueDate || i.dueAt.slice(0, 10) === dueDate), [items, dueDate])

  return (
    <>
      <div className="users-toolbar">
        <div className="users-filters">
          <select className="toolbar-select" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All status</option>{['pending', 'completed', 'cancelled', 'overdue'].map((s)=><option key={s}>{s}</option>)}</select>
          <input className="toolbar-input" placeholder="Keyword" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          <select className="toolbar-select" value={assignedToUserId} onChange={(e) => setAssignedToUserId(e.target.value)}><option value="">All users</option>{users.map((u)=><option key={u.id} value={u.id}>{u.fullName}</option>)}</select>
          <input className="toolbar-input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <button className="ms-button ms-button--secondary" onClick={() => void load()}>Apply</button>
        </div>
        <button className="ms-button" onClick={() => setShowCreate(true)}>Create task</button>
      </div>
      {error ? <p className="auth-error">{error}</p> : null}
      <table className="ms-table"><thead><tr><th>Lead</th><th>Title</th><th>Due at</th><th>Assigned user</th><th>Status</th><th>Actions</th></tr></thead><tbody>{filtered.map((t)=>{const overdue=t.status==='pending'&&new Date(t.dueAt).getTime()<Date.now();const display=overdue?'overdue':t.status;return <tr key={t.id}><td>{t.leadName??'-'}</td><td>{t.title}</td><td>{new Date(t.dueAt).toLocaleString()}</td><td>{t.assignedToUserName}</td><td>{display}</td><td><div className="table-actions"><button className="table-action-btn" onClick={async()=>{await completeTaskApi(t.id);await load()}}>Complete</button><button className="table-action-btn" onClick={async()=>{await cancelTaskApi(t.id);await load()}}>Cancel</button></div></td></tr>})}</tbody></table>
      {showCreate ? <CreateTaskModal users={users} onClose={() => setShowCreate(false)} onCreated={load} /> : null}
    </>
  )
}

function CreateTaskModal({ users, onClose, onCreated }: { users: UserLite[]; onClose: () => void; onCreated: () => Promise<void> }) {
  const [leadId, setLeadId] = useState('')
  const [assignedToUserId, setAssignedToUserId] = useState(users[0] ? String(users[0].id) : '')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueAt, setDueAt] = useState('')

  return <div className="modal-backdrop"><div className="modal-card"><h3>Create Follow-up Task</h3><div className="form-field"><span>Lead ID</span><input className="toolbar-input" value={leadId} onChange={(e)=>setLeadId(e.target.value)} /></div><div className="form-field"><span>Assigned user</span><select className="toolbar-select" value={assignedToUserId} onChange={(e)=>setAssignedToUserId(e.target.value)}>{users.map((u)=><option key={u.id} value={u.id}>{u.fullName}</option>)}</select></div><div className="form-field"><span>Title</span><input className="toolbar-input" value={title} onChange={(e)=>setTitle(e.target.value)} /></div><div className="form-field"><span>Description</span><textarea className="toolbar-input" style={{height:'80px',paddingTop:'8px'}} value={description} onChange={(e)=>setDescription(e.target.value)} /></div><div className="form-field"><span>Due at</span><input className="toolbar-input" type="datetime-local" value={dueAt} onChange={(e)=>setDueAt(e.target.value)} /></div><div className="modal-actions"><button className="ms-button ms-button--secondary" onClick={onClose}>Cancel</button><button className="ms-button" onClick={async()=>{await createLeadTaskApi({leadId:Number(leadId),assignedToUserId:Number(assignedToUserId),title,description,dueAt:new Date(dueAt).toISOString()});onClose();await onCreated()}}>Create</button></div></div></div>
}
