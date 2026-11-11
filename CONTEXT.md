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
- **Card Type**: either **Visitor** or **Contractor**. There is no separate
  single-day vs multi-day card. A visitor card is simply encoded for a shorter or
  longer **Validity Window**.
- **Validity Window**: the period (from A to B) the card is encoded to work, as set
  in the external access-control system. That system enforces expiry on the
  card itself.
- **Repurpose**: a card collected early may be reassigned to a different cardholder
  (re-encoded) instead of having its validity cut short.

## Roles (functional, not job titles)

There are four **roles**. Each Site Sheet assigns them to people in a Settings tab.
One person may hold several roles. Job titles are only an example mapping.

| Role | Does | Holders | Example (current site) |
|---|---|---|---|
| **Requester** | Raises Requests and Extensions | many | Production Manager, Office Manager, Regional Operations Manager |
| **Approver** | Approves Requests | **exactly one** | Regional Operations Manager (may move to Office Manager) |
| **Encoder** | Encodes cards in the access-control system and records it in the sheet | **(open)** one or many | Regional Operations Manager |
| **Collector** | Issues and collects cards, logs contractor check-out/check-in, is the target of reminders | **(open)** one or many | Office Manager |

- If the Approver raises a Request or Extension, it is **auto-approved**.
- Each **Role Holder** has a **shift** (start–end) in Settings. Current site:
  Office Manager and Regional Operations Manager 09:30–18:00, Production Manager
  07:30–16:00. Shifts rarely change.

## People

- **Visitor**: a person issued a Visitor card. Most visitors are employees.
  They may take a multi-day card home.
- **Contractor**: a person issued a Contractor card. They may never take it home.
  They get the **same card** back each day and may be engaged over multiple days.
- **Cardholder**: Visitor or Contractor (generic term). The name is typed fresh on
  each Request. There is no reusable people list.
- **Host**: the team or person the cardholder is there for, usually the Requester.
  Receives reminders.

## Lifecycle

- **Request**: a request for a card for a named cardholder for given dates.
- **Approval**: given by the Approver once dates are confirmed. Automatic if the
  Approver is the Requester.
- **Encoding Task**: work for the Encoder, created by an approved Request, an
  Extension, a lost card, or an early departure.
- **Encoding**: the Encoder records "encoded by X at time T, valid A → B". The sheet
  does **not** integrate with the access-control system (ADR 0002).
- **Issue**: the Collector hands the card to the cardholder.
- **Check-out / Check-in**: contractor-only daily handover, logged by the Collector
  with checkboxes.
- **Extension**: lengthens a stay. It creates an Encoding Task (re-encode).
  If the Approver requests it, it goes straight to the Encoder.
  **(open)** Extensions from other Requesters: approval needed or not?
- **Early Departure**: the Collector collects the card and the Encoder is informed.
  The Encoder may cut the validity short, or the card may be Repurposed.
- **Lost Card**: automatically creates an Encoding Task to **deactivate** the card.
- **Final Day**: the last day of the Validity Window.
- **Collection Deadline**: the end of the Collector's shift (18:00 at the current
  site) on the Final Day. The card is collected by then, even if the cardholder
  leaves earlier or later.
- **Return**: the card is back in the pool and available.

## Notifications (ADR 0004, ADR 0006)

- **Reminder**: sent to the Collector and the Host before the Collection Deadline.
  Delivered **no later than**: 17:30 on the previous working day (24h),
  09:30 on the Final Day (12h), 15:00 on the Final Day (3h).
- **Admin Space**: a Google Chat space (about 3 members) that receives an event feed
  through an incoming webhook. It is not used for DMs.
- **Overdue Contractor Card**: a contractor card not checked in by the end of the
  Collector's shift. It is posted to the Admin Space.

## Data & retention

- Minimum data: cardholder name, Host, and optionally a contact (phone or email).
- Retention: all records are purged at **18 months**, manually, following the
  organisation's retention policy. Employee details already live in HR records,
  so there is no special case for employees.
