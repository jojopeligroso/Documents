# Access Card Management: Specification v1.0

| | |
|---|---|
| **Status** | Requirements complete. Design complete. Not yet built on Google. |
| **Date** | 12 November 2026 |
| **Companion documents** | [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) (how to build it), [`CONTEXT.md`](CONTEXT.md) (glossary), [`docs/adr/`](docs/adr/) (why each decision was made) |
| **Rule for implementers** | Where this document and the code disagree, this document wins. Where this document is silent, ask; do not guess. |

**Contents:** 1 Sponsor report · 2 Roadmap · 3 Scope · 4 Roles · 5 Sheet layout ·
6 Workflow · 7 Validation and card allocation · 8 Calendar and deadlines ·
9 Scheduled jobs · 10 Notifications · 11 Protection and identity · 12 Audit and data ·
13 Architecture · 14 Limits and failure handling · 15 Acceptance scenarios ·
16 Assumptions, risks and checks · 17 Changes since v0.2

---

## 1. Sponsor report

### 1.1 What this is

A Google Sheet that keeps the record of every access card at one site: who asked for
it, who approved it, when it was encoded, who holds it, and when it came back. The sheet
sends the emails and Chat messages that move each card to its next step, and reminds
people before a card is due back. It runs entirely inside Google Workspace. It does
not talk to the door-access system: people still encode cards there, and the sheet
records that they did.

### 1.2 What the site gets

- One place that shows where every card is, and which cards are free for given dates.
- A fixed path for every card: request, approval, encoding, hand-out, return. Each step
  can only be taken by the person holding that role.
- Automatic emails to the next person who must act, and a running feed in one Chat
  space.
- Reminders to the Collector and the Host the day before, the morning of, and three
  hours before a visitor's card is due back.
- A daily check-out and check-in record for contractors, with an alert if a card is
  not back by the end of the Collector's shift.
- Handling for the awkward cases: extensions, changes to a request, cancellations,
  no-shows, early departures and lost cards.
- A complete history of who did what and when.

### 1.3 Current status

| Item | State |
|---|---|
| Requirements | Complete (seven question rounds, 10–12 Nov 2026) |
| Design | Complete (this document, 12 decision records) |
| Core rules (dates, deadlines, double-booking, permissions) | Written as example code, with 19 automated tests passing |
| Google Sheet and Apps Script | Not started |
| Platform assumptions | Seven need a half-day test on a real sheet and phone (§16.2) |

### 1.4 Cost

- **Licences:** none new. It uses the Google Workspace accounts the organisation
  already has. This assumes Apps Script and Chat webhooks are enabled on the domain,
  which the Workspace administrator should confirm.
- **Hosting:** none. Nothing runs outside Google.
- **Build effort:** an estimated 8 to 10 working days for one developer, followed by
  a two-week pilot. This is an estimate, not a commitment (see §2).
- **Running effort:** the Admin adds next year's public holidays once a year, and
  deletes records older than 18 months by hand.

### 1.5 What is needed from the sponsor

1. Approval to build and pilot at one site.
2. Names for the roles: Admin, Approver, Encoder, Provisioner, Collector, and the list
   of Requesters.
3. A Google Chat space for the event feed, with permission to add an incoming webhook.
4. The list of card serial numbers.
5. Confirmation that the 18-month retention period matches the organisation's
   retention policy.
6. A phone and a tablet for testing, since several users will act from mobile.

### 1.6 Main risks

| Risk | Effect | How it is handled |
|---|---|---|
| Everything runs under the Admin's Google account | If that account is disabled, emails, reminders and all actions stop | Documented handover: the new Admin clicks "Install triggers". Move the file to a Shared Drive later |
| Locks are for honest mistakes, not security | The Admin can change any record. Any editor could, with effort, get around the role checks | Accepted: all users are trusted. Every scripted action is logged |
| The sheet can drift from the door-access system | The sheet says a card is valid to Friday, but it was encoded to Thursday | Accepted: the Encoder types what they encoded. No integration by design |
| Some Google behaviour is assumed, not yet tested | A design change if, for example, phone edits do not run the script | Phase 0 tests all seven assumptions before any build work (§16.2) |
| Personal data in a spreadsheet | Names and contacts of visitors are held for up to 18 months | Minimum data only. Access limited to named role holders. Manual purge. The organisation's Data Protection Officer should confirm no further record-keeping is needed |
| Public holiday dates are unverified | A reminder could fall on a holiday | Dates were calculated from the statutory rules. Someone must check them against citizensinformation.ie before go-live |

### 1.7 Decision requested

Approve Phase 0 (half a day of platform tests) and, if those pass, the build and pilot
set out in §2.

### 1.8 How success would be judged (proposed)

