# DineFlow V1.0 Authorization, API, and Risk Handling

This document records the implemented V1.0 authority boundaries, Express API surface, validation conventions, and important operational protections. It describes backend-enforced behavior rather than inferring permission from client UI visibility.

## Authentication models

### Staff authority

Staff sign in with a username or email and password. Successful authentication produces staff JWT authority for one of the three staff roles: `WAITER`, `KITCHEN`, or `MANAGER`.

Protected staff routes require a Bearer token. The API validates the token, reloads the referenced User, and requires an active account whose current role matches the token role before assigning request authority. Role middleware then enforces the route's allowed staff role. An inactive account, malformed/invalid token, missing account, or changed role is rejected.

The staff login/current-user DTOs expose staff identity fields needed by the client, not `passwordHash`. There is no public staff or Manager registration endpoint.

### Customer authority

A Customer is a guest, not a staff User and not a staff-JWT account. Public table/menu browsing identifies a Table but grants no ordering authority. Joining an occupied Table with the current active-session join code establishes separate Customer-session authority.

Customer-protected routes require Customer-session Bearer authority. The API validates the token, reloads the referenced TableSession, requires it to remain `ACTIVE`, and confirms its Table binding. When the session closes, its former Customer authority is rejected. The Customer routes derive the active session and current Order server-side rather than accepting a client-selected Order identity.

## Authorization matrix

`✓` means the listed authority is required and accepted for that capability. `—` means that role/session authority is not used for the capability; it does not imply an additional route. Public operations may still require valid path/body input and lifecycle state.

| Capability | Public / unauthenticated | Customer session | Waiter | Kitchen | Manager |
| --- | :---: | :---: | :---: | :---: | :---: |
| Browse public menu and active Table information | ✓ | — | — | — | — |
| Join an active Table | ✓ (current join code required) | — | — | — | — |
| View Customer current Order | — | ✓ | — | — | — |
| Add Customer Order items | — | ✓ | — | — | — |
| Request payment | — | ✓ | — | — | — |
| View Waiter table board/detail | — | — | ✓ | — | — |
| Open Table | — | — | ✓ | — | — |
| Waiter-assisted item addition | — | — | ✓ | — | — |
| Cancel payment request | — | — | ✓ | — | — |
| Confirm payment | — | — | ✓ | — | — |
| View Kitchen queue | — | — | — | ✓ | — |
| Start Kitchen item | — | — | — | ✓ | — |
| Complete Kitchen item | — | — | — | ✓ | — |
| Manage staff | — | — | — | — | ✓ |
| Manage categories | — | — | — | — | ✓ |
| Manage dishes | — | — | — | — | ✓ |
| Manage tables | — | — | — | — | ✓ |
| View/generate table QR in Manager UI | — | — | — | — | ✓ |
| View Current Orders | — | — | — | — | ✓ |
| View History | — | — | — | — | ✓ |
| View Revenue | — | — | — | — | ✓ |
| View Top Dishes | — | — | — | — | ✓ |
| View Dashboard | — | — | — | — | ✓ |

The Manager QR screen uses Manager-authorized table data; there is no dedicated QR-generation API route. Public table lookup remains separate and does not disclose an active session's join code or authorize ordering.

## API reference

All paths below include the `/api` prefix. Inputs listed are the significant validated inputs, not an exhaustive DTO schema.

### Health — 1 endpoint

| Method | Path | Authority | Purpose / important conditions |
| --- | --- | --- | --- |
| GET | `/health` | Public | Health status and server timestamp. |

### Public and Customer — 8 endpoints

| Method | Path | Authority | Purpose / important conditions |
| --- | --- | --- | --- |
| GET | `/public/menu/categories` | Public | List active menu categories. |
| GET | `/public/menu/dishes` | Public | List active dishes whose Category is active; availability is returned for presentation. |
| GET | `/public/tables/:tableId` | Public | Return an active Table's public identity. `tableId` must be a valid ObjectId. |
| POST | `/public/tables/:tableId/join` | Public | Join the requested Table's active session. Body: four-digit integer `joinCode`; requires active, occupied Table and matching current session. |
| GET | `/customer/session` | Customer session | Return the authenticated Customer session context after exact active-session validation. |
| GET | `/customer/orders/current` | Customer session | Return the current Order derived from the authenticated active TableSession. |
| POST | `/customer/orders/items` | Customer session | Append items to the current `OPEN` Order. Body: non-empty unique `dishId` items with integer `quantity` 1–99; server validates Dish/Category state and derives snapshots/total. |
| POST | `/customer/orders/request-payment` | Customer session | Mark the current `OPEN` Order `PAYMENT_REQUESTED`; an already-requested Order returns its existing request state. |

