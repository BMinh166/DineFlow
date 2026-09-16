import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'

import { connectDatabase } from '../config/database.js'
import { User } from '../models/user.js'

const BCRYPT_ROUNDS = 12

interface SeedManagerConfig {
  name: string
  username: string
  email: string
  password: string
}

function getRequiredSeedValue(name: string): string {
  const value = process.env[name]

  if (!value?.trim()) {
    throw new Error(`Missing required seed configuration: ${name}`)
  }

  return value
}

function getSeedManagerConfig(): SeedManagerConfig {
  return {
    name: getRequiredSeedValue('SEED_MANAGER_NAME'),
    username: getRequiredSeedValue('SEED_MANAGER_USERNAME'),
    email: getRequiredSeedValue('SEED_MANAGER_EMAIL'),
    password: getRequiredSeedValue('SEED_MANAGER_PASSWORD'),
  }
}

async function seedManager(): Promise<void> {
  const config = getSeedManagerConfig()
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
      const validExistingManager = existingUser.role === 'MANAGER' && existingUser.active

      if (sameIdentity && validExistingManager) {
        console.log('Initial Manager account already exists; no changes made.')
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
      role: 'MANAGER',
      active: true,
    })

    console.log('Initial Manager account created successfully.')
  } finally {
    if (connected) {
      await mongoose.disconnect()
    }
  }
}

seedManager().catch(() => {
  console.error('Initial Manager seed failed.')
  process.exitCode = 1
})
