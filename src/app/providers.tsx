import { useEffect } from 'react'
import type { PropsWithChildren } from 'react'
import { FluentProvider, webLightTheme } from '@fluentui/react-components'
import { useAppDispatch } from './reduxHooks'
import { initializeAuth } from '../features/auth/authSlice'

export function AppProviders({ children }: PropsWithChildren) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    void dispatch(initializeAuth())
  }, [dispatch])

  return <FluentProvider theme={webLightTheme}>{children}</FluentProvider>
}
