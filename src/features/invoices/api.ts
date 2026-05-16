import { apiRequest } from '../../lib/apiClient'
import type { ApiResponse, InvoiceDto, PagedResult, PaymentDto } from './types'

function q(params: Record<string, string | number | undefined>) {
  const s = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') s.set(k, String(v))
  return s.toString()
}

function unwrap<T>(payload: T | ApiResponse<T>): T {
  if (payload && typeof payload === 'object' && 'data' in payload) return (payload as ApiResponse<T>).data
  return payload as T
}

export async function getInvoicesApi(params: { studentId?: number; status?: string; dueFrom?: string; dueTo?: string; page?: number; pageSize?: number } = {}) {
  const res = await apiRequest<PagedResult<InvoiceDto> | ApiResponse<PagedResult<InvoiceDto>>>(`/invoices?${q({ page: 1, pageSize: 20, ...params })}`)
  return unwrap(res)
}

export async function getInvoiceApi(id: number) {
  const res = await apiRequest<InvoiceDto | ApiResponse<InvoiceDto>>(`/invoices/${id}`)
  return unwrap(res)
}

export async function getOverdueInvoicesApi() {
  const res = await apiRequest<PagedResult<InvoiceDto> | ApiResponse<PagedResult<InvoiceDto>>>('/invoices/overdue?page=1&pageSize=200')
  return unwrap(res).items
}

export async function createInvoiceFromEnrollmentApi(enrollmentId: number, dueDate?: string) {
  const res = await apiRequest<InvoiceDto | ApiResponse<InvoiceDto>>(`/enrollments/${enrollmentId}/invoice`, { method: 'POST', body: { dueDate: dueDate || null } })
  return unwrap(res)
}

export async function cancelInvoiceApi(id: number) {
  const res = await apiRequest<InvoiceDto | ApiResponse<InvoiceDto>>(`/invoices/${id}/cancel`, { method: 'PATCH' })
  return unwrap(res)
}

export async function getPaymentsApi(params: { invoiceId?: number; studentId?: number; status?: string; page?: number; pageSize?: number } = {}) {
  const res = await apiRequest<PagedResult<PaymentDto> | ApiResponse<PagedResult<PaymentDto>>>(`/payments?${q({ page: 1, pageSize: 20, ...params })}`)
  return unwrap(res)
}

export async function getInvoicePaymentsApi(invoiceId: number) {
  const res = await apiRequest<PaymentDto[] | ApiResponse<PaymentDto[]>>(`/invoices/${invoiceId}/payments`)
  return unwrap(res)
}

export async function createPaymentApi(invoiceId: number, payload: { amount: number; method: string; transactionRef?: string | null; paidAt?: string | null; note?: string | null }) {
  const res = await apiRequest<PaymentDto | ApiResponse<PaymentDto>>(`/invoices/${invoiceId}/payments`, { method: 'POST', body: payload })
  return unwrap(res)
}

export async function getStudentInvoicesApi(studentId: number) {
  const res = await apiRequest<InvoiceDto[] | ApiResponse<InvoiceDto[]>>(`/students/${studentId}/invoices`)
  return unwrap(res)
}

export async function getStudentPaymentsApi(studentId: number) {
  const res = await apiRequest<PaymentDto[] | ApiResponse<PaymentDto[]>>(`/students/${studentId}/payments`)
  return unwrap(res)
}
