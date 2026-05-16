export type ApiResponse<T> = { success: boolean; message: string; data: T; errors?: unknown }
export type PagedResult<T> = { items: T[]; pageNumber: number; pageSize: number; totalCount: number; totalPages: number }

export type EnrollmentStatus =
  | 'pending'
  | 'waiting_payment'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'suspended'
  | 'transferred'
  | 'refunded'
  | 'dropped'

export type EnrollmentDto = {
  id: number
  studentId: number
  studentName: string
  courseId: number
  courseName: string
  classId: number | null
  className: string | null
  salesUserId: number | null
  salesUserName: string | null
  status: string
  tuitionFee: number
  discountAmount: number
  finalAmount: number
  enrolledAt: string | null
  startDate: string | null
  endDate: string | null
  note: string | null
}

export type StudentLite = { id: number; fullName: string; studentCode: string; branchId: number | null; branchName: string | null }
export type CourseLite = { id: number; name: string; tuitionFee?: number | null }
export type ClassLite = { id: number; courseId: number; name: string; classCode: string; status: string; maxStudents?: number | null }
export type UserLite = { id: number; fullName: string; branchId: number | null }
export type BranchLite = { id: number; name: string }
