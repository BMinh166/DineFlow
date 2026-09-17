import { User } from '../models/user.js'
import type { AuthContext } from '../types/auth-context.js'
import { STAFF_ROLES, type StaffRole } from '../types/staff-role.js'
import { Forbidden, Unauthorized } from '../utils/app-error.js'
import { comparePassword } from '../utils/password.js'
import { signStaffToken } from '../utils/staff-jwt.js'
import type { StaffLoginRequest } from '../validators/auth.validator.js'

const invalidCredentialsMessage = 'Incorrect username/email or password.'
const invalidCredentialsCode = 'INVALID_CREDENTIALS'
const inactiveAccountMessage = 'This account is inactive. Contact your manager.'
const inactiveAccountCode = 'INACTIVE_ACCOUNT'
const authenticationFailureCode = 'AUTHENTICATION_FAILED'

export interface StaffUserDto {
  id: string
  name: string
  username: string
  email: string
  role: StaffRole
}

export interface StaffLoginResult {
  token: string
  user: StaffUserDto
}

type StaffUserForDto = {
  _id: { toString(): string }
  name: string
  username: string
  email: string
  role: StaffRole
}

function authenticationFailure(): Unauthorized {
  return new Unauthorized('Unauthorized.', authenticationFailureCode)
}

function isStaffRole(role: unknown): role is StaffRole {
  return typeof role === 'string' && STAFF_ROLES.includes(role as StaffRole)
}

export function toStaffUserDto(user: StaffUserForDto): StaffUserDto {
  return {
    id: user._id.toString(),
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
  }
}

export async function loginStaff({
  identifier,
  password,
}: StaffLoginRequest): Promise<StaffLoginResult> {
  const user = await User.findOne({
    $or: [{ username: identifier }, { email: identifier }],
  }).select('+passwordHash')

  if (!user || !(await comparePassword(password, user.passwordHash))) {
    throw new Unauthorized(invalidCredentialsMessage, invalidCredentialsCode)
  }

  if (!user.active) {
    throw new Forbidden(inactiveAccountMessage, inactiveAccountCode)
  }

  return {
    token: signStaffToken({ userId: user._id.toString(), role: user.role }),
    user: toStaffUserDto(user),
  }
}

export async function getCurrentStaff(auth: AuthContext | undefined): Promise<StaffUserDto> {
  if (!auth) {
    throw authenticationFailure()
  }

  const user = await User.findById(auth.userId).select('_id name username email role active')

  if (!user || !user.active || !isStaffRole(user.role) || user.role !== auth.role) {
    throw authenticationFailure()
  }

  return toStaffUserDto(user)
}
