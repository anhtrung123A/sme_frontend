export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
  errors?: unknown
}

export type PagedResult<T> = {
  items: T[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export type StudentDto = {
  id: number
  studentCode: string
  branchId: number | null
  branchName: string | null
  fullName: string
  email: string | null
  phone: string | null
  dateOfBirth: string | null
  gender: string | null
  address: string | null
  status: string
}

export type BranchDto = { id: number; name: string }

export type StudentGuardianDto = {
  guardianId: number
  fullName: string
  phone: string
  email: string | null
  address: string | null
  relationship: string | null
  isPrimary: boolean
}

export type StudentNoteDto = {
  id: number
  studentId: number
  userId: number
  userName: string
  content: string
  createdAtUtc: string
  updatedAtUtc: string | null
}
