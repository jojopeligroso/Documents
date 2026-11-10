# ADR 0003: A single, transferable Approver role

**Status:** Accepted, 2026-11-10

## Context
There are four roles (OM, ROM, PM, Encoder). One person may hold several roles.
Approval rights must be unambiguous.

## Decision
Exactly **one** Role Holder per Site Sheet holds approval rights. The default is the
ROM, and the right can be transferred (e.g. to the OM). A Requester may approve
their own Request only if they are the Approver.

## Consequences
- + Clear accountability.
- − If the Approver is absent, approvals stall. **(open)** Do we need a deputy or a
  manual handover process?
