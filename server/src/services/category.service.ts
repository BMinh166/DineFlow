import { Category } from '../models/category.js'
import type { CreateCategoryRequest } from '../validators/category.validator.js'

export interface CategoryDto {
  id: string
  name: string
  description?: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

type CategoryForDto = {
  _id: { toString(): string }
  name: string
  description?: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

function toCategoryDto(category: CategoryForDto): CategoryDto {
  return {
    id: category._id.toString(),
    name: category.name,
    description: category.description,
    active: category.active,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }
}

export async function listManagerCategories(): Promise<CategoryDto[]> {
  const categories = await Category.find()
    .select('_id name description active createdAt updatedAt')
    .sort({ name: 1, _id: 1 })

  return categories.map(toCategoryDto)
}

export async function createManagerCategory({ name, description }: CreateCategoryRequest): Promise<CategoryDto> {
  const category = new Category({
    name,
    ...(description === undefined ? {} : { description }),
  })

  await category.save()
  return toCategoryDto(category)
}
