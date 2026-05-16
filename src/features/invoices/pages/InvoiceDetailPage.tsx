import { useEffect, useState } from 'react'
import { useAuthRoles } from '../../auth/useAuthRoles'
import { cancelInvoiceApi, createPaymentApi, getInvoiceApi, getInvoicePaymentsApi } from '../api'
import { InvoiceStatusBadge } from '../components/InvoiceStatusBadge'
import type { InvoiceDto, PaymentDto } from '../types'

export function InvoiceDetailPage({ invoiceId }: { invoiceId: string }) {
  const id = Number(invoiceId)
  const roles = useAuthRoles()
  const canCancel = roles.includes('Admin') || roles.includes('Manager')
  const canPay = roles.includes('Admin') || roles.includes('Manager') || roles.includes('Sales')
  const [invoice, setInvoice] = useState<InvoiceDto | null>(null)
  const [payments, setPayments] = useState<PaymentDto[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const [i, p] = await Promise.all([getInvoiceApi(id), getInvoicePaymentsApi(id)])
      setInvoice(i); setPayments(p)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load invoice')
    }
  }

  useEffect(() => { void load() }, [id])
  if (!invoice) return <p>{error ?? 'Loading...'}</p>

  return (
    <>
      {error ? <p className="auth-error">{error}</p> : null}
      <div className="users-toolbar">
        <div className="users-filters">
          {canPay ? <button className="table-action-btn" onClick={async()=>{const amount = Number(window.prompt('Amount', String(invoice.remainingAmount)) || '0'); if (!amount || amount <= 0 || amount > invoice.remainingAmount) return; const method = window.prompt('Method (cash/bank_transfer/card/e_wallet/other)', 'cash') || 'cash'; const transactionRef = window.prompt('Transaction ref (optional)', '') || null; const paidAt = window.prompt('Paid at (ISO, optional)', '') || null; const note = window.prompt('Note (optional)', '') || null; await createPaymentApi(invoice.id, { amount, method, transactionRef, paidAt, note }); await load()}}>+ Payment</button> : null}
          {canCancel && invoice.status !== 'paid' && invoice.status !== 'cancelled' ? <button className="table-action-btn" onClick={async()=>{if(window.confirm('Cancel invoice?')){await cancelInvoiceApi(invoice.id); await load()}}}>Cancel Invoice</button> : null}
          <button className="table-action-btn" disabled title="Available later">Export PDF</button>
        </div>
      </div>
      <div className="detail-grid">
        <div><strong>Invoice code:</strong> {invoice.invoiceCode}</div>
        <div><strong>Student:</strong> {invoice.studentName}</div>
        <div><strong>Enrollment:</strong> {invoice.enrollmentId}</div>
        <div><strong>Amount:</strong> {invoice.amount.toLocaleString()}</div>
        <div><strong>Paid amount:</strong> {invoice.paidAmount.toLocaleString()}</div>
        <div><strong>Remaining:</strong> {invoice.remainingAmount.toLocaleString()}</div>
        <div><strong>Due date:</strong> {invoice.dueDate ?? '-'}</div>
        <div><strong>Status:</strong> <InvoiceStatusBadge status={invoice.status} /></div>
        <div><strong>Issued at:</strong> {invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleString() : '-'}</div>
        <div><strong>Created by:</strong> {invoice.createdByUserName ?? '-'}</div>
      </div>

      <h3 style={{ marginTop: 16 }}>Payments</h3>
      <table className="ms-table">
        <thead><tr><th>Payment ID</th><th>Amount</th><th>Method</th><th>Transaction Ref</th><th>Paid At</th><th>Collected By</th><th>Status</th></tr></thead>
        <tbody>{payments.map((x)=><tr key={x.id}><td>{x.id}</td><td>{x.amount.toLocaleString()}</td><td>{x.method}</td><td>{x.transactionRef ?? '-'}</td><td>{new Date(x.paidAt).toLocaleString()}</td><td>{x.collectedByUserName ?? '-'}</td><td>{x.status}</td></tr>)}</tbody>
      </table>
    </>
  )
}
