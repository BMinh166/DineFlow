# DineFlow V1.0 Demo Guide

Use this guide to present the implemented DineFlow V1.0 lifecycle in four browser contexts: **Manager**, **Waiter**, **Kitchen**, and **Customer**. It follows normal product behavior only; no database edit, reset script, hidden endpoint, or hardcoded join code is required.

## Prepare before presenting

- Have active Manager, Waiter, and Kitchen access available. Keep credentials private and out of presentation materials.
- In Manager, ensure at least one active Category, two active/available Dishes, and one active `AVAILABLE` Table exist. A second available Table is useful when showing the Waiter board's mixed states.
- Open the Manager QR screen for the demo Table. The QR identifies only the public table route; it does not grant ordering authority.
- Open four separate contexts/tabs: Manager, Waiter, Kitchen, and Customer. A Customer mobile browser or responsive viewport is suitable.
- Obtain the join code only after the Waiter opens the live Table session. Do not pre-record, publish, or reuse a join code.

## Presentation sequence

1. **Manager overview.** Explain the four V1.0 roles: Customer, Waiter, Kitchen, and Manager. Optionally show active menu/table/staff management context, then introduce the Dashboard as an operational/reporting view. The verified Dashboard evidence is [manager-02-history.jpg](report-assets/manager/manager-02-history.jpg); its filename is retained even though its content is the Dashboard.

2. **Manager QR.** Show the normal QR screen for the selected demo Table. Explain that it contains the public table route, not an order credential. The verified QR evidence is [qr-01-demo-table.png](report-assets/qr/qr-01-demo-table.png).

3. **Waiter opens the Table.** In the Waiter context, show the Table board, select an `AVAILABLE` Table, and open it. The server creates an `ACTIVE` TableSession and `OPEN` Order while the Table becomes `OCCUPIED`. The board evidence [waiter-01-table-board.jpg](report-assets/waiter/waiter-01-table-board.jpg) shows both operational states.

4. **Customer scans/browses.** In the Customer context, scan/open the QR route. Show that the Customer can browse the public table menu before joining. Use [customer-01-public-menu.jpg](report-assets/customer/customer-01-public-menu.jpg) for table/join context and [customer-02-public-menu.jpg](report-assets/customer/customer-02-public-menu.jpg) for menu-card detail.

5. **Customer joins the current session.** Open the join UI, explain that QR alone is insufficient, and enter the code just supplied by the Waiter for this live session. Do not display the code to the audience or record it. The verified join UI is [customer-03-join-table.jpg](report-assets/customer/customer-03-join-table.jpg); its visible `0000` is an invalid input placeholder, not a demo code.

6. **Customer submits an order.** Add at least one Dish while the Order is `OPEN`. Explain that the server validates menu availability, appends `PENDING` OrderItems, records name/price snapshots, and calculates the integer-VND total. The Customer Current Order evidence is [customer-04-current-order.jpg](report-assets/customer/customer-04-current-order.jpg).

7. **Waiter observes the active lifecycle.** Open the active Table detail. Show the active Table/Order and item status, but do not expose any join-code digits. The verified detail evidence is [waiter-03-active-table.jpg](report-assets/waiter/waiter-03-active-table.jpg); the filename differs from its logical W-02 role and is intentionally retained.

8. **Kitchen processes items.** In the Kitchen context, show the real `PENDING` ticket and start preparation. Then progress items only through `PENDING` → `PREPARING` → `COMPLETED`. Use [kitchen-01-queue.jpg](report-assets/kitchen/kitchen-01-queue.jpg) for pending evidence and [kitchen-02-queue.jpg](report-assets/kitchen/kitchen-02-queue.jpg) for preparing evidence. Kitchen cannot close the order or release the Table.

9. **Observe state updates.** Refresh or wait for the normal client polling/refetch behavior in Customer and Waiter contexts. Show the changed Kitchen item statuses on the current Order. If desired, add another Dish only while the Order remains `OPEN`, then complete it through Kitchen.

10. **Request payment.** In the Customer context, request payment. Explain that the Order becomes `PAYMENT_REQUESTED` and new additions are locked.

11. **Confirm payment.** In the Waiter context, confirm payment only after every OrderItem is `COMPLETED`. The server transaction closes the Order and TableSession and returns the Table to `AVAILABLE`.

12. **Show history and reporting.** In Manager, refresh History, then open the closed Order detail to show persisted item snapshots and total. The actual asset mapping is [manager-03-history-detail.jpg](report-assets/manager/manager-03-history-detail.jpg) for the History list and [manager-01-dashboard.jpg](report-assets/manager/manager-01-dashboard.jpg) for History Detail. Finally show [manager-04-revenue.jpg](report-assets/manager/manager-04-revenue.jpg) and the Dashboard again: reporting derives from `CLOSED` Orders only.

## Key points to say during the demo

- A QR identifies a Table; the current active-session join code establishes Customer ordering authority.
- A Table has at most one `ACTIVE` TableSession, and a later reuse creates a new session, Order, join code, and Customer authority.
- The client supplies Dish ID and quantity; the server owns eligibility checks, snapshots, and totals.
- Kitchen transitions are forward-only: `PENDING` → `PREPARING` → `COMPLETED`.
- `PAYMENT_REQUESTED` blocks additions. Only Waiter confirmation after all items are `COMPLETED` closes the lifecycle.
- Manager History, Revenue, Top Dishes, and Dashboard use persisted closed-order data rather than a separate copied reporting record.

## Supported recovery guidance

Use only these product-supported recovery actions during a demo:

| Situation | Safe recovery |
| --- | --- |
| A screen is stale or a request failed transiently | Use the page's refresh action or reload the browser, then let the API return authoritative state. |
| A staff context loses access | Re-login as the correct active staff role, then refresh the relevant page. |
| Customer needs the public menu again | Rescan the QR or reopen the public table route. |
| Customer join fails | Verify that the Table is occupied and use the current code supplied by the Waiter for its active session. Avoid repeated guesses; the implemented join cooldown applies after consecutive failures. |
| Customer session is no longer active | Have the Waiter open a new Table lifecycle when appropriate, then join with that new session's current code. Old session authority cannot be reused. |
| More dishes are needed after payment was requested | The Waiter may cancel the payment request to return the Order to `OPEN`, then add dishes normally and complete them before another payment request. |
| A new demo cycle is needed | Complete and close the current lifecycle normally. Once the Table is `AVAILABLE`, the Waiter may open it again, creating a new session/order/code. |
| History or revenue does not yet show the closure | Refresh the Manager view and ensure the selected reporting period includes the closed Order. |

Do not use manual database edits, seed/reset scripts, private environment changes, unsupported endpoints, or application-source changes as demo recovery steps.

## Evidence reference

The P29-T5 asset manifest in [report-assets/README.md](report-assets/README.md) is the source of truth for reviewed filenames and content mapping. It contains 11 required coverage items plus 2 supporting images, all reviewed as available. The apparent Manager filename/content swaps are intentional manifest mappings, not missing evidence.

## Presenter completion check

- [ ] Four contexts are ready and roles are correctly signed in.
- [ ] The Customer joins only with a live current-session code.
- [ ] Every ordered item reaches `COMPLETED` before payment confirmation.
- [ ] The Table is shown as `AVAILABLE` after closure.
- [ ] Manager History and Revenue/Dashboard are refreshed after closure.
- [ ] No credential, token, private configuration, or live join code is displayed or recorded.
