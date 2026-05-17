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

export type LeadCandidateDecision = 'AutoCreateLead' | 'NeedsReview' | 'Ignore'

export type LeadCandidateStatus = 'Pending' | 'Approved' | 'Rejected' | 'ConvertedToLead' | 'Ignored'

export type InteractionIntent =
  | 'CourseInquiry'
  | 'PriceInquiry'
  | 'TrialRequest'
  | 'RegistrationIntent'
  | 'ScheduleInquiry'
  | 'LocationInquiry'
  | 'SupportExisting'
  | 'Complaint'
  | 'Spam'
  | 'Irrelevant'
  | 'EngagementOnly'

export interface LeadCandidateListItem {
  id: number
  rawInteractionId: number
  sourcePlatform: string
  sourceType: string
  customerName?: string | null
  phone?: string | null
  email?: string | null
  courseInterest?: string | null
  normalizedText?: string | null
  detectedIntent: InteractionIntent | string
  intentConfidence: number
  candidateScore: number
  decision: LeadCandidateDecision | string
  status: LeadCandidateStatus | string
  createdAt: string
}

export interface RawInteractionPreviewDto {
  id: number
  rawText?: string | null
  authorName?: string | null
  externalId: string
  parentExternalId?: string | null
}

export interface InteractionPredictionPreviewDto {
  id: number
  modelVersion: string
  intent: string
  intentConfidence: number
  isLeadCandidateProbability: number
  decision: string
  entitiesJson?: string | null
  predictedAt: string
}

export interface LeadCandidateDetail extends LeadCandidateListItem {
  decisionReasonJson?: string | null
  rawInteraction?: RawInteractionPreviewDto | null
  latestPrediction?: InteractionPredictionPreviewDto | null
  createdLeadId?: number | null
}

export type LeadCandidateQuery = {
  page?: number
  pageSize?: number
  status?: string
  decision?: string
  intent?: string
  sourcePlatform?: string
  sourceType?: string
  keyword?: string
  hasPhone?: boolean
  hasEmail?: boolean
  fromDate?: string
  toDate?: string
}
