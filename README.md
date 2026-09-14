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
npm install
npm run dev
```

The server environment file intentionally contains placeholders only. MongoDB connection, API routes, error handling, and product features are not part of this bootstrap task.
