const toneMap: Record<string, string> = {
  pending: '#b38600',
  waiting_payment: '#d97706',
  active: '#117865',
  completed: '#2563eb',
  cancelled: '#b42318',
  suspended: '#6b7280',
  transferred: '#7c3aed',
  refunded: '#b42318',
  dropped: '#b42318',
}

export function EnrollmentStatusBadge({ status }: { status: string }) {
  const tone = toneMap[status] ?? '#6b7280'
  return <span style={{ color: tone, border: `1px solid ${tone}`, borderRadius: 999, padding: '2px 8px', fontSize: 12 }}>{status}</span>
}
