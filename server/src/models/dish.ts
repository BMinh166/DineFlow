import { model, Schema, Types } from 'mongoose'

export interface DishDocument {
  categoryId: Types.ObjectId
  name: string
  description?: string
  imageUrl?: string
  price: number
  isActive: boolean
  isAvailable: boolean
  createdAt: Date
  updatedAt: Date
}

const dishSchema = new Schema<DishDocument>(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Price must be an integer.',
      },
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    isAvailable: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

dishSchema.index({ categoryId: 1, isActive: 1, isAvailable: 1 })

export const Dish = model<DishDocument>('Dish', dishSchema)
