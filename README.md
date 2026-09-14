# DineFlow

Restaurant Ordering & Management System — Software Engineering Project.

## Project structure

- `client/` — React, TypeScript, Vite, and Tailwind CSS frontend.
- `server/` — Node.js, TypeScript, Express, and Mongoose backend.
- `docs/` — project documentation.

## Local bootstrap

Install dependencies separately for each application:

```powershell
cd client
npm install
npm run dev
```

```powershell
cd server
Copy-Item .env.example .env
# Set MONGODB_URI in .env before starting the backend.
npm install
npm run dev
```

The backend starts only after connecting to MongoDB. Its foundation health endpoint is available at `GET /api/health`.
