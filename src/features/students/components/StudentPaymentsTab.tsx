import { useEffect, useState } from 'react'
import { MessageBar, MessageBarBody, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from '@fluentui/react-components'
import { formatStatusLabel } from '../../../lib/formatStatus'
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
      {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}
      <Table aria-label="Student payments">
        <TableHeader><TableRow><TableHeaderCell>Payment date</TableHeaderCell><TableHeaderCell>Invoice</TableHeaderCell><TableHeaderCell>Amount</TableHeaderCell><TableHeaderCell>Method</TableHeaderCell><TableHeaderCell>Collected by</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell></TableRow></TableHeader>
        <TableBody>{items.map((x) => <TableRow key={x.id}><TableCell>{new Date(x.paidAt).toLocaleString()}</TableCell><TableCell>{x.invoiceId}</TableCell><TableCell>{x.amount.toLocaleString()}</TableCell><TableCell>{x.method}</TableCell><TableCell>{x.collectedByUserName ?? '-'}</TableCell><TableCell>{formatStatusLabel(x.status)}</TableCell></TableRow>)}</TableBody>
      </Table>
    </div>
  )
}
