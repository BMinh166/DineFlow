import { api } from './api'
import type { KitchenItemTransitionResult, KitchenQueueTicket } from '../types/kitchen'

interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export async function getKitchenQueue(): Promise<KitchenQueueTicket[]> {
  const response = await api.get<ApiSuccessResponse<{ tickets: KitchenQueueTicket[] }>>('/kitchen/queue')
  return response.data.data.tickets
}

export async function startPreparingKitchenItem(itemId: string): Promise<KitchenItemTransitionResult> {
  const response = await api.patch<ApiSuccessResponse<KitchenItemTransitionResult>>(
    `/kitchen/queue/items/${encodeURIComponent(itemId)}/start-preparing`,
  )
  return response.data.data
}

export async function markKitchenItemCompleted(itemId: string): Promise<KitchenItemTransitionResult> {
  const response = await api.patch<ApiSuccessResponse<KitchenItemTransitionResult>>(
    `/kitchen/queue/items/${encodeURIComponent(itemId)}/mark-completed`,
  )
  return response.data.data
}