The QR/table ID is not Customer order authority. Join-code validation is scoped to the requested Table's `ACTIVE` TableSession; repeated failed joins are subject to the implemented per-table cooldown.

### Staff authentication — 2 endpoints

| Method | Path | Authority | Purpose / important conditions |
| --- | --- | --- | --- |
| POST | `/auth/login` | Public | Staff login. Strict body: `identifier` (username or email) and `password`; inactive/invalid credentials are rejected. |
| GET | `/auth/me` | Any authenticated staff role | Return the current active staff User's safe DTO after staff-token and current-account validation. |

### Waiter — 6 endpoints

All routes in this group require authenticated `WAITER` authority.

| Method | Path | Purpose / important conditions |
| --- | --- | --- |
| GET | `/waiter/tables` | List operational table-board data and active-session/current-order status. |
| POST | `/waiter/tables/:tableId/open` | Open an active `AVAILABLE` Table. Creates an `ACTIVE` TableSession and `OPEN` Order, then binds `currentOrderId`; rejects occupied/inactive/conflicting state. |
| GET | `/waiter/tables/:tableId/session` | Return the active session and current Order for an occupied active Table, including the operational join code for the Waiter. |
| POST | `/waiter/tables/:tableId/items` | Assisted item addition to the Table's server-derived active session/current `OPEN` Order. Uses the same validated item input and authoritative menu checks as Customer item addition. |
| POST | `/waiter/tables/:tableId/cancel-payment-request` | Return the table's current Order from `PAYMENT_REQUESTED` to `OPEN`. |
| POST | `/waiter/tables/:tableId/confirm-payment` | Confirm payment only for a current `PAYMENT_REQUESTED` Order whose items are all `COMPLETED`; transactionally closes Order/Session and releases the Table. |

### Kitchen — 3 endpoints

All routes in this group require authenticated `KITCHEN` authority.

| Method | Path | Purpose / important conditions |
| --- | --- | --- |
| GET | `/kitchen/queue` | List items for active/current Orders that are `OPEN` or `PAYMENT_REQUESTED`. |
| PATCH | `/kitchen/queue/items/:itemId/start-preparing` | Transition exactly `PENDING` → `PREPARING`. `itemId` must be a valid ObjectId. |
| PATCH | `/kitchen/queue/items/:itemId/mark-completed` | Transition exactly `PREPARING` → `COMPLETED`. `itemId` must be a valid ObjectId. |

Kitchen transition routes have no generic status field. They require the item to belong to an active TableSession/current eligible Order and reject stale or duplicate expected-state changes.

### Manager — 29 endpoints

All routes in this group require authenticated `MANAGER` authority.

#### Dashboard, current orders, and reporting — 7 endpoints

| Method | Path | Purpose / important conditions |
| --- | --- | --- |
| GET | `/manager/dashboard` | Read operational summary, current table/kitchen state, current-period revenue summary, and top dishes. |
| GET | `/manager/orders` | Read current Orders attached to active sessions and occupied Tables. |
| GET | `/manager/orders/:orderId` | Read one current `OPEN` or `PAYMENT_REQUESTED` Order only when its active binding remains valid. |
| GET | `/manager/history` | Read `CLOSED` Order history. Optional validated `dateFrom`/`dateTo` calendar filters. |
| GET | `/manager/history/:orderId` | Read one `CLOSED` historical Order with its closed session/Table context. |
| GET | `/manager/revenue` | Read-only summary of `CLOSED` Orders. Query: `TODAY`, `LAST_7_DAYS`, or `CUSTOM_RANGE` with validated date range. |
| GET | `/manager/top-dishes` | Read-only top-dish aggregation from embedded items in `CLOSED` Orders. |

