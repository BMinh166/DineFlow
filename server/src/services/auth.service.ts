import { User } from '../models/user.js'
import type { StaffRole } from '../types/staff-role.js'
import { Forbidden, Unauthorized } from '../utils/app-error.js'
import { comparePassword } from '../utils/password.js'
import { signStaffToken } from '../utils/staff-jwt.js'
import type { StaffLoginRequest } from '../validators/auth.validator.js'

const invalidCredentialsMessage = 'Incorrect username/email or password.'
const invalidCredentialsCode = 'INVALID_CREDENTIALS'
const inactiveAccountMessage = 'This account is inactive. Contact your manager.'
const inactiveAccountCode = 'INACTIVE_ACCOUNT'

export interface StaffLoginResult {
  token: string
  user: {
    id: string
    name: string
    username: string
    email: string
    role: StaffRole
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
    user: {
      id: user._id.toString(),
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
    },
  }
}
