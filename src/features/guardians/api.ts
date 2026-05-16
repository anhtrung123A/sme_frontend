import { apiRequest } from '../../lib/apiClient'
import type { ApiResponse, StudentGuardianDto } from '../students/types'

export async function getGuardiansApi(studentId: number): Promise<StudentGuardianDto[]> {
  const res = await apiRequest<ApiResponse<StudentGuardianDto[]>>(`/students/${studentId}/guardians`)
  return res.data
}

export async function createGuardianApi(studentId: number, payload: Record<string, unknown>): Promise<StudentGuardianDto> {
  const res = await apiRequest<ApiResponse<StudentGuardianDto>>(`/students/${studentId}/guardians`, {
    method: 'POST',
    body: payload,
  })
  return res.data
}

export async function updateGuardianApi(studentId: number, guardianId: number, payload: Record<string, unknown>): Promise<StudentGuardianDto> {
  const res = await apiRequest<ApiResponse<StudentGuardianDto>>(`/students/${studentId}/guardians/${guardianId}`, {
    method: 'PUT',
    body: payload,
  })
  return res.data
}

export async function deleteGuardianApi(studentId: number, guardianId: number): Promise<void> {
  await apiRequest(`/students/${studentId}/guardians/${guardianId}`, { method: 'DELETE' })
}
