import { useEffect, useState } from 'react'
import { Button, MessageBar, MessageBarBody, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from '@fluentui/react-components'
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
      {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}
      <Table aria-label="Student invoices">
        <TableHeader><TableRow><TableHeaderCell>Invoice code</TableHeaderCell><TableHeaderCell>Amount</TableHeaderCell><TableHeaderCell>Paid</TableHeaderCell><TableHeaderCell>Remaining</TableHeaderCell><TableHeaderCell>Due date</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell><TableHeaderCell>Actions</TableHeaderCell></TableRow></TableHeader>
        <TableBody>{items.map((x) => <TableRow key={x.id}><TableCell>{x.invoiceCode}</TableCell><TableCell>{x.amount.toLocaleString()}</TableCell><TableCell>{x.paidAmount.toLocaleString()}</TableCell><TableCell>{x.remainingAmount.toLocaleString()}</TableCell><TableCell>{x.dueDate ?? '-'}</TableCell><TableCell><InvoiceStatusBadge status={x.status} /></TableCell><TableCell><Button size="small" appearance="subtle" onClick={() => navigateTo(`/invoices/${x.id}`)}>View</Button></TableCell></TableRow>)}</TableBody>
      </Table>
    </div>
  )
}
