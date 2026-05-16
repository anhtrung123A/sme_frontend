import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from './auth'

const API_BASE_URL = 'http://localhost:8080/api/v1'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  withAuth?: boolean
}

let refreshInFlight: Promise<string | null> | null = null

function extractErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== 'object') {
    return 'Request failed'
  }

  const typedPayload = payload as {
    message?: string
    data?: { message?: string }
  }

  return typedPayload.data?.message ?? typedPayload.message ?? 'Request failed'
}

async function requestNewAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    return null
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    return null
  }

  const data = payload?.data
  const nextAccessToken = data?.accessToken
  const nextRefreshToken = data?.refreshToken

  if (!nextAccessToken || !nextRefreshToken) {
    return null
  }

  setAccessToken(nextAccessToken)
  setRefreshToken(nextRefreshToken)
  return nextAccessToken
}

async function getRefreshedToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = requestNewAccessToken().finally(() => {
      refreshInFlight = null
    })
  }

  return refreshInFlight
}

async function fetchWithAuth(path: string, options: RequestOptions, token?: string | null) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (options.withAuth !== false) {
    const effectiveToken = token ?? getAccessToken()
    if (effectiveToken) {
      headers.Authorization = `Bearer ${effectiveToken}`
    }
  }

  return fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response = await fetchWithAuth(path, options)
  let payload = await response.json().catch(() => null)

  if (response.status === 401 && options.withAuth !== false) {
    const refreshedToken = await getRefreshedToken()
    if (refreshedToken) {
      response = await fetchWithAuth(path, options, refreshedToken)
      payload = await response.json().catch(() => null)
    } else {
      clearAuthSession()
    }
  }

  if (!response.ok) {
    throw new Error(extractErrorMessage(payload))
  }

  return payload as T
}
