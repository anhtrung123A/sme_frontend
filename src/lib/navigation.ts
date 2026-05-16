import { useEffect, useState } from 'react'

export function getCurrentPath(): string {
  return window.location.pathname || '/'
}

export function navigateTo(path: string, replace = false) {
  if (window.location.pathname === path) {
    return
  }

  if (replace) {
    window.history.replaceState({}, '', path)
  } else {
    window.history.pushState({}, '', path)
  }

  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function useCurrentPath() {
  const [path, setPath] = useState(getCurrentPath)

  useEffect(() => {
    const handleLocation = () => setPath(getCurrentPath())
    window.addEventListener('popstate', handleLocation)
    return () => window.removeEventListener('popstate', handleLocation)
  }, [])

  return path
}
