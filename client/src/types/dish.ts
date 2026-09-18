export interface DishCategory {
  id: string
  name: string
}

export interface Dish {
  id: string
  category: DishCategory | null
  name: string
  description?: string
  imageUrl?: string
  price: number
  isActive: boolean
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}
