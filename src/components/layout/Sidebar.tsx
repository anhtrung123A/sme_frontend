import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  Building2,
  GraduationCap,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Shield,
  ClipboardCheck,
  Receipt,
  HandCoins,
  User,
  Users,
  Warehouse,
  School,
  CalendarCheck2,
} from 'lucide-react'
import { useAuthRoles } from '../../features/auth/useAuthRoles'
import { navigateTo, useCurrentPath } from '../../lib/navigation'

type SidebarProps = { isCollapsed: boolean }

type NavItem = { label: string; path: string; icon: LucideIcon; roles?: string[] }

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Users', path: '/users', icon: Users, roles: ['Admin', 'Manager'] },
  { label: 'Roles', path: '/roles', icon: Shield, roles: ['Admin'] },
  { label: 'Branches', path: '/branches', icon: Building2, roles: ['Admin', 'Manager'] },
  { label: 'Rooms', path: '/rooms', icon: Warehouse, roles: ['Admin', 'Manager', 'Sales', 'Teacher'] },
  { label: 'Courses', path: '/courses', icon: BookOpen, roles: ['Admin', 'Manager', 'Sales'] },
  { label: 'Classes', path: '/classes', icon: School, roles: ['Admin', 'Manager', 'Sales', 'Teacher'] },
  { label: 'Leads', path: '/leads', icon: Megaphone, roles: ['Admin', 'Manager', 'Sales'] },
  { label: 'Students', path: '/students', icon: GraduationCap, roles: ['Admin', 'Manager', 'Sales'] },
  { label: 'Follow-up Tasks', path: '/follow-up-tasks', icon: ListChecks, roles: ['Admin', 'Manager', 'Sales'] },
  { label: 'Lead Sources', path: '/lead-sources', icon: Building2, roles: ['Admin', 'Manager'] },
  { label: 'Enrollments', path: '/enrollments', icon: ClipboardCheck, roles: ['Admin', 'Manager', 'Sales'] },
  { label: 'Invoices', path: '/invoices', icon: Receipt, roles: ['Admin', 'Manager', 'Sales'] },
  { label: 'Payments', path: '/payments', icon: HandCoins, roles: ['Admin', 'Manager'] },
  { label: 'My Sessions', path: '/teacher/my-sessions', icon: CalendarCheck2, roles: ['Admin', 'Manager', 'Teacher'] },
  { label: 'Profile', path: '/profile', icon: User },
]

export function Sidebar({ isCollapsed }: SidebarProps) {
  const currentPath = useCurrentPath()
  const roles = useAuthRoles()
  const visibleItems = navItems.filter((item) => !item.roles || item.roles.some((r) => roles.includes(r)))

  const isActive = (path: string) => {
    if (path === '/users') return currentPath === '/users' || currentPath === '/users/create' || /\/users\/[^/]+\/edit$/.test(currentPath)
    if (path === '/leads') return currentPath === '/leads' || currentPath === '/leads/create' || /\/leads\/[^/]+(\/edit)?$/.test(currentPath)
    if (path === '/students') return currentPath === '/students' || currentPath === '/students/create' || /\/students\/[^/]+(\/edit|\/enrollments|\/invoices|\/payments|\/attendance)?$/.test(currentPath)
    if (path === '/courses') return currentPath === '/courses' || /\/courses\/[^/]+\/edit$/.test(currentPath)
    if (path === '/classes') return currentPath === '/classes' || currentPath === '/classes/create' || /\/classes\/[^/]+(\/edit|\/sessions)?$/.test(currentPath)
    if (path === '/enrollments') return currentPath === '/enrollments' || currentPath === '/enrollments/create' || /\/enrollments\/[^/]+(\/edit)?$/.test(currentPath)
    if (path === '/invoices') return currentPath === '/invoices' || /\/invoices\/[^/]+$/.test(currentPath)
    if (path === '/payments') return currentPath === '/payments' || /\/students\/[^/]+\/payments$/.test(currentPath)
    if (path === '/teacher/my-sessions') return currentPath === '/teacher/my-sessions' || /\/attendance\/sessions\/[^/]+$/.test(currentPath)
    return currentPath === path
  }

  return (
    <nav className={`left-sidebar ${isCollapsed ? 'collapsed' : ''}`.trim()}>
      <div className="sidebar-menu">
        {visibleItems.map((item) => {
          const ItemIcon = item.icon
          return (
            <a key={item.path} href={item.path} className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`.trim()} onClick={(event) => { event.preventDefault(); navigateTo(item.path) }}>
              <span className="sidebar-icon" aria-hidden="true"><ItemIcon size={16} /></span>
              <span className="sidebar-label">{item.label}</span>
            </a>
          )
        })}
      </div>
      <div className="sidebar-bottom"><div className="sidebar-workspace">My workspace</div></div>
    </nav>
  )
}
