import { AppLayout } from '../components/layout/AppLayout'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { BranchesPage } from '../features/branches/pages/BranchesPage'
import { ClassCreatePage } from '../features/classes/pages/ClassCreatePage'
import { ClassDetailPage } from '../features/classes/pages/ClassDetailPage'
import { ClassEditPage } from '../features/classes/pages/ClassEditPage'
import { ClassListPage } from '../features/classes/pages/ClassListPage'
import { ClassSessionDetailPage } from '../features/classes/pages/ClassSessionDetailPage'
import { ClassSessionsPage } from '../features/classes/pages/ClassSessionsPage'
import { CourseCreatePage } from '../features/courses/pages/CourseCreatePage'
import { CourseEditPage } from '../features/courses/pages/CourseEditPage'
import { CourseListPage } from '../features/courses/pages/CourseListPage'
import { DashboardPage } from '../features/dashboard/pages/DashboardPage'
import { useAuth } from '../features/auth/hooks'
import { useAuthRoles } from '../features/auth/useAuthRoles'
import { FollowUpTaskListPage } from '../features/followUpTasks/pages/FollowUpTaskListPage'
import { EnrollmentCreatePage } from '../features/enrollments/pages/EnrollmentCreatePage'
import { EnrollmentDetailPage } from '../features/enrollments/pages/EnrollmentDetailPage'
import { EnrollmentEditPage } from '../features/enrollments/pages/EnrollmentEditPage'
import { EnrollmentListPage } from '../features/enrollments/pages/EnrollmentListPage'
import { LeadCreatePage } from '../features/leads/pages/LeadCreatePage'
import { LeadDetailPage } from '../features/leads/pages/LeadDetailPage'
import { LeadEditPage } from '../features/leads/pages/LeadEditPage'
import { LeadListPage } from '../features/leads/pages/LeadListPage'
import { LeadSourceListPage } from '../features/leadSources/pages/LeadSourceListPage'
import { ProfilePage } from '../features/profile/pages/ProfilePage'
import { RolesPage } from '../features/roles/pages/RolesPage'
import { RoomsPage } from '../features/rooms/pages/RoomsPage'
import { StudentCreatePage } from '../features/students/pages/StudentCreatePage'
import { StudentDetailPage } from '../features/students/pages/StudentDetailPage'
import { StudentEditPage } from '../features/students/pages/StudentEditPage'
import { StudentListPage } from '../features/students/pages/StudentListPage'
import { UserCreatePage } from '../features/users/pages/UserCreatePage'
import { UserEditPage } from '../features/users/pages/UserEditPage'
import { UsersPage } from '../features/users/pages/UsersPage'
import { navigateTo, useCurrentPath } from '../lib/navigation'

type RouteView = { title: string; content: React.ReactElement }

function hasAnyRole(userRoles: string[], allowed: string[]) {
  return allowed.some((role) => userRoles.includes(role))
}

