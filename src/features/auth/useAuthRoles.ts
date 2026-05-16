import { useMemo } from 'react'
import { getAccessToken } from '../../lib/auth'

function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(b64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    )
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

export function useAuthRoles() {
  return useMemo(() => {
    const token = getAccessToken()
    if (!token) return [] as string[]

    const payload = decodePayload(token)
    if (!payload) return [] as string[]

    const raw = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
    if (Array.isArray(raw)) return raw.map(String)
    if (typeof raw === 'string') return [raw]
    return [] as string[]
  }, [])
}
