# ADR 0004: Gmail for people, Chat incoming webhook for the admin feed

**Status:** Proposed, 2026-11-10 (the per-event channel mapping is still open)

## Context
Actions in the sheet must notify the right person. A simple `onEdit` trigger can't
send email, because it can't use services that need authorisation. Google Chat
incoming webhooks can post only to a space, not to a person's DMs.

## Decision
- Use **installable triggers** (on-edit and time-driven) in Apps Script.
- **Gmail** goes to individuals: requests, encoding tasks, receipts, reminders.
- A **Chat incoming webhook** posts to one **Admin Space** (about 3 members) as an
  event feed. No Chat app and no DMs.

## Consequences
- + No Google Cloud Chat-app setup needed.
- − The webhook URL is a secret (anyone who has it can post to the space). Store it
  in Script Properties, not in a cell.
- − Installable triggers run as the user who installed them, so emails are sent
  from that account. **(open)** Whose account?
