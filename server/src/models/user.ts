import { model, Schema } from 'mongoose'

import { STAFF_ROLES, type StaffRole } from '../types/staff-role.js'

export interface UserDocument {
  name: string
  username: string
  email: string
  passwordHash: string
  role: StaffRole
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: STAFF_ROLES,
      required: true,
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

export const User = model<UserDocument>('User', userSchema)
