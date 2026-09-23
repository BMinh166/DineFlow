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

export interface CustomerCurrentOrderItem {
  id: string
  dishName: string
  unitPrice: number
  quantity: number
  status: 'PENDING' | 'PREPARING' | 'COMPLETED'
}

export interface CustomerCurrentOrder {
  id: string
  status: 'OPEN' | 'PAYMENT_REQUESTED' | 'CLOSED'
  total: number
  items: CustomerCurrentOrderItem[]
}

export type CustomerOrderErrorKind = 'invalid-cart' | 'session-expired' | 'dish-unavailable' | 'order-locked' | 'unexpected'

export async function placeCustomerOrder(items: CustomerOrderItemInput[]): Promise<PlaceCustomerOrderResult> {
  const response = await customerApi.post<ApiSuccessResponse<PlaceCustomerOrderResult>>('/customer/orders/items', { items })
  return response.data.data
}

export async function getCustomerCurrentOrder(): Promise<CustomerCurrentOrder> {
  const response = await customerApi.get<ApiSuccessResponse<{ order: CustomerCurrentOrder }>>('/customer/orders/current')
  return response.data.data.order
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

export type CustomerCurrentOrderErrorKind = 'not-found' | 'session-expired' | 'unexpected'

export function getCustomerCurrentOrderErrorKind(error: unknown): CustomerCurrentOrderErrorKind {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) return 'unexpected'

  const code = error.response?.data?.code
  if (code === 'CURRENT_ORDER_NOT_FOUND') return 'not-found'
  if (error.response?.status === 401 || code === 'CUSTOMER_SESSION_AUTHENTICATION_FAILED' || code === 'CUSTOMER_SESSION_INACTIVE' || code === 'CUSTOMER_SESSION_TABLE_MISMATCH') return 'session-expired'

  return 'unexpected'
}
