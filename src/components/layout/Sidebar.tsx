import { useAuth } from '../../features/auth/hooks'
import { navigateTo, useCurrentPath } from '../../lib/navigation'

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Users', path: '/users' },
  { label: 'Roles', path: '/roles' },
  { label: 'Branches', path: '/branches' },
  { label: 'Rooms', path: '/rooms' },
  { label: 'Profile', path: '/profile' },
]

export function Sidebar() {
  const { logout, currentUser } = useAuth()
  const currentPath = useCurrentPath()

  const isActive = (path: string) => {
    if (path === '/users') {
      return currentPath === '/users' || currentPath === '/users/create' || /\/users\/[^/]+\/edit$/.test(currentPath)
    }
    return currentPath === path
  }

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">SME CRM Central</div>

      {navItems.map((item) => (
        <a
          key={item.path}
          href={item.path}
          className={`nav-item ${isActive(item.path) ? 'active' : ''}`.trim()}
          onClick={(event) => {
            event.preventDefault()
            navigateTo(item.path)
          }}
        >
          {item.label}
        </a>
      ))}

      <div className="sidebar-footer">
        {currentUser ? <div className="sidebar-user">{currentUser.fullName}</div> : null}
        <button
          className="ms-button ms-button--secondary sidebar-logout"
          type="button"
          onClick={async () => {
            await logout()
            navigateTo('/login', true)
          }}
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}
