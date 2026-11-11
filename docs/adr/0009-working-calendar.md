# ADR 0009: Working calendar drives deadlines and reminders

**Status:** Accepted, 2026-11-11

## Decision
- A **Working Day** is Monday–Friday and not in Settings ▸ Holiday List. The list is
  seeded from `data/holidays-ie.csv` and maintained by hand.
- If the Final Day is not a Working Day, the Collection Deadline is the end of the
  Collector's shift on the **previous Working Day**.
- Reminder times (ADR 0006) are calculated from that adjusted deadline. "Previous
  working day" skips holidays as well as weekends.
- Visits must **start on a Working Day**. The sheet rejects other start dates. Cards
  may be provisioned earlier, handed to the Requester.

## Consequences
- No site closures are added for late December: there are no visitors then.
- − Someone must add next year's holidays each year. If they don't, reminders
  silently fall on holidays. Mitigation (proposed): the script warns in the Admin
  Space when the Holiday List has no entries for the next 60 days of a new year.
- − A visitor whose visit ends on a Saturday hands the card back on Friday, so they
  are without a card on Saturday. Accepted by the user.