#### Staff — 5 endpoints

| Method | Path | Purpose / important inputs |
| --- | --- | --- |
| GET | `/manager/staff` | List staff safe DTOs. |
| POST | `/manager/staff` | Create staff. Strict body includes name, unique username/email, password, staff role, and optional active state. |
| PATCH | `/manager/staff/:staffId` | Update one or more of name, username, email, or role; validates ObjectId and uniqueness. |
| PATCH | `/manager/staff/:staffId/activate` | Mark a staff account active. |
| PATCH | `/manager/staff/:staffId/deactivate` | Mark a staff account inactive. |

#### Categories — 5 endpoints

| Method | Path | Purpose / important inputs |
| --- | --- | --- |
| GET | `/manager/categories` | List categories. |
| POST | `/manager/categories` | Create a category. Strict body: name and optional description. |
| PATCH | `/manager/categories/:categoryId` | Update one or more supported category fields. |
| PATCH | `/manager/categories/:categoryId/activate` | Mark category active. |
| PATCH | `/manager/categories/:categoryId/deactivate` | Mark category inactive. |

#### Dishes — 6 endpoints

| Method | Path | Purpose / important inputs |
| --- | --- | --- |
| GET | `/manager/dishes` | List dishes and their category information. |
| POST | `/manager/dishes` | Create a Dish with category, name, optional description/image URL, and non-negative integer price; referenced Category must exist. |
| PATCH | `/manager/dishes/:dishId` | Update one or more supported Dish fields; validates referenced Category when changed. |
| PATCH | `/manager/dishes/:dishId/activate` | Mark Dish active. |
| PATCH | `/manager/dishes/:dishId/deactivate` | Mark Dish inactive. |
| PATCH | `/manager/dishes/:dishId/available` | Mark Dish available. |
| PATCH | `/manager/dishes/:dishId/unavailable` | Mark Dish unavailable. |

#### Tables and QR source data — 5 endpoints

| Method | Path | Purpose / important inputs |
| --- | --- | --- |
| GET | `/manager/tables` | List Table management data, operational status, and active-session indicator; also supplies Manager QR UI source data. |
| POST | `/manager/tables` | Create a Table with a positive unique integer `number`. |
| PATCH | `/manager/tables/:tableId` | Change a Table number subject to the same positive/unique constraint. |
| PATCH | `/manager/tables/:tableId/activate` | Mark a Table active. |
| PATCH | `/manager/tables/:tableId/deactivate` | Mark a Table inactive only when not occupied and without an active session. |

## Validation and error contract

- Route validators use Zod. Validated bodies and most parameter/query schemas are strict, rejecting unknown fields rather than accepting mass-assignment input.
- ObjectId path parameters used by these routes are checked before domain operations. Invalid IDs return a safe bad-request response.
- Item submissions require a non-empty list, unique dish IDs within a request, and integer quantity from 1 through 99. Dish price fields are non-negative integers.
- The JSON parser limits request bodies to 100 KB. Malformed JSON and too-large bodies receive safe error responses.
- Most API controllers use the shared response helpers: success is `{ success: true, data }`; errors are `{ success: false, message, code? }`. The health endpoint intentionally returns its own `{ status, timestamp }` shape.
- Known application errors map to their declared HTTP class: bad request (400), authentication failure (401), insufficient role (403), not found (404), conflict/lifecycle rejection (409), and join cooldown (429). Unexpected errors return a generic 500 response without an internal stack trace in the response.

## Risk-handling summary

