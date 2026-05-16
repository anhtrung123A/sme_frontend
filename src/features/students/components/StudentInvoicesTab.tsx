import { useEffect, useState } from 'react'
import { navigateTo } from '../../../lib/navigation'
import { getStudentInvoicesApi } from '../../invoices/api'
import { InvoiceStatusBadge } from '../../invoices/components/InvoiceStatusBadge'
import type { InvoiceDto } from '../../invoices/types'

export function StudentInvoicesTab({ studentId }: { studentId: number }) {
  const [items, setItems] = useState<InvoiceDto[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try { setItems(await getStudentInvoicesApi(studentId)) } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load invoices') }
    })()
  }, [studentId])

  return (
    <div>
      {error ? <p className="auth-error">{error}</p> : null}
      <table className="ms-table">
        <thead><tr><th>Invoice code</th><th>Amount</th><th>Paid</th><th>Remaining</th><th>Due date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{items.map((x)=><tr key={x.id}><td>{x.invoiceCode}</td><td>{x.amount.toLocaleString()}</td><td>{x.paidAmount.toLocaleString()}</td><td>{x.remainingAmount.toLocaleString()}</td><td>{x.dueDate ?? '-'}</td><td><InvoiceStatusBadge status={x.status} /></td><td><button className="table-action-btn" onClick={()=>navigateTo(`/invoices/${x.id}`)}>View</button></td></tr>)}</tbody>
      </table>
    </div>
  )
}
