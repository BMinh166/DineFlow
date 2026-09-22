import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react'

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
  items: CustomerCartItem[]
  addItem: (tableId: string, dish: PublicDish) => void
  clearCart: (tableId: string) => void
  decreaseQuantity: (tableId: string, dishId: string) => void
  increaseQuantity: (tableId: string, dishId: string) => void
  removeItem: (tableId: string, dishId: string) => void
}

export const CustomerCartContext = createContext<CustomerCartContextValue | undefined>(undefined)

const maximumQuantity = 99

export function CustomerCartProvider({ children }: { children: ReactNode }) {
  const [cartTableId, setCartTableId] = useState<string | null>(null)
  const [items, setItems] = useState<CustomerCartItem[]>([])

  const addItem = useCallback((tableId: string, dish: PublicDish) => {
    if (cartTableId !== tableId) {
      setCartTableId(tableId)
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
  }, [cartTableId])

  const increaseQuantity = useCallback((tableId: string, dishId: string) => {
    if (cartTableId !== tableId) return
    setItems(currentItems => currentItems.map(item => item.dishId === dishId
      ? { ...item, quantity: Math.min(maximumQuantity, item.quantity + 1) }
      : item))
  }, [cartTableId])

  const decreaseQuantity = useCallback((tableId: string, dishId: string) => {
    if (cartTableId !== tableId) return
    setItems(currentItems => currentItems.flatMap(item => {
      if (item.dishId !== dishId) return [item]
      if (item.quantity === 1) return []
      return [{ ...item, quantity: item.quantity - 1 }]
    }))
  }, [cartTableId])

  const removeItem = useCallback((tableId: string, dishId: string) => {
    if (cartTableId !== tableId) return
    setItems(currentItems => currentItems.filter(item => item.dishId !== dishId))
  }, [cartTableId])

  const clearCart = useCallback((tableId: string) => {
    if (cartTableId !== tableId) return
    setItems([])
    setCartTableId(null)
  }, [cartTableId])

  const value = useMemo<CustomerCartContextValue>(() => ({ cartTableId, items, addItem, clearCart, decreaseQuantity, increaseQuantity, removeItem }), [addItem, cartTableId, clearCart, decreaseQuantity, increaseQuantity, items, removeItem])

  return <CustomerCartContext.Provider value={value}>{children}</CustomerCartContext.Provider>
}
