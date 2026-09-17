import { model, Schema } from 'mongoose'

import { TABLE_STATUSES, type TableStatus } from '../types/table-status.js'

export interface TableDocument {
  number: number
  status: TableStatus
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const tableSchema = new Schema<TableDocument>(
  {
    number: {
      type: Number,
      required: true,
      min: 1,
      unique: true,
      validate: {
        validator: Number.isInteger,
        message: 'Table number must be an integer.',
      },
    },
    status: {
      type: String,
      enum: TABLE_STATUSES,
      required: true,
      default: 'AVAILABLE',
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

export const Table = model<TableDocument>('Table', tableSchema)
