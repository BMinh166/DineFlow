import axios from 'axios'

import { customerApi } from './customer-api'

interface ApiSuccessResponse<T> {
  success: true
  data: T
}

interface ApiErrorResponse {
  code?: unknown
}

export interface CustomerOrderItemInput {
  dishId: string
  quantity: number
}

export interface PlaceCustomerOrderResult {
  order: {
    id: string
    status: 'OPEN'
    total: number
  }
}

export type CustomerOrderErrorKind = 'invalid-cart' | 'session-expired' | 'dish-unavailable' | 'order-locked' | 'unexpected'

export async function placeCustomerOrder(items: CustomerOrderItemInput[]): Promise<PlaceCustomerOrderResult> {
  const response = await customerApi.post<ApiSuccessResponse<PlaceCustomerOrderResult>>('/customer/orders/items', { items })
  return response.data.data
}

export function getCustomerOrderErrorKind(error: unknown): CustomerOrderErrorKind {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) return 'unexpected'

  const code = error.response?.data?.code
  if (code === 'VALIDATION_ERROR') return 'invalid-cart'
  if (error.response?.status === 401 || code === 'CUSTOMER_SESSION_AUTHENTICATION_FAILED' || code === 'CUSTOMER_SESSION_INACTIVE') return 'session-expired'
  if (code === 'DISH_NOT_FOUND' || code === 'DISH_INACTIVE' || code === 'DISH_UNAVAILABLE' || code === 'DISH_CATEGORY_INACTIVE') return 'dish-unavailable'
  if (code === 'CURRENT_ORDER_NOT_FOUND' || code === 'ORDER_PAYMENT_REQUESTED' || code === 'ORDER_CLOSED' || code === 'ORDER_NOT_OPEN') return 'order-locked'

  return 'unexpected'
}
