export type ApiResponse<T> = { success: boolean; message: string; data: T; errors?: unknown }

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused'

export type SessionAttendanceItem = {
  studentId: number
  studentCode: string
  studentName: string
  status: AttendanceStatus | null
  note: string | null
  markedAt: string | null
  markedByUserId: number | null
}

export type ClassAttendanceSummaryItem = {
  studentId: number
  studentCode: string
  studentName: string
  totalSessions: number
  presentCount: number
  lateCount: number
  absentCount: number
  excusedCount: number
  attendanceRate: number
}

export type StudentAttendanceHistoryItem = {
  sessionDate: string
  className: string
  courseName: string
  status: string | null
  note: string | null
  markedAt: string | null
}
