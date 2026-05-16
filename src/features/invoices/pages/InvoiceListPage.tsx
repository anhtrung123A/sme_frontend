import { useEffect, useMemo, useState } from 'react'
import { navigateTo } from '../../../lib/navigation'
import { getInvoicesApi } from '../api'
import { InvoiceStatusBadge } from '../components/InvoiceStatusBadge'
import type { InvoiceDto } from '../types'

export function InvoiceListPage() {
  const [items, setItems] = useState<InvoiceDto[]>([])
  const [status, setStatus] = useState('')
  const [dueFrom, setDueFrom] = useState('')
  const [dueTo, setDueTo] = useState('')
  const [error, setError] = useState<string | null>(null)

  const kpi = useMemo(() => ({
    unpaid: items.filter((x) => x.status === 'unpaid').length,
    partiallyPaid: items.filter((x) => x.status === 'partially_paid').length,
    paid: items.filter((x) => x.status === 'paid').length,
    overdue: items.filter((x) => x.status === 'overdue').length,
  }), [items])

  const load = async () => {
    try {
      const data = await getInvoicesApi({ status: status || undefined, dueFrom: dueFrom || undefined, dueTo: dueTo || undefined })
      setItems(Array.isArray(data.items) ? data.items : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load invoices')
    }
  }

  useEffect(() => { void load() }, [])

  return (
    <>
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <div className="kpi-card"><span>Unpaid</span><strong>{kpi.unpaid}</strong></div>
        <div className="kpi-card"><span>Partially Paid</span><strong>{kpi.partiallyPaid}</strong></div>
        <div className="kpi-card"><span>Paid</span><strong>{kpi.paid}</strong></div>
        <div className="kpi-card"><span>Overdue</span><strong>{kpi.overdue}</strong></div>
      </div>
      <div className="users-toolbar">
        <div className="users-filters">
          <select className="toolbar-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All status</option>
            {['unpaid', 'partially_paid', 'paid', 'overdue', 'cancelled'].map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
          <input className="toolbar-input" type="date" value={dueFrom} onChange={(e)=>setDueFrom(e.target.value)} />
          <input className="toolbar-input" type="date" value={dueTo} onChange={(e)=>setDueTo(e.target.value)} />
          <button className="ms-button ms-button--secondary" onClick={()=>void load()}>Apply</button>
        </div>
      </div>
      {error ? <p className="auth-error">{error}</p> : null}
      <table className="ms-table">
        <thead><tr><th>Invoice code</th><th>Student</th><th>Enrollment</th><th>Amount</th><th>Paid amount</th><th>Remaining</th><th>Due date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{items.map((x)=><tr key={x.id}><td>{x.invoiceCode}</td><td>{x.studentName}</td><td>{x.enrollmentId}</td><td>{x.amount.toLocaleString()}</td><td>{x.paidAmount.toLocaleString()}</td><td>{x.remainingAmount.toLocaleString()}</td><td>{x.dueDate ?? '-'}</td><td><InvoiceStatusBadge status={x.status} /></td><td><button className="table-action-btn" onClick={()=>navigateTo(`/invoices/${x.id}`)}>View</button></td></tr>)}</tbody>
      </table>
    </>
  )
}
