import { useEffect, useState } from 'react'
import { apiRequest } from '../../../lib/apiClient'
import type { ApiResponse } from '../../leads/types'

type LeadSourceDto = { id: number; name: string; description: string | null; isActive: boolean }

export function LeadSourceListPage() {
  const [items, setItems] = useState<LeadSourceDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')

  const load = async () => {
    try {
      const res = await apiRequest<ApiResponse<LeadSourceDto[]>>('/lead-sources')
      setItems(res.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load lead sources')
    }
  }

  useEffect(() => { void load() }, [])

  const create = async () => {
    await apiRequest('/lead-sources', { method: 'POST', body: { name, description: null, isActive: true } })
    setName('')
    await load()
  }

  const edit = async (item: LeadSourceDto) => {
    const newName = window.prompt('Source name', item.name)
    if (!newName) return
    await apiRequest(`/lead-sources/${item.id}`, { method: 'PUT', body: { name: newName, description: item.description, isActive: item.isActive } })
    await load()
  }

  const remove = async (item: LeadSourceDto) => {
    if (!window.confirm(`Delete source "${item.name}"?`)) return
    await apiRequest(`/lead-sources/${item.id}`, { method: 'DELETE' })
    await load()
  }

  return (
    <>
      <div className="users-toolbar">
        <div className="users-filters"><input className="toolbar-input" placeholder="Source name" value={name} onChange={(e)=>setName(e.target.value)} /><button className="ms-button" onClick={()=>void create()}>Create source</button></div>
      </div>
      {error ? <p className="auth-error">{error}</p> : null}
      <table className="ms-table"><thead><tr><th>Name</th><th>Description</th><th>Active</th><th>Actions</th></tr></thead><tbody>{items.map((i)=><tr key={i.id}><td>{i.name}</td><td>{i.description ?? '-'}</td><td>{i.isActive ? 'Active' : 'Inactive'}</td><td><div className="table-actions"><button className="table-action-btn" onClick={()=>void edit(i)}>Edit</button><button className="table-action-btn" onClick={()=>void remove(i)}>Delete</button></div></td></tr>)}</tbody></table>
    </>
  )
}