After the two-week pilot: every card's location is known from the sheet alone; no
card is double-booked; no visitor card passes its deadline without the Collector
having been reminded; and role holders report that the phone flow is usable.

---

## 2. Roadmap

Effort figures are estimates for one developer. They are not commitments, and Phase 0
may change them.

| Phase | Outcome | Estimate | Exit test |
|---|---|---|---|
| **0. Platform tests** | The seven assumptions in §16.2 are confirmed or the design is adjusted | 0.5 day | Written result for each assumption |
| **1. Core rules** | Date, deadline, booking and permission logic with automated tests | Done as example code. 0.5 day to extend | `npm test` passes |
| **2. Sheet and settings** | The sheet builds itself: tabs, columns, dropdowns, locks, menu, triggers | 1.5 days | A second user can type only where allowed |
| **3. Main flow** | Submit, approve, deny, encode, issue, return, cancel, no-show, with audit, email and Chat | 2 days | Scenarios A1–A6 in §15 pass |
| **4. Linked requests and lost cards** | Extensions, amendments, lost and replacement cards | 1.5 days | Scenarios B1–B5 pass |
| **5. Contractors** | Daily log rows, check-out, check-in, overdue alert | 1 day | Scenarios C1–C3 pass |
| **6. Reminders and daily digest** | 24h/12h/3h reminders, overdue alerts, extension chase, holiday-list warning | 1 day | Scenarios D1–D5 pass |
| **7. Pilot** | Real use at the first site | 1 day set-up, then 2 weeks | §1.8 measures met. Library version 1 pinned |
| **Later** | Move to a Shared Drive. One-click new-site set-up. Purge helper. Cross-site view | Not estimated | — |

Order matters: each phase depends on the one before it. Phases 4, 5 and 6 can be
reordered among themselves if a feature is wanted sooner.

---

## 3. Scope

**In scope:** one site; one pool of identical reusable cards; the full request
workflow; contractor daily log; reminders; Gmail and Chat notifications; audit log;
locking; a build/repair command for the sheet.

**Out of scope for v1:** any connection to the door-access system; cross-site
reporting; automatic deletion of old records; Chat direct messages; a reusable people
list; automatic sharing of the file with role holders.

**Trust model:** every user is trusted. Locks and role checks exist to prevent
mistakes. The Admin can always override.

---

## 4. Roles

Roles are set in the Settings tab by organisation email address. One person may hold
several roles.

| Role | Holders | Does |
|---|---|---|
| **Admin** | exactly 1 | Owns the file. Installs the triggers, so every automatic email comes from this account. Sets the Approver. Adds and retires cards |
| **Approver** | exactly 1 at a time | Approves or denies requests, amendments and extensions. May delegate by changing the Approver email in Settings |
| **Encoder** | exactly 1 at a time | Encodes cards in the door-access system and records it |
| **Provisioner** | exactly 1 at a time | Hands cards out. Declares no-shows |
| **Collector** | exactly 1 at a time. Blank means "same as Provisioner" | Takes cards back. Records contractor check-out and check-in. Receives reminders |
| **Requester** | a short list | Raises requests, amendments and extensions. The Approver always counts as a Requester |

- **Delegation** means typing a different email into the role's cell. Every such
  change is written to the Event Log. There is no separate backup list.
- **Who can edit Settings:** the Admin and the current Approver only.
- **Host:** the person or team the cardholder is visiting. Always an address on the
  organisation's domain. Hosts receive reminders by email and cannot open the sheet.

---

## 5. Sheet layout

Six tabs, with exactly these names. Row 1 of every tab is the header row.

| Tab | Purpose | Who can type in it |
|---|---|---|
| `Requests` | One row per request, amendment or extension | Anyone with access, only in the open cells (§11.2) |
| `Contractor Log` | One row per contractor per working day | Anyone with access, only in Action and Action note |
| `Cards` | The card pool | Admin |
| `Settings` | Roles, times, holidays | Admin and Approver |
| `Event Log` | Audit trail | Nobody. Script only |
| `Sent Log` | Record of reminders already sent. Hidden | Nobody. Script only |

**Date and time rule for the whole sheet.** Only four columns hold true spreadsheet
dates: Start date and End date on `Requests`, Holiday date on `Settings`, and nothing
else. Every other date or time is plain text in one of these forms: `YYYY-MM-DD`,
`HH:mm`, or `YYYY-MM-DD HH:mm`. Reason: text reads the same on every device and
avoids time-zone conversion errors (ADR 0012).

### 5.1 `Requests`

Columns A to E are frozen so they stay visible on a phone.

