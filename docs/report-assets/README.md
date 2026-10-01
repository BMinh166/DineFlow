# DineFlow V1.0 Report Assets

This guide inventories the reviewed real runtime evidence for the DineFlow V1.0 report and demo. It contains Owner-captured screenshots, but no seed data, credentials, or database records.

## Asset locations and filenames

Place captured files in the role-specific directories using lowercase kebab-case names. Do not add dates, database IDs, session IDs, or random values to filenames.

```text
docs/report-assets/
  customer/
  waiter/
  kitchen/
  manager/
  qr/
```

## Required asset manifest

| ID | Actual filename | Role / area | Required | What it proves | Reviewed runtime state | Sensitive-data check | Review status |
| --- | --- | --- | :---: | --- | --- | --- | --- |
| C-01 | `customer/customer-01-public-menu.jpg` | Customer | Yes | Public table context and browse-before-join state. | Public menu with join card visible. | No join code, token, browser storage, or DevTools. | REVIEWED — AVAILABLE |
| C-01A | `customer/customer-02-public-menu.jpg` | Customer | Supporting | Categories, dish card, price, availability, and add-to-cart presentation. | Public menu dish list. | No sensitive data visible. | REVIEWED — AVAILABLE |
| C-02 | `customer/customer-03-join-table.jpg` | Customer | Yes | Join-code requirement and lack of ordering authority from QR alone. | Join modal visible before Customer join. | Shows only the UI's invalid `0000` placeholder, not a reusable code. | REVIEWED — AVAILABLE |
| C-03 | `customer/customer-04-current-order.jpg` | Customer | Yes | Persisted items, quantities, Kitchen statuses, and displayed total on an `OPEN` Order. | Current Order with preparation/completion statuses. | No token or browser storage. | REVIEWED — AVAILABLE |
| W-01 | `waiter/waiter-01-table-board.jpg` | Waiter | Yes | `AVAILABLE` and `OCCUPIED` table states with clear table identity. | One occupied Table and multiple available Tables. | No join-code modal open. | REVIEWED — AVAILABLE |
| W-02 | `waiter/waiter-03-active-table.jpg` | Waiter | Yes | Active Table/session Order detail and Kitchen item statuses. | Active Table detail modal. | Join-code digits are not visible; only the copy-code control is shown. | REVIEWED — AVAILABLE |
| K-01 | `kitchen/kitchen-01-queue.jpg` | Kitchen | Yes | Real `PENDING` ticket, Table context, and start-preparing action. | Kitchen pending queue. | No credentials, DevTools, or token/header display. | REVIEWED — AVAILABLE |
| K-01A | `kitchen/kitchen-02-queue.jpg` | Kitchen | Supporting | `PREPARING` queue state and complete action. | Kitchen preparing queue. | No sensitive data visible. | REVIEWED — AVAILABLE |
| M-01 | `manager/manager-02-history.jpg` | Manager | Yes | Implemented Dashboard summary with lifecycle-derived values and top dishes. | Dashboard after a closed Order. | No credentials or private configuration. | REVIEWED — AVAILABLE |
| M-02 | `manager/manager-03-history-detail.jpg` | Manager | Yes | Closed-order History list and read-only historical data. | History list with closed Orders. | No sensitive personal data. | REVIEWED — AVAILABLE |
| M-03 | `manager/manager-01-dashboard.jpg` | Manager | Yes | Closed Order item snapshots, total, and historical detail. | History Detail for a closed Order. | No sensitive personal data. | REVIEWED — AVAILABLE |
| M-04 | `manager/manager-04-revenue.jpg` | Manager | Yes | Reporting based on real closed-order data. | Revenue period containing the closed Order. | No private configuration. | REVIEWED — AVAILABLE |
| Q-01 | `qr/qr-01-demo-table.png` | Manager QR | Yes | Normal Manager QR visual for an active Table. | QR card for Table 1. | No join code, token, credential, or URL text is visible. | REVIEWED — AVAILABLE |

