import type { LucideIcon } from 'lucide-react'
import {
  Building2,
  LayoutDashboard,
  Shield,
  User,
  Users,
  Warehouse,
} from 'lucide-react'
import { navigateTo, useCurrentPath } from '../../lib/navigation'

type SidebarProps = {
  isCollapsed: boolean
}

type NavItem = {
  label: string
  path: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Users', path: '/users', icon: Users },
  { label: 'Roles', path: '/roles', icon: Shield },
  { label: 'Branches', path: '/branches', icon: Building2 },
  { label: 'Rooms', path: '/rooms', icon: Warehouse },
  { label: 'Profile', path: '/profile', icon: User },
]

export function Sidebar({ isCollapsed }: SidebarProps) {
  const currentPath = useCurrentPath()

  const isActive = (path: string) => {
    if (path === '/users') {
      return currentPath === '/users' || currentPath === '/users/create' || /\/users\/[^/]+\/edit$/.test(currentPath)
    }
    return currentPath === path
  }

  return (
    <nav className={`left-sidebar ${isCollapsed ? 'collapsed' : ''}`.trim()}>
      <div className="sidebar-menu">
        {navItems.map((item) => {
          const ItemIcon = item.icon

          return (
            <a
              key={item.path}
              href={item.path}
              className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`.trim()}
              onClick={(event) => {
                event.preventDefault()
                navigateTo(item.path)
              }}
            >
              <span className="sidebar-icon" aria-hidden="true">
                <ItemIcon size={16} />
              </span>
              <span className="sidebar-label">{item.label}</span>
            </a>
          )
        })}
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-workspace">My workspace</div>
      </div>
    </nav>
  )
}

