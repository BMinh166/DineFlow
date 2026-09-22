import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

import { connectDatabase } from '../config/database.js'
import { User } from '../models/user.js'

const BCRYPT_ROUNDS = 12
const SEEDABLE_STAFF_ROLES = ['WAITER', 'KITCHEN'] as const

type SeedableStaffRole = (typeof SEEDABLE_STAFF_ROLES)[number]

interface SeedStaffConfig {
  name: string
  username: string
  email: string
  password: string
  role: SeedableStaffRole
}

function getRequiredSeedValue(name: string): string {
  const value = process.env[name]

  if (!value?.trim()) {
    throw new Error(`Missing required seed configuration: ${name}`)
  }

  return value
}

function getSeedStaffRole(): SeedableStaffRole {
  const role = getRequiredSeedValue('SEED_STAFF_ROLE').trim().toUpperCase()

  if (!SEEDABLE_STAFF_ROLES.includes(role as SeedableStaffRole)) {
    throw new Error('SEED_STAFF_ROLE must be WAITER or KITCHEN.')
  }

  return role as SeedableStaffRole
}

function getSeedStaffConfig(): SeedStaffConfig {
  return {
    name: getRequiredSeedValue('SEED_STAFF_NAME'),
    username: getRequiredSeedValue('SEED_STAFF_USERNAME'),
    email: getRequiredSeedValue('SEED_STAFF_EMAIL'),
    password: getRequiredSeedValue('SEED_STAFF_PASSWORD'),
    role: getSeedStaffRole(),
  }
}

async function seedStaff(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Staff seeding is not allowed in production.')
  }

  const config = getSeedStaffConfig()
  let connected = false

  try {
    await connectDatabase()
    connected = true

    const matchingUsers = await User.find({
      $or: [
        { username: config.username },
        { email: config.email },
      ],
    })

    if (matchingUsers.length === 1) {
      const [existingUser] = matchingUsers
      const sameIdentity =
        existingUser.username === config.username && existingUser.email === config.email
      const validExistingStaff = existingUser.role === config.role && existingUser.active

      if (sameIdentity && validExistingStaff) {
        console.log(`Configured ${config.role} account already exists; no changes made.`)
        return
      }
    }

    if (matchingUsers.length > 0) {
      console.error('Configured seed identity conflicts with an existing user.')
      process.exitCode = 1
      return
    }

    const passwordHash = await bcrypt.hash(config.password, BCRYPT_ROUNDS)

    await User.create({
      name: config.name,
      username: config.username,
      email: config.email,
      passwordHash,
      role: config.role,
      active: true,
    })

    console.log(`${config.role} account created successfully.`)
  } finally {
    if (connected) {
      await mongoose.disconnect()
    }
  }
}

seedStaff().catch(error => {
  console.error(error instanceof Error ? error.message : 'Staff seed failed.')
  process.exitCode = 1
})
