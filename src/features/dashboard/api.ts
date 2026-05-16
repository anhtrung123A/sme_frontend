import { apiRequest } from '../../lib/apiClient'
import type {
  ApiResponse,
  AttendanceSummary,
  BranchLite,
  DashboardOverview,
  LeadBySource,
  LeadSummary,
  MonthlyRevenue,
  RevenueSummary,
  RiskStudent,
  SalesPerformance,
  TaskOverdue,
  TaskSummary,
} from './types'

function q(params: Record<string, string | number | undefined>) {
  const s = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') s.set(k, String(v))
  return s.toString()
}

function unwrap<T>(payload: T | ApiResponse<T>): T {
  if (payload && typeof payload === 'object' && 'data' in payload) return (payload as ApiResponse<T>).data
  return payload as T
}

type Scope = { branchId?: number; fromDate?: string; toDate?: string }

export async function getDashboardOverviewApi(scope: Scope = {}) {
  const res = await apiRequest<DashboardOverview | ApiResponse<DashboardOverview>>(`/dashboard/overview?${q(scope)}`)
  return unwrap(res)
}

export async function getLeadSummaryApi(scope: Scope = {}) {
  const res = await apiRequest<LeadSummary | ApiResponse<LeadSummary>>(`/analytics/leads/summary?${q(scope)}`)
  return unwrap(res)
}

export async function getLeadBySourceApi(scope: Scope = {}) {
  const res = await apiRequest<LeadBySource[] | ApiResponse<LeadBySource[]>>(`/analytics/leads/by-source?${q(scope)}`)
  return unwrap(res)
}

export async function getSalesPerformanceApi(scope: Scope = {}) {
  const res = await apiRequest<SalesPerformance[] | ApiResponse<SalesPerformance[]>>(`/analytics/leads/sales-performance?${q(scope)}`)
  return unwrap(res)
}

export async function getRevenueSummaryApi(scope: Scope = {}) {
  const res = await apiRequest<RevenueSummary | ApiResponse<RevenueSummary>>(`/analytics/revenue/summary?${q(scope)}`)
  return unwrap(res)
}

export async function getMonthlyRevenueApi(year: number) {
  const res = await apiRequest<MonthlyRevenue[] | ApiResponse<MonthlyRevenue[]>>(`/analytics/revenue/monthly?year=${year}`)
  return unwrap(res)
}

export async function getAttendanceSummaryApi(scope: Scope = {}) {
  const res = await apiRequest<AttendanceSummary | ApiResponse<AttendanceSummary>>(`/analytics/attendance/summary?${q(scope)}`)
  return unwrap(res)
}

export async function getRiskStudentsApi() {
  const res = await apiRequest<RiskStudent[] | ApiResponse<RiskStudent[]>>('/analytics/attendance/risk-students?threshold=70')
  return unwrap(res)
}

export async function getTaskSummaryApi(scope: Scope = {}) {
  const res = await apiRequest<TaskSummary | ApiResponse<TaskSummary>>(`/analytics/tasks/summary?${q(scope)}`)
  return unwrap(res)
}

export async function getOverdueTasksApi(scope: Scope = {}) {
  const res = await apiRequest<TaskOverdue[] | ApiResponse<TaskOverdue[]>>(`/analytics/tasks/overdue?${q(scope)}`)
  return unwrap(res)
}

export async function getBranchesLiteApi(): Promise<BranchLite[]> {
  const res = await apiRequest<{ items: BranchLite[] } | ApiResponse<{ items: BranchLite[] }>>('/branches?page=1&pageSize=200')
  return unwrap(res).items ?? []
}
