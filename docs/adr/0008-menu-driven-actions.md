# ADR 0008: Workflow actions run from a custom menu

**Status:** Proposed, 2026-11-11 (depends on whether anyone uses mobile)

## Context
The user prefers menu buttons over checkboxes for workflow actions (submit,
approve, deny, encode, issue, return, extend, cancel, no-show, lost). Actions act
on the **selected row**.

## Decision
- One custom menu (e.g. **Access Cards ▸ …**) is added by `onOpen` in the bound
  shell script. Each item calls the library.
- Each action checks the active user's role against Settings, validates the row's
  current status, updates the status and colour, writes an Event Log row, and sends
  notifications.
- Optional "button" drawings on the tabs call the same functions.

## Verified facts (Apps Script guides/menus, via Context7, 2026-11-11)
- "Only bound scripts can create menus." This fits ADR 0005: the shell creates the
  menu and the library does the work.
- Scripts assigned to images or drawings run only "in a web browser. The script
  doesn't execute if the image or drawing is clicked on mobile."

## Unverified (from training)
- Custom menus are probably also **not shown in the Sheets mobile apps**. If so,
  every menu action is desktop/browser only.

## Consequences
- + Role checks, status checks and an audit entry on every action.
- − Browser-only. If the Collector needs to check contractors in and out from a
  phone or tablet, we need a checkbox fallback (handled by an installable
  on-edit trigger) for those actions.
