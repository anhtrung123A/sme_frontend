import { useEffect, useState } from 'react'
import { createGuardianApi, deleteGuardianApi, getGuardiansApi, updateGuardianApi } from '../../guardians/api'
import { createStudentNoteApi, deleteStudentNoteApi, getStudentNotesApi, updateStudentNoteApi } from '../../studentNotes/api'
import { getStudentApi, updateStudentStatusApi } from '../api'
import { StudentEnrollmentsTab } from '../components/StudentEnrollmentsTab'
import { StudentInvoicesTab } from '../components/StudentInvoicesTab'
import { StudentPaymentsTab } from '../components/StudentPaymentsTab'
import type { StudentDto, StudentGuardianDto, StudentNoteDto } from '../types'

export function StudentDetailPage({ studentId, defaultTab = 'overview' }: { studentId: string; defaultTab?: 'overview'|'guardians'|'notes'|'enrollments'|'invoices'|'payments' }) {
  const id = Number(studentId)
  const [student, setStudent] = useState<StudentDto | null>(null)
  const [guardians, setGuardians] = useState<StudentGuardianDto[]>([])
  const [notes, setNotes] = useState<StudentNoteDto[]>([])
  const [tab, setTab] = useState<'overview'|'guardians'|'notes'|'enrollments'|'invoices'|'payments'|'disabled'>(defaultTab)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const [s, g, n] = await Promise.all([getStudentApi(id), getGuardiansApi(id), getStudentNotesApi(id)])
      setStudent(s); setGuardians(g); setNotes(n)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load student detail')
    }
  }

  useEffect(() => { void load() }, [id])

  if (!student) return <p>{error ?? 'Loading...'}</p>

  return (
    <>
      {error ? <p className="auth-error">{error}</p> : null}

      <div className="tabs">
        <button className={`tab-btn ${tab==='overview'?'active':''}`} onClick={()=>setTab('overview')}>Overview</button>
        <button className={`tab-btn ${tab==='guardians'?'active':''}`} onClick={()=>setTab('guardians')}>Guardians</button>
        <button className={`tab-btn ${tab==='notes'?'active':''}`} onClick={()=>setTab('notes')}>Notes</button>
        <button className={`tab-btn ${tab==='enrollments'?'active':''}`} onClick={()=>setTab('enrollments')}>Enrollments</button>
        <button className={`tab-btn ${tab==='invoices'?'active':''}`} onClick={()=>setTab('invoices')}>Invoices</button>
        <button className={`tab-btn ${tab==='payments'?'active':''}`} onClick={()=>setTab('payments')}>Payments</button>
        <button className="tab-btn" onClick={()=>setTab('disabled')}>Attendance (Phase 7)</button>
      </div>

      {tab==='overview' ? (
        <div className="detail-grid">
          <div><strong>Student code:</strong> {student.studentCode}</div>
          <div><strong>Full name:</strong> {student.fullName}</div>
          <div><strong>Phone:</strong> {student.phone ?? '-'}</div>
          <div><strong>Email:</strong> {student.email ?? '-'}</div>
          <div><strong>Date of birth:</strong> {student.dateOfBirth ?? '-'}</div>
          <div><strong>Gender:</strong> {student.gender ?? '-'}</div>
          <div><strong>Address:</strong> {student.address ?? '-'}</div>
          <div><strong>Branch:</strong> {student.branchName ?? '-'}</div>
          <div><strong>Status:</strong> {student.status}</div>
          <div><strong>Source lead:</strong> -</div>
          <div><strong>Created at:</strong> -</div>
          <div style={{gridColumn:'1 / -1'}}>
            <button className="table-action-btn" onClick={async()=>{const s=window.prompt('New status',student.status); if(s){await updateStudentStatusApi(student.id,s); await load()}}}>Change status</button>
          </div>
        </div>
      ) : null}

      {tab==='guardians' ? (
        <div>
          <button className="ms-button" onClick={async()=>{const fullName=window.prompt('Full name')||'';const phone=window.prompt('Phone')||'';if(!fullName||!phone)return;await createGuardianApi(id,{fullName,phone,email:null,address:null,relationship:null,isPrimary:false}); await load()}}>+ Add Guardian</button>
          <table className="ms-table"><thead><tr><th>Full name</th><th>Phone</th><th>Email</th><th>Relationship</th><th>Primary</th><th>Actions</th></tr></thead><tbody>{guardians.map((g)=><tr key={g.guardianId}><td>{g.fullName}</td><td>{g.phone}</td><td>{g.email??'-'}</td><td>{g.relationship??'-'}</td><td>{g.isPrimary?'Primary':'-'}</td><td><div className="table-actions"><button className="table-action-btn" onClick={async()=>{const fullName=window.prompt('Full name',g.fullName)||g.fullName;const phone=window.prompt('Phone',g.phone)||g.phone;await updateGuardianApi(id,g.guardianId,{fullName,phone,email:g.email,address:g.address,relationship:g.relationship,isPrimary:g.isPrimary});await load()}}>Edit</button><button className="table-action-btn" onClick={async()=>{if(window.confirm('Delete guardian?')){await deleteGuardianApi(id,g.guardianId);await load()}}}>Delete</button></div></td></tr>)}</tbody></table>
        </div>
      ) : null}

      {tab==='notes' ? (
        <div>
          <button className="ms-button" onClick={async()=>{const content=window.prompt('Note content')||'';if(!content.trim())return;await createStudentNoteApi(id,content);await load()}}>+ Add Note</button>
          <div className="timeline">{notes.map((n)=><div key={n.id} className="timeline-item"><div>{n.content}</div><small>{n.userName} ? {new Date(n.createdAtUtc).toLocaleString()}</small><div className="table-actions" style={{marginTop:'8px'}}><button className="table-action-btn" onClick={async()=>{const content=window.prompt('Edit note',n.content)||n.content;await updateStudentNoteApi(id,n.id,content);await load()}}>Edit</button><button className="table-action-btn" onClick={async()=>{if(window.confirm('Delete note?')){await deleteStudentNoteApi(id,n.id);await load()}}}>Delete</button></div></div>)}</div>
        </div>
      ) : null}

      {tab==='enrollments' ? <StudentEnrollmentsTab studentId={id} /> : null}
      {tab==='invoices' ? <StudentInvoicesTab studentId={id} /> : null}
      {tab==='payments' ? <StudentPaymentsTab studentId={id} /> : null}

      {tab==='disabled' ? <p>This tab will be available in a later phase.</p> : null}
    </>
  )
}
