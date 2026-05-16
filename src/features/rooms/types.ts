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

export type RoomDto = {
  id: number
  branchId: number
  branchName: string
  name: string
  capacity: number | null
  isActive: boolean
}

export type BranchDto = {
  id: number
  name: string
}

export type RoomPayload = {
  branchId: number
  name: string
  capacity: number | null
  isActive: boolean
}
