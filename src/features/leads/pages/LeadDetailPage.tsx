import { useEffect, useMemo, useState } from 'react'
import { navigateTo } from '../../../lib/navigation'
import {
  cancelTaskApi,
  changeLeadStatusApi,
  completeTaskApi,
  convertLeadToStudentApi,
  createLeadActivityApi,
  createLeadTaskApi,
  getLeadActivitiesApi,
  getLeadApi,
  getLeadTasksApi,
  getSalesUsersApi,
} from '../api'
import type { FollowUpTaskDto, LeadActivityDto, LeadDto, UserLite } from '../types'
import { useAuthRoles } from '../../auth/useAuthRoles'

type LeadDetailPageProps = { leadId: string }

export function LeadDetailPage({ leadId }: LeadDetailPageProps) {
  const roles = useAuthRoles()
  const canConvert = roles.includes('Admin') || roles.includes('Manager') || roles.includes('Sales')

  const id = Number(leadId)
  const [lead, setLead] = useState<LeadDto | null>(null)
  const [activities, setActivities] = useState<LeadActivityDto[]>([])
  const [tasks, setTasks] = useState<FollowUpTaskDto[]>([])
  const [users, setUsers] = useState<UserLite[]>([])
  const [tab, setTab] = useState<'overview' | 'activities' | 'tasks'>('overview')
  const [error, setError] = useState<string | null>(null)
  const [showActivity, setShowActivity] = useState(false)
  const [showTask, setShowTask] = useState(false)

  const refresh = async () => {
    try {
      const [l, a, t, u] = await Promise.all([
        getLeadApi(id),
        getLeadActivitiesApi(id),
        getLeadTasksApi(id),
        getSalesUsersApi(),
      ])
      setLead(l)
      setActivities(a)
      setTasks(t)
      setUsers(u)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load lead detail')
    }
  }

  useEffect(() => {
    void refresh()
  }, [id])

  const nextFollowUp = useMemo(() => {
    const pending = tasks
      .filter((t) => t.status === 'pending')
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    return pending[0]
  }, [tasks])

  if (!lead) return <p>{error ?? 'Loading...'}</p>

  const canShowConvert = canConvert && lead.status !== 'lost'

  return (
    <>
      {error ? <p className="auth-error">{error}</p> : null}
      <div className="users-toolbar">
        <div className="users-filters">
          <button className="table-action-btn" onClick={() => navigateTo(`/leads/${lead.id}/edit`)}>Edit lead</button>
          <button
            className="table-action-btn"
            onClick={async () => {
              const s = window.prompt('Status:', lead.status)
              if (s) {
                await changeLeadStatusApi(lead.id, s)
                await refresh()
              }
            }}
          >
            Change status
          </button>
          {canShowConvert ? (
            <button
              className="table-action-btn"
              onClick={async () => {
                const gender = window.prompt('Gender (male/female/other), optional:', '') || null
                const response = await convertLeadToStudentApi(lead.id, { gender })
                navigateTo(`/students/${response.studentId}`, true)
              }}
            >
              Convert to Student
            </button>
          ) : null}
          <button className="table-action-btn" onClick={() => setShowActivity(true)}>+ Activity</button>
          <button className="table-action-btn" onClick={() => setShowTask(true)}>+ Follow-up task</button>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab-btn ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>Overview</button>
        <button className={`tab-btn ${tab === 'activities' ? 'active' : ''}`} onClick={() => setTab('activities')}>Activities</button>
        <button className={`tab-btn ${tab === 'tasks' ? 'active' : ''}`} onClick={() => setTab('tasks')}>Follow-up Tasks</button>
      </div>

      {tab === 'overview' ? (
        <div className="detail-grid">
          <div><strong>Full name:</strong> {lead.fullName}</div><div><strong>Phone:</strong> {lead.phone}</div>
          <div><strong>Email:</strong> {lead.email ?? '-'}</div><div><strong>Address:</strong> {lead.address ?? '-'}</div>
          <div><strong>Source:</strong> {lead.sourceName ?? '-'}</div><div><strong>Status:</strong> {lead.status}</div>
          <div><strong>Assigned sales:</strong> {lead.assignedToUserName ?? '-'}</div><div><strong>Next follow-up:</strong> {nextFollowUp ? new Date(nextFollowUp.dueAt).toLocaleString() : '-'}</div>
          <div style={{ gridColumn: '1 / -1' }}><strong>Demand note:</strong> {lead.demandNote ?? '-'}</div>
        </div>
      ) : null}

      {tab === 'activities' ? (
        <div className="timeline">
          {activities.map((a) => (
            <div key={a.id} className="timeline-item">
              <div><strong>{a.type}</strong> - {a.content}</div>
              <small>{new Date(a.contactedAtUtc ?? a.createdAtUtc).toLocaleString()} by {a.userName}</small>
            </div>
          ))}
        </div>
      ) : null}

      {tab === 'tasks' ? (
        <table className="ms-table">
          <thead><tr><th>Title</th><th>Due at</th><th>Assigned user</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {tasks.map((t) => {
              const overdue = t.status === 'pending' && new Date(t.dueAt).getTime() < Date.now()
              const display = overdue ? 'overdue' : t.status
              return (
                <tr key={t.id}>
                  <td>{t.title}</td>
                  <td>{new Date(t.dueAt).toLocaleString()}</td>
                  <td>{t.assignedToUserName}</td>
                  <td>{display}</td>
                  <td>
                    <div className="table-actions">
                      <button className="table-action-btn" onClick={async () => { await completeTaskApi(t.id); await refresh() }}>Complete</button>
                      <button className="table-action-btn" onClick={async () => { await cancelTaskApi(t.id); await refresh() }}>Cancel</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : null}

      {showActivity ? <ActivityModal leadId={lead.id} onClose={() => setShowActivity(false)} onCreated={refresh} /> : null}
      {showTask ? <TaskModal leadId={lead.id} users={users} onClose={() => setShowTask(false)} onCreated={refresh} /> : null}
    </>
  )
}

function ActivityModal({ leadId, onClose, onCreated }: { leadId: number; onClose: () => void; onCreated: () => Promise<void> }) {
  const [type, setType] = useState('call')
  const [content, setContent] = useState('')
  const [contactedAt, setContactedAt] = useState('')

  return (
    <div className="modal-backdrop"><div className="modal-card"><h3>Create Activity</h3>
      <div className="form-field"><span>Type</span><select className="toolbar-select" value={type} onChange={(e) => setType(e.target.value)}>{['call','email','zalo','meeting','note','trial_follow_up'].map((t)=><option key={t}>{t}</option>)}</select></div>
      <div className="form-field"><span>Content</span><textarea className="toolbar-input" style={{ height: '90px', paddingTop: '8px' }} value={content} onChange={(e) => setContent(e.target.value)} /></div>
      <div className="form-field"><span>Contacted At</span><input className="toolbar-input" type="datetime-local" value={contactedAt} onChange={(e) => setContactedAt(e.target.value)} /></div>
      <div className="modal-actions"><button className="ms-button ms-button--secondary" onClick={onClose}>Cancel</button><button className="ms-button" onClick={async()=>{await createLeadActivityApi(leadId,{type,content,contactedAt:contactedAt?new Date(contactedAt).toISOString():undefined});onClose();await onCreated()}}>Create</button></div>
    </div></div>
  )
}

function TaskModal({ leadId, users, onClose, onCreated }: { leadId: number; users: UserLite[]; onClose: () => void; onCreated: () => Promise<void> }) {
  const [assignedToUserId, setAssignedToUserId] = useState(users[0] ? String(users[0].id) : '')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueAt, setDueAt] = useState('')

  return (
    <div className="modal-backdrop"><div className="modal-card"><h3>Create Follow-up Task</h3>
      <div className="form-field"><span>Assigned user</span><select className="toolbar-select" value={assignedToUserId} onChange={(e)=>setAssignedToUserId(e.target.value)}>{users.map((u)=><option key={u.id} value={u.id}>{u.fullName}</option>)}</select></div>
      <div className="form-field"><span>Title</span><input className="toolbar-input" value={title} onChange={(e)=>setTitle(e.target.value)} /></div>
      <div className="form-field"><span>Description</span><textarea className="toolbar-input" style={{height:'90px',paddingTop:'8px'}} value={description} onChange={(e)=>setDescription(e.target.value)} /></div>
      <div className="form-field"><span>Due at</span><input className="toolbar-input" type="datetime-local" value={dueAt} onChange={(e)=>setDueAt(e.target.value)} /></div>
      <div className="modal-actions"><button className="ms-button ms-button--secondary" onClick={onClose}>Cancel</button><button className="ms-button" onClick={async()=>{await createLeadTaskApi({leadId,assignedToUserId:Number(assignedToUserId),title,description,dueAt:new Date(dueAt).toISOString()});onClose();await onCreated()}}>Create</button></div>
    </div></div>
  )
}
