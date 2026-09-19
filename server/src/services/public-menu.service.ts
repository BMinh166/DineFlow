import { Category } from '../models/category.js'
import { Dish } from '../models/dish.js'

export interface PublicCategoryDto {
  id: string
  name: string
}

export interface PublicDishCategoryDto {
  id: string
  name: string
}

export interface PublicDishDto {
  id: string
  category: PublicDishCategoryDto
  name: string
  description?: string
  imageUrl?: string
  price: number
  isAvailable: boolean
}

type PublicCategoryForDto = {
  _id: { toString(): string }
  name: string
}

type PublicDishForDto = {
  _id: { toString(): string }
  category: PublicCategoryForDto
  name: string
  description?: string
  imageUrl?: string
  price: number
  isAvailable: boolean
}

function toPublicCategoryDto(category: PublicCategoryForDto): PublicCategoryDto {
  return {
    id: category._id.toString(),
    name: category.name,
  }
}

function toPublicDishDto(dish: PublicDishForDto): PublicDishDto {
  return {
    id: dish._id.toString(),
    category: toPublicCategoryDto(dish.category),
    name: dish.name,
    description: dish.description,
    imageUrl: dish.imageUrl,
    price: dish.price,
    isAvailable: dish.isAvailable,
  }
}

export async function listPublicMenuCategories(): Promise<PublicCategoryDto[]> {
  const categories = await Category.find({ active: true })
    .select('_id name')
    .sort({ name: 1, _id: 1 })

  return categories.map(toPublicCategoryDto)
}

export async function listPublicMenuDishes(): Promise<PublicDishDto[]> {
  const dishes = await Dish.aggregate<PublicDishForDto>([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: Category.collection.name,
        let: { categoryId: '$categoryId' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$_id', '$$categoryId'] },
                  { $eq: ['$active', true] },
                ],
              },
            },
          },
          { $project: { _id: 1, name: 1 } },
        ],
        as: 'category',
      },
    },
    { $unwind: '$category' },
    {
      $project: {
        _id: 1,
        category: 1,
        name: 1,
        description: 1,
        imageUrl: 1,
        price: 1,
        isAvailable: 1,
      },
    },
    { $sort: { 'category.name': 1, name: 1, _id: 1 } },
  ])

  return dishes.map(toPublicDishDto)
}
