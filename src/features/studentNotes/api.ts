import { apiRequest } from '../../lib/apiClient'
import type { ApiResponse, StudentNoteDto } from '../students/types'

export async function getStudentNotesApi(studentId: number): Promise<StudentNoteDto[]> {
  const res = await apiRequest<ApiResponse<StudentNoteDto[]>>(`/students/${studentId}/notes`)
  return res.data
}

export async function createStudentNoteApi(studentId: number, content: string): Promise<StudentNoteDto> {
  const res = await apiRequest<ApiResponse<StudentNoteDto>>(`/students/${studentId}/notes`, {
    method: 'POST',
    body: { content },
  })
  return res.data
}

export async function updateStudentNoteApi(studentId: number, noteId: number, content: string): Promise<StudentNoteDto> {
  const res = await apiRequest<ApiResponse<StudentNoteDto>>(`/students/${studentId}/notes/${noteId}`, {
    method: 'PUT',
    body: { content },
  })
  return res.data
}

export async function deleteStudentNoteApi(studentId: number, noteId: number): Promise<void> {
  await apiRequest(`/students/${studentId}/notes/${noteId}`, { method: 'DELETE' })
}
