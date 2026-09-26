import bcrypt from 'bcryptjs'

const BCRYPT_ROUNDS = 12

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export async function comparePassword(
  candidatePassword: string,
  passwordHash: string,
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, passwordHash)
  } catch {
    return false
  }
}