| Col | Header | Code name | Filled by | Notes |
|---|---|---|---|---|
| A | Request ID | `id` | Script | `<SITE>-0001`, e.g. `DUB-0042` |
| B | Status | `status` | Script | Blank means Draft. See §6.1 |
| C | Action | `action` | **User** | Dropdown. The only way to act on a row |
| D | Action note | `note` | **User** | Optional text for the action: a denial or cancellation reason |
| E | Message | `message` | Script | Result of the last action. Starts with ✓ or ✗ |
| F | Kind | `kind` | Requester | `New`, `Amendment`, `Extension`. Blank means New |
| G | Links to | `linksTo` | Requester | Request ID of the original. Required for Amendment and Extension |
| H | Cardholder name | `name` | Requester | |
| I | Cardholder type | `type` | Requester | `Visitor` or `Contractor` |
| J | Host email | `host` | Requester | Must end in `@<ORG_DOMAIN>` |
| K | Contact | `contact` | Requester | Optional phone or email |
| L | Start date | `startDate` | Requester | True date. Must be a working day |
| M | Start time | `startTime` | Requester | `HH:mm`. Blank becomes 09:30 on submit |
| N | End date | `endDate` | Requester | True date |
| O | End time | `endTime` | Requester | `HH:mm`. Blank becomes 18:00 on submit |
| P | Notes | `notes` | Requester | Optional |
| Q | Requester | `requester` | Script | Email of whoever submitted |
| R | Submitted at | `submittedAt` | Script | |
| S | Decision by | `decisionBy` | Script | |
| T | Decision at | `decisionAt` | Script | |
| U | Denial reason | `denialReason` | Script | Copied from Action note |
| V | Card serial | `serial` | **Encoder** | Dropdown of serials from `Cards` |
| W | Valid from | `validFrom` | Script, then **Encoder** | Pre-filled with the requested start. Encoder may change |
| X | Valid to | `validTo` | Script, then **Encoder** | Pre-filled with the requested end. Encoder may change |
| Y | Encoded by | `encodedBy` | Script | |
| Z | Encoded at | `encodedAt` | Script | |
| AA | Issued to | `issuedTo` | Script | `Cardholder` or `Requester` |
| AB | Issued by | `issuedBy` | Script | |
| AC | Issued at | `issuedAt` | Script | |
| AD | Returned by | `returnedBy` | Script | The Collector who took it back |
| AE | Returned at | `returnedAt` | Script | |
| AF | Collection deadline | `deadline` | Script | See §8 |
| AG | Prev status | `prevStatus` | Script | Hidden. Used while an extension is pending |
| AH | Deactivated at | `deactivatedAt` | Script | Hidden. Set when a lost card's task is closed |

### 5.2 `Contractor Log`

| Col | Header | Filled by | Notes |
|---|---|---|---|
| A | Date | Script | `YYYY-MM-DD` |
| B | Request ID | Script | |
| C | Contractor | Script | |
| D | Card serial | Script | |
| E | Status | Script | `Pending`, `Out`, `In`, `Overdue`, `Absent` |
| F | Action | **User** | Dropdown: `Check out` or `Check in` |
| G | Action note | **User** | Optional |
| H | Message | Script | |
| I | Checked out by | Script | |
| J | Checked out at | Script | |
| K | Checked in by | Script | |
| L | Checked in at | Script | |

### 5.3 `Cards`

| Col | Header | Notes |
|---|---|---|
| A | Card serial | Unique. Typed by the Admin |
| B | Card state | `Active`, `Lost`, `Retired`. The script sets `Lost`. The Admin sets the rest |
| C | In use by | Script. Request ID currently holding the card, or blank |
| D | Notes | Free text |

All cards are identical. There is no visitor card or contractor card.

### 5.4 `Settings`

Three independent blocks side by side.

**Block 1, columns A–B: key and value.** The script finds keys by name, so row order
does not matter.

| Key | Example | Meaning |
|---|---|---|
| `SITE_CODE` | `DUB` | Prefix for Request IDs |
| `ORG_DOMAIN` | `example.ie` | Host emails must be on this domain |
| `ADMIN_EMAIL` | | |
| `APPROVER_EMAIL` | | |
| `ENCODER_EMAIL` | | |
| `PROVISIONER_EMAIL` | | |
| `COLLECTOR_EMAIL` | (blank) | Blank means the Provisioner |
| `COLLECTOR_SHIFT_START` | `09:30` | |
| `COLLECTOR_SHIFT_END` | `18:00` | |
| `DEFAULT_START_TIME` | `09:30` | |
| `DEFAULT_END_TIME` | `18:00` | |
| `REMINDER_LEAD_MINUTES` | `30` | How long before its target time a reminder may be sent |
| `LOW_STOCK_THRESHOLD` | `5` | |
| `NEXT_REQUEST_NUMBER` | `1` | Script-managed counter. Do not lower it |

**Block 2, column D: `Requesters`.** One email per row.

