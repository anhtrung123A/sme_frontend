import { useEffect, useState } from 'react'
import {
  Badge,
  Button,
  Field,
  MessageBar,
  MessageBarBody,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@fluentui/react-components'
import { Pagination } from '../../../components/ui/Pagination'
import { FilterGroup, FilterItem, PageStack, PageToolbar, TableCard } from '../../../components/ui/FluentPage'
import { formatStatusLabel } from '../../../lib/formatStatus'
import { getPaymentsApi } from '../../invoices/api'
import type { PaymentDto } from '../../invoices/types'

function getPaymentStatusColor(status: string) {
  if (status === 'completed') return 'success'
  if (status === 'pending') return 'warning'
  if (status === 'failed') return 'danger'
  if (status === 'refunded') return 'informative'
  return 'subtle'
}

export function PaymentListPage() {
  const pageSize = 20
  const [items, setItems] = useState<PaymentDto[]>([])
  const [status, setStatus] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const load = async (nextPage = page) => {
    try {
      const data = await getPaymentsApi({ status: status || undefined, page: nextPage, pageSize })
      setItems(Array.isArray(data.items) ? data.items : [])
      setPage(data.pageNumber)
      setTotalCount(data.totalCount)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load payments')
    }
  }

  useEffect(() => { void load(1) }, [])

  return (
    <PageStack>
      <PageToolbar>
        <FilterGroup>
          <FilterItem>
            <Field label="Status">
              <Select value={status} onChange={(e) => setStatus(e.currentTarget.value)}>
                <option value="">All status</option>
                {['pending', 'completed', 'failed', 'refunded'].map((x) => <option key={x} value={x}>{formatStatusLabel(x)}</option>)}
              </Select>
            </Field>
          </FilterItem>
          <Button appearance="secondary" onClick={() => void load(1)}>Apply</Button>
        </FilterGroup>
      </PageToolbar>
      {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}
      <TableCard title="Payments" subtitle={`${totalCount.toLocaleString()} total payments`} footer={<Pagination page={page} pageSize={pageSize} totalCount={totalCount} onPageChange={(p) => void load(p)} />}>
        <Table aria-label="Payments table">
          <TableHeader><TableRow><TableHeaderCell>Payment ID</TableHeaderCell><TableHeaderCell>Invoice</TableHeaderCell><TableHeaderCell>Student</TableHeaderCell><TableHeaderCell>Amount</TableHeaderCell><TableHeaderCell>Method</TableHeaderCell><TableHeaderCell>Paid At</TableHeaderCell><TableHeaderCell>Collected By</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell></TableRow></TableHeader>
          <TableBody>{items.map((x) => <TableRow key={x.id}><TableCell>{x.id}</TableCell><TableCell>{x.invoiceId}</TableCell><TableCell>{x.studentName}</TableCell><TableCell>{x.amount.toLocaleString()}</TableCell><TableCell>{x.method}</TableCell><TableCell>{new Date(x.paidAt).toLocaleString()}</TableCell><TableCell>{x.collectedByUserName ?? '-'}</TableCell><TableCell><Badge appearance="filled" color={getPaymentStatusColor(x.status)}>{formatStatusLabel(x.status)}</Badge></TableCell></TableRow>)}</TableBody>
        </Table>
      </TableCard>
    </PageStack>
  )
}
