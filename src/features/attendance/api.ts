import { apiRequest } from '../../lib/apiClient'
import type { ApiResponse, ClassAttendanceSummaryItem, SessionAttendanceItem, StudentAttendanceHistoryItem } from './types'

function q(params: Record<string, string | number | undefined>) {
  const s = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') s.set(k, String(v))
  return s.toString()
}

function unwrap<T>(payload: T | ApiResponse<T>): T {
  if (payload && typeof payload === 'object' && 'data' in payload) return (payload as ApiResponse<T>).data
  return payload as T
}

export async function getSessionAttendanceApi(sessionId: number) {
  const res = await apiRequest<SessionAttendanceItem[] | ApiResponse<SessionAttendanceItem[]>>(`/class-sessions/${sessionId}/attendance`)
  return unwrap(res)
}

export async function bulkSaveAttendanceApi(sessionId: number, records: Array<{ studentId: number; status: string; note?: string | null }>) {
  const res = await apiRequest<SessionAttendanceItem[] | ApiResponse<SessionAttendanceItem[]>>(`/class-sessions/${sessionId}/attendance/bulk`, { method: 'POST', body: { records } })
  return unwrap(res)
}

export async function updateAttendanceRecordApi(id: number, status: string, note?: string | null) {
  const res = await apiRequest<unknown | ApiResponse<unknown>>(`/attendance-records/${id}`, { method: 'PUT', body: { status, note: note ?? null } })
  return unwrap(res)
}

export async function completeSessionApi(sessionId: number, payload: { topic?: string | null; note?: string | null }) {
  return apiRequest(`/class-sessions/${sessionId}/complete`, { method: 'PATCH', body: payload })
}

export async function getClassAttendanceSummaryApi(classId: number) {
  const res = await apiRequest<ClassAttendanceSummaryItem[] | ApiResponse<ClassAttendanceSummaryItem[]>>(`/classes/${classId}/attendance-summary`)
  return unwrap(res)
}

export async function getStudentAttendanceHistoryApi(studentId: number, params: { classId?: number; fromDate?: string; toDate?: string } = {}) {
  const res = await apiRequest<StudentAttendanceHistoryItem[] | ApiResponse<StudentAttendanceHistoryItem[]>>(`/students/${studentId}/attendance?${q(params)}`)
  return unwrap(res)
}
