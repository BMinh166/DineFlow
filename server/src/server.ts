import { app } from './app.js'
import { connectDatabase } from './config/database.js'
import { env } from './config/env.js'

async function startServer(): Promise<void> {
  try {
    await connectDatabase()

    app.listen(env.port, () => {
      console.log(`DineFlow server listening on port ${env.port}`)
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown startup error.'
    console.error(`Failed to start DineFlow server: ${message}`)
    process.exit(1)
  }
}

void startServer()
