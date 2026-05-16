const colorByStatus: Record<string, string> = {
  unpaid: '#b38600',
  partially_paid: '#d97706',
  paid: '#117865',
  overdue: '#b42318',
  cancelled: '#6b7280',
}

export function InvoiceStatusBadge({ status }: { status: string }) {
  const color = colorByStatus[status] ?? '#6b7280'
  return <span style={{ color, border: `1px solid ${color}`, borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>{status}</span>
}
