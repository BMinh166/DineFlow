# DineFlow

DineFlow is a restaurant ordering and management system for the full table-service lifecycle. It gives customers a table-specific menu and ordering experience, while Waiter, Kitchen, and Manager roles handle operations from opening a table through payment and reporting.

V1.0 has four roles:

- **Customer** — a guest who browses a table menu and joins the current table session before ordering.
- **Waiter** — opens tables, provides the current join code, can assist with orders, and confirms payment.
- **Kitchen** — processes queued order items.
- **Manager** — manages staff, menu data, tables, operational views, and reporting.

Each table has a static QR route. Scanning it identifies the table and permits public menu browsing; it does **not** authorize ordering. A Customer must join that table's current active session with the code supplied by the Waiter.

## Core flow

```text
AVAILABLE table
  -> Waiter opens table
  -> ACTIVE TableSession + OPEN Order
  -> Customer scans or opens the table QR route
  -> Customer joins with the current table code
  -> Customer or Waiter adds dishes
  -> Kitchen: PENDING -> PREPARING -> COMPLETED
  -> Customer requests payment
  -> PAYMENT_REQUESTED
  -> Waiter confirms payment after every item is COMPLETED
  -> Order CLOSED + TableSession CLOSED + Table AVAILABLE
  -> Closed order appears in Manager History and reporting
```

## Technology stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, Axios, React Router, and Lucide React.

**Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose, Zod, JWT, and bcryptjs.

**Development/tooling:** Git/GitHub and Postman.

## Repository structure

```text
client/  React/Vite frontend
server/  Express/Mongoose API and seed utilities
docs/    Documentation workspace (detailed Phase 29 technical documents are prepared separately)
```

## Prerequisites

- Node.js and npm (the repository does not declare a fixed Node.js version).
- Access to MongoDB through either a local-compatible connection URI or MongoDB Atlas.

## Installation

Install dependencies for the backend and frontend separately:

```powershell
cd server
npm install
```

```powershell
cd client
npm install
```

## Environment configuration

Create local environment files from the tracked templates. Do not commit the resulting `.env` files.

```powershell
cd server
Copy-Item .env.example .env

cd ..\client
Copy-Item .env.example .env
```

Configure `server/.env` with private values appropriate to your environment:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=<your-mongodb-connection-uri>
JWT_SECRET=<private-staff-jwt-secret>
JWT_EXPIRES_IN=8h
CUSTOMER_SESSION_SECRET=<private-customer-session-secret>
CUSTOMER_SESSION_EXPIRES_IN=4h
CLIENT_ORIGIN=http://localhost:5173

SEED_MANAGER_NAME=<initial-manager-name>
SEED_MANAGER_USERNAME=<initial-manager-username>
SEED_MANAGER_EMAIL=<initial-manager-email>
SEED_MANAGER_PASSWORD=<private-initial-manager-password>
```

`JWT_EXPIRES_IN` must be `8h`, and `CUSTOMER_SESSION_EXPIRES_IN` must be `4h`. Keep connection URIs, secrets, and seed passwords private.

For the frontend, configure `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

Optional **development-only** staff seed variables belong in `server/.env` when using the staff seed utility:

```env
SEED_STAFF_NAME=<staff-name>
SEED_STAFF_USERNAME=<staff-username>
SEED_STAFF_EMAIL=<staff-email>
SEED_STAFF_PASSWORD=<private-staff-password>
SEED_STAFF_ROLE=WAITER
```

`SEED_STAFF_ROLE` accepts only `WAITER` or `KITCHEN`. The utility refuses to run in production.

## Running locally

Start the API after MongoDB is reachable:

```powershell
cd server
npm run dev
```

Start the frontend in a second terminal:

```powershell
cd client
npm run dev
```

The development environment templates configure the frontend for `http://localhost:5173` and the API for `http://localhost:3000/api`. The API health endpoint is `GET /api/health`.

Available production-oriented scripts are:

```powershell
# server/
npm run build
npm run start

# client/
npm run build
npm run preview
```

## Initial Manager bootstrap

There is no public Manager registration. Set the private `SEED_MANAGER_*` values in an untracked `server/.env`, then run:

```powershell
cd server
npm run seed:manager
```

This explicit seed creates the configured active Manager account. Re-running it with the same active Manager identity makes no changes; it does not reset passwords or update an existing account. Do not leave seed credentials in tracked files.

## Staff and role preparation

Use the Manager Staff Management UI to create and manage Waiter and Kitchen accounts for normal operation. The development-only `npm run seed:staff` command is available for local/test preparation, never exposes an HTTP endpoint, and is not a production workflow.

Customers are guests authenticated by a session for the active table; they are not staff accounts. Do not publish demo usernames, passwords, tokens, or join codes.

## Key business rules

- A Table can have at most one active `TableSession`.
- The QR route identifies a Table but does not grant ordering permission; the Customer must join its current active session.
- A join code belongs only to the current active session.
- The backend authoritatively calculates dish price snapshots and integer-VND totals.
- Each submitted order request appends new `PENDING` items; it does not merge with existing order items.
- Kitchen items transition only from `PENDING` to `PREPARING` to `COMPLETED`.
- `PAYMENT_REQUESTED` prevents new item additions until a Waiter cancels the request and the order returns to `OPEN`.
- Payment confirmation requires every order item to be `COMPLETED`.
- Payment confirmation closes the Order and TableSession and returns the Table to `AVAILABLE`.
- Closed order snapshots remain historical, and revenue reporting uses `CLOSED` orders.
- The backend enforces role permissions for staff operations.

## Production context

The accepted V1.0 production topology is a static single-page application hosted on Render, connected to a Node/Express API service on Render, backed by MongoDB Atlas. Private deployment configuration, database connection details, and credentials are intentionally not documented here.

## Documentation

Detailed architecture, data-model, state, authorization, API, and risk-handling documentation belongs under `docs/` and is prepared separately during Phase 29. This README remains the concise project entry point.