| Risk / failure mode | Implemented protection | Relevant area / operational note |
| --- | --- | --- |
| QR copied or shared | QR/table route only identifies a Table; joining the current session is required before Customer order routes. | QR alone is not ordering authority; join-code distribution remains an operational responsibility. |
| Wrong-table or cross-table join | Join validates the requested Table, its `OCCUPIED` state, and its exact `ACTIVE` session/code. | Customer session stores both Table and TableSession identity. |
| Old join code after table reuse | A new TableSession and code are created for a later opening; generation checks prior codes for the same Table. | Old session authority does not match the new active session. |
| Repeated incorrect join attempts | In-memory per-Table counter starts a 60-second cooldown at the fifth consecutive failed attempt. | This is process-local operational protection. |
| Old Customer token after closure | Customer middleware revalidates the exact TableSession as `ACTIVE` and verifies its Table binding. | Closed/reused sessions reject previous Customer authority. |
| Two active sessions or concurrent table opening | Partial unique active-session index, transaction, active-session check, and conditional `AVAILABLE` → `OCCUPIED` claim. | Open-table conflicts are rejected. |
| Client price/name/total tampering | Item input accepts dish ID/quantity only; server looks up eligible Dish/Category, writes snapshots, and calculates total. | Client cannot set persisted price/name/total. |
| Menu changes after ordering | OrderItem persists dish name and unit-price snapshots. | Closed history/reporting preserves order-time values. |
| Invalid or duplicate item input | Strict validation requires unique dish IDs per request and integer quantity 1–99. | Each successful request intentionally appends new items. |
| Inactive/unavailable menu item ordered | Server checks Dish activity/availability and active Category at mutation time. | Applies to Customer and Waiter-assisted additions. |
| Duplicate or stale Kitchen transition | Expected current item state is a conditional update predicate. | Conflicting/duplicate transitions are rejected. |
| Arbitrary/regressive Kitchen state | Only explicit `PENDING` → `PREPARING` and `PREPARING` → `COMPLETED` endpoints exist. | Kitchen cannot close orders or tables. |
| Payment before preparation completes | Waiter confirmation requires every OrderItem to be `COMPLETED` (D-009). | The check is repeated in the transactional close predicate. |
| Additions after payment request | Customer and Waiter item mutations require `OPEN`; a Waiter may explicitly cancel the request to return to `OPEN`. | `PAYMENT_REQUESTED` is a lifecycle lock. |
| Confirm/cancel/payment races | Transactions and current lifecycle/status predicates guard payment request, cancellation, and confirmation. | Stale state produces a conflict rather than an arbitrary mutation. |
| Partial write during closure | Payment confirmation transactionally closes Order and TableSession and releases Table. | All three lifecycle writes succeed or roll back together. |
| Table reuse leaks previous lifecycle | New TableSession/current Order binding is created on reopening; Customer middleware requires the exact active session. | Reuse does not revive previous authority. |
| Password hash or sensitive staff leakage | `passwordHash` is `select: false`; staff DTOs explicitly shape public fields. | No password hash is returned by documented staff APIs. |
| Wrong staff role uses a role API | Staff authentication plus `requireStaffRole` protects Waiter, Kitchen, and Manager route groups. | Backend middleware, not client visibility, is authoritative. |
| Inactive staff or stale staff JWT | Middleware reloads User and requires active account and current token-role match. | Invalid/missing/stale authority is rejected. |
| Malformed IDs, bodies, or query input | Zod validators, ObjectId checks, strict schemas, and centralized safe errors. | Unknown routes return a safe 404 response. |
| Reporting duplication/inconsistency | History, Revenue, and Top Dishes derive from persisted `CLOSED` Orders and embedded snapshots. | No separate copied reporting record is used. |

## Important business invariants

- A Table has at most one `ACTIVE` TableSession.
- Customer authority belongs to one exact `ACTIVE` TableSession and its bound Table.
- The active lifecycle has a server-checked current Order binding.
- The client cannot authoritatively choose persisted dish name, price, or total.
- OrderItems only progress forward through their explicit Kitchen transitions.
- `PAYMENT_REQUESTED` blocks item additions.
- Closure requires all items `COMPLETED` and closes the Order/TableSession while releasing the Table.
- Operational routes do not reopen a `CLOSED` lifecycle.
- Reusing a Table creates a new lifecycle identity.
- Reporting derives from persisted `CLOSED` Orders.

## Security boundary and non-goals

- There is no public Manager registration and no `ADMIN` or `CASHIER` V1.0 staff role.
- The client has no authority to bypass server lifecycle or role checks.
- Join codes are operational data, not fields returned by public menu/table browsing.
- V1.0 provides no realtime/WebSocket API; clients use the implemented request/refetch/polling behavior.
- This document describes implemented controls, not a claim of comprehensive security certification.
