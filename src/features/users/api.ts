import { apiRequest } from '../../lib/apiClient'
import type {
  ApiResponse,
  BranchDto,
  CreateUserPayload,
  PagedResult,
  RoleDto,
  UpdateUserPayload,
  UserDto,
  UserRoleDto,
} from './types'

type UserQuery = {
  search?: string
  branchId?: number
  status?: string
  page?: number
  pageSize?: number
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      query.set(key, String(value))
    }
  })

  return query.toString()
}

export async function getUsersApi(query: UserQuery = {}): Promise<PagedResult<UserDto>> {
  const qs = buildQuery({
    search: query.search,
    branchId: query.branchId,
    status: query.status,
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 50,
  })

  const response = await apiRequest<ApiResponse<PagedResult<UserDto>>>(`/users?${qs}`)
  return response.data
}

export async function getUserApi(id: number): Promise<UserDto> {
  const response = await apiRequest<ApiResponse<UserDto>>(`/users/${id}`)
  return response.data
}

export async function createUserApi(payload: CreateUserPayload): Promise<UserDto> {
  const response = await apiRequest<ApiResponse<UserDto>>('/users', {
    method: 'POST',
    body: payload,
  })

  return response.data
}

export async function updateUserApi(id: number, payload: UpdateUserPayload): Promise<UserDto> {
  const response = await apiRequest<ApiResponse<UserDto>>(`/users/${id}`, {
    method: 'PUT',
    body: payload,
  })

  return response.data
}

export async function updateUserStatusApi(id: number, status: string): Promise<UserDto> {
  const response = await apiRequest<ApiResponse<UserDto>>(`/users/${id}/status`, {
    method: 'PATCH',
    body: { status },
  })

  return response.data
}

export async function deleteUserApi(id: number): Promise<void> {
  await apiRequest(`/users/${id}`, { method: 'DELETE' })
}

export async function getRolesApi(): Promise<RoleDto[]> {
  const response = await apiRequest<ApiResponse<RoleDto[]>>('/roles')
  return response.data
}

export async function getBranchesApi(): Promise<BranchDto[]> {
  const qs = buildQuery({ page: 1, pageSize: 100 })
  const response = await apiRequest<ApiResponse<PagedResult<BranchDto>>>(`/branches?${qs}`)
  return response.data.items
}

export async function getUserRolesApi(userId: number): Promise<UserRoleDto[]> {
  const response = await apiRequest<ApiResponse<UserRoleDto[]>>(`/users/${userId}/roles`)
  return response.data
}

export async function updateUserRolesApi(userId: number, roleIds: number[]): Promise<UserRoleDto[]> {
  const response = await apiRequest<ApiResponse<UserRoleDto[]>>(`/users/${userId}/roles`, {
    method: 'PUT',
    body: { roleIds },
  })

  return response.data
}
