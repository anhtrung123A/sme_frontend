import { apiRequest } from '../../lib/apiClient'
import type { ApiResponse, BranchDto, PagedResult, StudentDto } from './types'

function qs(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') q.set(k, String(v))
  }
  return q.toString()
}

export async function getStudentsApi(params: {
  keyword?: string
  status?: string
  branchId?: number
  page?: number
  pageSize?: number
}): Promise<PagedResult<StudentDto>> {
  const query = qs({ page: 1, pageSize: 20, ...params })
  const res = await apiRequest<ApiResponse<PagedResult<StudentDto>>>(`/students?${query}`)
  return res.data
}

export async function getStudentApi(id: number): Promise<StudentDto> {
  const res = await apiRequest<ApiResponse<StudentDto>>(`/students/${id}`)
  return res.data
}

export async function createStudentApi(payload: Record<string, unknown>): Promise<StudentDto> {
  const res = await apiRequest<ApiResponse<StudentDto>>('/students', { method: 'POST', body: payload })
  return res.data
}

export async function updateStudentApi(id: number, payload: Record<string, unknown>): Promise<StudentDto> {
  const res = await apiRequest<ApiResponse<StudentDto>>(`/students/${id}`, { method: 'PUT', body: payload })
  return res.data
}

export async function updateStudentStatusApi(id: number, status: string): Promise<StudentDto> {
  const res = await apiRequest<ApiResponse<StudentDto>>(`/students/${id}/status`, {
    method: 'PATCH',
    body: { status },
  })
  return res.data
}

export async function deleteStudentApi(id: number): Promise<void> {
  await apiRequest(`/students/${id}`, { method: 'DELETE' })
}

export async function getBranchesApi(): Promise<BranchDto[]> {
  const res = await apiRequest<ApiResponse<PagedResult<BranchDto>>>('/branches?page=1&pageSize=100')
  return res.data.items
}