**Block 3, columns F–G: `Holiday date`, `Holiday name`.** Seeded from
`data/holidays-ie.csv`.

### 5.5 `Event Log`

Timestamp · Actor · Action · Request ID · Card serial · From status · To status · Details

### 5.6 `Sent Log`

Key · Sent at · Outcome (`SENT`, `SKIPPED` or `EMPTY`)

---

## 6. Workflow

### 6.1 Statuses

| Status | Colour | Hex | Meaning |
|---|---|---|---|
| Draft (blank cell) | none | `#ffffff` | Being typed. Not yet submitted |
| Submitted | lime | `#ccff66` | Waiting for the Approver |
| Approved | green | `#93c47d` | Waiting for the Encoder |
| Denied | red | `#e06666` | Final |
| Encoded | light blue | `#9fc5e8` | Card ready. Not yet handed out |
| Issued | teal | `#76a5af` | Card is out |
| Extension pending | amber | `#ffd966` | Card is out and an extension is in progress |
| Closed | grey | `#d9d9d9` | Final. Card returned, or an extension row that has been applied |
| Cancelled | dark grey | `#999999` | Final |
| No-show | orange | `#f6b26b` | Card was ready and never collected. Must be cancelled |
| Lost | purple | `#b4a7d6` | Card reported lost |

The whole row takes the colour. The Status column always shows the word as well, so
nothing depends on colour alone.

### 6.2 How people act

A person picks an action from the **Action** dropdown on the row. The dropdown offers
only the actions that are possible for the row's current status. The script then:

1. identifies the person from their Google account;
2. checks they hold a role that may take that action;
3. checks the data;
4. makes the change, recolours the row, and rebuilds the dropdown;
5. writes the result to **Message** (✓ or ✗ with a reason);
6. writes the Event Log;
7. sends the emails and the Chat line.

If any check fails, nothing changes except the Message.

The **Access Cards** menu (desktop only) holds helpers and Admin tools. It cannot run
workflow actions. See ADR 0011 for why.

### 6.3 Actions on `Requests`

"Requester" below includes the Approver.

| Action | Allowed from status | Who | Extra checks | Result |
|---|---|---|---|---|
| **Submit** | Draft | Requester | §7.1 | Submitted. If the person is the Approver: Approved at once, and both steps are logged |
| **Approve** | Submitted | Approver | | Approved. Valid from/to pre-filled with the requested start/end |
| **Deny** | Submitted | Approver | | Denied. Action note becomes Denial reason |
| **Record encoding** | Approved | Encoder | §7.2 | Encoded. Or Issued, if the row already has an Issued at (an amended request whose card is already out). Collection deadline calculated |
| **Issue to cardholder** | Encoded, visitor rows only | Provisioner | | Issued. Issued to = Cardholder |
| **Issue to requester** | Encoded, visitor rows only | Provisioner | | Issued. Issued to = Requester. What the Requester then does with the card is not tracked |
| **Return** | Issued, Extension pending | Collector | | Closed. Card freed |
| **No-show** | Encoded | Provisioner | | No-show |
| **Cancel** | Submitted, Approved, Encoded, No-show | Requester or Collector | | Cancelled. Card freed if one was assigned |
| **Report lost** | Encoded, Issued, Extension pending | Anyone identified | | Lost. Card state becomes Lost |
| **Record deactivation** | Lost, task still open | Encoder | | Stays Lost. Deactivated at is set. No further actions |
| **Record replacement** | Lost, task still open | Encoder | New serial chosen. §7.2 | Encoded with the new card. Issue fields cleared, so it must be handed out again |

**Side effects**

- **Return before the Final Day** is an early departure. The Encoder is emailed so
  they can shorten the card's validity or reuse the card.
- **Return** or **Report lost** while an extension is in progress cancels the
  extension row.
- **Cancel** of a row that already has a card emails the Encoder, because the card was
  encoded and is no longer needed.
- **No-show** emails the Requester and the Encoder. The row appears in the daily digest
  (§9) until someone cancels it.
- **A Host who wants to cancel** emails the Collector, who chooses Cancel.

### 6.4 Extensions

An extension is a new row.

1. The Requester fills in a blank row: Kind = `Extension`, Links to = the original
   Request ID, and the new End date (End time optional). Other fields may be left
   blank. Then Submit.
2. Checks: the original exists, is not itself an extension, and is Encoded or Issued.
   The new end is later than the original's Valid to.
3. On submit, the script copies the name, type, host, contact and start from the
   original into the extension row. The original becomes **Extension pending** and
   remembers its previous status.
4. The Approver approves (automatic if the Approver submitted it). The extension row
   becomes Approved, with the original's serial and Valid from, and Valid to set to
   the new end.
