import { useEffect, useState } from 'react'
import { useAuthRoles } from '../../auth/useAuthRoles'
import { navigateTo } from '../../../lib/navigation'
import { deleteCourseApi, getCoursesApi, updateCourseApi } from '../api'
import type { CourseDto } from '../types'

export function CourseListPage() {
  const roles = useAuthRoles()
  const canEdit = roles.includes('Admin')
  const [items, setItems] = useState<CourseDto[]>([])
  const [keyword, setKeyword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const data = await getCoursesApi({ keyword: keyword || undefined })
      setItems(data.items)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load courses')
    }
  }

  useEffect(() => { void load() }, [])

  return (
    <>
      <div className="users-toolbar">
        <div className="users-filters">
          <input className="toolbar-input" placeholder="Search course" value={keyword} onChange={(e)=>setKeyword(e.target.value)} />
          <button className="ms-button ms-button--secondary" onClick={()=>void load()}>Search</button>
        </div>
        {canEdit ? <button className="ms-button" onClick={()=>navigateTo('/courses/create')}>Create course</button> : null}
      </div>
      {error ? <p className="auth-error">{error}</p> : null}
      <table className="ms-table"><thead><tr><th>Code</th><th>Name</th><th>Level</th><th>Total Sessions</th><th>Tuition Fee</th><th>Active</th><th>Actions</th></tr></thead><tbody>{items.map((c)=><tr key={c.id}><td>{c.code}</td><td>{c.name}</td><td>{c.level??'-'}</td><td>{c.totalSessions??'-'}</td><td>{c.tuitionFee.toLocaleString()}</td><td>{c.isActive?'Yes':'No'}</td><td><div className="table-actions">{canEdit ? <><button className="table-action-btn" onClick={()=>navigateTo(`/courses/${c.id}/edit`)}>Edit</button><button className="table-action-btn" onClick={async()=>{await updateCourseApi(c.id,{name:c.name,code:c.code,level:c.level,description:c.description,totalSessions:c.totalSessions,tuitionFee:c.tuitionFee,isActive:!c.isActive});await load()}}>{c.isActive?'Deactivate':'Activate'}</button><button className="table-action-btn" onClick={async()=>{if(window.confirm(`Delete ${c.name}?`)){await deleteCourseApi(c.id);await load()}}}>Delete</button></> : '-'}</div></td></tr>)}</tbody></table>
    </>
  )
}
