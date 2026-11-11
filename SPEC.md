# Access Card Management: Specification v0.1 (draft for review)

Consolidates decisions from the requirements sessions of 10–11 Nov 2026. Terms are
defined in [`CONTEXT.md`](CONTEXT.md). Rationale is in [`docs/adr/`](docs/adr/).
Items marked **[OPEN]** are listed in §15.

---

## 1. Purpose and scope

A Google Sheet (one copy per site) with Apps Script that manages a fixed pool of
identical, reusable access cards. It covers the **administrative record** of each card's
journey: request → approval → encoding → issue → (daily contractor check-out/in) →
return. It also handles extensions, amendments, cancellations, no-shows and lost cards,
with reminders and notifications through Gmail and one Google Chat space.

**In scope:** a single site, the workflow, notifications, scheduling, audit and locking.

**Out of scope (now):** integration with the access-control system (ADR 0002), cross-site
reporting, automated purging, the new-site Setup/Repair tool (described in §13 but
deferred), reusable people lists, and Google Chat DMs.

**Trust model:** all parties are trusted. Locks and role checks prevent **mistakes**,
not malice. The Admin can always override.

---

## 2. Roles and permissions

Each role is identified by organisation email in Settings. One person may hold several.

| Role | Holders | Set by |
|---|---|---|
| Admin | 1 | file owner (the Admin is the owner) |
| Approver | 1 at any time | Admin. The Approver may delegate |
| Encoder | 1 at any time | Admin / Approver (Settings edit) |
| Provisioner | 1 at any time | Admin / Approver |
| Collector | 1 at any time. Blank means same as Provisioner | Admin / Approver |
| Requester | short list | Admin / Approver |

### Action → who may perform it