5. The Encoder re-encodes the card and chooses Record encoding on the extension row.
   The original's Valid to and Collection deadline are updated, and it returns to its
   previous status. The extension row becomes Closed. Reminders restart for the new
   deadline.
6. If the extension is denied or cancelled, the original returns to its previous
   status unchanged.

Only one extension may be in progress per original. There is no cut-off time for
requesting one. Extensions still unfinished on the original's Final Day are chased in
the daily digest (§9).

### 6.5 Amendments

An amendment is a new row that replaces the original.

1. The Requester fills in a blank row: Kind = `Amendment`, Links to = the original
   Request ID, and only the fields that change. Then Submit.
2. Checks: the original exists, is not an extension, and is Submitted, Approved,
   Encoded or Issued. If the original is Extension pending, the amendment is refused
   until the extension is finished.
3. On submit, blank fields are copied from the original, and the result is checked
   like a new request (§7.1). The working-day rule for the start is skipped if the
   original is already Issued.
4. **If the original was only Submitted:** it becomes Cancelled with the message
   "Superseded by <new ID>". The amendment carries on as an ordinary Submitted request.
5. **If the original was Approved or later:** the original stays as it is until the
   amendment is approved. On approval, the original becomes Cancelled ("Superseded by
   <new ID>"). The amendment row takes over its card serial, encoding details and
   issue details, and goes to the Encoder for re-encoding. After Record encoding it
   becomes Issued if the card is already out, otherwise Encoded.
6. If the amendment is denied, the original is untouched.

### 6.6 Lost cards

1. Anyone chooses **Report lost**. The row becomes Lost. The card's state in `Cards`
   becomes Lost and it can no longer be assigned. The Encoder and the Collector are
   emailed. The Chat feed shows it.
2. The Encoder deactivates the lost card in the door-access system, then either:
   - chooses **Record deactivation** if no replacement is needed. The row is finished; or
   - picks a new serial in Card serial, adjusts Valid from/to if needed, and chooses
     **Record replacement**. The row becomes Encoded with the new card, and the
     Provisioner hands it out as usual.
3. If the card is found, the Admin sets its state back to Active in `Cards`.

### 6.7 Contractors

A contractor never takes the card home, and is only on site during the Collector's
hours.

- A contractor request follows the same path up to **Encoded**. It is never "issued"
  from the `Requests` tab.
- On each working day inside the card's validity, the script adds one row to
  `Contractor Log` with status **Pending**.
- The Collector chooses **Check out** when handing the card over: the log row becomes
  **Out**. The first check-out also moves the request to Issued.
- The Collector chooses **Check in** when it comes back: the log row becomes **In**.
  A check-in on the request's Final Day closes the request and frees the card.
- At the end of the Collector's shift, a row still **Out** becomes **Overdue** and is
  posted to the Chat feed. A row still **Pending** becomes **Absent**.
- An Overdue row can still be checked in.
- To end an engagement early, the Collector chooses **Return** on the `Requests` row.

| Log action | Allowed from | Who |
|---|---|---|
| Check out | Pending | Collector |
| Check in | Out, Overdue | Collector |

---

## 7. Validation and card allocation

### 7.1 On Submit

1. Cardholder name, Cardholder type, Host email, Start date and End date are filled in.
2. Host email ends in `@<ORG_DOMAIN>`.
3. Start time and End time are `HH:mm`. Blanks are filled with the defaults.
4. The end is after the start.
5. The Start date is a working day (§8).

### 7.2 On Record encoding and Record replacement

1. A Card serial is chosen and its state in `Cards` is Active.
2. Valid from and Valid to are `YYYY-MM-DD HH:mm`, and Valid to is later.
3. **No double-booking.** No other request that currently holds a card (Encoded,
   Issued, Extension pending or No-show) has the same serial with an overlapping
   validity. Periods that only touch (one ends at 18:00, the next starts at 18:00) do
   not overlap. If there is a clash, the action is refused and the Message names the
   clashing request.

### 7.3 Low-stock warning

On Submit and Approve the script counts cards free for the request's dates:

> free = Active cards − other requests that are Approved, Encoded, Issued, Extension
> pending or No-show and overlap those dates

If free is below `LOW_STOCK_THRESHOLD` (5), a warning is added to the Message and to
the Chat line. It is a warning only; the request still goes ahead, even at zero.

---

## 8. Calendar and deadlines

- **Working day:** Monday to Friday, and not in the Settings holiday list.
- **Final Day:** the date in Valid to.
- **Collection deadline:** the end of the Collector's shift on the Final Day. If the
  Final Day is not a working day, the end of the Collector's shift on the last working
  day before it.
- A visit must start on a working day. A card may be handed out earlier than the start.

Examples with a shift of 09:30–18:00:

| Valid to | Collection deadline |
|---|---|
| Fri 13 Nov 2026 16:00 | Fri 13 Nov 2026 18:00 |
| Sat 14 Nov 2026 18:00 | Fri 13 Nov 2026 18:00 |
| Sat 26 Dec 2026 18:00 (Fri 25 is a holiday) | Thu 24 Dec 2026 18:00 |

---

## 9. Scheduled jobs

One timer runs every 15 minutes. Each run works out what should have happened by now
and does whatever has not been done. The `Sent Log` guarantees nothing is sent twice.

| Job | Applies to | Target time | Action |
|---|---|---|---|
| Reminder "24h" | Visitor rows that are Issued or Extension pending | 30 min before the Collector's shift ends on the last working day before the deadline (17:30) | Email Collector and Host |
| Reminder "12h" | same | Collector's shift start on the deadline day (09:30) | Email Collector and Host |
| Reminder "3h" | same | 3 hours before the deadline (15:00) | Email Collector and Host |
| Visitor overdue | same, once the deadline has passed | Straight after the deadline | Email Collector. Chat line |
| Contractor log rows | Contractor rows that are Encoded, Issued or Extension pending | Any time on a working day | Add today's row if missing |
| Contractor overdue | Today's log rows | Collector's shift end | Out → Overdue, with a Chat line. Pending → Absent |
| Daily digest | — | Collector's shift start, working days | One Chat message listing: extensions unfinished on or after the original's Final Day; no-shows not yet cancelled; overdue visitor cards; and, from 1 November, a warning if the holiday list has no dates for next year. Nothing is posted if the list is empty |

**Timing rule.** A reminder is sent on the first run at or after
(target − `REMINDER_LEAD_MINUTES`). With a 30-minute lead and a 15-minute timer, it
arrives 15 to 30 minutes before the target, never after it. If a reminder's target
passed more than 60 minutes ago (for example, a card issued late), it is skipped and
recorded as skipped. When an extension changes the deadline, a fresh set of reminders
is due.

---

## 10. Notifications

### 10.1 Who is told

| Event | Email to | Chat |
|---|---|---|
| Submitted | Approver | ✓ |
| Approved | Requester, Encoder (as a task) | ✓ |
| Denied | Requester | ✓ |
| Encoded | Provisioner, Collector, Requester | ✓ |
| Issued | — | ✓ |
| Returned | — (Encoder if early) | ✓ |
| No-show | Requester, Encoder | ✓ |
| Cancelled | Requester if someone else cancelled. Encoder if a card was assigned | ✓ |
| Extension submitted | Approver | ✓ |
| Extension approved | Encoder (as a task), Requester | ✓ |
| Extension encoded | Collector, Requester, Host | ✓ |
| Lost | Encoder (as a task), Collector | ✓ |
| Replacement encoded | Provisioner, Requester | ✓ |
| Role changed in Settings | — | ✓ |
| Reminders | Collector, Host | — |
| Visitor overdue | Collector | ✓ |
| Contractor overdue | — | ✓ |
| Low stock | — | ✓ (added to the Submitted or Approved line) |

### 10.2 Email format

- **From:** the Admin's account.
- **Subject:** `[<Request ID>] <what happened>`, for example `[DUB-0042] Approval needed`.
- **Body:** request ID, cardholder and type, host, requested dates, card and validity
  (if encoded), status, then one line saying what the recipient must do, then a link
  straight to the row.
- Emails to a Host have no link, because Hosts cannot open the sheet.

### 10.3 Chat format

One line per event, starting with a symbol and the Request ID:

```
📝 DUB-0042 submitted by pm@example.ie: Jane Doe (Visitor), 2026-11-16 09:30 → 2026-11-18 18:00.
✅ DUB-0042 approved by rom@example.ie.
💳 DUB-0042 encoded by rom@example.ie: card C-017, valid 2026-11-16 09:30 → 2026-11-18 18:00.
🤝 DUB-0042 issued to cardholder by om@example.ie.
↩️ DUB-0042 returned to om@example.ie. Card C-017 is free.
⚠️ DUB-0042: card C-017 (Jane Doe) was due back by 2026-11-18 18:00 and has not been returned.
🚨 DUB-0042: card C-017 reported lost by pm@example.ie.
```

The webhook address is a secret. It is stored in the site script's hidden properties,
never in a cell.

---

## 11. Protection and identity

### 11.1 Who the script runs as

Every workflow action runs inside a trigger installed by the Admin, so it runs with the
Admin's permissions and sends email from the Admin's account, whoever picked the
action. This is what lets the script write to locked cells on behalf of other users.

### 11.2 What is locked

Each tab has one sheet-wide lock, with openings for the cells people may type in. The
script recalculates the openings after every action, from the Status column.

| Tab | Open cells |
|---|---|
| `Requests` | Action and Action note on every row. Columns F–P on Draft rows and on the empty rows below the data. Columns V–X on rows that are Approved or Lost |
| `Contractor Log` | Action and Action note on every row |
| `Settings` | Nothing open. The Admin and the Approver are editors of the whole tab |
| `Cards`, `Event Log`, `Sent Log` | Nothing open. Admin only |

So once a request is submitted, nobody but the Admin can change what was asked for.
Changes go through an amendment.

### 11.3 Sharing rule

Share the file with **named people only**, as editors. Never share it with a group or
with the whole domain: Google then lets those people edit locked cells.

### 11.4 Knowing who acted

The script reads the acting person's email from the edit event. If Google does not
supply it, the action is refused with the Message "Could not identify you". This is
expected never to happen inside one Workspace domain, and is tested in Phase 0.

### 11.5 When the Approver changes

Editing `APPROVER_EMAIL` in Settings writes the change to the Event Log, posts a Chat
line, removes the old Approver's edit right on Settings, and grants it to the new one.
Changes to the other role cells are logged and posted the same way.

---

## 12. Audit and data

- **Event Log:** one row for every action and every role change: when, who, what,
  which request and card, status before and after, and any note. It is never edited.
- **Personal data held:** cardholder name, Host email, and an optional contact.
- **Retention:** records are deleted by hand at 18 months, following the
  organisation's retention policy. This covers `Requests`, `Contractor Log`,
  `Event Log` and `Sent Log`.
- **Request numbers** never restart, because the counter lives in Settings and not in
  the data that gets purged.

---

## 13. Architecture

```
Site Sheet (one per site)
 └─ Shell script (bound to the sheet, ~100 lines, no business rules)
     ├─ menu
     ├─ on-edit trigger ──┐
     ├─ 15-minute trigger ─┤   holds the lock, passes the webhook address
     └─ site properties   │
                          ▼
            Library "ACM" (one shared project, pinned by version number)
             ├─ pure/  rules with no Google calls: Cal, Schedule, Alloc, Workflow
             └─ gas/   Google-facing code: Settings, Rows, Actions, Linked, Cards,
                       ContractorLog, Poller, Digest, Notify, Protect, Audit,
                       SettingsWatch, Template, Api
```

- **Why a shell and a library:** a fix is released once and each site moves to the new
  version deliberately (ADR 0005).
- **Why the shell holds the lock, triggers and properties:** Google gives a library
  one shared copy of these across every site that uses it. Each site needs its own.
- **Why pure and gas are separate:** the pure rules run in Node with automated tests.
  The Google-facing code is kept thin and tested by hand on a test copy.
- **One action at a time:** the shell takes the site's lock before calling the
  library, so two people acting at the same moment cannot get the same Request ID or
  the same card.

---

## 14. Limits and failure handling

| Topic | Rule |
|---|---|
| A check fails | Nothing changes. Message shows ✗ and the reason. The dropdown is cleared so the person can try again |
| An email or Chat post fails | The action still stands. The failure is written to the Event Log as `NOTIFY_FAILED` |
| An unexpected error | Message shows "Something went wrong … Tell the Admin". The error is written to the Event Log as `ERROR` |
| Two people act at once | The second waits up to 25 seconds for the first to finish |
| Speed | An action is expected to take a few seconds. Not yet measured |
| Google's daily limits (Workspace) | 1,500 email recipients; 6 hours of trigger run time; 100,000 web requests. Source: Google's Apps Script quota page, read 12 Nov 2026. Expected use is far below all three |
| Settings incomplete | Every action is refused with a Message naming the missing key |

---

## 15. Acceptance scenarios

Each is run by hand on the test copy with at least two different Google accounts.

**A. Main flow**
- A1. A Requester submits a complete row. It gets an ID, turns lime, and locks. The
  Approver gets an email. Chat shows the line.
- A2. A Requester submits with a missing name, a weekend start date, or an outside
  Host email. Nothing changes and Message says why.
- A3. A Requester tries Approve. Refused. The Approver approves. The Encoder gets a
  task email. Valid from/to are pre-filled.
- A4. The Approver submits their own request. It goes straight to Approved, and the
  Event Log shows both Submit and Approve.
- A5. The Encoder records encoding with a serial already booked for overlapping dates.
  Refused, naming the other request. With a free serial it succeeds and the deadline
  appears.
- A6. Provisioner issues. Collector returns. The row is Closed and `Cards` shows the
  card free. Deny, Cancel and No-show each behave as in §6.3.

**B. Linked requests and lost cards**
- B1. Extension on an Issued row: the original turns amber; after approval and
  encoding, the original's Valid to and deadline change and it returns to Issued.
- B2. Extension denied: the original returns to Issued unchanged.
- B3. Amendment of a Submitted row: the original becomes Cancelled, "Superseded by …".
- B4. Amendment of an Issued row: the original stays live until approval, then is
  superseded; after re-encoding the new row is Issued with the same card.
- B5. Report lost by a plain Requester works. `Cards` shows Lost. Record replacement
  with the same serial is refused; with a new Active serial the row becomes Encoded.

**C. Contractors**
- C1. On a working day a log row appears for an Encoded contractor request.
- C2. Check out, then Check in. The first check-out moves the request to Issued.
- C3. A card left Out past the shift end becomes Overdue with a Chat line, and can
  still be checked in.

**D. Timed jobs** (use a test request with near dates, or adjust the shift times)
- D1. The three reminders arrive before their target times, once each, to the
  Collector and the Host.
- D2. After an extension, a new set of reminders arrives for the new deadline.
- D3. A visitor card past its deadline produces one email and one Chat line.
- D4. The digest lists an unfinished extension on the original's Final Day.
- D5. A Valid to on a Saturday gives a Friday deadline.

**E. Protection and phones**
- E1. A second user cannot type in a submitted row's request fields, in `Event Log`,
  or in `Settings`.
- E2. Changing `APPROVER_EMAIL` moves the Settings edit right and is logged.
- E3. Every action in A1–A6 works from the Sheets app on a phone.

---

## 16. Assumptions, risks and checks

### 16.1 Confirmed from Google's documentation (read 10–12 Nov 2026)

- Installable triggers run "with the authorization of the user who created the trigger".
- A script that uses a library is slower to start than one that does not.
- A person needs at least view access to the library project to use it.
- In a library, locks and script properties are the library's own, shared by every
  script that includes it. A call for the active spreadsheet returns the including
  script's sheet.
- The edit event carries a `user` field "if available (depending on a complex set of
  security restrictions)".
