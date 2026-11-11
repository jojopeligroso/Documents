# ADR 0007: Requests typed into a dedicated tab; rows locked by script on submit

**Status:** Proposed, 2026-11-11 (the submit signal and amendment flow are still open)

## Context
The user wants Requesters to type straight into a row on a tab used only for
Requests. A submitted row must not change silently afterwards.

## Decision
- A **Requests** tab where each Requester types one row per visit. Dropdowns, date
  pickers and required-field checks are done with data validation.
- An explicit **Submit** signal (proposed: a checkbox column). Without one, the
  script can't tell a finished row from one still being typed, because the on-edit
  trigger fires on every cell edit.
- On submit, the script validates the row, then **protects that row's range**
  (`Range.protect()`), leaving only the script-running account and the owner as
  editors.
- Changes after submission go through an amendment flow (to be defined), never by
  editing the locked row.

## Verified facts (Apps Script `Protection` reference, via Context7, 2026-11-11)
- "Neither the owner of the spreadsheet nor the current user can be removed" from a
  protected range's editors. So the sheet owner and the trigger's account can
  **always** edit locked rows.
- If a user gets edit access **through a Google Group**, or the whole domain has
  edit access, `removeEditor` does **not** stop them editing the protected range.
  So **share the Site Sheet with named individuals, not groups or the domain.**
- `setWarningOnly(true)` gives "are you sure?" protection instead of blocking.

## Consequences
- + Matches how users already work in Sheets. No forms to maintain.
- − Locks are "trusted-party" strength: the owner and trigger account can bypass
  them. That's acceptable under the trust model.
- − Hundreds of per-row protections can make a sheet sluggish (unverified; check
  before building). Alternative: protect the whole Requests tab, leave only an
  "entry zone" unprotected, and have the script move submitted rows into a
  protected register.
