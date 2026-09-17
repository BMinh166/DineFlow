import axios from 'axios'

interface ApiErrorResponse {
  code?: unknown
}

export function getLoginErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (error.response?.data?.code === 'INVALID_CREDENTIALS') {
      return 'Tên đăng nhập/email hoặc mật khẩu không đúng.'
    }

    if (error.response?.data?.code === 'INACTIVE_ACCOUNT') {
      return 'Tài khoản này đã ngừng hoạt động. Vui lòng liên hệ quản lý.'
    }
  }

  return 'Không thể đăng nhập lúc này. Vui lòng kiểm tra kết nối và thử lại.'
}
