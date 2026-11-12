# ADR 0003: Functional roles, one holder each, with delegation

**Status:** Accepted, 2026-11-11 (revised; replaces the earlier "backup list" idea)

## Context
The workflow functions are: request, approve, encode, provision (issue), collect.
Plus an administrative function that owns the file and runs the triggers. Who
performs each one varies by site and over time, and one person may perform several.

## Decision
- Roles are **Admin, Approver, Encoder, Provisioner, Collector, Requester**. Each is
  identified by organisation email in Settings.
- **Exactly one** holder at any time for Admin, Approver, Encoder, Provisioner and
  Collector. Requester is a short list of permitted people.
- The Collector defaults to the Provisioner unless it is set separately.
- The Admin sets the Approver. The Approver may delegate the role. Other roles change
  by editing their cell. Every change is logged in the Event Log.
- If the Approver raises a Request or Extension, it is auto-approved. Other
  Requesters can't approve their own Requests.
- The Admin owns the file and installs the triggers. It is a separate role, but may
  be the same person as the Approver.

## Consequences
- + Unambiguous: one name per responsibility at any moment, and the history is in
  the Event Log.
- + Works for any site's staffing without code changes.
- − Delegation is manual (edit a cell) and doesn't revert automatically.
- Note: everyone is trusted, so role checks guard against mistakes, not malice. The
  Admin can always override (file owner + trigger account; ADR 0007).
