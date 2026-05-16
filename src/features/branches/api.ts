import { apiRequest } from '../../lib/apiClient'
import type { ApiResponse, BranchDto, BranchPayload, PagedResult } from './types'

export async function getBranchesApi(): Promise<BranchDto[]> {
  const response = await apiRequest<ApiResponse<PagedResult<BranchDto>>>('/branches?page=1&pageSize=100')
  return response.data.items
}

export async function getBranchApi(id: number): Promise<BranchDto> {
  const response = await apiRequest<ApiResponse<BranchDto>>(`/branches/${id}`)
  return response.data
}

export async function createBranchApi(payload: BranchPayload): Promise<BranchDto> {
  const response = await apiRequest<ApiResponse<BranchDto>>('/branches', {
    method: 'POST',
    body: payload,
  })

  return response.data
}

export async function updateBranchApi(id: number, payload: BranchPayload): Promise<BranchDto> {
  const response = await apiRequest<ApiResponse<BranchDto>>(`/branches/${id}`, {
    method: 'PUT',
    body: payload,
  })

  return response.data
}

export async function deleteBranchApi(id: number): Promise<void> {
  await apiRequest(`/branches/${id}`, { method: 'DELETE' })
}