**Required coverage: 11/11.** Two retained supporting images add public-menu detail and Kitchen `PREPARING` evidence. The History list and History Detail remain separate because together they show both the closed-order index and its preserved item-level snapshots. The single Revenue image is sufficient for the reporting requirement; Top Dishes remains optional.

## Filename and content mapping review

Owner filenames are retained as supplied. All files are in the correct role/category directory and use lowercase kebab-case naming, but the following names do not match the originally proposed manifest sequence or page content:

| Actual file | Actual content | Review decision |
| --- | --- | --- |
| `customer/customer-03-join-table.jpg` | Customer join modal | Accepted as C-02; the extra public-menu image shifts the originally proposed sequence. |
| `customer/customer-04-current-order.jpg` | Customer Current Order | Accepted as C-03; the extra public-menu image shifts the originally proposed sequence. |
| `waiter/waiter-03-active-table.jpg` | Waiter active Table detail | Accepted as W-02; filename sequence differs from the original proposal. |
| `manager/manager-01-dashboard.jpg` | Manager History Detail | Accepted as M-03; filename content differs from its original proposed name. |
| `manager/manager-02-history.jpg` | Manager Dashboard | Accepted as M-01; filename content differs from its original proposed name. |
| `manager/manager-03-history-detail.jpg` | Manager History list | Accepted as M-02; filename content differs from its original proposed name. |

No asset was renamed, edited, regenerated, or excluded. The manifest's actual-filename column is the source of truth for report use.

## Optional assets

Capture these only when they materially improve the report. They are not required for P29-T5 acceptance.

| ID | Suggested filename | What it can add | Suitable lifecycle moment |
| --- | --- | --- | --- |
| O-01 | `manager/manager-05-staff.png` | Manager staff/role administration. | Fixture preparation. |
| O-02 | `manager/manager-06-menu-management.png` | Category or Dish management and availability state. | Fixture preparation. |
| O-03 | `manager/manager-07-table-management.png` | Table management separate from Waiter operational board. | Fixture preparation. |
| O-04 | `customer/customer-04-payment-requested.png` | Customer payment-lock state. | Immediately after payment request, before confirmation. |
| O-05 | `waiter/waiter-03-payment-confirmation.png` | Waiter payment-confirmation UI. | Only after every item is completed; avoid committing an unnecessary confirmation overlay if it obscures context. |
| O-06 | `customer/customer-05-mobile-menu.png` | Responsive/mobile Customer menu presentation. | Public-menu capture state. |
| O-07 | `kitchen/kitchen-02-completed.png` | Completed Kitchen tab/state. | After Kitchen completes an item, before payment closure. |

**Optional screenshot count: 7.**

## Recommended demo fixture

Create this small fixture through the Manager UI and normal product flows. It is a recommended demo fixture, **not** automatically seeded data and not a record of existing production data.

### Staff

Create or select one active Waiter and one active Kitchen account through Staff Management. For disposable demo identities, use non-personal display names and example-domain email addresses, such as:

| Role | Display name | Username suggestion | Email suggestion |
| --- | --- | --- | --- |
| Waiter | `Phục vụ Demo` | `waiter.demo` | `waiter.demo@example.com` |
| Kitchen | `Bếp Demo` | `kitchen.demo` | `kitchen.demo@example.com` |

Choose private passwords during account creation; do not record them in this guide, screenshots, or committed files.

### Menu

Create 2–3 active categories and 4–6 active/available Dishes with integer-VND prices:

| Category | Dish | Price (VND) |
| --- | --- | ---: |
| Khai vị | Gỏi cuốn | 45,000 |
| Món chính | Cơm gà | 75,000 |
| Món chính | Bún bò | 70,000 |
| Nước uống | Trà đào | 30,000 |
| Nước uống | Nước suối | 15,000 |

### Tables and order

- Create two active Tables: one **primary demo Table** (for example, Table 12) and one **available reference Table** (for example, Table 8).
- Keep the reference Table available so the Waiter board can show both `AVAILABLE` and `OCCUPIED` simultaneously after the primary Table opens.
- During the lifecycle, submit two different dishes to the primary Table. Start with one dish for the Customer Current Order and Kitchen Queue captures; add the second while the Order is still `OPEN` if a richer history/revenue view is useful.
- Complete every ordered item through the Kitchen flow before requesting/confirming payment.

