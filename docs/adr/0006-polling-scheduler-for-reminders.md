# ADR 0006: One polling trigger with lead times, not per-event triggers

**Status:** Proposed, 2026-11-11

## Context
Reminders must arrive **no later than** fixed times: 17:30 on the previous working
day, 09:30 and 15:00 on the Final Day. Overdue-contractor checks happen at the end
of the Collector's shift. Apps Script time-driven triggers are imprecise:
- A recurring daily trigger at hour H fires somewhere between H and H+1
  (developers.google.com/apps-script/guides/triggers/installable).
- `nearMinute(m)` is accurate to ±15 minutes (…/reference/script/clock-trigger-builder).

## Decision
- One installable trigger runs `everyMinutes(15)` (or 10) during working hours.
- Each run computes which reminders and checks are **due within the next window**
  and sends them. "Due" means `deadline − leadTime ≤ now`. The lead time defaults
  to 30 minutes, so a 09:30 reminder normally goes out between about 09:00 and
  09:15.
- Every notification is recorded (request ID, type, sent-at) so it is **never
  sent twice**, even if runs overlap or are retried.
- The 09:30 reminder lands before the Collector's 09:30 shift start. Accepted: it
  will be waiting in their inbox.

## Consequences
- + Handles changes in dates, extensions and shifts naturally, with no trigger
  bookkeeping.
- + Reminders can't be late by more than one polling interval plus the lead time.
- − Uses more trigger runtime than one-off triggers. Expected to be well within
  Workspace quotas at one site (to verify against current quota docs).
