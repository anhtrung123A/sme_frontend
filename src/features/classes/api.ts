import { apiRequest } from '../../lib/apiClient'
import type {
  ApiResponse,
  BranchLite,
  ClassDto,
  ClassScheduleDto,
  ClassSessionDto,
  CourseLite,
  GenerateSessionsResponse,
  PagedResult,
  RoomLite,
  UserLite,
} from './types'

function q(params: Record<string, string | number | undefined>) {
  const s = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') s.set(k, String(v))
  return s.toString()
}

export async function getClassesApi(params: { branchId?: number; courseId?: number; teacherUserId?: number; status?: string; page?: number; pageSize?: number } = {}) {
  const qs = q({ page: 1, pageSize: 20, ...params })
  const res = await apiRequest<ApiResponse<PagedResult<ClassDto>>>(`/classes?${qs}`)
  return res.data
}

export async function getClassApi(id: number) {
  const res = await apiRequest<ApiResponse<ClassDto>>(`/classes/${id}`)
  return res.data
}

export async function createClassApi(payload: Record<string, unknown>) {
  const res = await apiRequest<ApiResponse<ClassDto>>('/classes', { method: 'POST', body: payload })
  return res.data
}

export async function updateClassApi(id: number, payload: Record<string, unknown>) {
  const res = await apiRequest<ApiResponse<ClassDto>>(`/classes/${id}`, { method: 'PUT', body: payload })
  return res.data
}

export async function updateClassStatusApi(id: number, status: string) {
  const res = await apiRequest<ApiResponse<ClassDto>>(`/classes/${id}/status`, { method: 'PATCH', body: { status } })
  return res.data
}

export async function deleteClassApi(id: number) { await apiRequest(`/classes/${id}`, { method: 'DELETE' }) }

export async function getClassSchedulesApi(classId: number) {
  const res = await apiRequest<ApiResponse<ClassScheduleDto[]>>(`/classes/${classId}/schedules`)
  return res.data
}

export async function createClassScheduleApi(classId: number, payload: Record<string, unknown>) {
  const res = await apiRequest<ApiResponse<ClassScheduleDto>>(`/classes/${classId}/schedules`, { method: 'POST', body: payload })
  return res.data
}

export async function updateClassScheduleApi(classId: number, scheduleId: number, payload: Record<string, unknown>) {
  const res = await apiRequest<ApiResponse<ClassScheduleDto>>(`/classes/${classId}/schedules/${scheduleId}`, { method: 'PUT', body: payload })
  return res.data
}

export async function deleteClassScheduleApi(classId: number, scheduleId: number) {
  await apiRequest(`/classes/${classId}/schedules/${scheduleId}`, { method: 'DELETE' })
}

export async function generateSessionsApi(classId: number, payload: Record<string, unknown>) {
  const res = await apiRequest<ApiResponse<GenerateSessionsResponse>>(`/classes/${classId}/generate-sessions`, { method: 'POST', body: payload })
  return res.data
}

export async function getClassSessionsApi(classId: number, params: { fromDate?: string; toDate?: string; status?: string } = {}) {
  const qs = q(params)
  const res = await apiRequest<ApiResponse<ClassSessionDto[]>>(`/classes/${classId}/sessions${qs ? `?${qs}` : ''}`)
  return res.data
}

export async function getClassSessionApi(id: number) {
  const res = await apiRequest<ApiResponse<ClassSessionDto>>(`/class-sessions/${id}`)
  return res.data
}

export async function updateClassSessionApi(id: number, payload: Record<string, unknown>) {
  const res = await apiRequest<ApiResponse<ClassSessionDto>>(`/class-sessions/${id}`, { method: 'PUT', body: payload })
  return res.data
}

export async function updateClassSessionStatusApi(id: number, status: string) {
  const res = await apiRequest<ApiResponse<ClassSessionDto>>(`/class-sessions/${id}/status`, { method: 'PATCH', body: { status } })
  return res.data
}

export async function deleteClassSessionApi(id: number) { await apiRequest(`/class-sessions/${id}`, { method: 'DELETE' }) }

export async function getCoursesLiteApi(): Promise<CourseLite[]> {
  const res = await apiRequest<ApiResponse<PagedResult<CourseLite>>>('/courses?page=1&pageSize=100')
  return res.data.items
}

export async function getBranchesLiteApi(): Promise<BranchLite[]> {
  const res = await apiRequest<ApiResponse<PagedResult<BranchLite>>>('/branches?page=1&pageSize=100')
  return res.data.items
}

export async function getRoomsLiteApi(): Promise<RoomLite[]> {
  const res = await apiRequest<ApiResponse<PagedResult<RoomLite>>>('/rooms?page=1&pageSize=200')
  return res.data.items
}

export async function getUsersLiteApi(): Promise<UserLite[]> {
  const res = await apiRequest<ApiResponse<PagedResult<UserLite>>>('/users?page=1&pageSize=200')
  return res.data.items
}