- A lock cannot keep out the file owner, the person running the script, or anyone who
  has access through a group or the whole domain.
- Daily timers fire within an hour of the set time. `nearMinute` is ±15 minutes.
- Only a script bound to the sheet can create menus. Drawings with scripts do not run
  on mobile.
- Workspace quotas as listed in §14.

### 16.2 Assumed, to be tested in Phase 0

| # | Assumption | If it fails |
|---|---|---|
| 1 | Picking from a dropdown in the Sheets phone app fires the on-edit trigger | Major redesign: actions would need a web form |
| 2 | The edit event gives the acting person's email within the domain | Role checks impossible as designed. Fall back to one Action column per role, each locked to that person |
| 3 | The trigger, running as the Admin, can write to cells locked against the person who acted | Open the script-written columns to role holders |
| 4 | A sheet-wide lock with open ranges stops a second editor typing elsewhere | Fall back to per-row locks |
| 5 | Changes made by the script do not fire the on-edit trigger again | Add a guard flag |
| 6 | A plain-text `HH:mm` column and a date column are usable on a phone | Use dropdowns for times |
| 7 | An incoming webhook can be added to the chosen Chat space | The Workspace admin must enable it |

### 16.3 Checks before go-live

1. Holiday dates verified against citizensinformation.ie and marked `verified = yes`
   in `data/holidays-ie.csv`.