No database editing, direct MongoDB insertion, reset script, or seed script is part of this fixture.

## Efficient one-lifecycle capture sequence

Use separate logged-in browser contexts/tabs for Manager, Waiter, Kitchen, and Customer where practical. Keep the primary demo Table and reference Table identities consistent throughout.

1. Manager prepares/selects the active Waiter, active Kitchen user, active categories, active/available dishes, primary demo Table, and available reference Table.
2. Optional: capture setup-management views now.
3. Waiter opens the primary demo Table. Keep the reference Table available.
4. Capture **W-01** with both operational states visible.
5. In Manager QR, capture **Q-01** for the primary demo Table. Confirm its encoded route is the public table route only.
6. Customer opens that public table route without joining. Capture **C-01**, then open the join UI and capture **C-02** without displaying a code value.
7. Customer joins using the code supplied out of band by the Waiter. Do not capture or commit that code.
8. Customer submits the first dish while the Order is `OPEN`. Capture **C-03**, **W-02**, and **K-01**. Before committing W-02, redact/crop the current join-code digits if visible.
9. Kitchen transitions the first item from `PENDING` to `PREPARING` to `COMPLETED`. Optionally add the second dish while the Order remains `OPEN`, then complete it through the same Kitchen flow.
10. Customer requests payment. Optionally capture the payment-requested state.
11. Waiter confirms payment only after every item is `COMPLETED`.
12. Manager captures **M-01**, **M-02**, **M-03**, and **M-04** from the actual closed lifecycle. This also makes the active-session join code unusable.

This sequence uses normal application behavior only and does not require a second full lifecycle.

## Capture quality rules

- Capture real DineFlow UI only; do not compose or manipulate UI states that did not occur.
- Use a consistent browser/window size where practical. Customer captures may use a phone/mobile viewport; Manager captures should use a readable desktop or tablet viewport.
- Keep the UI language consistent within the selected asset set.
- Avoid DevTools, browser storage/cookie views, address-bar sensitive content, and notification overlays that obscure labels, totals, statuses, or actions.
- Do not crop labels, totals, table identity, item status, or relevant lifecycle state.
- Basic crop/redaction is allowed only for privacy/presentation and must not change the demonstrated application behavior.
- Use the actual dashboard, history, and revenue values produced by the lifecycle. Do not add, alter, or claim fabricated metrics.

## Privacy and security rules

Do not commit screenshots that expose passwords, Manager/staff credentials, JWTs, Customer-session tokens, Authorization headers, cookies/local storage, Atlas credentials, Render configuration, MongoDB URIs, private environment files, or sensitive personal information.

### Join-code handling

A screenshot may show that join-code UI exists, but it must not commit a currently valid reusable code. For **W-02**, either redact/crop only the digits while preserving the label/context, or ensure the lifecycle is closed before the image is committed. Do not modify application source solely to hide a join code.

### QR handling

**Q-01** may be committed only when it is captured from the normal Manager QR UI for a disposable/demo Table. Its QR must encode only the public `/table/:tableId` route. A QR identifies the Table and does not grant Customer ordering authority; it must not include a join code, token, or credential. If exporting QR content is awkward, capture the QR UI itself instead of creating an alternative QR asset.

## Capture and review result

- [x] Owner-supplied assets were inventoried in their actual repository locations.
- [x] Required coverage was visually reviewed against the implemented DineFlow screens.
- [x] Supporting public-menu and Kitchen-state evidence was retained.
- [x] Each candidate was checked for visible credentials, tokens, private configuration, sensitive personal information, and active reusable join codes.
- [x] The visible `0000` Customer join input is an invalid UI placeholder, not an active join code.
- [x] The QR image visually matches the normal Manager QR card. Source verification confirms that this UI encodes only the public `/table/:tableId` route; no credential or join-code text is displayed in the asset.

The required P29-T5 asset set is reviewed and available. P29-T6 remains a separate task and is not started by this document update.
