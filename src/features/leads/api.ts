import { apiRequest } from '../../lib/apiClient'
import type {
  ApiResponse,
  BranchDto,
  FollowUpTaskDto,
  LeadActivityDto,
  LeadDto,
  LeadSourceDto,
  PagedResult,
  UserLite,
} from './types'

function toQuery(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') q.set(k, String(v))
  }
  return q.toString()
}

export async function getLeadsApi(params: {
  keyword?: string
  status?: string
  sourceId?: number
  assignedToUserId?: number
  branchId?: number
  page?: number
  pageSize?: number
}): Promise<PagedResult<LeadDto>> {
  const qs = toQuery({ page: 1, pageSize: 20, ...params })
  const res = await apiRequest<ApiResponse<PagedResult<LeadDto>>>(`/leads?${qs}`)
  return res.data
}

export async function getLeadApi(id: number): Promise<LeadDto> {
  const res = await apiRequest<ApiResponse<LeadDto>>(`/leads/${id}`)
  return res.data
}

export async function createLeadApi(payload: Record<string, unknown>): Promise<LeadDto> {
  const res = await apiRequest<ApiResponse<LeadDto>>('/leads', { method: 'POST', body: payload })
  return res.data
}

export async function updateLeadApi(id: number, payload: Record<string, unknown>): Promise<LeadDto> {
  const res = await apiRequest<ApiResponse<LeadDto>>(`/leads/${id}`, { method: 'PUT', body: payload })
  return res.data
}

export async function deleteLeadApi(id: number): Promise<void> {
  await apiRequest(`/leads/${id}`, { method: 'DELETE' })
}

export async function assignLeadApi(id: number, assignedToUserId: number): Promise<LeadDto> {
  const res = await apiRequest<ApiResponse<LeadDto>>(`/leads/${id}/assign`, {
    method: 'PATCH',
    body: { assignedToUserId },
  })
  return res.data
}

export async function changeLeadStatusApi(id: number, status: string, lostReason?: string): Promise<LeadDto> {
  const res = await apiRequest<ApiResponse<LeadDto>>(`/leads/${id}/status`, {
    method: 'PATCH',
    body: { status, lostReason },
  })
  return res.data
}

export async function getLeadActivitiesApi(leadId: number): Promise<LeadActivityDto[]> {
  const res = await apiRequest<ApiResponse<LeadActivityDto[]>>(`/leads/${leadId}/activities`)
  return res.data
}

export async function createLeadActivityApi(
  leadId: number,
  payload: { type: string; content: string; contactedAt?: string },
): Promise<LeadActivityDto> {
  const res = await apiRequest<ApiResponse<LeadActivityDto>>(`/leads/${leadId}/activities`, {
    method: 'POST',
    body: payload,
  })
  return res.data
}

export async function getLeadSourcesApi(): Promise<LeadSourceDto[]> {
  const res = await apiRequest<ApiResponse<LeadSourceDto[]>>('/lead-sources')
  return res.data
}

export async function getBranchesApi(): Promise<BranchDto[]> {
  const res = await apiRequest<ApiResponse<PagedResult<BranchDto>>>('/branches?page=1&pageSize=100')
  return res.data.items
}

export async function getSalesUsersApi(): Promise<UserLite[]> {
  const res = await apiRequest<ApiResponse<PagedResult<UserLite>>>('/users?page=1&pageSize=100')
  return res.data.items
}

export async function getLeadTasksApi(leadId: number): Promise<FollowUpTaskDto[]> {
  const res = await apiRequest<ApiResponse<PagedResult<FollowUpTaskDto>>>(
    `/follow-up-tasks?page=1&pageSize=100&leadId=${leadId}`,
  )
  return res.data.items
}

export async function createLeadTaskApi(payload: {
  leadId: number
  assignedToUserId: number
  title: string
  description?: string
  dueAt: string
}): Promise<FollowUpTaskDto> {
  const res = await apiRequest<ApiResponse<FollowUpTaskDto>>('/follow-up-tasks', {
    method: 'POST',
    body: payload,
  })
  return res.data
}

export async function completeTaskApi(id: number): Promise<FollowUpTaskDto> {
  const res = await apiRequest<ApiResponse<FollowUpTaskDto>>(`/follow-up-tasks/${id}/complete`, { method: 'PATCH' })
  return res.data
}

export async function cancelTaskApi(id: number): Promise<FollowUpTaskDto> {
  const res = await apiRequest<ApiResponse<FollowUpTaskDto>>(`/follow-up-tasks/${id}/cancel`, { method: 'PATCH' })
  return res.data
}
