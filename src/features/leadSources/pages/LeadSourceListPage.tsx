import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  MessageBar,
  MessageBarBody,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@fluentui/react-components'
import { Add24Regular } from '@fluentui/react-icons'
import { apiRequest } from '../../../lib/apiClient'
import { Pagination } from '../../../components/ui/Pagination'
import { PageStack, PageToolbar, TableActions, TableCard } from '../../../components/ui/FluentPage'
import type { ApiResponse } from '../../leads/types'

type LeadSourceDto = { id: number; name: string; description: string | null; isActive: boolean }

export function LeadSourceListPage() {
  const pageSize = 20
  const [items, setItems] = useState<LeadSourceDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [page, setPage] = useState(1)
  const [editing, setEditing] = useState<LeadSourceDto | null>(null)
  const [deleting, setDeleting] = useState<LeadSourceDto | null>(null)

  const load = async () => {
    try {
      const res = await apiRequest<ApiResponse<LeadSourceDto[]>>('/lead-sources')
      setItems(res.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load lead sources')
    }
  }

  useEffect(() => { void load() }, [])
  const pagedItems = items.slice((page - 1) * pageSize, page * pageSize)

  const create = async () => {
    await apiRequest('/lead-sources', { method: 'POST', body: { name, description: null, isActive: true } })
    setName('')
    await load()
  }

  return (
    <PageStack>
      <PageToolbar>
        <div style={{ display: 'flex', gap: 8 }}>
          <Field label="Source name"><Input value={name} onChange={(_, d) => setName(d.value)} /></Field>
          <Button appearance="primary" icon={<Add24Regular />} onClick={() => void create()}>Create source</Button>
        </div>
      </PageToolbar>
      {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}
      <TableCard title="Lead Sources" subtitle={`${items.length} sources`} footer={<Pagination page={page} pageSize={pageSize} totalCount={items.length} onPageChange={setPage} />}>
        <Table aria-label="Lead sources table"><TableHeader><TableRow><TableHeaderCell>Name</TableHeaderCell><TableHeaderCell>Description</TableHeaderCell><TableHeaderCell>Active</TableHeaderCell><TableHeaderCell>Actions</TableHeaderCell></TableRow></TableHeader><TableBody>{pagedItems.map((i) => <TableRow key={i.id}><TableCell>{i.name}</TableCell><TableCell>{i.description ?? '-'}</TableCell><TableCell><Badge appearance="filled" color={i.isActive ? 'success' : 'danger'}>{i.isActive ? 'Active' : 'Inactive'}</Badge></TableCell><TableCell><TableActions><Button size="small" appearance="subtle" onClick={() => setEditing(i)}>Edit</Button><Button size="small" appearance="subtle" onClick={() => setDeleting(i)}>Delete</Button></TableActions></TableCell></TableRow>)}</TableBody></Table>
      </TableCard>

      <Dialog open={Boolean(editing)} onOpenChange={(_, d) => !d.open && setEditing(null)}>
        <DialogSurface><DialogBody><DialogTitle>Edit source</DialogTitle><DialogContent><Field label="Source name"><Input value={editing?.name ?? ''} onChange={(_, data) => setEditing((prev) => prev ? { ...prev, name: data.value } : prev)} /></Field></DialogContent><DialogActions><DialogTrigger disableButtonEnhancement><Button appearance="secondary">Cancel</Button></DialogTrigger><Button appearance="primary" onClick={async () => { if (!editing) return; await apiRequest(`/lead-sources/${editing.id}`, { method: 'PUT', body: { name: editing.name, description: editing.description, isActive: editing.isActive } }); setEditing(null); await load() }}>Save</Button></DialogActions></DialogBody></DialogSurface>
      </Dialog>

      <Dialog open={Boolean(deleting)} onOpenChange={(_, d) => !d.open && setDeleting(null)}>
        <DialogSurface><DialogBody><DialogTitle>Delete source</DialogTitle><DialogContent>Delete "{deleting?.name}"?</DialogContent><DialogActions><DialogTrigger disableButtonEnhancement><Button appearance="secondary">Cancel</Button></DialogTrigger><Button appearance="primary" onClick={async () => { if (!deleting) return; await apiRequest(`/lead-sources/${deleting.id}`, { method: 'DELETE' }); setDeleting(null); await load() }}>Delete</Button></DialogActions></DialogBody></DialogSurface>
      </Dialog>
    </PageStack>
  )
}
