# ADR 0012: Dates and times are text strings, in the sheet and in the code

**Status:** Accepted, 2026-11-12

## Context
Deadlines and reminders depend on wall-clock times at the site. JavaScript `Date`
objects carry a time zone, and Sheets returns a time-only cell as a `Date` on
30 December 1899. In the `Europe/Dublin` zone that date has a historical offset of
about 25 minutes, so reading `09:30` that way gives the wrong minutes (known Apps
Script pitfall, from training; avoided by design, so it does not need verifying).

## Decision
- In the sheet, only **Start date**, **End date** and **Holiday date** are true date
  cells (so people get a date picker). Everything else is plain text:
  `YYYY-MM-DD`, `HH:mm`, or `YYYY-MM-DD HH:mm`.
- In `pure/` code, all dates and times are those same strings. They are compared with
  `<` and `>`, and changed only through `Cal`.
- `gas/` code converts the three true-date columns with `Utilities.formatDate` in the
  spreadsheet's time zone, reads all text with `getDisplayValues()`, and gets "now"
  from `Audit.now(tz)`.

## Consequences
- + The rules are testable in Node with no time-zone set-up, and give the same answer
  on any machine.
- + What a person sees in a cell is exactly what the code reads.
- − Text dates do not sort or filter as dates in the Sheets UI. The chosen format
  sorts correctly as text, which covers the common case.
- − Daylight-saving changes are ignored in arithmetic. They happen at 01:00 on a
  Sunday, outside every working-hours calculation here.
