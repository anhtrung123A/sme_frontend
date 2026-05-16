import { apiRequest } from '../../lib/apiClient'
import type { ApiResponse, BranchLite, ClassLite, CourseLite, EnrollmentDto, PagedResult, StudentLite, UserLite } from './types'

function q(params: Record<string, string | number | undefined>) {
  const s = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') s.set(k, String(v))
  return s.toString()
}

function unwrap<T>(payload: T | ApiResponse<T>): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as ApiResponse<T>).data
  }
  return payload as T
}

export async function getEnrollmentsApi(params: {
  studentId?: number
  courseId?: number
  classId?: number
  salesUserId?: number
  branchId?: number
  status?: string
  page?: number
  pageSize?: number
} = {}) {
  const qs = q({ page: 1, pageSize: 20, ...params })
  const res = await apiRequest<PagedResult<EnrollmentDto> | ApiResponse<PagedResult<EnrollmentDto>>>(`/enrollments?${qs}`)
  return unwrap(res)
}

export async function getEnrollmentApi(id: number) {
  const res = await apiRequest<EnrollmentDto | ApiResponse<EnrollmentDto>>(`/enrollments/${id}`)
  return unwrap(res)
}

export async function createEnrollmentApi(payload: Record<string, unknown>) {
  const res = await apiRequest<EnrollmentDto | ApiResponse<EnrollmentDto>>('/enrollments', { method: 'POST', body: payload })
  return unwrap(res)
}

export async function updateEnrollmentApi(id: number, payload: Record<string, unknown>) {
  const res = await apiRequest<EnrollmentDto | ApiResponse<EnrollmentDto>>(`/enrollments/${id}`, { method: 'PUT', body: payload })
  return unwrap(res)
}

export async function assignEnrollmentClassApi(id: number, classId: number | null) {
  const res = await apiRequest<EnrollmentDto | ApiResponse<EnrollmentDto>>(`/enrollments/${id}/assign-class`, { method: 'PATCH', body: { classId } })
  return unwrap(res)
}

export async function updateEnrollmentStatusApi(id: number, status: string, note?: string) {
  const res = await apiRequest<EnrollmentDto | ApiResponse<EnrollmentDto>>(`/enrollments/${id}/status`, { method: 'PATCH', body: { status, note: note || null } })
  return unwrap(res)
}

export async function deleteEnrollmentApi(id: number) {
  await apiRequest(`/enrollments/${id}`, { method: 'DELETE' })
}

export async function getStudentEnrollmentsApi(studentId: number) {
  const res = await apiRequest<EnrollmentDto[] | ApiResponse<EnrollmentDto[]>>(`/students/${studentId}/enrollments`)
  return unwrap(res)
}

export async function getStudentsLiteApi(): Promise<StudentLite[]> {
  const res = await apiRequest<PagedResult<StudentLite> | ApiResponse<PagedResult<StudentLite>>>('/students?page=1&pageSize=200')
  return unwrap(res).items
}

export async function getCoursesLiteApi(): Promise<CourseLite[]> {
  const res = await apiRequest<PagedResult<CourseLite> | ApiResponse<PagedResult<CourseLite>>>('/courses?page=1&pageSize=200')
  return unwrap(res).items
}

export async function getClassesLiteApi(params: { courseId?: number; branchId?: number; status?: string } = {}): Promise<ClassLite[]> {
  const qs = q({ page: 1, pageSize: 200, ...params })
  const res = await apiRequest<PagedResult<ClassLite> | ApiResponse<PagedResult<ClassLite>>>(`/classes?${qs}`)
  return unwrap(res).items
}

export async function getUsersLiteApi(): Promise<UserLite[]> {
  const res = await apiRequest<PagedResult<UserLite> | ApiResponse<PagedResult<UserLite>>>('/users?page=1&pageSize=200')
  return unwrap(res).items
}

export async function getBranchesLiteApi(): Promise<BranchLite[]> {
  const res = await apiRequest<PagedResult<BranchLite> | ApiResponse<PagedResult<BranchLite>>>('/branches?page=1&pageSize=100')
  return unwrap(res).items
}
