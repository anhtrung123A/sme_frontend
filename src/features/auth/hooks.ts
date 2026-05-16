import { useAppDispatch, useAppSelector } from '../../app/reduxHooks'
import { clearLoginError, loginWithPassword, logout } from './authSlice'

export function useAuth() {
  const dispatch = useAppDispatch()
  const auth = useAppSelector((state) => state.auth)

  return {
    ...auth,
    login: (email: string, password: string) => dispatch(loginWithPassword({ email, password })),
    logout: () => dispatch(logout()),
    clearLoginError: () => dispatch(clearLoginError()),
  }
}
