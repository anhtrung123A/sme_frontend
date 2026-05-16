import { useEffect, useState } from 'react'
import { getPaymentsApi } from '../../invoices/api'
import type { PaymentDto } from '../../invoices/types'

export function PaymentListPage() {
  const [items, setItems] = useState<PaymentDto[]>([])
  const [status, setStatus] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const data = await getPaymentsApi({ status: status || undefined })
      setItems(Array.isArray(data.items) ? data.items : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load payments')
    }
  }

  useEffect(() => { void load() }, [])

  return (
    <>
      <div className="users-toolbar">
        <div className="users-filters">
          <select className="toolbar-select" value={status} onChange={(e)=>setStatus(e.target.value)}>
            <option value="">All status</option>
            {['pending', 'completed', 'failed', 'refunded'].map((x)=><option key={x} value={x}>{x}</option>)}
          </select>
          <button className="ms-button ms-button--secondary" onClick={()=>void load()}>Apply</button>
        </div>
      </div>
      {error ? <p className="auth-error">{error}</p> : null}
      <table className="ms-table">
        <thead><tr><th>Payment ID</th><th>Invoice</th><th>Student</th><th>Amount</th><th>Method</th><th>Paid At</th><th>Collected By</th><th>Status</th></tr></thead>
        <tbody>{items.map((x)=><tr key={x.id}><td>{x.id}</td><td>{x.invoiceId}</td><td>{x.studentName}</td><td>{x.amount.toLocaleString()}</td><td>{x.method}</td><td>{new Date(x.paidAt).toLocaleString()}</td><td>{x.collectedByUserName ?? '-'}</td><td>{x.status}</td></tr>)}</tbody>
      </table>
    </>
  )
}
