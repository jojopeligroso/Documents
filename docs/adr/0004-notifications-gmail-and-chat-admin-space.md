# ADR 0004: Gmail for people, Chat incoming webhook for the admin feed

**Status:** Accepted, 2026-11-11

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
  from that account. Accepted: they send from the account of whoever installs them.

## Event → channel matrix (accepted)

| Event | Gmail to | Admin Space |
|---|---|---|
| New request | Approver | ✓ |
| Approved / rejected | Requester | ✓ |
| Encoding task | Encoder | ✓ |
| Encoded | Collector + Requester | ✓ |
| Card issued / returned | — | ✓ |
| Extension requested | Approver/Encoder (receipt) | ✓ |
| Reminders 24/12/3h | Collector + Host | — |
| Contractor card not checked in by shift end | — | ✓ |
| Visitor card not back after Collection Deadline | Collector | ✓ |
