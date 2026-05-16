import { AppLayout } from '../components/layout/AppLayout'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { BranchesPage } from '../features/branches/pages/BranchesPage'
import { DashboardPage } from '../features/dashboard/pages/DashboardPage'
import { useAuth } from '../features/auth/hooks'
import { FollowUpTaskListPage } from '../features/followUpTasks/pages/FollowUpTaskListPage'
import { LeadCreatePage } from '../features/leads/pages/LeadCreatePage'
import { LeadDetailPage } from '../features/leads/pages/LeadDetailPage'
import { LeadEditPage } from '../features/leads/pages/LeadEditPage'
import { LeadListPage } from '../features/leads/pages/LeadListPage'
import { LeadSourceListPage } from '../features/leadSources/pages/LeadSourceListPage'
import { ProfilePage } from '../features/profile/pages/ProfilePage'
import { RolesPage } from '../features/roles/pages/RolesPage'
import { RoomsPage } from '../features/rooms/pages/RoomsPage'
import { UserCreatePage } from '../features/users/pages/UserCreatePage'
import { UserEditPage } from '../features/users/pages/UserEditPage'
import { UsersPage } from '../features/users/pages/UsersPage'
import { navigateTo, useCurrentPath } from '../lib/navigation'

type RouteView = { title: string; content: React.ReactElement }

function resolvePrivateRoute(path: string): RouteView | null {
  if (path === '/dashboard') return { title: 'Dashboard', content: <DashboardPage /> }
  if (path === '/users') return { title: 'System Users', content: <UsersPage /> }
  if (path === '/users/create') return { title: 'Create User', content: <UserCreatePage /> }
  const userEditMatch = path.match(/^\/users\/([^/]+)\/edit$/)
  if (userEditMatch) return { title: 'Edit User', content: <UserEditPage userId={userEditMatch[1]} /> }
  if (path === '/roles') return { title: 'Roles', content: <RolesPage /> }
  if (path === '/branches') return { title: 'Branches', content: <BranchesPage /> }
  if (path === '/rooms') return { title: 'Rooms', content: <RoomsPage /> }
  if (path === '/profile') return { title: 'Profile', content: <ProfilePage /> }

  if (path === '/leads') return { title: 'Leads', content: <LeadListPage /> }
  if (path === '/leads/create') return { title: 'Create Lead', content: <LeadCreatePage /> }
  const leadDetailMatch = path.match(/^\/leads\/([^/]+)$/)
  if (leadDetailMatch) return { title: 'Lead Detail', content: <LeadDetailPage leadId={leadDetailMatch[1]} /> }
  const leadEditMatch = path.match(/^\/leads\/([^/]+)\/edit$/)
  if (leadEditMatch) return { title: 'Edit Lead', content: <LeadEditPage leadId={leadEditMatch[1]} /> }

  if (path === '/follow-up-tasks') return { title: 'Follow-up Tasks', content: <FollowUpTaskListPage /> }
  if (path === '/lead-sources') return { title: 'Lead Sources', content: <LeadSourceListPage /> }

  return null
}

export function AppRouter() {
  const { isAuthenticated, isInitializing } = useAuth()
  const path = useCurrentPath()

  if (isInitializing) return null

  if (!isAuthenticated) {
    if (path !== '/login') navigateTo('/login', true)
    return <LoginPage />
  }

  if (path === '/login' || path === '/') {
    navigateTo('/dashboard', true)
    return null
  }

  const route = resolvePrivateRoute(path)
  if (!route) {
    navigateTo('/dashboard', true)
    return null
  }

  return <AppLayout title={route.title}>{route.content}</AppLayout>
}
