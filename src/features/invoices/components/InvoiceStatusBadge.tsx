import { Badge } from '@fluentui/react-components'
import { formatStatusLabel } from '../../../lib/formatStatus'

function getInvoiceStatusColor(status: string) {
  if (status === 'paid') return 'success'
  if (status === 'unpaid' || status === 'partially_paid') return 'warning'
  if (status === 'overdue') return 'danger'
  return 'subtle'
}

export function InvoiceStatusBadge({ status }: { status: string }) {
  return (
    <Badge appearance="filled" color={getInvoiceStatusColor(status)}>
      {formatStatusLabel(status)}
    </Badge>
  )
}
