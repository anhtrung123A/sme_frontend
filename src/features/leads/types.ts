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

export type LeadStatus = 'new' | 'contacted' | 'interested' | 'trial_scheduled' | 'lost'

export type LeadDto = {
  id: number
  branchId: number | null
  branchName: string | null
  assignedToUserId: number | null
  assignedToUserName: string | null
  fullName: string
  phone: string
  email: string | null
  dateOfBirth: string | null
  address: string | null
  sourceId: number | null
  sourceName: string | null
  interestedCourseId: number | null
  status: string
  demandNote: string | null
}

export type LeadSourceDto = {
  id: number
  name: string
  description: string | null
  isActive: boolean
}

export type LeadActivityDto = {
  id: number
  leadId: number
  userId: number
  userName: string
  type: string
  content: string
  contactedAtUtc: string | null
  createdAtUtc: string
}

export type FollowUpTaskDto = {
  id: number
  assignedToUserId: number
  assignedToUserName: string
  leadId: number | null
  leadName: string | null
  title: string
  description: string | null
  dueAt: string
  status: string
  completedAt: string | null
}

export type BranchDto = {
  id: number
  name: string
}

export type UserLite = {
  id: number
  fullName: string
  branchId: number | null
  branchName: string | null
}
