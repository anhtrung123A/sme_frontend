import { Badge } from '@fluentui/react-components'
import { formatStatusLabel } from '../../../lib/formatStatus'

function getEnrollmentStatusColor(status: string) {
  if (status === 'active' || status === 'completed') return 'success'
  if (status === 'pending' || status === 'waiting_payment') return 'warning'
  if (status === 'cancelled' || status === 'refunded' || status === 'dropped') return 'danger'
  if (status === 'transferred') return 'informative'
  return 'subtle'
}

export function EnrollmentStatusBadge({ status }: { status: string }) {
  return (
    <Badge appearance="filled" color={getEnrollmentStatusColor(status)}>
      {formatStatusLabel(status)}
    </Badge>
  )
}
