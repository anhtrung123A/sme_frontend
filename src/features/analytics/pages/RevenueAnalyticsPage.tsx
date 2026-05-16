import { useEffect, useState } from 'react'
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getMonthlyRevenueApi, getRevenueSummaryApi } from '../../dashboard/api'
import type { MonthlyRevenue, RevenueSummary } from '../../dashboard/types'

export function RevenueAnalyticsPage() {
  const [summary, setSummary] = useState<RevenueSummary | null>(null)
  const [monthly, setMonthly] = useState<MonthlyRevenue[]>([])
  useEffect(() => { void (async () => { setSummary(await getRevenueSummaryApi()); setMonthly(await getMonthlyRevenueApi(new Date().getFullYear())) })() }, [])
  return (
    <>
      <div className="detail-grid">
        <div>Total Invoice: {summary?.totalInvoiceAmount.toLocaleString() ?? 0}</div>
        <div>Total Paid: {summary?.totalPaidAmount.toLocaleString() ?? 0}</div>
        <div>Outstanding: {summary?.outstandingAmount.toLocaleString() ?? 0}</div>
        <div>Overdue: {summary?.overdueAmount.toLocaleString() ?? 0}</div>
      </div>
      <div style={{ height: 320, background: '#fff', border: '1px solid #d1d1d1', borderRadius: 6, marginTop: 12, padding: 12 }}>
        <ResponsiveContainer width="100%" height="100%"><LineChart data={monthly}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Line type="monotone" dataKey="revenue" stroke="#117865" /></LineChart></ResponsiveContainer>
      </div>
    </>
  )
}