| Action | Allowed role | Notes |
|---|---|---|
| Submit request | Requester (own row) | Locks the row |
| Request amendment | Requester | New linked row |
| Request extension | Requester | New linked row |
| Approve / Deny | Approver | Reason optional on deny. Auto-approve if the Approver is the Requester |
| Record encoding | Encoder | Card serial, valid from/to, which may differ from requested |
| Issue | Provisioner | To cardholder **or** Requester (pre-provisioning) |
| Record handover to cardholder | Requester or Provisioner **[OPEN]** | Only after a pre-provisioned issue |
| Contractor check-out / check-in | Collector | Contractor Log tab |
| Return (collect) | Collector | Early return ⇒ Encoder notified |
| Declare no-show | Provisioner | Cancellation then mandatory |
| Cancel | Requester or Collector (on the Host's behalf) **[OPEN]** confirm Requester | |
| Report lost | Collector **[OPEN]** or any role holder? | Creates an encoding task |
| Record deactivation / replacement | Encoder | Closes the lost-card task |

---

## 3. Tabs

| Tab | Purpose | Who edits |
|---|---|---|
| **Settings** | Site code, role emails, shifts, holiday list, reminder lead times, low-stock threshold (5) | Admin + Approver only (script keeps the protection in sync) |
| **Cards** | Pool: card serial, current status, current request, notes | Script; Admin adds and retires cards |
| **Requests** | One row per New / Amendment / Extension | Requesters type the entry fields; the script fills the rest; locked after submit |
| **Contractor Log** | One row per active contractor per Working Day (auto-generated) | Collector, via the Action dropdown |
| **Event Log** | Append-only audit trail | Script only (protected) |

### 3.1 Requests columns
Request ID (auto, `<SITE>-0001`) · Kind (New / Amendment / Extension) · Links to ·
Cardholder name · Cardholder type (Visitor / Contractor) · Host email · Contact
(optional) · Requested start (default 09:30) · Requested end (default 18:00) · Notes ·
Requester (auto) · Submitted at (auto) · **Status** · Decision by/at · Denial reason ·
Card serial · Valid from · Valid to · Encoded by/at · Issued to (Cardholder / Requester) ·
Issued by/at · Handed over at · Returned by/at · **Message** · **Action**

### 3.2 Contractor Log columns
Date · Request ID · Contractor · Card serial · Checked out at/by · Checked in at/by ·
Status (Pending / Out / In / Overdue) · Message · Action

### 3.3 Event Log columns
Timestamp · Actor email · Action · Request ID · Card serial · From status → To status ·
Details

---

## 4. Statuses and transitions (Requests)

Colours: Draft none · Submitted lime · Approved green · Denied red · Encoded light blue ·
Issued teal · Extension pending amber · Returned/Closed grey · Cancelled dark grey ·
No-show orange · Lost purple. A text Status column is always shown alongside.

```
Draft ──Submit──▶ Submitted ──Approve──▶ Approved ──Record encoding──▶ Encoded ──Issue──▶ Issued ──Return──▶ Returned/Closed
                     │                      │                             │                 │
                     ├─Deny──▶ Denied        ├─Cancel──▶ Cancelled         ├─No-show──▶ No-show ──Cancel (mandatory)──▶ Cancelled
                     └─Cancel──▶ Cancelled   │                             └─Cancel──▶ Cancelled
                                                                                            ├─Extension submitted──▶ Extension pending ──(ext. encoded or denied)──▶ Issued
                                                                                            └─Report lost──▶ Lost ──(Encoder deactivates; replacement encoded)──▶ Issued (new serial) / Closed
```

- **Amendment** (new linked row): if the original is still Submitted, the original
  becomes Cancelled ("superseded by X") **[OPEN: confirm]**. If the original is
  Approved or later, the amendment goes to the Approver again, and on approval the
  usual encoding follows.
- **Extension** (new linked row): Submitted → Approved (or auto-approved) → Encoded.
  On encoding, the original's Valid to and Collection Deadline are updated and the
  original returns to Issued.
- **Early departure** = Return before the Final Day. The Encoder is notified and may
  shorten validity or repurpose the card.

---

## 5. Validation rules

- Required fields: cardholder name, cardholder type, Host email (org domain),
  requested start and end.
- Requested start must be a **Working Day** and before the end.
- The Host must be an org-domain email.
- On **Record encoding**: the card serial must exist in the pool, must not be retired
  or lost, and its Validity Window must **not overlap** another active request on the
  same card (blocked).
- **Low-stock warning** when fewer than 5 cards are free across the request's dates.
  Shown on Submit and Approve, and posted to the Admin Space.
- Every action checks the actor's role and that the transition is valid for the
  current status. A blank actor email means refused.

---

## 6. Calendar and deadlines (ADR 0009)

- Working Day = Mon–Fri and not in the Holiday List (`data/holidays-ie.csv`, which
  needs verifying).
- **Collection Deadline** = end of the Collector's shift (18:00) on the Final Day, or
  on the previous Working Day if the Final Day isn't a Working Day.
- Contractors are only on site during Collector hours.

---

## 7. Scheduled jobs (one 15-minute polling trigger, ADR 0006)

Each job is idempotent, so a sent notification is recorded and never repeated.

| Job | When (no later than) | Does |
|---|---|---|
| Reminder 24h | 17:30, previous Working Day | Gmail to Collector + Host |
| Reminder 12h | 09:30, Final Day | Gmail to Collector + Host |
| Reminder 3h | 15:00, Final Day | Gmail to Collector + Host |
| Contractor Log rows | Shift start each Working Day | Add a row per active contractor |
| Contractor overdue | Collector shift end | Admin Space: cards not checked in |
| Visitor overdue | After the Collection Deadline | Gmail to Collector + Admin Space |
| Extension chase | 09:30, Final Day | Admin Space if an extension is unapproved or unencoded |
| Holiday list check | Daily | Admin Space warning if no holidays are listed for the coming year (after 1 Nov) |

Default lead time: 30 minutes before each target.

---

## 8. Notifications (ADR 0004)

| Event | Gmail to | Admin Space |
|---|---|---|
| Submitted | Approver | ✓ |
| Approved / Denied | Requester | ✓ |
| Encoding task (new, extension, lost, early return) | Encoder | ✓ |
| Encoded | Provisioner/Collector + Requester | ✓ |
| Issued / handed over / returned | — | ✓ |
| Extension requested | Approver (+ Encoder receipt) | ✓ |
| Reminders | Collector + Host | — |
| Contractor not checked in | — | ✓ |
| Visitor not returned after deadline | Collector | ✓ |
| Low stock | — | ✓ |

**Email content:** request ID, cardholder, cardholder type, dates, card serial (if
known), and the action needed next. Role holders get a link to the row. Hosts get no
link. Sent from the Admin's account (the trigger installer).

**Chat format:** one line per event, e.g.
`✅ DUB-0042 approved by <name>: Jane Doe (Visitor), 12 Nov 09:30 → 14 Nov 18:00`.
The webhook URL is kept in Script Properties.

---

## 9. Locking and protection (ADR 0007)

- A Requests row is protected on submit. Only the Admin (owner and trigger account)
  can still edit it. The script writes later fields as the trigger account.
- The Event Log is fully protected. Settings is editable only by the Admin and the
  Approver, and is re-synced when the Approver changes.
- Share the sheet with **named individuals only** (never groups or the domain), or
  the locks won't hold.

## 10. Audit
Every action and every role change appends an Event Log row (§3.3).

## 11. Data and retention
Minimum data: cardholder name, Host, optional contact. All records are purged
manually at 18 months, per the organisation's retention policy.

## 12. Architecture (ADR 0001, 0005)
- One Site Sheet per site, bound to a thin **shell** script: `onOpen` menu,
  installable on-edit handler, 15-minute poller. Each delegates to a shared
  **library** pinned to a numbered version.
- The library contains pure modules (calendar, deadlines, transitions, permissions,
  overlap) plus thin service adapters (Sheets, Gmail, Chat via `UrlFetchApp`, locks
  via `LockService`).
- Concurrency: every handler takes a script lock, so two people acting at once can't
  corrupt IDs or card allocation.

## 13. Setup / Repair (deferred)
An Admin-only menu item that installs triggers, applies protections, validates
Settings and stores the webhook. Out of scope for v1. For now, the first site is set
up by hand.

## 14. Development (ADR 0010)
Plain JS + JSDoc, `clasp`, a test copy on the dev library version, and Node unit
tests for the pure modules.

---

## 15. Open items before build

1. Who records the Requester → cardholder handover: the Requester or the Provisioner?
2. Who may Cancel: confirm the Requester as well as the Collector.
3. Who may Report lost: the Collector only, or any role holder?
4. Amendment of a still-Submitted request: does the original become Cancelled
   ("superseded")?
5. Verify the holiday dates against citizensinformation.ie.
6. Mobile check: confirm on a real phone that dropdown edits fire the trigger and
   that the user's email is available.
