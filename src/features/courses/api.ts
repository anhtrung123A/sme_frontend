import { apiRequest } from '../../lib/apiClient'
import type { ApiResponse, CourseDto, PagedResult } from './types'

function q(params: Record<string, string | number | boolean | undefined>) {
  const s = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') s.set(k, String(v))
  return s.toString()
}

export async function getCoursesApi(params: { keyword?: string; isActive?: boolean; page?: number; pageSize?: number } = {}) {
  const qs = q({ page: 1, pageSize: 50, ...params })
  const res = await apiRequest<ApiResponse<PagedResult<CourseDto>>>(`/courses?${qs}`)
  return res.data
}

export async function getCourseApi(id: number) {
  const res = await apiRequest<ApiResponse<CourseDto>>(`/courses/${id}`)
  return res.data
}

export async function createCourseApi(payload: Record<string, unknown>) {
  const res = await apiRequest<ApiResponse<CourseDto>>('/courses', { method: 'POST', body: payload })
  return res.data
}

export async function updateCourseApi(id: number, payload: Record<string, unknown>) {
  const res = await apiRequest<ApiResponse<CourseDto>>(`/courses/${id}`, { method: 'PUT', body: payload })
  return res.data
}

export async function deleteCourseApi(id: number) {
  await apiRequest(`/courses/${id}`, { method: 'DELETE' })
}