function resolvePrivateRoute(path: string, roles: string[]): RouteView | null {
  if (path === '/dashboard') return { title: 'Dashboard', content: <DashboardPage /> }

  if (path === '/users') return { title: 'System Users', content: <UsersPage /> }
  if (path === '/users/create') return { title: 'Create User', content: <UserCreatePage /> }
  const userEditMatch = path.match(/^\/users\/([^/]+)\/edit$/)
  if (userEditMatch) return { title: 'Edit User', content: <UserEditPage userId={userEditMatch[1]} /> }

  if (path === '/roles') return { title: 'Roles', content: <RolesPage /> }
  if (path === '/branches') return { title: 'Branches', content: <BranchesPage /> }
  if (path === '/rooms') return { title: 'Rooms', content: <RoomsPage /> }

  if (path === '/courses') {
    if (!hasAnyRole(roles, ['Admin', 'Manager', 'Sales'])) return null
    return { title: 'Courses', content: <CourseListPage /> }
  }
  if (path === '/courses/create') {
    if (!hasAnyRole(roles, ['Admin'])) return null
    return { title: 'Create Course', content: <CourseCreatePage /> }
  }
  const courseEditMatch = path.match(/^\/courses\/([^/]+)\/edit$/)
  if (courseEditMatch) {
    if (!hasAnyRole(roles, ['Admin'])) return null
    return { title: 'Edit Course', content: <CourseEditPage courseId={courseEditMatch[1]} /> }
  }

  if (path === '/classes') {
    if (!hasAnyRole(roles, ['Admin', 'Manager', 'Sales', 'Teacher'])) return null
    return { title: 'Classes', content: <ClassListPage /> }
  }
  if (path === '/classes/create') {
    if (!hasAnyRole(roles, ['Admin', 'Manager'])) return null
    return { title: 'Create Class', content: <ClassCreatePage /> }
  }
  const classDetailMatch = path.match(/^\/classes\/([^/]+)$/)
  if (classDetailMatch) {
    if (!hasAnyRole(roles, ['Admin', 'Manager', 'Sales', 'Teacher'])) return null
    return { title: 'Class Detail', content: <ClassDetailPage classId={classDetailMatch[1]} /> }
  }
  const classEditMatch = path.match(/^\/classes\/([^/]+)\/edit$/)
  if (classEditMatch) {
    if (!hasAnyRole(roles, ['Admin', 'Manager'])) return null
    return { title: 'Edit Class', content: <ClassEditPage classId={classEditMatch[1]} /> }
  }
  const classSessionsMatch = path.match(/^\/classes\/([^/]+)\/sessions$/)
  if (classSessionsMatch) {
    if (!hasAnyRole(roles, ['Admin', 'Manager', 'Teacher'])) return null
    return { title: 'Class Sessions', content: <ClassSessionsPage classId={classSessionsMatch[1]} /> }
  }

  const sessionDetailMatch = path.match(/^\/class-sessions\/([^/]+)$/)
  if (sessionDetailMatch) {
    if (!hasAnyRole(roles, ['Admin', 'Manager', 'Teacher'])) return null
    return { title: 'Session Detail', content: <ClassSessionDetailPage sessionId={sessionDetailMatch[1]} /> }
  }

  if (path === '/leads') return { title: 'Leads', content: <LeadListPage /> }
  if (path === '/leads/create') return { title: 'Create Lead', content: <LeadCreatePage /> }
  const leadDetailMatch = path.match(/^\/leads\/([^/]+)$/)
  if (leadDetailMatch) return { title: 'Lead Detail', content: <LeadDetailPage leadId={leadDetailMatch[1]} /> }
  const leadEditMatch = path.match(/^\/leads\/([^/]+)\/edit$/)
  if (leadEditMatch) return { title: 'Edit Lead', content: <LeadEditPage leadId={leadEditMatch[1]} /> }

  if (path === '/students') return { title: 'Students', content: <StudentListPage /> }
  if (path === '/students/create') return { title: 'Create Student', content: <StudentCreatePage /> }
  const studentEnrollmentsMatch = path.match(/^\/students\/([^/]+)\/enrollments$/)
  if (studentEnrollmentsMatch) {
    if (!hasAnyRole(roles, ['Admin', 'Manager', 'Sales'])) return null
    return { title: 'Student Enrollments', content: <StudentDetailPage studentId={studentEnrollmentsMatch[1]} defaultTab="enrollments" /> }
  }
  const studentDetailMatch = path.match(/^\/students\/([^/]+)$/)
  if (studentDetailMatch) return { title: 'Student Detail', content: <StudentDetailPage studentId={studentDetailMatch[1]} /> }
  const studentEditMatch = path.match(/^\/students\/([^/]+)\/edit$/)
  if (studentEditMatch) return { title: 'Edit Student', content: <StudentEditPage studentId={studentEditMatch[1]} /> }

  if (path === '/follow-up-tasks') return { title: 'Follow-up Tasks', content: <FollowUpTaskListPage /> }
  if (path === '/lead-sources') return { title: 'Lead Sources', content: <LeadSourceListPage /> }
  if (path === '/enrollments') {
    if (!hasAnyRole(roles, ['Admin', 'Manager', 'Sales'])) return null
    return { title: 'Enrollments', content: <EnrollmentListPage /> }
  }
  if (path === '/enrollments/create') {
    if (!hasAnyRole(roles, ['Admin', 'Manager', 'Sales'])) return null
    return { title: 'Create Enrollment', content: <EnrollmentCreatePage /> }
  }
  const enrollmentDetailMatch = path.match(/^\/enrollments\/([^/]+)$/)
  if (enrollmentDetailMatch) {
    if (!hasAnyRole(roles, ['Admin', 'Manager', 'Sales'])) return null
    return { title: 'Enrollment Detail', content: <EnrollmentDetailPage enrollmentId={enrollmentDetailMatch[1]} /> }
  }
  const enrollmentEditMatch = path.match(/^\/enrollments\/([^/]+)\/edit$/)
  if (enrollmentEditMatch) {
    if (!hasAnyRole(roles, ['Admin', 'Manager'])) return null
    return { title: 'Edit Enrollment', content: <EnrollmentEditPage enrollmentId={enrollmentEditMatch[1]} /> }
  }

  if (path === '/profile') return { title: 'Profile', content: <ProfilePage /> }

  return null
}

export function AppRouter() {
  const { isAuthenticated, isInitializing } = useAuth()
  const roles = useAuthRoles()
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

  const route = resolvePrivateRoute(path, roles)
  if (!route) {
    navigateTo('/dashboard', true)
    return null
  }

  return <AppLayout title={route.title}>{route.content}</AppLayout>
}