2. All of §15 passed, including E3 on a real phone.
3. The file is shared with named people only.
4. The Data Protection Officer has confirmed the 18-month retention.

---

## 17. Changes since v0.2

These came out of detailed design and reading Google's documentation. Each changes
something agreed earlier.

1. **The menu cannot run workflow actions.** A script started from a menu runs with
   the clicker's own permissions, so it could not write to locked rows or the Event
   Log, and emails would come from whoever clicked. All actions now go through the
   Action dropdown, which works on desktop and phone alike. The menu keeps helpers and
   Admin tools (ADR 0008, ADR 0011).
2. **One lock per tab with openings**, in place of a lock per submitted row. It can be
   rebuilt from the Status column at any time, so it is easy to repair (ADR 0007).
3. **Dates and times are stored as text**, apart from the two date columns people
   pick from a calendar (ADR 0012).
4. **"Returned / Closed" is now the single status `Closed`.**
5. **A minimal Build / repair command is in v1** after all. The first site needs its
   tabs, dropdowns and locks created somehow, and a command is more reliable than
   doing it by hand. The fuller new-site tool stays deferred.
6. **The lock, the triggers and the webhook address live in each site's shell**, not in
   the shared library, because Google shares a library's own copies across all sites.
7. **New details filled in:** exact column layout; the rules for amendments and
   extensions; `Record deactivation` and `Record replacement`; the `Absent` log status;
   the daily digest; the hidden `Sent Log` tab.
