# ADR 0007: Requests typed into rows; one sheet-wide lock with openings

**Status:** Accepted, 2026-11-12 (revised: sheet-wide lock replaces per-row locks)

## Context
Requesters type requests straight into rows on the Requests tab. Once submitted, what
was asked for must not change silently.

## Decision
- Each tab has **one sheet-level protection**. The cells people may type in are
  listed as **unprotected ranges** ("openings").
- On `Requests` the openings are: Action and Action note on every row; the entry
  columns on Draft rows and the empty rows below the data; the encoding columns on
  rows that are Approved or Lost.
- The script recalculates the openings from the Status column after any action that
  changes them (`Protect.syncRequests`).
- Changes after submission are made with an Amendment row.

## Why not one protection per submitted row (the earlier design)
- Hundreds of protections on one tab may slow the sheet (unverified).
- A per-row lock can only be created, not derived. The sheet-wide lock is computed
  from the data, so "Build / repair" can always put it right.

## Verified facts (Apps Script `Protection` reference, via Context7, Nov 2026)
- "Neither the owner of the spreadsheet nor the current user can be removed" from a
  protection's editors.
- A person with edit access through a **Google Group**, or because the whole domain
  can edit, is **not** stopped by a protection. Share with named people only.

## Consequences
- + Self-repairing. One protection per tab to reason about.
- − Locks are "trusted-party" strength: the Admin can always edit.
- − To be confirmed in Phase 0: a sheet-wide protection with unprotected ranges
  blocks other editors everywhere else.
