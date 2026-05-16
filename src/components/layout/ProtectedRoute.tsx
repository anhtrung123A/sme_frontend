import type { ReactNode } from 'react'
import { useAuth } from '../../features/auth/hooks'
import { LoginPage } from '../../features/auth/pages/LoginPage'

type ProtectedRouteProps = {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <>{children}</>
}
