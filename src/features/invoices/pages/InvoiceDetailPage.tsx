import { useEffect, useState } from 'react'
import {
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
import { useAuthRoles } from '../../auth/useAuthRoles'
import { cancelInvoiceApi, createPaymentApi, getInvoiceApi, getInvoicePaymentsApi } from '../api'
import { InvoiceStatusBadge } from '../components/InvoiceStatusBadge'
import type { InvoiceDto, PaymentDto } from '../types'
import { DetailCard, PageStack, TableCard } from '../../../components/ui/FluentPage'
import { formatStatusLabel } from '../../../lib/formatStatus'

export function InvoiceDetailPage({ invoiceId }: { invoiceId: string }) {
  const id = Number(invoiceId)
  const roles = useAuthRoles()
  const canCancel = roles.includes('Admin') || roles.includes('Manager')
  const canPay = roles.includes('Admin') || roles.includes('Manager') || roles.includes('Sales')
  const [invoice, setInvoice] = useState<InvoiceDto | null>(null)
  const [payments, setPayments] = useState<PaymentDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showPayDialog, setShowPayDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [payForm, setPayForm] = useState({ amount: '', method: 'cash', transactionRef: '', paidAt: '', note: '' })

  const load = async () => {
    try {
      const [i, p] = await Promise.all([getInvoiceApi(id), getInvoicePaymentsApi(id)])
      setInvoice(i); setPayments(p)
      setPayForm((prev) => ({ ...prev, amount: String(i.remainingAmount) }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load invoice')
    }
  }

  useEffect(() => { void load() }, [id])
  if (!invoice) return <p>{error ?? 'Loading...'}</p>

  return (
    <PageStack>
      {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {canPay ? <Button appearance="primary" onClick={() => setShowPayDialog(true)}>Add Payment</Button> : null}
        {canCancel && invoice.status !== 'paid' && invoice.status !== 'cancelled' ? <Button appearance="secondary" onClick={() => setShowCancelDialog(true)}>Cancel Invoice</Button> : null}
        <Button appearance="secondary" disabled title="Available later">Export PDF</Button>
      </div>

      <DetailCard>
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
      </DetailCard>

      <TableCard title="Payments" subtitle={`${payments.length} payments`}>
        <Table aria-label="Invoice payments table">
          <TableHeader><TableRow><TableHeaderCell>Payment ID</TableHeaderCell><TableHeaderCell>Amount</TableHeaderCell><TableHeaderCell>Method</TableHeaderCell><TableHeaderCell>Transaction Ref</TableHeaderCell><TableHeaderCell>Paid At</TableHeaderCell><TableHeaderCell>Collected By</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell></TableRow></TableHeader>
          <TableBody>{payments.map((x) => <TableRow key={x.id}><TableCell>{x.id}</TableCell><TableCell>{x.amount.toLocaleString()}</TableCell><TableCell>{x.method}</TableCell><TableCell>{x.transactionRef ?? '-'}</TableCell><TableCell>{new Date(x.paidAt).toLocaleString()}</TableCell><TableCell>{x.collectedByUserName ?? '-'}</TableCell><TableCell>{formatStatusLabel(x.status)}</TableCell></TableRow>)}</TableBody>
        </Table>
      </TableCard>

      <Dialog open={showPayDialog} onOpenChange={(_, d) => setShowPayDialog(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Create Payment</DialogTitle>
            <DialogContent>
              <Field label="Amount"><Input type="number" min={1} value={payForm.amount} onChange={(_, data) => setPayForm({ ...payForm, amount: data.value })} /></Field>
              <Field label="Method"><Input value={payForm.method} onChange={(_, data) => setPayForm({ ...payForm, method: data.value })} /></Field>
              <Field label="Transaction ref"><Input value={payForm.transactionRef} onChange={(_, data) => setPayForm({ ...payForm, transactionRef: data.value })} /></Field>
              <Field label="Paid at (ISO optional)"><Input value={payForm.paidAt} onChange={(_, data) => setPayForm({ ...payForm, paidAt: data.value })} /></Field>
              <Field label="Note"><Input value={payForm.note} onChange={(_, data) => setPayForm({ ...payForm, note: data.value })} /></Field>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement><Button appearance="secondary">Cancel</Button></DialogTrigger>
              <Button appearance="primary" onClick={async () => {
                const amount = Number(payForm.amount || '0')
                if (!amount || amount <= 0 || amount > invoice.remainingAmount) return
                await createPaymentApi(invoice.id, {
                  amount,
                  method: payForm.method,
                  transactionRef: payForm.transactionRef || null,
                  paidAt: payForm.paidAt || null,
                  note: payForm.note || null,
                })
                setShowPayDialog(false)
                await load()
              }}>Create</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Dialog open={showCancelDialog} onOpenChange={(_, d) => setShowCancelDialog(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Cancel invoice</DialogTitle>
            <DialogContent>Cancel invoice "{invoice.invoiceCode}"?</DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement><Button appearance="secondary">No</Button></DialogTrigger>
              <Button appearance="primary" onClick={async () => { await cancelInvoiceApi(invoice.id); setShowCancelDialog(false); await load() }}>Yes, cancel</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </PageStack>
  )
}
