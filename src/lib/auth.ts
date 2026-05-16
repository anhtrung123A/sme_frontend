import type { AuthUser } from '../features/auth/types'

const ACCESS_TOKEN_KEY = 'sme_crm_access_token'
const REFRESH_TOKEN_KEY = 'sme_crm_refresh_token'
const CURRENT_USER_KEY = 'sme_crm_current_user'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setRefreshToken(token: string) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

export function clearRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function getCurrentUser(): AuthUser | null {
  const raw = localStorage.getItem(CURRENT_USER_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function setCurrentUser(user: AuthUser) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
}

export function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY)
}

export function clearAuthSession() {
  clearAccessToken()
  clearRefreshToken()
  clearCurrentUser()
}
