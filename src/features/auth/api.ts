import { apiRequest } from '../../lib/apiClient'
import type {
  ApiResponse,
  AuthTokenResponse,
  AuthUser,
  LoginRequest,
  RefreshTokenRequest,
} from './types'

export async function loginApi(payload: LoginRequest): Promise<AuthTokenResponse> {
  const response = await apiRequest<ApiResponse<AuthTokenResponse>>('/auth/login', {
    method: 'POST',
    withAuth: false,
    body: payload,
  })

  return response.data
}

export async function getMeApi(): Promise<AuthUser> {
  const response = await apiRequest<ApiResponse<AuthUser>>('/auth/me')
  return response.data
}

export async function refreshTokenApi(payload: RefreshTokenRequest): Promise<AuthTokenResponse> {
  const response = await apiRequest<ApiResponse<AuthTokenResponse>>('/auth/refresh-token', {
    method: 'POST',
    withAuth: false,
    body: payload,
  })

  return response.data
}

export async function logoutApi(refreshToken: string | null): Promise<void> {
  await apiRequest<ApiResponse<{ message: string }>>('/auth/logout', {
    method: 'POST',
    body: refreshToken ? { refreshToken } : {},
  })
}
