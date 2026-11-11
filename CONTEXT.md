# Domain Context & Glossary

Each term has one meaning. If code, sheet tabs, or messages use a term, it means
exactly what is written here. Items marked **(open)** are not yet decided; see
`docs/open-questions.md`.

## Deployment

- **Site Sheet**: one copy of the Google Sheet template, owned by one site/office,
  with its own Role Holders, Card Pool and settings. Sites do not share data.
  One site at launch, designed to support more (see ADR 0005).
- **Workspace**: all users are on a paid Google Workspace domain.

## Cards

- **Card**: a physical, reusable access card identified by a **Card Serial**.
  Every card is tracked as stock in the **Card Pool**.
- **Card Pool**: the fixed set of cards belonging to a Site Sheet.
- **All cards are identical.** There is one pool and one stock count. Visitor vs
  Contractor is a property of the **Request** (**Cardholder Type**), not of the card.
  A visitor card is simply encoded for a shorter or longer **Validity Window**.
- **Validity Window**: the period (from A to B) the card is encoded to work, as set
  in the external access-control system. That system enforces expiry on the
  card itself.
- **Repurpose**: a card collected early may be reassigned to a different cardholder
  (re-encoded) instead of having its validity cut short.

## Roles (functional, not job titles)

Each role is held by people identified by their **organisation email address**,
entered in a dedicated cell (or list) in Settings. One person may hold several
roles (e.g. Approver + Encoder). Job titles are only an example mapping.

| Role | Does | Holders | Example (current site) |
|---|---|---|---|
| **Admin** | Owns the file, installs the triggers (emails are sent from this account), sets the Approver | exactly one | Separate role. May be the same person as the Approver |
| **Approver** | Approves or denies Requests, Extensions and Amendments | **exactly one at any time** | Regional Operations Manager |
| **Encoder** | Encodes cards in the access-control system and records it in the sheet | exactly one at any time | Regional Operations Manager |
| **Provisioner** | Hands out cards (issue), declares no-shows | exactly one at any time | Office Manager |
| **Collector** | Takes cards back, logs contractor check-in, receives reminders | exactly one at any time. **Defaults to the Provisioner** | Office Manager |
| **Requester** | Raises Requests, Extensions, Amendments | a short **list** of permitted people | Production Manager, Office Manager, Regional Operations Manager |

- **Changing role holders:** the Admin sets the Approver. The Approver may
  **delegate** their role. Encoder, Provisioner and Collector are changed by editing
  their cell. "Delegation" means changing the cell's email, and every change is
  written to the Event Log. There is no separate backup list.
- If the Approver raises a Request or Extension, it is **auto-approved**.
- The **Approver** is the person with the highest authority over facility security.
- **Provisioner vs Collector:** these are the same person by default. The split
  exists so someone else can be delegated to take cards back when the person who
  issued them can't.
- **Sheet access:** only the Admin, the role holders and listed Requesters can open
  the Site Sheet. Hosts do not get access.
- **Settings tab:** editable only by the Admin and the current Approver. The script
  updates that protection automatically whenever the Approver changes.
- **Ownership:** the Admin's My Drive at first. The aim is to move it to a Shared
  Drive later.
- Each role holder has a **shift** (start–end) in Settings. Current site:
  Office Manager and Regional Operations Manager 09:30–18:00, Production Manager
  07:30–16:00. Shifts rarely change.

## People

- **Visitor**: a person issued a Visitor card. Most visitors are employees.
  They may take a multi-day card home.
- **Contractor**: a person issued a Contractor card. They may never take it home.
  They get the **same card** back each day and may be engaged over multiple days.
  Contractors are **only on site during the Collector's hours**, so there is no
  out-of-hours issue or return.
- **Cardholder**: Visitor or Contractor (generic term). The name is typed fresh on
  each Request. There is no reusable people list.
- **Host**: the team or person the cardholder is there for, usually the Requester.
  Receives reminders. Always a user on the Workspace domain (email only, no sheet access).

## Lifecycle

- **Request**: a request for a card for a named cardholder for given dates **with
  times**. Default start **09:30**, default end **18:00**.
  The Requester types it straight into a row on a dedicated **Requests** tab. Once
  submitted (menu or Action dropdown, ADR 0008), the row is **locked** and coloured
  by status (see Statuses). Visits always **start on a Working Day**. The sheet
  rejects a start date that isn't one.
