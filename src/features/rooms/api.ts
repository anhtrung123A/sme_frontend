import { apiRequest } from '../../lib/apiClient'
import type { ApiResponse, BranchDto, PagedResult, RoomDto, RoomPayload } from './types'

function buildQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value))
    }
  })

  return query.toString()
}

export async function getRoomsApi(branchId?: number): Promise<RoomDto[]> {
  const qs = buildQuery({ page: 1, pageSize: 100, branchId })
  const response = await apiRequest<ApiResponse<PagedResult<RoomDto>>>(`/rooms?${qs}`)
  return response.data.items
}

export async function getRoomApi(id: number): Promise<RoomDto> {
  const response = await apiRequest<ApiResponse<RoomDto>>(`/rooms/${id}`)
  return response.data
}

export async function createRoomApi(payload: RoomPayload): Promise<RoomDto> {
  const response = await apiRequest<ApiResponse<RoomDto>>('/rooms', {
    method: 'POST',
    body: payload,
  })

  return response.data
}

export async function updateRoomApi(id: number, payload: RoomPayload): Promise<RoomDto> {
  const response = await apiRequest<ApiResponse<RoomDto>>(`/rooms/${id}`, {
    method: 'PUT',
    body: payload,
  })

  return response.data
}

export async function deleteRoomApi(id: number): Promise<void> {
  await apiRequest(`/rooms/${id}`, { method: 'DELETE' })
}

export async function getBranchesApi(): Promise<BranchDto[]> {
  const response = await apiRequest<ApiResponse<PagedResult<BranchDto>>>('/branches?page=1&pageSize=100')
  return response.data.items
}
