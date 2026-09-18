import axios from 'axios'

type ApiErrorResponse = {
  message?: unknown
  success?: unknown
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return typeof value === 'object' && value !== null
}

export function getApiErrorMessage(error: unknown, fallback = 'Đã xảy ra lỗi. Vui lòng thử lại.'): string {
  if (!axios.isAxiosError(error) || !isApiErrorResponse(error.response?.data)) return fallback

  const { message, success } = error.response.data
  if (success === false && typeof message === 'string' && message.trim()) return message

  return fallback
}
