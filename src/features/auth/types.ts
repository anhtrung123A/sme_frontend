export type AuthUser = {
  id: number
  branchId: number | null
  branchName: string | null
  fullName: string
  email: string
  phone: string | null
  status: string
  lastLoginAtUtc: string | null
}

export type LoginRequest = {
  email: string
  password: string
}

export type AuthTokenResponse = {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAtUtc: string
}

export type RefreshTokenRequest = {
  refreshToken: string
}

type ApiEnvelope<T> = {
  success: boolean
  message: string
  data: T
  errors?: unknown
}

export type ApiResponse<T> = ApiEnvelope<T>
