import { apiRequest } from '../../lib/apiClient'
import type { ApiResponse, LeadCandidateDetail, LeadCandidateListItem, LeadCandidateQuery, PagedResult } from './types'

function toQuery(params: Record<string, string | number | boolean | undefined>) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') q.set(k, String(v))
  }
  return q.toString()
}

function unwrapPaged(payload: PagedResult<LeadCandidateListItem> | ApiResponse<PagedResult<LeadCandidateListItem>>) {
  const maybeWrapped = payload as ApiResponse<PagedResult<LeadCandidateListItem>>
  return maybeWrapped.data ?? (payload as PagedResult<LeadCandidateListItem>)
}

function unwrapDetail(payload: LeadCandidateDetail | ApiResponse<LeadCandidateDetail>) {
  const maybeWrapped = payload as ApiResponse<LeadCandidateDetail>
  return maybeWrapped.data ?? (payload as LeadCandidateDetail)
}

export async function getLeadCandidatesApi(query: LeadCandidateQuery = {}): Promise<PagedResult<LeadCandidateListItem>> {
  const qs = toQuery({ page: 1, pageSize: 20, ...query })
  const res = await apiRequest<PagedResult<LeadCandidateListItem> | ApiResponse<PagedResult<LeadCandidateListItem>>>(`/lead-candidates?${qs}`)
  return unwrapPaged(res)
}

export async function getLeadCandidateDetailApi(id: number): Promise<LeadCandidateDetail> {
  const res = await apiRequest<LeadCandidateDetail | ApiResponse<LeadCandidateDetail>>(`/lead-candidates/${id}`)
  return unwrapDetail(res)
}

export async function approveLeadCandidateApi(id: number): Promise<LeadCandidateDetail> {
  const res = await apiRequest<LeadCandidateDetail | ApiResponse<LeadCandidateDetail>>(`/lead-candidates/${id}/approve`, { method: 'POST' })
  return unwrapDetail(res)
}

export async function rejectLeadCandidateApi(id: number): Promise<LeadCandidateDetail> {
  const res = await apiRequest<LeadCandidateDetail | ApiResponse<LeadCandidateDetail>>(`/lead-candidates/${id}/reject`, { method: 'POST' })
  return unwrapDetail(res)
}

export async function ignoreLeadCandidateApi(id: number): Promise<LeadCandidateDetail> {
  const res = await apiRequest<LeadCandidateDetail | ApiResponse<LeadCandidateDetail>>(`/lead-candidates/${id}/ignore`, { method: 'POST' })
  return unwrapDetail(res)
}

export async function convertLeadCandidateApi(id: number): Promise<LeadCandidateDetail> {
  const res = await apiRequest<LeadCandidateDetail | ApiResponse<LeadCandidateDetail>>(`/lead-candidates/${id}/convert-to-lead`, { method: 'POST' })
  return unwrapDetail(res)
}