- **Amendment**: a change to a locked Request, raised as a **new row** that refers to
  the original. If the original was already approved, the Amendment needs
  re-approval. History is kept.
- **Approval**: given by the Approver once dates are confirmed. Automatic if the
  Approver is the Requester.
- **Denial**: the Approver rejects the Request. A reason is **optional**.
- **Encoding Task**: work for the Encoder, created by an approved Request, an
  Extension, a lost card, or an early departure.
- **Encoding**: the Encoder records the **Card Serial**, "encoded by X at time T,
  valid A → B". A → B **may differ** from the requested dates. The sheet
  does **not** integrate with the access-control system (ADR 0002).
- **Issue**: the Provisioner hands the card to the cardholder, **or** hands it to the
  Requester ahead of the visit (pre-provisioning). The record shows who received it.
  If it went to the Requester, the later **Requester → cardholder handover** is
  recorded too.
- **Check-out / Check-in**: contractor-only daily handover. The **Collector** records
  both. (For visitors, the Provisioner issues and the Collector collects.)
  The script **automatically adds a Contractor Log row** for each active contractor
  on each Working Day. Actions use the menu or the row's Action dropdown
  (ADR 0008).
- **Extension**: a **new linked row** (Kind = Extension). It lengthens a stay. It **needs the Approver's sign-off**, then creates
  an Encoding Task (re-encode). If the Approver requests it, it is auto-approved.
- **Early Departure**: the Collector collects the card and the Encoder is informed.
  The Encoder may cut the validity short, or the card may be Repurposed.
- **Lost Card**: automatically creates an Encoding Task to **deactivate** the lost
  card and, if needed, **activate a replacement** card for the same cardholder.
- **Final Day**: the last day of the Validity Window.
- **Working Day**: not a weekend and not in the Settings **Holiday List** (Irish
  public holidays plus any site closures; see `docs/holidays-ie.md`). The Collector works only on Working Days.
- **Collection Deadline**: the end of the Collector's shift (18:00 at the current
  site) on the Final Day. The card is collected by then, even if the cardholder
  leaves earlier or later. If the Final Day is **not** a Working Day, the deadline is
  the end of the Collector's shift on the **previous Working Day**.
- **No-show**: the cardholder never collects the card on day 1. The Provisioner
  declares it, and a **Cancellation** is mandatory.
- **Cancellation**: raised by the Host or the Collector. A Host (no sheet access)
  emails the Collector, who records it with the menu action or checkbox.
- **Return**: the card is back in the pool and available.

- **Request ID**: `<SITE>-0001`, where `<SITE>` is a short site code set in
  Settings.

## Statuses (row colour + text Status column)

| Status | Colour |
|---|---|
| Draft | none |
| Submitted | lime |
| Approved | green |
| Denied | red |
| Encoded | light blue |
| Issued | teal |
| Extension pending | amber |
| Returned / Closed | grey |
| Cancelled | dark grey |
| No-show | orange |
| Lost | purple |

## Card allocation

- The sheet **blocks** assigning one card to visits whose Validity Windows overlap.
- **Low-stock warning** when fewer than **5** cards are free **across the dates of
  the Request being made**.

## Notifications (ADR 0004, ADR 0006)

- **Reminder**: sent to the current Collector and the Host before
  the Collection Deadline.
  Delivered **no later than**: 17:30 on the previous working day (24h),
  09:30 on the Final Day (12h), 15:00 on the Final Day (3h).
- **Admin Space**: a Google Chat space (about 3 members) that receives an event feed
  through an incoming webhook. It is not used for DMs.
- **Overdue Contractor Card**: a contractor card not checked in by the end of the
  Collector's shift. It is posted to the Admin Space.

## Audit

- **Event Log**: a locked tab. The script appends one row per action (who, what,
  when, request ID). Never edited by hand.

## Data & retention

- Minimum data: cardholder name, Host, and optionally a contact (phone or email).
- Retention: all records are purged at **18 months**, manually, following the
  organisation's retention policy. Employee details already live in HR records,
  so there is no special case for employees.
