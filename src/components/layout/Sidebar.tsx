import type { ReactNode } from 'react'
import { Tooltip, makeStyles, mergeClasses, tokens } from '@fluentui/react-components'
import {
  BookOpen24Regular,
  Building24Regular,
  CalendarCheckmark24Regular,
  ChartMultiple24Regular,
  Home24Regular,
  Payment24Regular,
  People24Regular,
} from '@fluentui/react-icons'
import { useAuthRoles } from '../../features/auth/useAuthRoles'
import { navigateTo, useCurrentPath } from '../../lib/navigation'

type SidebarProps = { isCollapsed: boolean }

type NavItem = { label: string; path: string; icon: ReactNode; roles?: string[] }

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <Home24Regular /> },
  { label: 'Users', path: '/users', icon: <People24Regular />, roles: ['Admin', 'Manager'] },
  { label: 'Roles', path: '/roles', icon: <People24Regular />, roles: ['Admin'] },
  { label: 'Branches', path: '/branches', icon: <Building24Regular />, roles: ['Admin', 'Manager'] },
  { label: 'Rooms', path: '/rooms', icon: <Building24Regular />, roles: ['Admin', 'Manager', 'Sales', 'Teacher'] },
  { label: 'Courses', path: '/courses', icon: <BookOpen24Regular />, roles: ['Admin', 'Manager', 'Sales'] },
  { label: 'Classes', path: '/classes', icon: <BookOpen24Regular />, roles: ['Admin', 'Manager', 'Sales', 'Teacher'] },
  { label: 'Leads', path: '/leads', icon: <People24Regular />, roles: ['Admin', 'Manager', 'Sales'] },
  { label: 'Lead Candidates', path: '/leads/candidates', icon: <People24Regular />, roles: ['Admin', 'Manager', 'Sales'] },
  { label: 'Students', path: '/students', icon: <People24Regular />, roles: ['Admin', 'Manager', 'Sales'] },
  { label: 'Follow-up Tasks', path: '/follow-up-tasks', icon: <CalendarCheckmark24Regular />, roles: ['Admin', 'Manager', 'Sales'] },
  { label: 'Lead Sources', path: '/lead-sources', icon: <Building24Regular />, roles: ['Admin', 'Manager'] },
  { label: 'Enrollments', path: '/enrollments', icon: <BookOpen24Regular />, roles: ['Admin', 'Manager', 'Sales'] },
  { label: 'Invoices', path: '/invoices', icon: <Payment24Regular />, roles: ['Admin', 'Manager', 'Sales'] },
  { label: 'Payments', path: '/payments', icon: <Payment24Regular />, roles: ['Admin', 'Manager'] },
  { label: 'My Sessions', path: '/teacher/my-sessions', icon: <CalendarCheckmark24Regular />, roles: ['Admin', 'Manager', 'Teacher'] },
  { label: 'Lead Analytics', path: '/analytics/leads', icon: <ChartMultiple24Regular />, roles: ['Admin', 'Manager', 'Sales'] },
  { label: 'Revenue Analytics', path: '/analytics/revenue', icon: <ChartMultiple24Regular />, roles: ['Admin', 'Manager'] },
  { label: 'Enrollment Analytics', path: '/analytics/enrollments', icon: <ChartMultiple24Regular />, roles: ['Admin', 'Manager', 'Sales'] },
  { label: 'Attendance Analytics', path: '/analytics/attendance', icon: <ChartMultiple24Regular />, roles: ['Admin', 'Manager', 'Teacher'] },
  { label: 'Task Analytics', path: '/analytics/tasks', icon: <ChartMultiple24Regular />, roles: ['Admin', 'Manager', 'Sales'] },
  { label: 'Profile', path: '/profile', icon: <People24Regular /> },
]

