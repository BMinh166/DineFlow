import { Category } from '../models/category.js'
import { Dish } from '../models/dish.js'
import { NotFound } from '../utils/app-error.js'
import type { CreateDishRequest, UpdateDishRequest } from '../validators/dish.validator.js'

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

async function findDishCategoryDto(categoryId: { toString(): string }): Promise<CategoryForDto | undefined> {
  const category = await Category.findById(categoryId).select('_id name')

  return category
    ? { _id: category._id, name: category.name ?? '' }
    : undefined
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

async function findDishOrThrow(dishId: string) {
  const dish = await Dish.findById(dishId)

  if (!dish) {
    throw new NotFound('Dish not found.', 'DISH_NOT_FOUND')
  }

  return dish
}

export async function updateManagerDish(dishId: string, update: UpdateDishRequest): Promise<DishDto> {
  const dish = await findDishOrThrow(dishId)
  let category: CategoryForDto | undefined

  if (update.categoryId !== undefined) {
    const foundCategory = await Category.findById(update.categoryId).select('_id name')

    if (!foundCategory) {
      throw new NotFound('Category not found.', 'CATEGORY_NOT_FOUND')
    }

    dish.categoryId = foundCategory._id
    category = {
      _id: foundCategory._id,
      name: foundCategory.name ?? '',
    }
  }

  if (update.name !== undefined) dish.name = update.name
  if (update.description !== undefined) dish.description = update.description
  if (update.imageUrl !== undefined) dish.imageUrl = update.imageUrl
  if (update.price !== undefined) dish.price = update.price

  await dish.save()

  if (!category) {
    category = await findDishCategoryDto(dish.categoryId)
  }

  return toDishDto(dish, category)
}

export async function setManagerDishActive(dishId: string, isActive: boolean): Promise<DishDto> {
  const dish = await findDishOrThrow(dishId)
  dish.isActive = isActive
  await dish.save()

  const category = await findDishCategoryDto(dish.categoryId)
  return toDishDto(dish, category)
}

export async function setManagerDishAvailable(dishId: string, isAvailable: boolean): Promise<DishDto> {
  const dish = await findDishOrThrow(dishId)
  dish.isAvailable = isAvailable
  await dish.save()

  const category = await findDishCategoryDto(dish.categoryId)
  return toDishDto(dish, category)
}
