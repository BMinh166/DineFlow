export interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export interface ApiErrorResponse {
  success: false
  message: string
  code?: string
}

export function successResponse<T>(data: T): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
  }
}

export function errorResponse(message: string, code?: string): ApiErrorResponse {
  return code ? { success: false, message, code } : { success: false, message }
}