const useStyles = makeStyles({
  root: {
    width: '248px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    transitionProperty: 'width',
    transitionDuration: tokens.durationNormal,
    transitionTimingFunction: tokens.curveEasyEase,
    '@media (max-width: 960px)': {
      width: '72px',
    },
  },
  collapsed: {
    width: '72px',
  },
  menu: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXXS,
    padding: tokens.spacingVerticalS,
    overflowY: 'auto',
  },
  item: {
    minHeight: '40px',
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    padding: `0 ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusMedium,
    color: tokens.colorNeutralForeground2,
    textDecorationLine: 'none',
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightRegular,
    outlineStyle: 'none',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      color: tokens.colorNeutralForeground1,
    },
    ':focus-visible': {
      boxShadow: `0 0 0 2px ${tokens.colorStrokeFocus2}`,
    },
  },
  active: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold,
    ':hover': {
      backgroundColor: tokens.colorBrandBackground2Hover,
      color: tokens.colorBrandForeground1,
    },
  },
  icon: {
    width: '24px',
    height: '24px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  label: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  labelCollapsed: {
    display: 'none',
  },
  footer: {
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    color: tokens.colorNeutralForeground3,
    padding: tokens.spacingHorizontalM,
    fontSize: tokens.fontSizeBase200,
  },
})

export function Sidebar({ isCollapsed }: SidebarProps) {
  const currentPath = useCurrentPath()
  const roles = useAuthRoles()
  const styles = useStyles()
  const visibleItems = navItems.filter((item) => !item.roles || item.roles.some((r) => roles.includes(r)))

  const isActive = (path: string) => {
    if (path === '/users') return currentPath === '/users' || currentPath === '/users/create' || /\/users\/[^/]+\/edit$/.test(currentPath)
    if (path === '/leads/candidates') return currentPath === '/leads/candidates' || /\/leads\/candidates\/[^/]+$/.test(currentPath)
    if (path === '/leads') return currentPath === '/leads' || currentPath === '/leads/create' || /\/leads\/(?!candidates(?:\/|$))[^/]+(\/edit)?$/.test(currentPath)
    if (path === '/students') return currentPath === '/students' || currentPath === '/students/create' || /\/students\/[^/]+(\/edit|\/enrollments|\/invoices|\/payments|\/attendance)?$/.test(currentPath)
    if (path === '/courses') return currentPath === '/courses' || /\/courses\/[^/]+\/edit$/.test(currentPath)
    if (path === '/classes') return currentPath === '/classes' || currentPath === '/classes/create' || /\/classes\/[^/]+(\/edit|\/sessions)?$/.test(currentPath)
    if (path === '/enrollments') return currentPath === '/enrollments' || currentPath === '/enrollments/create' || /\/enrollments\/[^/]+(\/edit)?$/.test(currentPath)
    if (path === '/invoices') return currentPath === '/invoices' || /\/invoices\/[^/]+$/.test(currentPath)
    if (path === '/payments') return currentPath === '/payments' || /\/students\/[^/]+\/payments$/.test(currentPath)
    if (path === '/teacher/my-sessions') return currentPath === '/teacher/my-sessions' || /\/attendance\/sessions\/[^/]+$/.test(currentPath)
    if (path === '/analytics/leads') return currentPath === '/analytics/leads'
    if (path === '/analytics/revenue') return currentPath === '/analytics/revenue'
    if (path === '/analytics/enrollments') return currentPath === '/analytics/enrollments'
    if (path === '/analytics/attendance') return currentPath === '/analytics/attendance'
    if (path === '/analytics/tasks') return currentPath === '/analytics/tasks'
    return currentPath === path
  }

  return (
    <nav className={mergeClasses(styles.root, isCollapsed && styles.collapsed)} aria-label="Primary navigation">
      <div className={styles.menu}>
        {visibleItems.map((item) => {
          const active = isActive(item.path)
          const link = (
            <a
              key={item.path}
              href={item.path}
              aria-current={active ? 'page' : undefined}
              className={mergeClasses(styles.item, active && styles.active)}
              onClick={(event) => {
                event.preventDefault()
                navigateTo(item.path)
              }}
            >
              <span className={styles.icon} aria-hidden="true">
                {item.icon}
              </span>
              <span className={mergeClasses(styles.label, isCollapsed && styles.labelCollapsed)}>{item.label}</span>
            </a>
          )

          return isCollapsed ? (
            <Tooltip key={item.path} content={item.label} relationship="label" positioning="after">
              {link}
            </Tooltip>
          ) : link
        })}
      </div>
      <div className={styles.footer}>{isCollapsed ? 'CRM' : 'My workspace'}</div>
    </nav>
  )
}
