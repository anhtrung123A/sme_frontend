export type ApiResponse<T> = { success: boolean; message: string; data: T; errors?: unknown }

export type DashboardOverview = {
  totalLeads: number
  newLeads: number
  convertedLeads: number
  totalStudents: number
  activeStudents: number
  totalEnrollments: number
  activeEnrollments: number
  totalRevenue: number
  outstandingAmount: number
  overdueInvoices: number
  pendingFollowUpTasks: number
  todaySessions: number
}

export type LeadSummary = {
  totalLeads: number
  newLeads: number
  contactedLeads: number
  interestedLeads: number
  trialScheduledLeads: number
  enrolledLeads: number
  lostLeads: number
  conversionRate: number
}

export type LeadBySource = { sourceName: string; totalLeads: number; convertedLeads: number; conversionRate: number }
export type SalesPerformance = { salesUserId: number; salesUserName: string; assignedLeads: number; contactedLeads: number; convertedLeads: number; lostLeads: number; conversionRate: number }
export type RevenueSummary = { totalInvoiceAmount: number; totalPaidAmount: number; outstandingAmount: number; overdueAmount: number; paidInvoiceCount: number; unpaidInvoiceCount: number; partiallyPaidInvoiceCount: number; overdueInvoiceCount: number }
export type MonthlyRevenue = { month: number; revenue: number }
export type AttendanceSummary = { totalSessions: number; completedSessions: number; totalAttendanceRecords: number; presentCount: number; lateCount: number; absentCount: number; excusedCount: number; averageAttendanceRate: number }
export type RiskStudent = { studentId: number; studentCode: string; studentName: string; classId: number; className: string; totalSessions: number; presentCount: number; lateCount: number; absentCount: number; attendanceRate: number }
export type TaskSummary = { totalTasks: number; pendingTasks: number; completedTasks: number; cancelledTasks: number; overdueTasks: number }
export type TaskOverdue = { id: number; title: string; dueAt: string; assignedToUserId: number; assignedToUserName: string }
export type BranchLite = { id: number; name: string }
