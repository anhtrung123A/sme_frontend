export type ApiResponse<T> = { success: boolean; message: string; data: T; errors?: unknown }
export type PagedResult<T> = { items: T[]; pageNumber: number; pageSize: number; totalCount: number; totalPages: number }

export type CourseDto = {
  id: number
  name: string
  code: string
  level: string | null
  description: string | null
  totalSessions: number | null
  tuitionFee: number
  isActive: boolean
}
