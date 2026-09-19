export interface PublicCategory {
  id: string
  name: string
}

export interface PublicDish {
  id: string
  category: PublicCategory
  name: string
  description?: string
  imageUrl?: string
  price: number
  isAvailable: boolean
}

export interface PublicTable {
  id: string
  number: number
}
