# Domain Context & Glossary

Each term has one meaning. If code, sheet tabs, or messages use a term, it means
exactly what is written here. Items marked **(open)** are not yet decided; see
`docs/open-questions.md`.

## Deployment

- **Site Sheet**: one copy of the Google Sheet template, owned by one site/office,
  with its own Role Holders, Card Pool and settings. Sites do not share data.
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

## People & roles

- **Visitor**: a person issued a Visitor card. Most visitors are employees.
  They may take a multi-day card home.
- **Contractor**: a person issued a Contractor card. They may never take it home.
  They get the **same card** back each day and may be engaged over multiple days.
- **Cardholder**: Visitor or Contractor (generic term).
- **Host**: the team or person the cardholder is there for, usually the Requester.
- **Requester**: the person who raises a Request. Usually the Production Manager
  or Office Manager.
- **Role Holder**: a person assigned to a role in a Site Sheet. One person may hold
  several roles.
- **Office Manager (OM)**: issues and collects cards, and logs contractor
  check-out/check-in. Shift 09:30–18:00.
- **Regional Operations Manager (ROM)**: default Approver and Encoder.
  Shift 09:30–18:00.
- **Production Manager (PM)**: typical Requester. Shift 07:30–16:00.
- **Approver**: the **single** person with approval rights. Default: ROM. May be
  transferred (e.g. to OM). A Requester may approve their own Request only if
  they are the Approver.
- **Encoder**: the person who encodes cards in the external access-control system.
  Default: ROM. May be reassigned. **(open)** Is the Encoder always the same
  person as the Approver?

## Lifecycle (draft)

- **Request**: a request for a card for a named cardholder for given dates.
- **Approval**: the Approver confirms the dates. Approval happens once dates are confirmed.
- **Encoding**: the Encoder records "encoded by X at time T, valid A → B". The sheet
  does **not** integrate with the access-control system. It records only the
  administrative state.
- **Issue**: the card is handed to the cardholder.
- **Check-out / Check-in**: contractor-only daily handover, logged by the OM with
  checkboxes.
- **Extension**: a request to lengthen a stay. It requires re-encoding (a new task
  for the Encoder). **(open)** Who may request it, and does it need approval?
- **Final Day**: the last day of the Validity Window.
- **Collection Deadline**: the end of the OM's shift (18:00) on the Final Day. The OM
  must collect the card by then, even if the cardholder leaves earlier or later.
- **Return**: the card is back in the pool and available.

## Notifications

- **Reminder**: sent to the OM and the Host before the Collection Deadline,
  nominally at 24h / 12h / 3h. Times are moved into working hours.
  **(open)** The exact shifting rule.
- **Admin Space**: a Google Chat space (about 3 members) that receives an event feed
  through an incoming webhook ("X happened on the sheet"). It is not used for DMs.
- **Overdue Contractor Card**: a contractor card not checked in by the end of the
  OM's shift. It is posted to the Admin Space.

## Data & retention

- Minimum data: cardholder name, Host, and optionally a contact (phone or email).
- Retention follows the organisation's existing data-retention policy. Working
  figure for non-employee records: **18 months**. **(open)** How records about
  employee visitors are handled.
