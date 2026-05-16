import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getLeadBySourceApi, getLeadSummaryApi, getSalesPerformanceApi } from '../../dashboard/api'
import type { LeadBySource, LeadSummary, SalesPerformance } from '../../dashboard/types'

export function LeadAnalyticsPage() {
  const [summary, setSummary] = useState<LeadSummary | null>(null)
  const [bySource, setBySource] = useState<LeadBySource[]>([])
  const [sales, setSales] = useState<SalesPerformance[]>([])

  useEffect(() => { void (async () => { setSummary(await getLeadSummaryApi()); setBySource(await getLeadBySourceApi()); setSales(await getSalesPerformanceApi()) })() }, [])

  return (
    <>
      <div className="detail-grid">
        <div>Total Leads: {summary?.totalLeads ?? 0}</div><div>New: {summary?.newLeads ?? 0}</div><div>Enrolled: {summary?.enrolledLeads ?? 0}</div><div>Conversion: {Number(summary?.conversionRate ?? 0).toFixed(2)}%</div>
      </div>
      <div style={{ height: 280, background: '#fff', border: '1px solid #d1d1d1', borderRadius: 6, marginTop: 12, padding: 12 }}>
        <ResponsiveContainer width="100%" height="100%"><BarChart data={bySource}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="sourceName" /><YAxis /><Tooltip /><Bar dataKey="totalLeads" fill="#117865" /></BarChart></ResponsiveContainer>
      </div>
      <table className="ms-table" style={{ marginTop: 12 }}>
        <thead><tr><th>Sales</th><th>Assigned</th><th>Contacted</th><th>Converted</th><th>Lost</th><th>Conversion</th></tr></thead>
        <tbody>{sales.map((x)=><tr key={x.salesUserId}><td>{x.salesUserName}</td><td>{x.assignedLeads}</td><td>{x.contactedLeads}</td><td>{x.convertedLeads}</td><td>{x.lostLeads}</td><td>{Number(x.conversionRate).toFixed(2)}%</td></tr>)}</tbody>
      </table>
    </>
  )
}
