import { model, Schema } from 'mongoose'

export interface CategoryDocument {
  name: string
  description?: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const categorySchema = new Schema<CategoryDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

export const Category = model<CategoryDocument>('Category', categorySchema)
