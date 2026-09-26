import { User } from '../models/user.js'
import type { StaffRole } from '../types/staff-role.js'
import { Conflict, NotFound } from '../utils/app-error.js'
import { hashPassword } from '../utils/password.js'
import type { CreateStaffRequest, UpdateStaffRequest } from '../validators/staff.validator.js'

export interface ManagedStaffDto {
  id: string
  name: string
  username: string
  email: string
  role: StaffRole
  active: boolean
  createdAt: Date
  updatedAt: Date
}

type StaffForDto = {
  _id: { toString(): string }
  name: string
  username: string
  email: string
  role: StaffRole
  active: boolean
  createdAt: Date
  updatedAt: Date
}

function toManagedStaffDto(user: StaffForDto): ManagedStaffDto {
  return {
    id: user._id.toString(),
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

function duplicateUsernameError(): Conflict {
  return new Conflict('Username already exists.', 'USERNAME_ALREADY_EXISTS')
}

function duplicateEmailError(): Conflict {
  return new Conflict('Email already exists.', 'EMAIL_ALREADY_EXISTS')
}

function duplicateIdentifierError(): Conflict {
  return new Conflict('Username or email already exists.', 'STAFF_IDENTIFIER_ALREADY_EXISTS')
}

function duplicateKeyField(error: unknown): 'username' | 'email' | null {
  if (typeof error !== 'object' || error === null) return null

  const databaseError = error as { code?: unknown; keyPattern?: unknown }
  if (databaseError.code !== 11000 || typeof databaseError.keyPattern !== 'object' || databaseError.keyPattern === null) {
    return null
  }

  const keyPattern = databaseError.keyPattern as Record<string, unknown>
  if ('username' in keyPattern) return 'username'
  if ('email' in keyPattern) return 'email'
  return null
}

export async function listManagerStaff(): Promise<ManagedStaffDto[]> {
  const staff = await User.find()
    .select('_id name username email role active createdAt updatedAt')
    .sort({ name: 1, _id: 1 })

  return staff.map(toManagedStaffDto)
}

export async function createManagerStaff({
  name,
  username,
  email,
  password,
  role,
  active,
}: CreateStaffRequest): Promise<ManagedStaffDto> {
  const existingUser = await User.findOne({ $or: [{ username }, { email }] })
    .select('_id username email')

  if (existingUser?.username === username) throw duplicateUsernameError()
  if (existingUser?.email === email) throw duplicateEmailError()

  const passwordHash = await hashPassword(password)
  const user = new User({
    name,
    username,
    email,
    passwordHash,
    role,
    ...(active === undefined ? {} : { active }),
  })

  try {
    await user.save()
  } catch (error) {
    const field = duplicateKeyField(error)
    if (field === 'username') throw duplicateUsernameError()
    if (field === 'email') throw duplicateEmailError()
    if (typeof error === 'object' && error !== null && (error as { code?: unknown }).code === 11000) {
      throw duplicateIdentifierError()
    }
    throw error
  }

  return toManagedStaffDto(user)
}

async function findStaffOrThrow(staffId: string) {
  const staff = await User.findById(staffId)

  if (!staff) {
    throw new NotFound('Staff not found.', 'STAFF_NOT_FOUND')
  }

  return staff
}

export async function updateManagerStaff(staffId: string, update: UpdateStaffRequest): Promise<ManagedStaffDto> {
  const staff = await findStaffOrThrow(staffId)

  if (update.username !== undefined && update.username !== staff.username) {
    const existingUser = await User.exists({ username: update.username, _id: { $ne: staff._id } })
    if (existingUser) throw duplicateUsernameError()
    staff.username = update.username
  }

  if (update.email !== undefined && update.email !== staff.email) {
    const existingUser = await User.exists({ email: update.email, _id: { $ne: staff._id } })
    if (existingUser) throw duplicateEmailError()
    staff.email = update.email
  }

  if (update.name !== undefined) staff.name = update.name
  if (update.role !== undefined) staff.role = update.role

  try {
    await staff.save()
  } catch (error) {
    const field = duplicateKeyField(error)
    if (field === 'username') throw duplicateUsernameError()
    if (field === 'email') throw duplicateEmailError()
    if (typeof error === 'object' && error !== null && (error as { code?: unknown }).code === 11000) {
      throw duplicateIdentifierError()
    }
    throw error
  }

  return toManagedStaffDto(staff)
}

export async function activateManagerStaff(staffId: string): Promise<ManagedStaffDto> {
  const staff = await findStaffOrThrow(staffId)
  staff.active = true
  await staff.save()

  return toManagedStaffDto(staff)
}

export async function deactivateManagerStaff(staffId: string): Promise<ManagedStaffDto> {
  const staff = await findStaffOrThrow(staffId)
  staff.active = false
  await staff.save()

  return toManagedStaffDto(staff)
}
