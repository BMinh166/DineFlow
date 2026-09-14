import mongoose from 'mongoose'
import { env } from './env.js'

export async function connectDatabase(): Promise<void> {
  if (!env.mongodbUri) {
    throw new Error('MONGODB_URI is required to start the server.')
  }

  await mongoose.connect(env.mongodbUri)
  console.log('MongoDB connected')
}
