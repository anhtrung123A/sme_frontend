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

export type UserDto = {
  id: number
  branchId: number | null
  branchName: string | null
  fullName: string
  email: string
  phone: string | null
  status: string
  lastLoginAtUtc: string | null
}

export type UserRoleDto = {
  roleId: number
  roleName: string
}

export type RoleDto = {
  id: number
  name: string
  description: string | null
}

export type BranchDto = {
  id: number
  name: string
  address: string | null
  phone: string | null
  email: string | null
  isActive: boolean
}

export type CreateUserPayload = {
  fullName: string
  email: string
  phone: string
  branchId: number | null
  passwordHash: string
  status: string
}

export type UpdateUserPayload = {
  fullName: string
  email: string
  phone: string
  branchId: number | null
  passwordHash?: string
}
