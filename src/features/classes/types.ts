export type ApiResponse<T> = { success: boolean; message: string; data: T; errors?: unknown }
export type PagedResult<T> = { items: T[]; pageNumber: number; pageSize: number; totalCount: number; totalPages: number }

export type ClassDto = {
  id: number
  branchId: number
  branchName: string | null
  courseId: number
  courseName: string | null
  roomId: number | null
  roomName: string | null
  teacherUserId: number | null
  teacherUserName: string | null
  classCode: string
  name: string
  maxStudents: number | null
  startDate: string | null
  endDate: string | null
  status: string
}

export type CourseLite = { id: number; name: string }
export type BranchLite = { id: number; name: string }
export type RoomLite = { id: number; branchId: number; name: string; isActive: boolean }
export type UserLite = { id: number; branchId: number | null; fullName: string }

export type ClassScheduleDto = { id: number; classId: number; dayOfWeek: number; startTime: string; endTime: string }
export type ClassSessionDto = {
  id: number
  classId: number
  scheduleId: number | null
  sessionDate: string
  startTime: string
  endTime: string
  roomId: number | null
  roomName: string | null
  teacherUserId: number | null
  teacherUserName: string | null
  status: string
  topic: string | null
  note: string | null
}

export type GenerateSessionsResponse = { createdCount: number; skippedCount: number; removedScheduledCount: number }
