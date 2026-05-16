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

export type BranchDto = {
  id: number
  name: string
  address: string | null
  phone: string | null
  email: string | null
  isActive: boolean
}

export type BranchPayload = {
  name: string
  address: string
  phone: string
  email: string
  isActive: boolean
}
