import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useAuthRoles } from '../../auth/useAuthRoles'
import {
  getAttendanceSummaryApi,
  getBranchesLiteApi,
  getDashboardOverviewApi,
  getLeadBySourceApi,
  getLeadSummaryApi,
  getMonthlyRevenueApi,
  getOverdueTasksApi,
  getRevenueSummaryApi,
  getRiskStudentsApi,
  getSalesPerformanceApi,
  getTaskSummaryApi,
} from '../api'
import type { AttendanceSummary, BranchLite, DashboardOverview, LeadBySource, LeadSummary, MonthlyRevenue, RevenueSummary, RiskStudent, SalesPerformance, TaskOverdue, TaskSummary } from '../types'

export function DashboardPage() {
  const roles = useAuthRoles()
  const isAdmin = roles.includes('Admin')
  const canSeeRevenue = roles.includes('Admin') || roles.includes('Manager')
  const canSeeSalesPerf = roles.includes('Admin') || roles.includes('Manager')
  const canSeeRisk = roles.includes('Admin') || roles.includes('Manager') || roles.includes('Teacher')

  const [branches, setBranches] = useState<BranchLite[]>([])
  const [branchId, setBranchId] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [leadSummary, setLeadSummary] = useState<LeadSummary | null>(null)
  const [leadBySource, setLeadBySource] = useState<LeadBySource[]>([])
  const [salesPerf, setSalesPerf] = useState<SalesPerformance[]>([])
  const [revenueSummary, setRevenueSummary] = useState<RevenueSummary | null>(null)
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([])
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null)
  const [riskStudents, setRiskStudents] = useState<RiskStudent[]>([])
  const [taskSummary, setTaskSummary] = useState<TaskSummary | null>(null)
  const [overdueTasks, setOverdueTasks] = useState<TaskOverdue[]>([])
  const [error, setError] = useState<string | null>(null)

  const scope = useMemo(() => ({ branchId: branchId ? Number(branchId) : undefined, fromDate: fromDate || undefined, toDate: toDate || undefined }), [branchId, fromDate, toDate])

  const load = async () => {
    try {
      setError(null)
      const nowYear = new Date().getFullYear()
      const [ov, ls, lbs, sp, rs, mr, ats, rsk, ts, ot] = await Promise.all([
        getDashboardOverviewApi(scope),
        getLeadSummaryApi(scope),
        getLeadBySourceApi(scope),
        getSalesPerformanceApi(scope),
        canSeeRevenue ? getRevenueSummaryApi(scope) : Promise.resolve(null),
        canSeeRevenue ? getMonthlyRevenueApi(nowYear) : Promise.resolve([]),
        getAttendanceSummaryApi(scope),
        canSeeRisk ? getRiskStudentsApi() : Promise.resolve([]),
        getTaskSummaryApi(scope),
        getOverdueTasksApi(scope),
      ])
      setOverview(ov); setLeadSummary(ls); setLeadBySource(lbs); setSalesPerf(sp)
      setRevenueSummary(rs); setMonthlyRevenue(mr); setAttendanceSummary(ats); setRiskStudents(rsk); setTaskSummary(ts); setOverdueTasks(ot)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard')
    }
  }

  useEffect(() => {
    void load()
    if (isAdmin) void (async () => setBranches(await getBranchesLiteApi()))()
  }, [])

  const cards = overview ? [
    ['Total Leads', overview.totalLeads],
    ['Converted Leads', overview.convertedLeads],
    ['Active Students', overview.activeStudents],
    ['Active Enrollments', overview.activeEnrollments],
    ['Total Revenue', overview.totalRevenue.toLocaleString()],
    ['Outstanding Amount', overview.outstandingAmount.toLocaleString()],
    ['Overdue Invoices', overview.overdueInvoices],
    ['Pending Tasks', overview.pendingFollowUpTasks],
    ['Today Sessions', overview.todaySessions],
  ] : []

  return (
    <>
      <div className="users-toolbar">
        <div className="users-filters">
          {isAdmin ? <select className="toolbar-select" value={branchId} onChange={(e)=>setBranchId(e.target.value)}><option value="">All branches</option>{branches.map((b)=><option key={b.id} value={b.id}>{b.name}</option>)}</select> : null}
          <input className="toolbar-input" type="date" value={fromDate} onChange={(e)=>setFromDate(e.target.value)} />
          <input className="toolbar-input" type="date" value={toDate} onChange={(e)=>setToDate(e.target.value)} />
          <button className="ms-button ms-button--secondary" onClick={()=>void load()}>Refresh</button>
        </div>
      </div>

      {error ? <p className="auth-error">{error}</p> : null}

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
        {cards.map(([label, value]) => <div key={String(label)} className="kpi-card"><span>{label}</span><strong>{String(value)}</strong></div>)}
      </div>

      <div className="detail-grid" style={{ marginBottom: 12 }}>
        <div style={{ gridColumn: '1 / -1' }}><strong>Lead By Source</strong></div>
        <div style={{ gridColumn: '1 / -1', height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leadBySource}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sourceName" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="totalLeads" fill="#117865" />
              <Bar dataKey="convertedLeads" fill="#0f5ea6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {canSeeRevenue ? (
        <div className="detail-grid" style={{ marginBottom: 12 }}>
          <div style={{ gridColumn: '1 / -1' }}><strong>Monthly Revenue</strong></div>
          <div style={{ gridColumn: '1 / -1', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#117865" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {revenueSummary ? <>
            <div>Total Invoice: {revenueSummary.totalInvoiceAmount.toLocaleString()}</div>
            <div>Total Paid: {revenueSummary.totalPaidAmount.toLocaleString()}</div>
            <div>Outstanding: {revenueSummary.outstandingAmount.toLocaleString()}</div>
            <div>Overdue: {revenueSummary.overdueAmount.toLocaleString()}</div>
          </> : null}
        </div>
      ) : null}

      <div className="detail-grid" style={{ marginBottom: 12 }}>
        <div><strong>Lead Conversion Rate:</strong> {Number(leadSummary?.conversionRate ?? 0).toFixed(2)}%</div>
        <div><strong>Attendance Rate:</strong> {Number(attendanceSummary?.averageAttendanceRate ?? 0).toFixed(2)}%</div>
        <div><strong>Pending Tasks:</strong> {taskSummary?.pendingTasks ?? 0}</div>
        <div><strong>Overdue Tasks:</strong> {taskSummary?.overdueTasks ?? 0}</div>
      </div>

      {canSeeSalesPerf ? (
        <>
          <h3>Sales Performance</h3>
          <table className="ms-table" style={{ marginBottom: 12 }}>
            <thead><tr><th>Sales</th><th>Assigned</th><th>Contacted</th><th>Converted</th><th>Lost</th><th>Conversion Rate</th></tr></thead>
            <tbody>{salesPerf.map((x)=><tr key={x.salesUserId}><td>{x.salesUserName}</td><td>{x.assignedLeads}</td><td>{x.contactedLeads}</td><td>{x.convertedLeads}</td><td>{x.lostLeads}</td><td>{Number(x.conversionRate).toFixed(2)}%</td></tr>)}</tbody>
          </table>
        </>
      ) : null}

      {canSeeRisk ? (
        <>
          <h3>Risk Students</h3>
          <table className="ms-table" style={{ marginBottom: 12 }}>
            <thead><tr><th>Student</th><th>Class</th><th>Total</th><th>Present</th><th>Late</th><th>Absent</th><th>Rate</th><th>Risk</th></tr></thead>
            <tbody>{riskStudents.map((x)=><tr key={`${x.studentId}-${x.classId}`}><td>{x.studentCode} - {x.studentName}</td><td>{x.className}</td><td>{x.totalSessions}</td><td>{x.presentCount}</td><td>{x.lateCount}</td><td>{x.absentCount}</td><td>{Number(x.attendanceRate).toFixed(2)}%</td><td>{x.attendanceRate < 50 ? 'High Risk' : x.attendanceRate < 70 ? 'Risk' : '-'}</td></tr>)}</tbody>
          </table>
        </>
      ) : null}

      <h3>Overdue Tasks</h3>
      <table className="ms-table">
        <thead><tr><th>Title</th><th>Assigned User</th><th>Due At</th></tr></thead>
        <tbody>{overdueTasks.map((x)=><tr key={x.id}><td>{x.title}</td><td>{x.assignedToUserName}</td><td>{new Date(x.dueAt).toLocaleString()}</td></tr>)}</tbody>
      </table>
    </>
  )
}
