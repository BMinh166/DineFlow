import { model, Schema, Types } from 'mongoose'

import {
  ORDER_ITEM_STATUSES,
  type OrderItemStatus,
} from '../types/order-item-status.js'
import { ORDER_STATUSES, type OrderStatus } from '../types/order-status.js'

export interface OrderItemDocument {
  dishId: Types.ObjectId
  dishNameSnapshot: string
  unitPriceSnapshot: number
  quantity: number
  status: OrderItemStatus
  createdAt: Date
  updatedAt: Date
}

export interface OrderDocument {
  tableSessionId: Types.ObjectId
  status: OrderStatus
  items: OrderItemDocument[]
  total: number
  paymentRequestedAt?: Date
  closedAt?: Date
  closedBy?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const orderItemSchema = new Schema<OrderItemDocument>(
  {
    dishId: {
      type: Schema.Types.ObjectId,
      ref: 'Dish',
      required: true,
    },
    dishNameSnapshot: {
      type: String,
      required: true,
    },
    unitPriceSnapshot: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Unit price snapshot must be an integer.',
      },
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be an integer.',
      },
    },
    status: {
      type: String,
      enum: ORDER_ITEM_STATUSES,
      required: true,
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  },
)

const orderSchema = new Schema<OrderDocument>(
  {
    tableSessionId: {
      type: Schema.Types.ObjectId,
      ref: 'TableSession',
      required: true,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      required: true,
      default: 'OPEN',
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    total: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Total must be an integer.',
      },
    },
    paymentRequestedAt: {
      type: Date,
    },
    closedAt: {
      type: Date,
    },
    closedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
)

orderSchema.index({ tableSessionId: 1 })
orderSchema.index({ status: 1, closedAt: -1 })

export const Order = model<OrderDocument>('Order', orderSchema)
