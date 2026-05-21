import { useEffect, useState } from 'react'
import {
  Button,
  Field,
  Input,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
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
import { MoreHorizontalRegular } from '@fluentui/react-icons'
import { navigateTo } from '../../../lib/navigation'
import { Pagination } from '../../../components/ui/Pagination'
import { FilterGroup, FilterItem, PageStack, PageToolbar, TableCard } from '../../../components/ui/FluentPage'
import { getInvoicesApi } from '../api'
import { InvoiceStatusBadge } from '../components/InvoiceStatusBadge'
import type { InvoiceDto } from '../types'

export function InvoiceListPage() {
  const pageSize = 20
  const [items, setItems] = useState<InvoiceDto[]>([])
  const [status, setStatus] = useState('')
  const [dueFrom, setDueFrom] = useState('')
  const [dueTo, setDueTo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const load = async (nextPage = page) => {
    try {
      const data = await getInvoicesApi({ status: status || undefined, dueFrom: dueFrom || undefined, dueTo: dueTo || undefined, page: nextPage, pageSize })
      setItems(Array.isArray(data.items) ? data.items : [])
      setPage(data.pageNumber)
      setTotalCount(data.totalCount)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load invoices')
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
                {['unpaid', 'partially_paid', 'paid', 'overdue', 'cancelled'].map((x) => <option key={x} value={x}>{x}</option>)}
              </Select>
            </Field>
          </FilterItem>
          <FilterItem><Field label="Due from"><Input type="date" value={dueFrom} onChange={(_, d) => setDueFrom(d.value)} /></Field></FilterItem>
          <FilterItem><Field label="Due to"><Input type="date" value={dueTo} onChange={(_, d) => setDueTo(d.value)} /></Field></FilterItem>
          <Button appearance="secondary" onClick={() => void load(1)}>Apply</Button>
        </FilterGroup>
      </PageToolbar>
      {error ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar> : null}
      <TableCard title="Invoices" subtitle={`${totalCount.toLocaleString()} total invoices`} footer={<Pagination page={page} pageSize={pageSize} totalCount={totalCount} onPageChange={(p) => void load(p)} />}>
        <Table aria-label="Invoices table">
          <TableHeader><TableRow><TableHeaderCell>Invoice code</TableHeaderCell><TableHeaderCell>Student</TableHeaderCell><TableHeaderCell>Enrollment</TableHeaderCell><TableHeaderCell>Amount</TableHeaderCell><TableHeaderCell>Paid amount</TableHeaderCell><TableHeaderCell>Remaining</TableHeaderCell><TableHeaderCell>Due date</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell><TableHeaderCell>Actions</TableHeaderCell></TableRow></TableHeader>
          <TableBody>{items.map((x) => <TableRow key={x.id}><TableCell>{x.invoiceCode}</TableCell><TableCell>{x.studentName}</TableCell><TableCell>{x.enrollmentId}</TableCell><TableCell>{x.amount.toLocaleString()}</TableCell><TableCell>{x.paidAmount.toLocaleString()}</TableCell><TableCell>{x.remainingAmount.toLocaleString()}</TableCell><TableCell>{x.dueDate ?? '-'}</TableCell><TableCell><InvoiceStatusBadge status={x.status} /></TableCell><TableCell><Menu positioning="below-end"><MenuTrigger disableButtonEnhancement><Button size="small" appearance="subtle" icon={<MoreHorizontalRegular />} aria-label="More actions" /></MenuTrigger><MenuPopover><MenuList><MenuItem onClick={() => navigateTo(`/invoices/${x.id}`)}>View</MenuItem></MenuList></MenuPopover></Menu></TableCell></TableRow>)}</TableBody>
        </Table>
      </TableCard>
    </PageStack>
  )
}
