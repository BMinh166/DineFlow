import { Category } from '../models/category.js'
import { Dish } from '../models/dish.js'
import { NotFound } from '../utils/app-error.js'
import type { CreateDishRequest } from '../validators/dish.validator.js'

export interface DishCategoryDto {
  id: string
  name: string
}

export interface DishDto {
  id: string
  category: DishCategoryDto | null
  name: string
  description?: string
  imageUrl?: string
  price: number
  isActive: boolean
  isAvailable: boolean
  createdAt: Date
  updatedAt: Date
}

type DishForDto = {
  _id: { toString(): string }
  categoryId: { toString(): string }
  name: string
  description?: string
  imageUrl?: string
  price: number
  isActive: boolean
  isAvailable: boolean
  createdAt: Date
  updatedAt: Date
}

type CategoryForDto = {
  _id: { toString(): string }
  name: string
}

function toDishDto(dish: DishForDto, category: CategoryForDto | undefined): DishDto {
  return {
    id: dish._id.toString(),
    category: category ? { id: category._id.toString(), name: category.name } : null,
    name: dish.name,
    description: dish.description,
    imageUrl: dish.imageUrl,
    price: dish.price,
    isActive: dish.isActive,
    isAvailable: dish.isAvailable,
    createdAt: dish.createdAt,
    updatedAt: dish.updatedAt,
  }
}

export async function listManagerDishes(): Promise<DishDto[]> {
  const dishes = await Dish.find()
    .select('_id categoryId name description imageUrl price isActive isAvailable createdAt updatedAt')
    .sort({ name: 1, _id: 1 })
  const categoryIds = dishes.map(dish => dish.categoryId)
  const categories = await Category.find({ _id: { $in: categoryIds } }).select('_id name')
  const categoriesById = new Map(categories.map(category => [category._id.toString(), category]))

  return dishes.map(dish => toDishDto(dish, categoriesById.get(dish.categoryId.toString())))
}

export async function createManagerDish({ categoryId, name, description, imageUrl, price }: CreateDishRequest): Promise<DishDto> {
  const category = await Category.findById(categoryId).select('_id name')

  if (!category) {
    throw new NotFound('Category not found.', 'CATEGORY_NOT_FOUND')
  }

  const dish = new Dish({
    categoryId,
    name,
    ...(description === undefined ? {} : { description }),
    ...(imageUrl === undefined ? {} : { imageUrl }),
    price,
  })

  await dish.save()
  return toDishDto(dish, category)
}
