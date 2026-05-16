import { StudentAttendanceHistoryPage } from '../../attendance/pages/StudentAttendanceHistoryPage'

export function StudentAttendanceTab({ studentId }: { studentId: number }) {
  return <StudentAttendanceHistoryPage studentId={String(studentId)} />
}
