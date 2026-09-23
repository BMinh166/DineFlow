import { useContext, useMemo } from 'react'

import { CustomerCartContext } from '../context/CustomerCartContext'
import type { PublicDish } from '../types/public-menu'

export function useCustomerCart(tableId: string) {
  const context = useContext(CustomerCartContext)
  if (!context) throw new Error('useCustomerCart must be used within CustomerCartProvider.')

  const items = context.cartTableId === tableId ? context.items : []
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)
  const displayTotal = items.reduce((total, item) => total + item.price * item.quantity, 0)

  return useMemo(() => ({
    items,
    isSubmissionPending: context.isSubmissionPending,
    itemCount,
    displayTotal,
    addItem: (dish: PublicDish) => context.addItem(tableId, dish),
    clearCart: () => context.clearCart(tableId),
    decreaseQuantity: (dishId: string) => context.decreaseQuantity(tableId, dishId),
    increaseQuantity: (dishId: string) => context.increaseQuantity(tableId, dishId),
    removeItem: (dishId: string) => context.removeItem(tableId, dishId),
    setSubmissionPending: context.setSubmissionPending,
    getQuantity: (dishId: string) => items.find(item => item.dishId === dishId)?.quantity ?? 0,
  }), [context, displayTotal, itemCount, items, tableId])
}
