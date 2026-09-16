import { model, Schema, Types } from 'mongoose'

import {
  TABLE_SESSION_STATUSES,
  type TableSessionStatus,
} from '../types/table-session-status.js'

export interface TableSessionDocument {
  tableId: Types.ObjectId
  joinCode: number
  status: TableSessionStatus
  openedBy: Types.ObjectId
  openedAt: Date
  closedBy?: Types.ObjectId
  closedAt?: Date
  currentOrderId?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const tableSessionSchema = new Schema<TableSessionDocument>(
  {
    tableId: {
      type: Schema.Types.ObjectId,
      ref: 'Table',
      required: true,
    },
    joinCode: {
      type: Number,
      required: true,
      min: 1000,
      max: 9999,
      validate: {
        validator: Number.isInteger,
        message: 'Join code must be a 4-digit integer.',
      },
    },
    status: {
      type: String,
      enum: TABLE_SESSION_STATUSES,
      required: true,
      default: 'ACTIVE',
    },
    openedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    openedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    closedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    closedAt: {
      type: Date,
    },
    currentOrderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
  },
  {
    timestamps: true,
  },
)

tableSessionSchema.index(
  { tableId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'ACTIVE' },
  },
)

export const TableSession = model<TableSessionDocument>(
  'TableSession',
  tableSessionSchema,
)
