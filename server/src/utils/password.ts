import bcrypt from 'bcryptjs'

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
