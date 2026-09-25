import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import { useCustomerSession } from '../hooks/useCustomerSession'
import type { PublicDish } from '../types/public-menu'

export interface CustomerCartItem {
  dishId: string
  imageUrl?: string
  name: string
  price: number
  quantity: number
}

interface CustomerCartContextValue {
  cartTableId: string | null
  cartTableSessionId: string | null
  isSubmissionPending: boolean
  items: CustomerCartItem[]
  addItem: (tableId: string, dish: PublicDish) => void
  clearCart: (tableId: string) => void
  decreaseQuantity: (tableId: string, dishId: string) => void
  increaseQuantity: (tableId: string, dishId: string) => void
  removeItem: (tableId: string, dishId: string) => void
  setSubmissionPending: (isPending: boolean) => void
}

export const CustomerCartContext = createContext<CustomerCartContextValue | undefined>(undefined)

const maximumQuantity = 99

export function CustomerCartProvider({ children }: { children: ReactNode }) {
  const { session, status } = useCustomerSession()
  const [cartTableId, setCartTableId] = useState<string | null>(null)
  const [cartTableSessionId, setCartTableSessionId] = useState<string | null>(null)
  const [items, setItems] = useState<CustomerCartItem[]>([])
  const [isSubmissionPending, setSubmissionPending] = useState(false)
  const activeTableSessionId = status === 'authorized' ? session?.tableSessionId ?? null : null

  useEffect(() => {
    if (!cartTableId || cartTableSessionId === activeTableSessionId) return

    setItems([])
    setCartTableId(null)
    setCartTableSessionId(null)
  }, [activeTableSessionId, cartTableId, cartTableSessionId])

  const addItem = useCallback((tableId: string, dish: PublicDish) => {
    if (isSubmissionPending) return
    if (cartTableId !== tableId || cartTableSessionId !== activeTableSessionId) {
      setCartTableId(tableId)
      setCartTableSessionId(activeTableSessionId)
      setItems([{ dishId: dish.id, imageUrl: dish.imageUrl, name: dish.name, price: dish.price, quantity: 1 }])
      return
    }

    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.dishId === dish.id)
      if (!existingItem) {
        return [...currentItems, { dishId: dish.id, imageUrl: dish.imageUrl, name: dish.name, price: dish.price, quantity: 1 }]
      }

      return currentItems.map(item => item.dishId === dish.id
        ? { ...item, quantity: Math.min(maximumQuantity, item.quantity + 1) }
        : item)
    })
  }, [activeTableSessionId, cartTableId, cartTableSessionId, isSubmissionPending])

  const increaseQuantity = useCallback((tableId: string, dishId: string) => {
    if (cartTableId !== tableId || cartTableSessionId !== activeTableSessionId || isSubmissionPending) return
    setItems(currentItems => currentItems.map(item => item.dishId === dishId
      ? { ...item, quantity: Math.min(maximumQuantity, item.quantity + 1) }
      : item))
  }, [activeTableSessionId, cartTableId, cartTableSessionId, isSubmissionPending])

  const decreaseQuantity = useCallback((tableId: string, dishId: string) => {
    if (cartTableId !== tableId || cartTableSessionId !== activeTableSessionId || isSubmissionPending) return
    setItems(currentItems => currentItems.flatMap(item => {
      if (item.dishId !== dishId) return [item]
      if (item.quantity === 1) return []
      return [{ ...item, quantity: item.quantity - 1 }]
    }))
  }, [activeTableSessionId, cartTableId, cartTableSessionId, isSubmissionPending])

  const removeItem = useCallback((tableId: string, dishId: string) => {
    if (cartTableId !== tableId || cartTableSessionId !== activeTableSessionId || isSubmissionPending) return
    setItems(currentItems => currentItems.filter(item => item.dishId !== dishId))
  }, [activeTableSessionId, cartTableId, cartTableSessionId, isSubmissionPending])

  const clearCart = useCallback((tableId: string) => {
    if (cartTableId !== tableId) return
    setItems([])
    setCartTableId(null)
    setCartTableSessionId(null)
  }, [cartTableId])

  const value = useMemo<CustomerCartContextValue>(() => ({ cartTableId, cartTableSessionId, isSubmissionPending, items, addItem, clearCart, decreaseQuantity, increaseQuantity, removeItem, setSubmissionPending }), [addItem, cartTableId, cartTableSessionId, clearCart, decreaseQuantity, increaseQuantity, isSubmissionPending, items, removeItem])

  return <CustomerCartContext.Provider value={value}>{children}</CustomerCartContext.Provider>
}
