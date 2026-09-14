import { app } from './app.js'

const port = Number(process.env.PORT ?? 3000)

app.listen(port, () => {
  console.log(`DineFlow server bootstrap listening on port ${port}`)
})
