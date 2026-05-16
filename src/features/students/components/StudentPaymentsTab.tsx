import { useEffect, useState } from 'react'
import { getStudentPaymentsApi } from '../../invoices/api'
import type { PaymentDto } from '../../invoices/types'

export function StudentPaymentsTab({ studentId }: { studentId: number }) {
  const [items, setItems] = useState<PaymentDto[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      try { setItems(await getStudentPaymentsApi(studentId)) } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load payments') }
    })()
  }, [studentId])

  return (
    <div>
      {error ? <p className="auth-error">{error}</p> : null}
      <table className="ms-table">
        <thead><tr><th>Payment date</th><th>Invoice</th><th>Amount</th><th>Method</th><th>Collected by</th><th>Status</th></tr></thead>
        <tbody>{items.map((x)=><tr key={x.id}><td>{new Date(x.paidAt).toLocaleString()}</td><td>{x.invoiceId}</td><td>{x.amount.toLocaleString()}</td><td>{x.method}</td><td>{x.collectedByUserName ?? '-'}</td><td>{x.status}</td></tr>)}</tbody>
      </table>
    </div>
  )
}
