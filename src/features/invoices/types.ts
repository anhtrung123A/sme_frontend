export type ApiResponse<T> = { success: boolean; message: string; data: T; errors?: unknown }
export type PagedResult<T> = { items: T[]; pageNumber: number; pageSize: number; totalCount: number; totalPages: number }

export type InvoiceDto = {
  id: number
  enrollmentId: number
  studentId: number
  studentName: string
  invoiceCode: string
  amount: number
  paidAmount: number
  remainingAmount: number
  dueDate: string | null
  status: string
  issuedAt: string | null
  createdByUserId: number | null
  createdByUserName: string | null
}

export type PaymentDto = {
  id: number
  invoiceId: number
  studentId: number
  studentName: string
  amount: number
  method: string
  status: string
  transactionRef: string | null
  paidAt: string
  note: string | null
  collectedByUserId: number | null
  collectedByUserName: string | null
}
